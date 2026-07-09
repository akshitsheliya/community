import { Request, Response } from "express";
import { dbPool } from "../config/db";
import { MemberProfileModel } from "../models/committeeMemberModel";
import { sendResponse } from "../helpers/responseHelper";
import { getMessage } from "../utils/translation";
import { isCommunityAdmin } from "../helpers/adminCheckHelper";
import { sendNotificationToSingleUser } from "../firebase/helpers/notificationHelper";
import { storeNotification } from "../middleware/storeNotificationsMiddleware";
import moment from "moment";
import logger from "../utils/logger";
import { AuthRequest } from "../middleware/authMiddleware";

const memberModel = new MemberProfileModel(dbPool);

export const getCommitteeMember = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const community_id = user?.community_id;  // Fetch community_id from the user's token
  const user_id = req.user?.user_id;

  // Ensure user_id is available (authentication required)
  if (!user_id || !community_id) {
    logger.error("No user_id or community_id found in request - authentication required");
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  logger.info("getCommitteeMember API called", { user_id });

  try {
    const committeemem = await memberModel.getCommitteeMember(community_id);  // Pass community_id to the model
    logger.info("Fetched committee members from DB", {
      user_id,
      count: committeemem?.length || 0,
    });

    if (!committeemem || committeemem.length === 0) {
      logger.warn("No committee members found", { user_id });
      return sendResponse(
        res,
        200,
        true,
        getMessage("members_not_found", req.lang),
        []
      );
    }

    const baseUrl = process.env.BASE_URL;
    const formattedcommitteemembers = committeemem.map((rep) => ({
      ...rep,
      profile_photo: rep.profile_photo
        ? `${baseUrl}/Uploads/${rep.profile_photo}`
        : null,
      id_proof: rep.id_proof ? `${baseUrl}/Uploads/${rep.id_proof}` : null,
      date_of_birth: rep.date_of_birth
        ? moment(rep.date_of_birth).format("YYYY-MM-DD")
        : null,
    }));

    logger.info("Successfully formatted committee member data", { user_id });

    return sendResponse(
      res,
      200,
      true,
      getMessage("committee_retrived", req.lang),
      formattedcommitteemembers
    );
  } catch (error: any) {
    logger.error(`❌ [${user_id}] Error fetching committee members: ${error?.message}`, {
      user_id: user_id,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

export const addCommitteeMember = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const user_id = req.user?.user_id;
  const userUuid = req.user?.user_uuid;
  const community_id = user?.community_id;


  // Ensure user_id is available (authentication required)
  if (!user_id || !userUuid || !community_id) {
    logger.error("No user_id or userUuid or community_id found in request - authentication required", { user_id });
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  logger.info(`📥 [${user_id}] addCommitteeMember API called`, {
    user_id,
    params: req.params,
    body: req.body,
  });

  try {
    if (!(await isCommunityAdmin(userUuid))) {
      logger.warn("❌ Forbidden - not a community admin", { user_id });
      return sendResponse(res, 403, false, getMessage("admin_authority", req.lang));
    }

    const { member_uuid } = req.params;
    const { designation }: { designation: keyof typeof designationLimits } = req.body;

    logger.info(`📌 [${user_id}] Validating designation and member_uuid`, {
      user_id,
      member_uuid,
      designation,
    });

    if (!member_uuid) {
      logger.warn("❌ member_uuid is missing", { user_id });
      return sendResponse(res, 400, false, getMessage("all_fields_req", req.lang));
    }

    let normalizedDesignation = String(designation).toLowerCase();
    const designationMapping: Record<string, string> = {
      'president': 'pramukh',
      'vice president': 'up pramukh',
      'secretary': 'mantri',
      'joint secretary': 'sah mantri',
      'committee member': 'committee member',
      'member': 'committee member',
    };
    
    // Map to backend expected format if possible
    if (designationMapping[normalizedDesignation]) {
      normalizedDesignation = designationMapping[normalizedDesignation];
    }
    
    // Override designation with normalized version
    designation = normalizedDesignation as any;

    const existingMember = await memberModel.getMemberByUuid(member_uuid);
    if (!existingMember) {
      logger.warn("❌ Member not found", { user_id, member_uuid });
      return sendResponse(res, 404, false, getMessage("members_not_found", req.lang));
    }

    if (existingMember.designation) {
      logger.warn("❌ Member already has designation assigned", {
        user_id,
        member_uuid,
        existingDesignation: existingMember.designation,
      });
      return sendResponse(
        res,
        400,
        false,
        getMessage("designation_already_assigned_to_member", req.lang)
      );
    }

    const designationLimits = {
      pramukh: 2,
      "up pramukh": 2,
      mantri: 2,
      "sah mantri": 2,
    };

    const designationCount = await memberModel.getDesignationCount(designation, community_id);
    logger.info(`🔢 [${user_id}] Current count for designation '${designation}' is ${designationCount}`, { user_id });

    if (designationCount >= (designationLimits[designation] || Infinity)) {
      logger.warn("❌ Designation limit exceeded", { user_id, designation });
      return sendResponse(res, 400, false, getMessage("designation_limit_exceeded", req.lang));
    }

    const result = (await memberModel.addCommitteeMember(member_uuid, designation)) as { affectedRows: number };

    if (result.affectedRows > 0) {
      logger.info("✅ Committee member added successfully", {
        user_id,
        member_uuid,
        designation,
      });

      const tokenQuery = `SELECT fcm_device_token, app_language FROM tbl_logins WHERE member_id = ?`;
      const [rows]: any = await dbPool.execute(tokenQuery, [existingMember.member_id]);

      const designationLabels = {
        en_US: {
          pramukh: "President",
          "up pramukh": "Vice President",
          mantri: "Secretary",
          "sah mantri": "Joint Secretary",
          "committee member": "Committee Member",
        },
        gu_IN: {
          pramukh: "પ્રમુખ",
          "up pramukh": "ઉપ પ્રમુખ",
          mantri: "મંત્રી",
          "sah mantri": "સહ મંત્રી",
          "committee member": "કમિટી સભ્ય",
        },
      };

      const appLanguage = rows[0]?.app_language === "gu_IN" ? "gu_IN" : "en_US";
      const designationText = designationLabels[appLanguage]?.[designation as keyof typeof designationLabels['en_US']] || designation;

      // Store Notification
      await storeNotification(
        existingMember.member_id,
        "committee_added",
        appLanguage === "gu_IN"
          ? `તમારી ${designationText} તરીકે નિમણૂક કરેલી છે.`
          : `You have been added as a ${designationText}.`,
          community_id
      );
      logger.info("🔔 Notification stored", {
        user_id,
        member_id: existingMember.member_id,
        designationText,
      });

      if (rows.length > 0 && rows[0].fcm_device_token) {
        const fcmToken = rows[0].fcm_device_token;
        const title = appLanguage === "gu_IN" ? "અભિનંદન!" : "Congratulations!";
        const message =
          appLanguage === "gu_IN"
            ? `તમારી ${designationText} તરીકે નિમણૂક કરેલી છે.`
            : `You have been added as a ${designationText}.`;

        await sendNotificationToSingleUser(fcmToken, title, message, {
          type: "committee_added",
          member_id: String(existingMember.member_id),
          member_uuid,
          designation,
        });

        logger.info("✅ Push notification sent successfully", {
          user_id,
          fcmToken,
          title,
          message,
        });
      } else {
        logger.warn("⚠️ No FCM token found; push notification not sent", {
          user_id,
          member_id: existingMember.member_id,
        });
      }

      return sendResponse(
        res,
        200,
        true,
        getMessage("committee_member_updated", req.lang)
      );
    } else {
      logger.error("❌ DB update failed: No rows affected", {
        user_id,
        member_uuid,
        designation,
      });
      return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
    }
  } catch (error: any) {
    logger.error(`❌ [${user_id}] Exception in addCommitteeMember: ${error?.message}`, {
      user_id: user_id,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

export const editCommitteeMember = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const user_id = req.user?.user_id;
  const userUuid = req.user?.user_uuid;
  const community_id = user?.community_id;


  // Ensure user_id is available (authentication required)
  if (!user_id || !userUuid || !community_id) {
    logger.error("No user_id or userUuid or community_id found in request - authentication required", { user_id });
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  logger.info(`📥 [${user_id}] Received update request:`, {
    user_id,
    member_uuid: req.params.member_uuid,
    designation: req.body.designation,
  });

  try {
    if (!(await isCommunityAdmin(userUuid))) {
      logger.warn(`🚫 [${user_id}] Access denied. Not a community admin.`, { user_id });
      return sendResponse(
        res,
        403,
        false,
        getMessage("admin_authority", req.lang)
      );
    }

    const { member_uuid } = req.params;
    const { designation }: { designation: keyof typeof designationLimits } = req.body;

    if (!member_uuid || !designation) {
      logger.warn(`⚠️ [${user_id}] Missing fields in request`, { user_id });
      return sendResponse(
        res,
        400,
        false,
        getMessage("all_fields_req", req.lang)
      );
    }

    let normalizedDesignation = String(designation).toLowerCase();
    const designationMapping: Record<string, string> = {
      'president': 'pramukh',
      'vice president': 'up pramukh',
      'secretary': 'mantri',
      'joint secretary': 'sah mantri',
      'committee member': 'committee member',
      'member': 'committee member',
    };
    
    if (designationMapping[normalizedDesignation]) {
      normalizedDesignation = designationMapping[normalizedDesignation];
    }
    
    // Override designation
    designation = normalizedDesignation as any;

    const existingMember = await memberModel.getMemberByUuid(member_uuid);
    if (!existingMember || existingMember.is_committee_member !== 1) {
      logger.warn(`⚠️ [${user_id}] Member not found or not a committee member`, { user_id });
      return sendResponse(
        res,
        404,
        false,
        getMessage("members_not_found", req.lang)
      );
    }

    const designationCount = await memberModel.getDesignationCount(designation, community_id);
    const designationLimits = {
      pramukh: 2,
      "up pramukh": 2,
      mantri: 2,
      "sah mantri": 2,
    };

    if (designationCount >= designationLimits[designation]) {
      logger.warn(`⚠️ [${user_id}] Designation limit exceeded for ${designation}`, { user_id });
      return sendResponse(
        res,
        400,
        false,
        getMessage("designation_limit_exceeded", req.lang)
      );
    }

    const result = await memberModel.updateCommitteeMemberDesignation(
      member_uuid,
      designation
    );

    if (result.affectedRows > 0) {
      logger.info(`✅ [${user_id}] Committee designation updated successfully for member_uuid: ${member_uuid}`, { user_id });

      // Get FCM token and app_language
      const tokenQuery = `SELECT fcm_device_token, app_language FROM tbl_logins WHERE member_id = ?`;
      const [rows]: any = await dbPool.execute(tokenQuery, [
        existingMember.member_id,
      ]);

      let appLanguage = "en_US";
      let fcmToken = null;
      if (rows.length > 0 && rows[0].fcm_device_token) {
        fcmToken = rows[0].fcm_device_token;
        appLanguage = rows[0].app_language || "en_US";
      }

      const designationLabels = {
        en_US: {
          pramukh: "President",
          "up pramukh": "Vice President",
          mantri: "Secretary",
          "sah mantri": "Joint Secretary",
          "committee member": "Committee Member",
        },
        gu_IN: {
          pramukh: "પ્રમુખ",
          "up pramukh": "ઉપ પ્રમુખ",
          mantri: "મંત્રી",
          "sah mantri": "સહ મંત્રી",
          "committee member": "કમિટી સભ્ય",
        },
      };

      const langKey = appLanguage === "gu_IN" ? "gu_IN" : "en_US";
      const designationText = designationLabels[langKey]?.[designation as keyof typeof designationLabels['en_US']] || designation;

      const title = langKey === "gu_IN" ? "હોદ્દો અપડેટ થયો!" : "Designation Updated!";
      const message =
        langKey === "gu_IN"
          ? `તમારા પદ માં સુધારો થયો છે. હવે તમે ${designationText} તરીકે નિમણૂક થયા છો.`
          : `Your designation has been changed to ${designationText}.`;

      await storeNotification(
        existingMember.member_id,
        "committee_update",
        message,
        community_id
      );

      if (fcmToken) {
        await sendNotificationToSingleUser(fcmToken, title, message, {
          type: "committee_update",
          member_id: String(existingMember.member_id),
          member_uuid,
          designation,
        });

        logger.info(`📲 [${user_id}] Committee designation update notification sent to ${existingMember.member_id}`, { user_id });
      }

      return sendResponse(
        res,
        200,
        true,
        getMessage("committee_member_updated", req.lang)
      );
    } else {
      logger.warn(`⚠️ [${user_id}] No rows affected while updating designation for ${member_uuid}`, { user_id });
      return sendResponse(
        res,
        500,
        false,
        getMessage("int_server_err", req.lang)
      );
    }
  } catch (error: any) {
    logger.error(`❌ [${user_id}] Error updating committee designation: ${error?.message}`, {
      user_id: user_id,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

export const deleteCommitteeMember = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const community_id = user?.community_id; 
  const user_id = req.user?.user_id;
  const userUuid = req.user?.user_uuid;

  // Ensure user_id is available (authentication required)
  if (!user_id || !userUuid || !community_id) {
    logger.error("No user_id or userUuid or community_id found in request - authentication required", { user_id });
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  logger.info(`📥 [${user_id}] Received delete request for committee member`, {
    user_id,
    member_uuid: req.params.member_uuid,
  });

  try {
    if (!(await isCommunityAdmin(userUuid))) {
      logger.warn(`🚫 [${user_id}] Forbidden: Not a community admin`, { user_id });
      return sendResponse(
        res,
        403,
        false,
        getMessage("admin_authority", req.lang)
      );
    }

    const { member_uuid } = req.params;
    if (!member_uuid) {
      logger.warn(`⚠️ [${user_id}] Missing member_uuid parameter`, { user_id });
      return sendResponse(
        res,
        400,
        false,
        getMessage("all_fields_req", req.lang)
      );
    }

    const existingMember = await memberModel.getMemberByUuid(member_uuid);
    if (!existingMember) {
      logger.warn(`❌ [${user_id}] Member not found: ${member_uuid}`, { user_id });
      return sendResponse(
        res,
        404,
        false,
        getMessage("members_not_found", req.lang)
      );
    }

    if (existingMember.is_committee_member === 0) {
      logger.info(`ℹ️ [${user_id}] Member is not currently a committee member`, { user_id });
      return sendResponse(
        res,
        200,
        true,
        getMessage("not_committee_member", req.lang)
      );
    }

    const result = (await memberModel.removeCommitteeMember(member_uuid)) as {
      affectedRows: number;
    };

    if (result.affectedRows > 0) {
      logger.info(`✅ [${user_id}] Committee member removed successfully`, {
        user_id,
        member_uuid,
      });

      const tokenQuery = `SELECT fcm_device_token, app_language FROM tbl_logins WHERE member_id = ?`;
      const [rows]: any = await dbPool.execute(tokenQuery, [
        existingMember.member_id,
      ]);

      let appLanguage = "en_US";
      let fcmToken = null;
      if (rows.length > 0 && rows[0].fcm_device_token) {
        fcmToken = rows[0].fcm_device_token;
        appLanguage = rows[0].app_language || "en_US";
      }

      const langKey = appLanguage === "gu_IN" ? "gu_IN" : "en_US";
      const title = langKey === "gu_IN" ? "હોદ્દો દૂર થયો!" : "Designation Removed!";
      const message =
        langKey === "gu_IN"
          ? "તમારું કમિટી સભ્ય પદ હટાવવામાં આવ્યું છે."
          : "You have been removed as a committee member.";

      await storeNotification(existingMember.member_id, "committee_removal", message, community_id);

      if (fcmToken) {
        await sendNotificationToSingleUser(fcmToken, title, message, {
          type: "committee_removal",
          member_id: String(existingMember.member_id),
          member_uuid,
        });

        logger.info(
          `📤 [${user_id}] Notification sent to removed committee member`,
          { user_id, member_id: existingMember.member_id, title, message }
        );
      } else {
        logger.info(`ℹ️ [${user_id}] No FCM token found for member`, {
          user_id,
          member_id: existingMember.member_id,
        });
      }

      return sendResponse(
        res,
        200,
        true,
        getMessage("committee_member_removed", req.lang)
      );
    } else {
      logger.error(`❌ [${user_id}] Failed to remove committee member`, {
        user_id,
        member_uuid,
      });
      return sendResponse(
        res,
        500,
        false,
        getMessage("int_server_err", req.lang)
      );
    }
  } catch (error: any) {
    logger.error(`❌ [${user_id}] Error in deleteCommitteeMember: ${error?.message}`, {
      user_id: user_id,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};