import { Request, Response } from 'express';
import { dbPool } from '../config/db';
import { scanCommunityForMatches } from '../services/familyMatcherService';
import { getMemberIdFromToken, getCommunityIdFromToken, isCommunityAdmin } from '../helpers/authHelpers';
import { v4 as uuidv4 } from 'uuid';

/**
 * Manually trigger a scan for the community
 * Admin only
 */
export const triggerScan = async (req: any, res: any) => {
  try {
    const memberId = await getMemberIdFromToken(req.user);
    const communityId = await getCommunityIdFromToken(req.user);
    
    if (!memberId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Check admin
    const isAdmin = await isCommunityAdmin(memberId, communityId);
    if (!isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only community admin can trigger scan' 
      });
    }
    
    // Run scan (async, don't await if you want immediate response)
    const result = await scanCommunityForMatches(communityId);
    
    return res.status(200).json({
      success: true,
      message: 'Scan completed successfully',
      data: result
    });
    
  } catch (error: any) {
    console.error('triggerScan error:', error);
    return res.status(500).json({
      success: false,
      message: 'Scan failed',
      error: error.message
    });
  }
};

/**
 * Get all suggestions for the community
 * Admin only
 */
export const getSuggestions = async (req: any, res: any) => {
  try {
    const memberId = await getMemberIdFromToken(req.user);
    const communityId = await getCommunityIdFromToken(req.user);
    
    if (!memberId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    const isAdmin = await isCommunityAdmin(memberId, communityId);
    if (!isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only community admin can view suggestions' 
      });
    }
    
    const status = req.query.status || 'pending';
    const confidence = req.query.confidence; // optional filter
    
    let query = `
      SELECT 
        fms.suggestion_id,
        fms.suggestion_uuid,
        fms.member_id_a,
        fms.member_id_b,
        fms.suggestion_type,
        fms.suggested_label,
        fms.match_score,
        fms.match_reason,
        fms.status,
        fms.created_at,
        mp_a.first_name as member_a_first_name,
        mp_a.surname as member_a_surname,
        mp_a.father_name as member_a_father_name,
        mp_a.gender as member_a_gender,
        mp_a.profile_photo as member_a_photo,
        mp_a.member_uuid as member_a_uuid,
        mp_b.first_name as member_b_first_name,
        mp_b.surname as member_b_surname,
        mp_b.father_name as member_b_father_name,
        mp_b.gender as member_b_gender,
        mp_b.profile_photo as member_b_photo,
        mp_b.member_uuid as member_b_uuid
      FROM tbl_family_match_suggestions fms
      JOIN tbl_member_profile mp_a ON fms.member_id_a = mp_a.member_id
      JOIN tbl_member_profile mp_b ON fms.member_id_b = mp_b.member_id
      WHERE fms.community_id = ?
        AND fms.status = ?
    `;
    
    const params: any[] = [communityId, status];
    
    if (confidence === 'high') {
      query += ` AND fms.match_score >= 0.9`;
    } else if (confidence === 'medium') {
      query += ` AND fms.match_score >= 0.6 AND fms.match_score < 0.9`;
    }
    
    query += ` ORDER BY fms.match_score DESC, fms.created_at DESC`;
    
    const [suggestions]: any = await dbPool.query(query, params);
    
    return res.status(200).json({
      success: true,
      message: 'Suggestions fetched',
      data: suggestions,
      total: suggestions.length
    });
    
  } catch (error: any) {
    console.error('getSuggestions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch suggestions',
      error: error.message
    });
  }
};

/**
 * Approve a suggestion → Create actual relationship
 */
export const approveSuggestion = async (req: any, res: any) => {
  try {
    const memberId = await getMemberIdFromToken(req.user);
    const communityId = await getCommunityIdFromToken(req.user);
    const { suggestionUuid } = req.params;
    
    if (!memberId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    const isAdmin = await isCommunityAdmin(memberId, communityId);
    if (!isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only community admin can approve' 
      });
    }
    
    // Get the suggestion
    const [rows]: any = await dbPool.query(
      `SELECT * FROM tbl_family_match_suggestions 
       WHERE suggestion_uuid = ? AND status = 'pending'`,
      [suggestionUuid]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Suggestion not found or already processed' 
      });
    }
    
    const suggestion = rows[0];
    
    // Get member genders for inverse calculation
    const [membersInfo]: any = await dbPool.query(
      `SELECT member_id, gender FROM tbl_member_profile 
       WHERE member_id IN (?, ?)`,
      [suggestion.member_id_a, suggestion.member_id_b]
    );
    
    const genderA = membersInfo.find((m: any) => m.member_id === suggestion.member_id_a)?.gender || 'Male';
    const genderB = membersInfo.find((m: any) => m.member_id === suggestion.member_id_b)?.gender || 'Male';
    
    // Create relationship using existing helper
    const { getInverseLabel } = require('../helpers/relationshipHelper');
    const forwardLabel = suggestion.suggested_label;
    const inverseLabel = getInverseLabel(forwardLabel, genderA, genderB);
    
    // Insert forward relationship
    const forwardUuid = uuidv4();
    await dbPool.query(
      `INSERT INTO tbl_family_relationships 
       (relationship_uuid, from_member_id, to_member_id, relationship_label,
        inverse_label, community_id, added_by_member_id, is_verified, is_active, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, 'ai_suggested')`,
      [forwardUuid, suggestion.member_id_a, suggestion.member_id_b, 
       forwardLabel, inverseLabel, communityId, memberId]
    );
    
    // Insert inverse relationship
    const inverseUuid = uuidv4();
    await dbPool.query(
      `INSERT INTO tbl_family_relationships 
       (relationship_uuid, from_member_id, to_member_id, relationship_label,
        inverse_label, community_id, added_by_member_id, is_verified, is_active, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, 'ai_suggested')`,
      [inverseUuid, suggestion.member_id_b, suggestion.member_id_a, 
       inverseLabel, forwardLabel, communityId, memberId]
    );
    
    // Update suggestion status
    await dbPool.query(
      `UPDATE tbl_family_match_suggestions 
       SET status = 'confirmed', reviewed_by = ?, reviewed_at = NOW()
       WHERE suggestion_uuid = ?`,
      [memberId, suggestionUuid]
    );
    
    return res.status(200).json({
      success: true,
      message: 'Suggestion approved and relationship created',
      data: { forwardUuid, inverseUuid }
    });
    
  } catch (error: any) {
    console.error('approveSuggestion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve suggestion',
      error: error.message
    });
  }
};

/**
 * Reject a suggestion
 */
export const rejectSuggestion = async (req: any, res: any) => {
  try {
    const memberId = await getMemberIdFromToken(req.user);
    const communityId = await getCommunityIdFromToken(req.user);
    const { suggestionUuid } = req.params;
    
    if (!memberId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    const isAdmin = await isCommunityAdmin(memberId, communityId);
    if (!isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only community admin can reject' 
      });
    }
    
    const [result]: any = await dbPool.query(
      `UPDATE tbl_family_match_suggestions 
       SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW()
       WHERE suggestion_uuid = ? AND status = 'pending'`,
      [memberId, suggestionUuid]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Suggestion not found or already processed' 
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Suggestion rejected'
    });
    
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reject suggestion',
      error: error.message
    });
  }
};

/**
 * Get suggestion stats
 */
export const getStats = async (req: any, res: any) => {
  try {
    const memberId = await getMemberIdFromToken(req.user);
    const communityId = await getCommunityIdFromToken(req.user);
    
    if (!memberId) return res.status(401).json({ success: false });
    
    const [stats]: any = await dbPool.query(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
         SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
         SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
         SUM(CASE WHEN match_score >= 0.9 THEN 1 ELSE 0 END) as high_confidence
       FROM tbl_family_match_suggestions
       WHERE community_id = ?`,
      [communityId]
    );
    
    return res.status(200).json({
      success: true,
      data: stats[0]
    });
    
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
