import { Request, Response } from "express";
import { familylistModel } from "../models/memberlistModel";
import { sendResponse } from "../helpers/responseHelper";
import { getMessage } from "../utils/translation";
import moment from "moment";
import logger from "../utils/logger";

const familyListModel = new familylistModel();

export const getFamilyMemberDetails = async (req: Request, res: Response) => {
  const user_id = req.user?.user_id;

  // Ensure user_id is available (authentication required)
  if (!user_id) {
    logger.error(`❌ [${user_id || 'unknown'}] Unauthorized access attempt: No user_id found`, {
      user_id: user_id || 'unknown',
      method: req.method,
      url: req.originalUrl
    });
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  try {
    const familyUuid = req.params.family_uuid;

    logger.info(`📥 [${user_id}] Fetching family member details`, {
      user_id,
      method: req.method,
      url: req.originalUrl,
      params: { familyUuid }
    });

    if (!familyUuid) {
      logger.warn(`⚠️ [${user_id}] Missing family_uuid parameter`, {
        user_id,
        method: req.method,
        url: req.originalUrl
      });
      return sendResponse(
        res,
        400,
        false,
        getMessage("family_not_found", req.lang)
      );
    }

    logger.info(`📤 [${user_id}] Querying family members for family_uuid: ${familyUuid}`, {
      user_id,
      method: req.method,
      url: req.originalUrl
    });
    const familyMembersResult =
      await familyListModel.getFamilyMembersByFamilyUuid(familyUuid);

    if (!familyMembersResult || familyMembersResult.length === 0) {
      logger.info(`📥 [${user_id}] No family members found for family_uuid: ${familyUuid}`, {
        user_id,
        method: req.method,
        url: req.originalUrl
      });
      return sendResponse(
        res,
        200,
        true,
        getMessage("members_not_found", req.lang),
        []
      );
    }

    const baseUrl = process.env.BASE_URL;
    const maskedFamilyMembers = familyMembersResult.map((member) => {
      const isMainMember = member.member_id === member.family_main_member_id;

      return {
        ...member,
        user_uuid: member.user_uuid,
        phone_number:
          member.gender.toLowerCase() === "female"
            ? "**********"
            : member.phone_number,
        profile_photo: member.profile_photo ? `${baseUrl}/uploads/${member.profile_photo}` : null,
        id_proof: member.id_proof ? `${baseUrl}/uploads/${member.id_proof}` : null,
        date_of_birth: member.date_of_birth ? moment(member.date_of_birth).format("YYYY-MM-DD") : null,
        isMainMember: isMainMember,
        relationship: isMainMember ? { value: "himself", label: "પોતે", name: "relationship" } : member.relationship,
      };
    });

    logger.info(`✅ [${user_id}] Retrieved ${maskedFamilyMembers.length} family member(s) successfully for family_uuid: ${familyUuid}`, {
      user_id,
      method: req.method,
      url: req.originalUrl
    });

    sendResponse(
      res,
      200,
      true,
      getMessage("family_member_details_retrieved", req.lang),
      maskedFamilyMembers
    );
  } catch (error) {
    logger.error(`❌ [${user_id}] Error fetching family member details for family_uuid: ${req.params.family_uuid}`, {
      user_id,
      method: req.method,
      url: req.originalUrl,
      error
    });
    sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};