import { Request, Response } from "express";
import { dbPool } from "../config/db";
import { UserVerificationModel } from "../models/profileModel";
import { sendResponse } from "../helpers/responseHelper";
import { getMessage } from "../utils/translation";
import { getPaginationFromRequest } from "../helpers/paginationHelper";
import { sendNotificationToSingleUser } from "../firebase/helpers/notificationHelper";
import { storeNotification } from "../middleware/storeNotificationsMiddleware";
import logger from "../utils/logger";
import { AuthRequest } from "../middleware/authMiddleware";

const userVerification = new UserVerificationModel(dbPool);

// Get all unverified users
export const getUnverifiedUsers = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const community_id = user?.community_id;
  const user_id = req.user?.user_id;

  // Ensure user_id is available (authentication required)
  if (!user_id || !community_id) {
    logger.error("No user_id or community_id found in request - authentication required");
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  try {
    logger.info(`📥 [${user_id}] Fetching all unverified users`, { user_id });

    // Pass only community_id to the model method
    const result = await userVerification.getUnverifiedUsers(community_id);

    if (!result.data || result.data.length === 0) {
      logger.info(`📤 [${user_id}] No unverified users found`, { user_id });
      return sendResponse(
        res,
        200,
        true,
        getMessage("no_unverified_users_found", req.lang),
        [],
        0
      );
    }

    // Construct full URLs for profile_photo
    const baseUrl = process.env.BASE_URL;
    const enhancedData = result.data.map((user: any) => ({
      ...user,
      profile_photo: user.profile_photo
        ? `${baseUrl}/Uploads/${user.profile_photo}`
        : null,
    }));

    logger.info(`✅ [${user_id}] Retrieved ${enhancedData.length} unverified users successfully`, { user_id });

    sendResponse(
      res,
      200,
      true,
      getMessage("unverified_user_fetch_success", req.lang),
      enhancedData,
      result.total
    );
  } catch (error: any) {
    logger.error(`❌ [${user_id}] Error fetching unverified users: ${error?.message}`, {
      user_id: user_id,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

// Approve a user
export const approveUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user } = req as AuthRequest;
  const user_id = req.user?.user_id;
  const member_uuid = req.params.member_uuid;
  const community_id = user?.community_id;


  // Ensure user_id is available (authentication required)
  if (!user_id || !community_id) {
    logger.error("No user_id or community_id found in request - authentication required");
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  try {
    if (!member_uuid) {
      logger.warn(`❌ [${user_id}] member_uuid is missing from request parameters`, { user_id });
      sendResponse(res, 400, false, getMessage("member_UUID_is_required", req.lang));
      return;
    }

    logger.info(`📥 [${user_id}] Admin ${user_id} is approving user with member_uuid: ${member_uuid}`, { user_id });

    const result = await userVerification.approveUser(member_uuid, user_id, community_id);

    if (result.affectedRows === 0) {
      logger.warn(`❌ [${user_id}] User with member_uuid: ${member_uuid} not found or already verified`, { user_id });
      sendResponse(res, 404, false, getMessage("user_not_found_or_already_ver", req.lang));
      return;
    }

    logger.info(`✅ [${user_id}] User with member_uuid: ${member_uuid} successfully approved`, { user_id });

    const fcmData = await userVerification.getFcmTokenByMemberUuid(member_uuid);

    if (fcmData) {
      const { fcm_device_token, member_id, app_language } = fcmData;

      // Translate message based on app_language
      let title = "Account Approved ✅";
      let message =
        "Your account has been successfully verified. You can now access all features!";

      if (app_language === "gu_IN") {
        title = "અકાઉંટ મંજૂર થઈ ગયું ✅";
        message =
          "તમારું અકાઉંટ મંજૂર થઈ ગયું છે. હવે તમે એપ્લિકેશન વાપરી શકશો.";
      }

      // Store notification
      logger.info(`📤 [${user_id}] Storing approval notification for member_id: ${member_id}`, { user_id });
      await storeNotification(member_id, "approve_user", message , community_id);

      // Send push notification
      logger.info(`📱 [${user_id}] Sending push notification to user with member_id: ${member_id}`, { user_id });
      await sendNotificationToSingleUser(fcm_device_token, title, message, {
        type: "approve_user",
        member_uuid,
        member_id: String(member_id),
      });

      logger.info(`✅ [${user_id}] User approval notification sent and stored successfully`, { user_id });
    } else {
      logger.warn(`⚠️ [${user_id}] No FCM token found for member_uuid: ${member_uuid}`, { user_id });
    }

    sendResponse(res, 200, true, getMessage("user_approved_success", req.lang));
  } catch (error: any) {
    logger.error(`❌ [${user_id}] Error approving user with member_uuid: ${error?.message}`, {
      user_id: user_id,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

// Reject a user
export const rejectUser = async (req: Request, res: Response): Promise<void> => {
  const { user } = req as AuthRequest;
  const user_id = req.user?.user_id;
  const community_id = user?.community_id;

  // Ensure user_id is available (authentication required)
  if (!user_id || !community_id) {
    logger.error("No user_id or community_id found in request - authentication required");
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  try {
    const { member_uuid } = req.params;
    const { reject_reason } = req.body;

    logger.info(`📥 [${user_id}] Initiating user rejection for member_uuid: ${member_uuid}`, { user_id });

    if (!reject_reason) {
      logger.warn(`⚠️ [${user_id}] Reject reason is missing in request body`, { user_id });
      sendResponse(res, 400, false, getMessage("reject_reason_is_req", req.lang));
      return;
    }

    if (!member_uuid) {
      logger.warn(`⚠️ [${user_id}] Member UUID is missing in request params`, { user_id });
      sendResponse(res, 400, false, getMessage("member_UUID_is_required", req.lang));
      return;
    }

    const result = await userVerification.rejectUser(member_uuid, reject_reason, community_id);

    if (result.affectedRows === 0) {
      logger.warn(`⚠️ [${user_id}] User not found or already rejected`, { user_id, member_uuid });
      sendResponse(res, 404, false, getMessage("user_not_found_or_already_rejected", req.lang));
      return;
    }

    logger.info(`✅ [${user_id}] User successfully rejected`, { user_id, member_uuid });

    const fcmData = await userVerification.getFcmTokenByMemberUuid(member_uuid);

    if (fcmData) {
      const { fcm_device_token, member_id, app_language } = fcmData;

      let title = "Account Rejected ❌";
      let message = `Your account verification has been rejected. Reason: ${reject_reason}`;

      if (app_language === "gu_IN") {
        title = "અકાઉંટ રિજેક્ટ થયું ❌";
        message = `તમારું અકાઉંટ '${reject_reason}' કારણે રિજેક્ટ થયું છે.`;
      }

      logger.info(`📤 [${user_id}] Storing rejection notification for member_id: ${member_id}`, { user_id });
      await storeNotification(member_id, "reject_user", message, community_id);

      logger.info(`📱 [${user_id}] Sending push notification to user with member_id: ${member_id}`, { user_id });
      await sendNotificationToSingleUser(fcm_device_token, title, message, {
        type: "reject_user",
        member_uuid,
        member_id: String(member_id),
        reject_reason,
      });

      logger.info(`✅ [${user_id}] Notification sent and stored successfully`, {
        user_id,
        member_id,
        member_uuid,
        reject_reason,
      });
    } else {
      logger.warn(`⚠️ [${user_id}] No FCM token found for member_uuid: ${member_uuid}`, { user_id });
    }

    sendResponse(res, 200, true, getMessage("user_rejected_success", req.lang));
  } catch (error: any) {
    logger.error(`❌ [${user_id}] Error rejecting user: ${error?.message}`, {
      user_id: user_id,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};