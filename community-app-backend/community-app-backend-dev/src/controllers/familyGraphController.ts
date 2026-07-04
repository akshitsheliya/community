import { Request, Response } from "express";
import { FamilyGraphModel } from "../models/familyGraphModel";
import { sendResponse } from "../helpers/responseHelper";
import logger from "../utils/logger";
import { isCommunityAdmin, getMemberIdFromToken, getCommunityIdFromToken } from "../helpers/authHelpers";
import { dbPool } from "../config/db";

const familyGraphModel = new FamilyGraphModel();

const getMemberIdFromUuid = async (uuid: string): Promise<number | null> => {
  const [rows]: any = await dbPool.query(`SELECT member_id FROM tbl_member_profile WHERE member_uuid = ?`, [uuid]);
  return rows.length > 0 ? rows[0].member_id : null;
};

export const addRelationship = async (req: Request, res: Response) => {
  try {
    const { to_member_uuid, relationship_label } = req.body;
    const fromMemberId = await getMemberIdFromToken((req as any).user);
    const communityId = await getCommunityIdFromToken((req as any).user);
    
    if (!fromMemberId) {
      return sendResponse(res, 401, false, "User not found or member_id missing");
    }
    
    if (!to_member_uuid || !relationship_label) {
      return sendResponse(res, 400, false, "to_member_uuid and relationship_label are required");
    }

    const toMemberId = await getMemberIdFromUuid(to_member_uuid);
    if (!toMemberId) {
      return sendResponse(res, 404, false, "Target member not found");
    }

    if (fromMemberId === toMemberId) {
      return sendResponse(res, 400, false, "Cannot create relationship with self");
    }

    const exists = await familyGraphModel.checkExistingRelationship(fromMemberId, toMemberId, communityId);
    if (exists) {
      return sendResponse(res, 400, false, "Relationship already exists");
    }

    const isAdmin = await isCommunityAdmin(fromMemberId, communityId);
    const isVerified = isAdmin ? 1 : 0; // Auto-verify if added by admin

    const result = await familyGraphModel.addRelationship({
      from_member_id: fromMemberId,
      to_member_id: toMemberId,
      relationship_label,
      community_id: communityId,
      added_by_member_id: fromMemberId,
      is_verified: isVerified
    });

    return sendResponse(res, 201, true, "Relationship added successfully", result);
  } catch (error: any) {
    logger.error(`Add relationship error: ${error.message}`);
    return sendResponse(res, 500, false, "Failed to add relationship", error.message);
  }
};

export const getMemberRelationships = async (req: Request, res: Response) => {
  try {
    const { memberUuid } = req.params;
    const communityId = await getCommunityIdFromToken((req as any).user);

    const memberId = await getMemberIdFromUuid(memberUuid);
    if (!memberId) {
      return sendResponse(res, 404, false, "Member not found");
    }

    const relationships = await familyGraphModel.getRelationshipsByMember(memberId, communityId);
    return sendResponse(res, 200, true, "Relationships fetched successfully", relationships);
  } catch (error: any) {
    logger.error(`Get member relationships error: ${error.message}`);
    return sendResponse(res, 500, false, "Failed to fetch relationships", error.message);
  }
};

export const getMyRelationships = async (req: Request, res: Response) => {
  try {
    const memberId = await getMemberIdFromToken((req as any).user);
    const communityId = await getCommunityIdFromToken((req as any).user);

    if (!memberId) {
      return sendResponse(res, 200, true, "No relationships found", []);
    }

    const relationships = await familyGraphModel.getRelationshipsByMember(memberId, communityId);
    return sendResponse(res, 200, true, "Relationships fetched successfully", relationships);
  } catch (error: any) {
    logger.error(`Get my relationships error: ${error.message}`);
    return sendResponse(res, 500, false, "Failed to fetch relationships", error.message);
  }
};

export const getFamilyTree = async (req: Request, res: Response) => {
  try {
    const { memberUuid } = req.params;
    const depth = parseInt(req.query.depth as string) || 2;
    const communityId = await getCommunityIdFromToken((req as any).user);

    const memberId = await getMemberIdFromUuid(memberUuid);
    if (!memberId) {
      return sendResponse(res, 404, false, "Member not found");
    }

    const tree = await familyGraphModel.getFamilyGraph(memberId, communityId, depth);
    return sendResponse(res, 200, true, "Family tree fetched successfully", tree);
  } catch (error: any) {
    logger.error(`Get family tree error: ${error.message}`);
    return sendResponse(res, 500, false, "Failed to fetch family tree", error.message);
  }
};

export const getPendingRelationships = async (req: Request, res: Response) => {
  try {
    const fromMemberId = await getMemberIdFromToken((req as any).user);
    const communityId = await getCommunityIdFromToken((req as any).user);

    if (!fromMemberId) {
      return sendResponse(res, 401, false, "User not found");
    }

    const isAdmin = await isCommunityAdmin(fromMemberId, communityId);
    if (!isAdmin) {
      return sendResponse(res, 403, false, "Unauthorized");
    }

    const pending = await familyGraphModel.getPendingRelationships(communityId);
    return sendResponse(res, 200, true, "Pending relationships fetched successfully", pending);
  } catch (error: any) {
    logger.error(`Get pending relationships error: ${error.message}`);
    return sendResponse(res, 500, false, "Failed to fetch pending relationships", error.message);
  }
};

export const approveRelationship = async (req: Request, res: Response) => {
  try {
    const { relationshipUuid } = req.params;
    const fromMemberId = await getMemberIdFromToken((req as any).user);
    const communityId = await getCommunityIdFromToken((req as any).user);

    if (!fromMemberId) {
      return sendResponse(res, 401, false, "User not found");
    }

    const isAdmin = await isCommunityAdmin(fromMemberId, communityId);
    if (!isAdmin) {
      return sendResponse(res, 403, false, "Unauthorized");
    }

    const success = await familyGraphModel.approveRelationship(relationshipUuid, fromMemberId);
    if (success) {
      return sendResponse(res, 200, true, "Relationship approved");
    } else {
      return sendResponse(res, 404, false, "Relationship not found");
    }
  } catch (error: any) {
    logger.error(`Approve relationship error: ${error.message}`);
    return sendResponse(res, 500, false, "Failed to approve relationship", error.message);
  }
};

export const rejectRelationship = async (req: Request, res: Response) => {
  try {
    const { relationshipUuid } = req.params;
    const fromMemberId = await getMemberIdFromToken((req as any).user);
    const communityId = await getCommunityIdFromToken((req as any).user);

    if (!fromMemberId) {
      return sendResponse(res, 401, false, "User not found");
    }

    const isAdmin = await isCommunityAdmin(fromMemberId, communityId);
    if (!isAdmin) {
      return sendResponse(res, 403, false, "Unauthorized");
    }

    const success = await familyGraphModel.rejectRelationship(relationshipUuid);
    if (success) {
      return sendResponse(res, 200, true, "Relationship rejected");
    } else {
      return sendResponse(res, 404, false, "Relationship not found");
    }
  } catch (error: any) {
    logger.error(`Reject relationship error: ${error.message}`);
    return sendResponse(res, 500, false, "Failed to reject relationship", error.message);
  }
};

export const deleteRelationship = async (req: Request, res: Response) => {
  try {
    const { relationshipUuid } = req.params;
    const fromMemberId = await getMemberIdFromToken((req as any).user);
    const communityId = await getCommunityIdFromToken((req as any).user);

    if (!fromMemberId) {
      return sendResponse(res, 401, false, "User not found");
    }

    const relation = await familyGraphModel.getRelationshipByUuid(relationshipUuid);
    if (!relation) {
      return sendResponse(res, 404, false, "Relationship not found");
    }

    const isAdmin = await isCommunityAdmin(fromMemberId, communityId);
    if (!isAdmin && relation.added_by_member_id !== fromMemberId) {
      return sendResponse(res, 403, false, "Unauthorized to delete this relationship");
    }

    const success = await familyGraphModel.deleteRelationship(relationshipUuid);
    return sendResponse(res, 200, true, "Relationship deleted");
  } catch (error: any) {
    logger.error(`Delete relationship error: ${error.message}`);
    return sendResponse(res, 500, false, "Failed to delete relationship", error.message);
  }
};
