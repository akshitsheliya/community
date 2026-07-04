import { Request, Response } from 'express';
import * as model from '../models/familyJoinRequestModel';
import { dbPool } from '../config/db';
import { getMemberIdFromToken, getCommunityIdFromToken, isCommunityAdmin } from '../helpers/authHelpers';

/**
 * POST /api/family-join/search
 * Search for matching families for a potential joiner
 */
export const searchMatchingFamilies = async (req: any, res: any) => {
  try {
    const memberId = await getMemberIdFromToken(req.user);
    const communityId = await getCommunityIdFromToken(req.user);
    
    if (!memberId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    // Get requester's profile for matching
    const [rows]: any = await dbPool.query(
      `SELECT first_name, father_name, surname 
       FROM tbl_member_profile WHERE member_id = ?`,
      [memberId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    
    const profile = rows[0];
    
    const matches = await model.searchMatchingFamilies({
      communityId,
      firstName: profile.first_name,
      fatherName: profile.father_name,
      surname: profile.surname,
      excludeMemberId: memberId
    });
    
    return res.status(200).json({
      success: true,
      message: 'Matching families found',
      data: matches,
      total: matches.length
    });
    
  } catch (error: any) {
    console.error('searchMatchingFamilies error:', error);
    return res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

/**
 * POST /api/family-join/request
 * Create a join request
 */
export const createRequest = async (req: any, res: any) => {
  try {
    const memberId = await getMemberIdFromToken(req.user);
    const communityId = await getCommunityIdFromToken(req.user);
    
    if (!memberId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const { target_family_uuid, target_member_uuid, claimed_relationship } = req.body;
    
    if (!target_family_uuid || !claimed_relationship) {
      return res.status(400).json({
        success: false,
        message: 'target_family_uuid and claimed_relationship are required'
      });
    }
    
    // Get family_sr_id from uuid
    const [familyRows]: any = await dbPool.query(
      `SELECT family_sr_id FROM tbl_families WHERE family_uuid = ?`,
      [target_family_uuid]
    );
    
    if (familyRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }
    
    const familyId = familyRows[0].family_sr_id;
    
    // Get target_member_id if provided
    let targetMemberId = null;
    if (target_member_uuid) {
      const [memberRows]: any = await dbPool.query(
        `SELECT member_id FROM tbl_member_profile WHERE member_uuid = ?`,
        [target_member_uuid]
      );
      if (memberRows.length > 0) {
        targetMemberId = memberRows[0].member_id;
      }
    }
    
    // Check for duplicate request
    const [existing]: any = await dbPool.query(
      `SELECT 1 FROM tbl_family_join_requests 
       WHERE requester_member_id = ? AND target_family_sr_id = ? 
       AND status = 'pending'`,
      [memberId, familyId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this family'
      });
    }
    
    const result = await model.createJoinRequest({
      requester_member_id: memberId,
      target_family_sr_id: familyId,
      target_member_id: targetMemberId,
      claimed_relationship,
      community_id: communityId
    });
    
    return res.status(201).json({
      success: true,
      message: 'Join request sent successfully. Waiting for family approval.',
      data: result
    });
    
  } catch (error: any) {
    console.error('createRequest error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create join request',
      error: error.message
    });
  }
};

/**
 * GET /api/family-join/incoming
 * Get requests to join MY family
 */
export const getIncomingRequests = async (req: any, res: any) => {
  try {
    const memberId = await getMemberIdFromToken(req.user);
    
    if (!memberId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    // Get user's family_sr_id
    const [rows]: any = await dbPool.query(
      `SELECT family_sr_id FROM tbl_member_profile WHERE member_id = ?`,
      [memberId]
    );
    
    if (rows.length === 0 || !rows[0].family_sr_id) {
      return res.status(200).json({
        success: true,
        message: 'No family found',
        data: []
      });
    }
    
    const familyId = rows[0].family_sr_id;
    const requests = await model.getJoinRequestsForFamily(familyId);
    
    return res.status(200).json({
      success: true,
      message: 'Incoming requests fetched',
      data: requests,
      total: requests.length
    });
    
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch requests',
      error: error.message
    });
  }
};

/**
 * GET /api/family-join/my-requests
 * Get requests I have sent
 */
export const getMyRequests = async (req: any, res: any) => {
  try {
    const memberId = await getMemberIdFromToken(req.user);
    
    if (!memberId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const requests = await model.getMyJoinRequests(memberId);
    
    return res.status(200).json({
      success: true,
      data: requests,
      total: requests.length
    });
    
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your requests',
      error: error.message
    });
  }
};

/**
 * GET /api/family-join/community
 * Get all requests in community (admin only)
 */
export const getCommunityRequests = async (req: any, res: any) => {
  try {
    const memberId = await getMemberIdFromToken(req.user);
    const communityId = await getCommunityIdFromToken(req.user);
    
    if (!memberId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const isAdmin = await isCommunityAdmin(memberId, communityId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const status = req.query.status;
    const requests = await model.getJoinRequestsForCommunity(communityId, status);
    
    return res.status(200).json({
      success: true,
      data: requests,
      total: requests.length
    });
    
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * PUT /api/family-join/request/:uuid/approve
 * Approve a join request (family head or admin)
 */
export const approveRequest = async (req: any, res: any) => {
  try {
    const memberId = await getMemberIdFromToken(req.user);
    const { requestUuid } = req.params;
    
    if (!memberId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    // Get the request
    const request = await model.getRequestByUuid(requestUuid);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    
    // Check if user is family head or admin
    const [familyRows]: any = await dbPool.query(
      `SELECT family_main_member_id FROM tbl_families WHERE family_sr_id = ?`,
      [request.target_family_sr_id]
    );
    
    const isFamilyHead = familyRows[0]?.family_main_member_id === memberId;
    const isAdmin = await isCommunityAdmin(memberId, request.community_id);
    
    if (!isFamilyHead && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only family head or admin can approve'
      });
    }
    
    // Approve and link
    const result = await model.approveAndLinkMember(requestUuid, memberId);
    
    return res.status(200).json({
      success: true,
      message: 'Request approved. Member joined your family!',
      data: result
    });
    
  } catch (error: any) {
    console.error('approveRequest error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve request',
      error: error.message
    });
  }
};

/**
 * PUT /api/family-join/request/:uuid/reject
 * Reject a join request
 */
export const rejectRequest = async (req: any, res: any) => {
  try {
    const memberId = await getMemberIdFromToken(req.user);
    const { requestUuid } = req.params;
    const { review_note } = req.body;
    
    if (!memberId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const request = await model.getRequestByUuid(requestUuid);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    
    // Same permission check as approve
    const [familyRows]: any = await dbPool.query(
      `SELECT family_main_member_id FROM tbl_families WHERE family_sr_id = ?`,
      [request.target_family_sr_id]
    );
    
    const isFamilyHead = familyRows[0]?.family_main_member_id === memberId;
    const isAdmin = await isCommunityAdmin(memberId, request.community_id);
    
    if (!isFamilyHead && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only family head or admin can reject'
      });
    }
    
    const success = await model.updateRequestStatus(
      requestUuid, 
      'rejected_by_family', 
      memberId,
      review_note
    );
    
    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to reject. Request may already be processed.'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Request rejected'
    });
    
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * PUT /api/family-join/request/:uuid/cancel
 * Cancel my own request
 */
export const cancelRequest = async (req: any, res: any) => {
  try {
    const memberId = await getMemberIdFromToken(req.user);
    const { requestUuid } = req.params;
    
    if (!memberId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const success = await model.cancelRequest(requestUuid, memberId);
    
    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel. Request may not exist or already processed.'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Request cancelled'
    });
    
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /api/family-join/stats
 * Stats for admin dashboard
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
         SUM(CASE WHEN status = 'approved_by_family' THEN 1 ELSE 0 END) as approved,
         SUM(CASE WHEN status LIKE 'rejected%' THEN 1 ELSE 0 END) as rejected
       FROM tbl_family_join_requests
       WHERE community_id = ?`,
      [communityId]
    );
    
    return res.status(200).json({
      success: true,
      data: stats[0]
    });
    
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
