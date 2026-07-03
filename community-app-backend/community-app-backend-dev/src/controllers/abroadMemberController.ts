import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { dbPool } from "../config/db";
import { AbroadMemberModel } from "../models/abroadMemberModel";
import { sendResponse } from "../helpers/responseHelper";
import { getMessage } from "../utils/translation";
import { v4 as uuidv4 } from "uuid";
import logger from "../utils/logger";

const abroadMemberModel = new AbroadMemberModel(dbPool);

// Get all members (list)
export const getAllMembers = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const userId = req.user?.user_id;
  const community_id = user?.community_id;

  // Ensure user_id is available for logging
  if (!userId || !community_id) {
    logger.error("No user_id found in request - authentication required");
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  try {
    logger.info(`📥 [${userId}] Fetching all abroad members`, {
      user_id: userId,
      method: req.method,
      url: req.originalUrl
    });

    const members = await abroadMemberModel.getAllMembers(community_id);

    if (!members || members.length === 0) {
      logger.info(`📥 [${userId}] No abroad members found`, { user_id: userId });
      return sendResponse(res, 200, true, getMessage("no_abroad_member_found", req.lang), []);
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const formattedMembers = members.map(member => ({
      ...member,
      passport_photo: member.passport_photo 
        ? `${baseUrl}/Uploads/${member.passport_photo}`
        : null
    }));

    logger.info(`✅ [${userId}] Successfully fetched ${members.length} abroad members`, { user_id: userId });
    return sendResponse(
      res,
      200,
      true,
      getMessage("abroad_members_retrived", req.lang),
      formattedMembers
    );
  } catch (error: any) {
    logger.error(`❌ [${userId}] Error getting abroad member: ${error?.message}`, {
      user_id: userId,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

// Get a member by abroad_uuid
export const getMemberByUuid = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const userId = user?.user_id;
  const community_id = user?.community_id;
  const { abroad_uuid } = req.params;

  if (!userId || !community_id) {
    logger.error("Missing user_id or community_id in token - authentication required");
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  if (!abroad_uuid) {
    logger.warn(`⚠️ [${userId}] abroad_uuid not provided`, { user_id: userId });
    return sendResponse(res, 400, false, "abroad_uuid is required in URL");
  }

  try {
    logger.info(`📥 [${userId}] Fetching abroad member by UUID: ${abroad_uuid}`, {
      user_id: userId,
      community_id: community_id,
      method: req.method,
      url: req.originalUrl
    });

    const member = await abroadMemberModel.getMemberByUuid(abroad_uuid, community_id);

    if (!member) {
      logger.info(`📥 [${userId}] Abroad member with UUID ${abroad_uuid} not found or access denied`, {
        user_id: userId,
        community_id: community_id,
      });
      return sendResponse(res, 404, false, getMessage("no_members_found", req.lang));
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const formattedMember = {
      ...member,
      passport_photo: member.passport_photo 
        ? `${baseUrl}/Uploads/${member.passport_photo}`
        : null
    };

    logger.info(`✅ [${userId}] Successfully fetched abroad member with UUID: ${abroad_uuid}`, {
      user_id: userId,
      community_id: community_id,
    });
    return sendResponse(
      res,
      200,
      true,
      getMessage("abroad_members_retrived", req.lang),
      formattedMember
    );
  } catch (error: any) {
    logger.error(`❌ [${userId}] Error fetching abroad member: ${error?.message}`, {
      user_id: userId,
      community_id: community_id,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

// Add a new member with generated abroad_uuid
export const addMember = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const userId = user?.user_id;
  const userUuid = user?.user_uuid;
  const community_id = user?.community_id;

  // Ensure user_id and user_uuid are available
  if (!userId || !userUuid || !community_id) {
    logger.error("No user_id or user_uuid found in request - authentication required");
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  try {
    logger.info(`📥 [${userId}] Attempting to add a new abroad member`, {
      user_id: userId,
      method: req.method,
      url: req.originalUrl
    });

    logger.info(`📥 [${userId}] Received request parameters:`, {
      user_id: userId,
      full_name: req.body.full_name,
      govt_private: req.body.govt_private,
      designation: req.body.designation,
      career: req.body.career,
      experience_year: req.body.experience_year,
      success_mantra: req.body.success_mantra,
      contact_number: req.body.contact_number,
      country: req.body.country,
      city: req.body.city,
      thoughts_on_committee: req.body.thoughts_on_committee
    });

    const memberId = await abroadMemberModel.getMemberIdFromUserUuid(userUuid);
    if (!memberId) {
      logger.warn(`⚠️ [${userId}] No member_id found for user_uuid: ${userUuid}`, { user_id: userId });
      return sendResponse(res, 400, false, getMessage("no_members_found", req.lang));
    }

    const {
      full_name, govt_private, designation, career, experience_year, success_mantra,
      contact_number, country, city, thoughts_on_committee
    } = req.body;

    if (!full_name) {
      logger.warn(`⚠️ [${userId}] Missing required field: full_name`, { user_id: userId });
      return sendResponse(res, 400, false, getMessage("all_fields_req", req.lang));
    }

    const abroadUuid = uuidv4();
    const passportPhoto = req.file ? `passport_photos/${req.file.filename}` : null;

    if (req.file) {
      logger.info(`📷 [${userId}] Uploaded passport photo: ${passportPhoto}`, { user_id: userId });
    }

    const result = await abroadMemberModel.addMember(
      abroadUuid, memberId, full_name, passportPhoto, govt_private, designation,
      career, experience_year ? parseInt(experience_year) : null, success_mantra,
      contact_number, country, city, thoughts_on_committee, community_id, userId 
    ) as { insertId: number };


    if (result.insertId) {
      const baseUrl = process.env.BASE_URL || "http://localhost:3000";
      const fullPassportPhotoUrl = passportPhoto 
        ? `${baseUrl}/Uploads/${passportPhoto}`
        : null;

      const newMember = await abroadMemberModel.getMemberByUuid(abroadUuid, community_id);

      logger.info(`✅ [${userId}] Successfully added abroad member with UUID: ${abroadUuid}`, { user_id: userId });
      return sendResponse(res, 201, true, getMessage("member_added_success", req.lang), {
        id: result.insertId,
        abroad_uuid: abroadUuid,
        member_id: memberId,
        full_name,
        passport_photo: fullPassportPhotoUrl,
        govt_private,
        designation,
        career,
        experience_year: experience_year ? parseInt(experience_year) : null,
        success_mantra,
        contact_number,
        country,
        city,
        thoughts_on_committee,
        member_uuid: newMember?.member_uuid || null
      });
    }

  } catch (error: any) {
    logger.error(`❌ [${userId}] Error adding abroad member: ${error?.message}`, {
      user_id: userId,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

// Update a specific member by abroad_uuid
export const updateMember = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const community_id = user?.community_id;
  const userId = req.user?.user_id;
  const userUuid = req.user?.user_uuid;
  const { abroad_uuid } = req.params;

  // Ensure user_id and user_uuid are available
  if (!userId || !userUuid || !community_id) {
    logger.error("No user_id or user_uuid found in request - authentication required");
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  if (!abroad_uuid) {
    logger.warn(`⚠️ [${userId}] abroad_uuid not provided`, { user_id: userId });
    return sendResponse(res, 400, false, "abroad_uuid is required in URL");
  }

  try {
    logger.info(`📥 [${userId}] Attempting to update abroad member with UUID: ${abroad_uuid}`, {
      user_id: userId,
      method: req.method,
      url: req.originalUrl
    });

    logger.info(`📥 [${userId}] Received request parameters:`, {
      user_id: userId,
      full_name: req.body.full_name,
      govt_private: req.body.govt_private,
      designation: req.body.designation,
      career: req.body.career,
      experience_year: req.body.experience_year,
      success_mantra: req.body.success_mantra,
      contact_number: req.body.contact_number,
      country: req.body.country,
      city: req.body.city,
      thoughts_on_committee: req.body.thoughts_on_committee
    });

    const memberId = await abroadMemberModel.getMemberIdFromUserUuid(userUuid);
    if (!memberId) {
      logger.warn(`⚠️ [${userId}] No member_id found for user_uuid: ${userUuid}`, { user_id: userId });
      return sendResponse(res, 400, false, getMessage("no_members_found", req.lang));
    }

    const {
      full_name, govt_private, designation, career, experience_year, success_mantra,
      contact_number, country, city, thoughts_on_committee
    } = req.body;

    if (!full_name) {
      logger.warn(`⚠️ [${userId}] Missing required field: full_name`, { user_id: userId });
      return sendResponse(res, 400, false, getMessage("all_fields_req", req.lang));
    }

    const existingMember = await abroadMemberModel.getMemberByUuid(abroad_uuid, community_id);
    if (!existingMember) {
      logger.warn(`⚠️ [${userId}] Abroad member with UUID ${abroad_uuid} not found`, { user_id: userId });
      return sendResponse(res, 404, false, "Member not found");
    }

    if (existingMember.member_id !== memberId) {
      logger.warn(`⚠️ [${userId}] Permission denied: Cannot update member`, { user_id: userId, member_id: existingMember.member_id });
      return sendResponse(res, 403, false, getMessage("you_cannot_update", req.lang));
    }

    const passportPhoto = req.file ? `passport_photos/${req.file.filename}` : existingMember.passport_photo;

    if (req.file) {
      logger.info(`📷 [${userId}] Uploaded new passport photo: ${passportPhoto}`, { user_id: userId });
    }

    const result = await abroadMemberModel.updateMember(
      abroad_uuid,
      full_name, passportPhoto, govt_private, designation, career,
      experience_year ? parseInt(experience_year) : null, success_mantra,
      contact_number, country, city, thoughts_on_committee, community_id
    ) as { affectedRows: number };

    if (result.affectedRows > 0) {
      const baseUrl = process.env.BASE_URL || "http://localhost:3000";
      const fullPassportPhotoUrl = passportPhoto 
        ? `${baseUrl}/Uploads/${passportPhoto}`
        : null;

      const updatedMember = await abroadMemberModel.getMemberByUuid(abroad_uuid, community_id);

      logger.info(`✅ [${userId}] Successfully updated abroad member with UUID: ${abroad_uuid}`, { user_id: userId });
      return sendResponse(res, 200, true, getMessage("member_updated", req.lang), {
        abroad_uuid,
        member_id: memberId,
        full_name,
        passport_photo: fullPassportPhotoUrl,
        govt_private,
        designation,
        career,
        experience_year: experience_year ? parseInt(experience_year) : null,
        success_mantra,
        contact_number,
        country,
        city,
        thoughts_on_committee,
        member_uuid: updatedMember?.member_uuid || null
      });
    }

  } catch (error: any) {
    logger.error(`❌ [${userId}] Error updating abroad member: ${error?.message}`, {
      user_id: userId,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

// Delete a specific member by abroad_uuid
export const deleteMember = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const community_id = user?.community_id;
  const userId = req.user?.user_id;
  const userUuid = req.user?.user_uuid;
  const { abroad_uuid } = req.params;

  // Ensure user_id and user_uuid are available
  if (!userId || !userUuid || !community_id) {
    logger.error("No user_id or user_uuid found in request - authentication required");
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  if (!abroad_uuid) {
    logger.warn(`⚠️ [${userId}] abroad_uuid not provided`, { user_id: userId });
    return sendResponse(res, 400, false, "abroad_uuid is required in URL");
  }

  try {
    logger.info(`📥 [${userId}] Attempting to delete abroad member with UUID: ${abroad_uuid}`, {
      user_id: userId,
      method: req.method,
      url: req.originalUrl
    });

    const memberId = await abroadMemberModel.getMemberIdFromUserUuid(userUuid);
    if (!memberId) {
      logger.warn(`⚠️ [${userId}] No member_id found for user_uuid: ${userUuid}`, { user_id: userId });
      return sendResponse(res, 400, false, getMessage("no_members_found", req.lang));
    }

    const existingMember = await abroadMemberModel.getMemberByUuid(abroad_uuid, community_id);
    if (!existingMember) {
      logger.warn(`⚠️ [${userId}] Abroad member with UUID ${abroad_uuid} not found`, { user_id: userId });
      return sendResponse(res, 404, false, getMessage("no_members_found", req.lang));
    }

    const isAdminQuery = `
      SELECT is_community_admin 
      FROM tbl_member_profile 
      WHERE member_id = ?
    `;
    const [adminRows]: any = await dbPool.query(isAdminQuery, [memberId]);
    const isAdmin = adminRows.length > 0 && adminRows[0].is_community_admin === 1;

    if (existingMember.member_id !== memberId && !isAdmin) {
      logger.warn(`⚠️ [${userId}] Permission denied: Cannot delete member`, {
        user_id: userId,
        member_id: existingMember.member_id,
        is_admin: isAdmin
      });
      return sendResponse(res, 403, false, getMessage("you_cannot_update", req.lang));
    }

    const result = await abroadMemberModel.deleteMember(abroad_uuid, community_id) as { affectedRows: number };
    if (result.affectedRows > 0) {
      logger.info(`✅ [${userId}] Successfully deleted abroad member with UUID: ${abroad_uuid}`, { user_id: userId });
      return sendResponse(res, 200, true, getMessage("member_deleted", req.lang));
    }
  } catch (error: any) {
    logger.error(`❌ [${userId}] Error deleting abroad member: ${error?.message}`, {
      user_id: userId,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};