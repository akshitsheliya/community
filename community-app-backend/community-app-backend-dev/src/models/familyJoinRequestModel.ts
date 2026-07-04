import { dbPool } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

interface CreateJoinRequestParams {
  requester_member_id: number;
  target_family_sr_id: number;
  target_member_id?: number | null;
  claimed_relationship: string;
  community_id: number;
  request_message?: string;
}

/**
 * Create a new join request
 */
export const createJoinRequest = async (data: CreateJoinRequestParams) => {
  const requestUuid = uuidv4();
  
  const [result]: any = await dbPool.query(
    `INSERT INTO tbl_family_join_requests 
     (request_uuid, requester_member_id, target_family_sr_id, target_member_id,
      claimed_relationship, community_id, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    [
      requestUuid,
      data.requester_member_id,
      data.target_family_sr_id,
      data.target_member_id || null,
      data.claimed_relationship.toLowerCase(),
      data.community_id
    ]
  );
  
  return {
    request_id: result.insertId,
    request_uuid: requestUuid
  };
};

/**
 * Get all pending join requests for a specific family
 * (For family head to review)
 */
export const getJoinRequestsForFamily = async (familyId: number) => {
  const [rows]: any = await dbPool.query(
    `SELECT 
       fjr.request_id,
       fjr.request_uuid,
       fjr.requester_member_id,
       fjr.target_family_sr_id,
       fjr.target_member_id,
       fjr.claimed_relationship,
       fjr.status,
       fjr.created_at,
       fjr.reviewed_at,
       fjr.review_note,
       -- Requester details
       mp.first_name as requester_first_name,
       mp.father_name as requester_father_name,
       mp.surname as requester_surname,
       mp.gender as requester_gender,
       mp.date_of_birth as requester_dob,
       mp.phone_number as requester_phone,
       mp.profile_photo as requester_photo,
       mp.member_uuid as requester_uuid,
       mp.current_resident as requester_location,
       -- Target member details (if specific)
       tmp.first_name as target_first_name,
       tmp.surname as target_surname
     FROM tbl_family_join_requests fjr
     JOIN tbl_member_profile mp ON fjr.requester_member_id = mp.member_id
     LEFT JOIN tbl_member_profile tmp ON fjr.target_member_id = tmp.member_id
     WHERE fjr.target_family_sr_id = ?
     ORDER BY 
       CASE fjr.status 
         WHEN 'pending' THEN 1 
         WHEN 'approved_by_family' THEN 2
         ELSE 3 
       END,
       fjr.created_at DESC`,
    [familyId]
  );
  return rows;
};

/**
 * Get all pending requests for community (admin view)
 */
export const getJoinRequestsForCommunity = async (communityId: number, status?: string) => {
  let query = `
    SELECT 
       fjr.request_id,
       fjr.request_uuid,
       fjr.claimed_relationship,
       fjr.status,
       fjr.created_at,
       fjr.reviewed_at,
       -- Requester
       mp.first_name as requester_first_name,
       mp.surname as requester_surname,
       mp.father_name as requester_father_name,
       mp.gender as requester_gender,
       mp.phone_number as requester_phone,
       mp.member_uuid as requester_uuid,
       -- Family info
       fjr.target_family_sr_id,
       fam.family_uuid as target_family_uuid,
       -- Family head
       head.first_name as head_first_name,
       head.surname as head_surname
     FROM tbl_family_join_requests fjr
     JOIN tbl_member_profile mp ON fjr.requester_member_id = mp.member_id
     JOIN tbl_families fam ON fjr.target_family_sr_id = fam.family_sr_id
     LEFT JOIN tbl_member_profile head ON fam.family_main_member_id = head.member_id
     WHERE fjr.community_id = ?
  `;
  
  const params: any[] = [communityId];
  
  if (status) {
    query += ` AND fjr.status = ?`;
    params.push(status);
  }
  
  query += ` ORDER BY fjr.created_at DESC`;
  
  const [rows]: any = await dbPool.query(query, params);
  return rows;
};

/**
 * Get requests sent BY a specific user
 */
export const getMyJoinRequests = async (memberId: number) => {
  const [rows]: any = await dbPool.query(
    `SELECT 
       fjr.request_id,
       fjr.request_uuid,
       fjr.claimed_relationship,
       fjr.status,
       fjr.created_at,
       fjr.reviewed_at,
       fjr.review_note,
       fjr.target_family_sr_id,
       fam.family_uuid,
       -- Target family head details
       head.first_name as family_head_first_name,
       head.surname as family_head_surname,
       head.member_uuid as family_head_uuid
     FROM tbl_family_join_requests fjr
     JOIN tbl_families fam ON fjr.target_family_sr_id = fam.family_sr_id
     LEFT JOIN tbl_member_profile head ON fam.family_main_member_id = head.member_id
     WHERE fjr.requester_member_id = ?
     ORDER BY fjr.created_at DESC`,
    [memberId]
  );
  return rows;
};

/**
 * Get single request by UUID
 */
export const getRequestByUuid = async (uuid: string) => {
  const [rows]: any = await dbPool.query(
    `SELECT * FROM tbl_family_join_requests WHERE request_uuid = ?`,
    [uuid]
  );
  return rows[0] || null;
};

/**
 * Update request status
 */
export const updateRequestStatus = async (
  requestUuid: string, 
  status: string, 
  reviewedBy: number,
  reviewNote?: string
) => {
  const [result]: any = await dbPool.query(
    `UPDATE tbl_family_join_requests 
     SET status = ?, reviewed_by = ?, review_note = ?, reviewed_at = NOW()
     WHERE request_uuid = ? AND status = 'pending'`,
    [status, reviewedBy, reviewNote || null, requestUuid]
  );
  return result.affectedRows > 0;
};

/**
 * Cancel a request (by requester themselves)
 */
export const cancelRequest = async (requestUuid: string, requesterId: number) => {
  const [result]: any = await dbPool.query(
    `UPDATE tbl_family_join_requests 
     SET status = 'cancelled', updated_at = NOW()
     WHERE request_uuid = ? AND requester_member_id = ? AND status = 'pending'`,
    [requestUuid, requesterId]
  );
  return result.affectedRows > 0;
};

/**
 * Search for potential families matching a new user
 * Uses similar logic to family matcher
 */
export const searchMatchingFamilies = async (params: {
  communityId: number;
  firstName?: string;
  fatherName?: string;
  surname?: string;
  excludeMemberId: number;
}) => {
  const { communityId, firstName, fatherName, surname, excludeMemberId } = params;
  
  // Find members with matching father_name or surname
  const [rows]: any = await dbPool.query(
    `SELECT DISTINCT
       fam.family_sr_id,
       fam.family_uuid,
       fam.number_of_family_members,
       -- Family head details
       head.member_id as head_member_id,
       head.member_uuid as head_member_uuid,
       head.first_name as head_first_name,
       head.father_name as head_father_name,
       head.surname as head_surname,
       head.gender as head_gender,
       head.phone_number as head_phone,
       head.profile_photo as head_photo,
       -- Match scoring
       CASE 
         WHEN head.first_name = ? THEN 100  -- If head's name matches our father_name
         WHEN head.surname = ? THEN 60
         WHEN head.father_name = ? THEN 40  -- Same father (potential sibling family)
         ELSE 20
       END as match_score,
       -- Match reasons
       GROUP_CONCAT(
         DISTINCT CASE 
           WHEN head.first_name = ? THEN CONCAT('Head name matches your father: ', head.first_name)
           WHEN head.surname = ? THEN CONCAT('Same surname: ', head.surname)  
           WHEN head.father_name = ? THEN CONCAT('Same father name: ', head.father_name)
         END
         SEPARATOR ' • '
       ) as match_reason
     FROM tbl_families fam
     JOIN tbl_member_profile head ON fam.family_main_member_id = head.member_id
     JOIN tbl_community_member_relation cmr ON head.member_id = cmr.member_id
     WHERE cmr.community_id = ?
       AND cmr.is_approved = 1
       AND head.member_id != ?
       AND (
         head.first_name = ?      -- Head is your father
         OR head.surname = ?      -- Same surname
         OR head.father_name = ?  -- Same father (siblings)
       )
     GROUP BY fam.family_sr_id
     ORDER BY match_score DESC
     LIMIT 10`,
    [
      fatherName, surname, fatherName,      // For CASE scoring
      fatherName, surname, fatherName,      // For reason
      communityId,
      excludeMemberId,
      fatherName, surname, fatherName       // For WHERE
    ]
  );
  
  return rows;
};

/**
 * Complete approval: create relationship + update member's family
 */
export const approveAndLinkMember = async (
  requestUuid: string, 
  approvedByMemberId: number
) => {
  const conn = await dbPool.getConnection();
  
  try {
    await conn.beginTransaction();
    
    // Get request details
    const [requests]: any = await conn.query(
      `SELECT * FROM tbl_family_join_requests WHERE request_uuid = ? AND status = 'pending'`,
      [requestUuid]
    );
    
    if (requests.length === 0) {
      throw new Error('Request not found or already processed');
    }
    
    const request = requests[0];
    
    // Get requester and target member details for gender-aware inverse label
    const [members]: any = await conn.query(
      `SELECT member_id, first_name, gender FROM tbl_member_profile 
       WHERE member_id IN (?, ?)`,
      [request.requester_member_id, request.target_member_id || 0]
    );
    
    const requester = members.find((m: any) => m.member_id === request.requester_member_id);
    const targetMember = members.find((m: any) => m.member_id === request.target_member_id);
    
    // Update request status
    await conn.query(
      `UPDATE tbl_family_join_requests 
       SET status = 'approved_by_family', reviewed_by = ?, reviewed_at = NOW()
       WHERE request_uuid = ?`,
      [approvedByMemberId, requestUuid]
    );
    
    // Update member's family_sr_id
    await conn.query(
      `UPDATE tbl_member_profile 
       SET family_sr_id = ?, updated_on = NOW()
       WHERE member_id = ?`,
      [request.target_family_sr_id, request.requester_member_id]
    );
    
    // Also update in community_member_relation
    await conn.query(
      `UPDATE tbl_community_member_relation 
       SET family_sr_id = ?, updated_on = NOW()
       WHERE member_id = ? AND community_id = ?`,
      [request.target_family_sr_id, request.requester_member_id, request.community_id]
    );
    
    // Create relationship if target_member_id is specified
    let relationshipCreated = false;
    if (request.target_member_id && request.claimed_relationship) {
      const { getInverseLabel } = require('../helpers/relationshipHelper');
      
      const forwardLabel = request.claimed_relationship.toLowerCase();
      const requesterGender = requester?.gender || 'Male';
      const inverseLabel = getInverseLabel(forwardLabel, requesterGender, targetMember?.gender);
      
      // Insert forward: requester says target is [claimed_relationship]
      const forwardUuid = uuidv4();
      await conn.query(
        `INSERT INTO tbl_family_relationships 
         (relationship_uuid, from_member_id, to_member_id, relationship_label,
          inverse_label, community_id, added_by_member_id, is_verified, is_active, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, 'join_request')`,
        [
          forwardUuid, 
          request.requester_member_id, 
          request.target_member_id,
          forwardLabel, 
          inverseLabel, 
          request.community_id, 
          approvedByMemberId
        ]
      );
      
      // Insert inverse: target's relationship to requester
      const inverseUuid = uuidv4();
      await conn.query(
        `INSERT INTO tbl_family_relationships 
         (relationship_uuid, from_member_id, to_member_id, relationship_label,
          inverse_label, community_id, added_by_member_id, is_verified, is_active, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, 'join_request')`,
        [
          inverseUuid, 
          request.target_member_id, 
          request.requester_member_id,
          inverseLabel, 
          forwardLabel, 
          request.community_id, 
          approvedByMemberId
        ]
      );
      
      relationshipCreated = true;
    }
    
    await conn.commit();
    
    return {
      success: true,
      family_sr_id: request.target_family_sr_id,
      relationship_created: relationshipCreated
    };
    
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};
