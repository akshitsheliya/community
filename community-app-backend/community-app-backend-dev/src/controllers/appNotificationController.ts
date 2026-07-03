import { Request, Response } from "express";
import { appNotificationModel } from "../models/appNotificationModel";
import { dbPool } from "../config/db";
import { sendResponse } from "../helpers/responseHelper";
import { getMessage } from "../utils/translation";
import logger from "../utils/logger";
import { AuthRequest } from "../middleware/authMiddleware";

const notificationModel = new appNotificationModel(dbPool);

export const getAppNotifications = async (req: Request, res: Response) => {
   const { user } = req as AuthRequest;
   const community_id = user?.community_id;
  const userId = req.user?.user_id;
  const userUuid = req.user?.user_uuid;

  // Ensure user_id and user_uuid are available
  if (!userId || !userUuid || !community_id) {
    logger.error(`❌ [${userId || 'unknown'}] Unauthorized access attempt: No user_id or user_uuid found`, {
      user_id: userId || 'unknown'
    });
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  try {
    logger.info(`📥 [${userId}] Fetching notifications for user_uuid: ${userUuid}`, {
      user_id: userId,
      method: req.method,
      url: req.originalUrl
    });

    const member = await notificationModel.getMemberIdByUserUuid(userUuid);
    
    if (!member) {
      logger.warn(`⚠️ [${userId}] No member found for user_uuid: ${userUuid}`, { user_id: userId });
      return sendResponse(res, 404, false, getMessage("user_not_found", req.lang));
    }

    const notifications = await notificationModel.getAppNotifications(member.member_id , community_id);
    
    logger.info(`✅ [${userId}] Successfully fetched ${notifications.length} notifications for member_id: ${member.member_id}`, { user_id: userId });
    return sendResponse(res, 200, true, getMessage("notifications_fetched_successfully", req.lang), notifications);
  } catch (error: any) {
    logger.error(`❌ [${userId}] Error adding abroad member: ${error?.message}`, {
      user_id: userId,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const community_id = user?.community_id;
  const userId = req.user?.user_id;
  const userUuid = req.user?.user_uuid;
  const { notification_uuid } = req.params;

  // Ensure user_id and user_uuid are available
  if (!userId || !userUuid || !community_id) {
    logger.error(`❌ [${userId || 'unknown'}] Unauthorized access attempt: No user_id or user_uuid found`, {
      user_id: userId || 'unknown'
    });
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  if (!notification_uuid) {
    logger.warn(`⚠️ [${userId}] Invalid or missing notification_uuid`, { user_id: userId });
    return sendResponse(res, 400, false, getMessage("invalid_notification_uuid", req.lang));
  }

  try {
    logger.info(`📥 [${userId}] Attempting to mark notification as read`, {
      user_id: userId,
      method: req.method,
      url: req.originalUrl,
      notification_uuid
    });

    const member = await notificationModel.getMemberIdByUserUuid(userUuid);
    if (!member) {
      logger.warn(`⚠️ [${userId}] No member found for user_uuid: ${userUuid}`, { user_id: userId });
      return sendResponse(res, 404, false, getMessage("user_not_found", req.lang));
    }

    logger.info(`📱 [${userId}] Updating notification_uuid: ${notification_uuid} as read for member_id: ${member.member_id}`, { user_id: userId });

    const isUpdated = await notificationModel.updateNotificationAsRead(
      notification_uuid,
      member.member_id,
      community_id,
    );

    if (!isUpdated) {
      logger.warn(`⚠️ [${userId}] Notification not found or already read: ${notification_uuid}`, { user_id: userId });
      return sendResponse(res, 404, false, getMessage("notification_not_found_or_already_read", req.lang));
    }

    logger.info(`✅ [${userId}] Successfully marked notification_uuid: ${notification_uuid} as read`, { user_id: userId });
    return sendResponse(res, 200, true, getMessage("notification_marked_as_read", req.lang));
  } catch (error: any) {
    logger.error(`❌ [${userId}] Error adding abroad member: ${error?.message}`, {
      user_id: userId,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  const userId = req.user?.user_id;
  const userUuid = req.user?.user_uuid;

  if (!userId || !userUuid) {
    logger.error(`❌ [${userId || 'unknown'}] Unauthorized access`, { user_id: userId || 'unknown' });
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  try {
    logger.info(`📥 [${userId}] Marking all notifications as read`, {
      user_id: userId,
      method: req.method,
      url: req.originalUrl
    });

    const member = await notificationModel.getMemberIdByUserUuid(userUuid);
    if (!member) {
      logger.warn(`⚠️ [${userId}] No member found for user_uuid: ${userUuid}`, { user_id: userId });
      return sendResponse(res, 404, false, getMessage("user_not_found", req.lang));
    }

    const isUpdated = await notificationModel.updateAllNotificationsAsRead(member.member_id);

    if (!isUpdated) {
      logger.warn(`⚠️ [${userId}] No unread notifications found to update`, { user_id: userId });
      return sendResponse(res, 404, false, getMessage("notifications_already_read_or_not_found", req.lang));
    }

    logger.info(`✅ [${userId}] All notifications marked as read`, { user_id: userId });
    return sendResponse(res, 200, true, getMessage("notifications_marked_as_read", req.lang));
  } catch (error: any) {
    logger.error(`❌ [${userId}] Error in marking all notification as read member: ${error?.message}`, {
      user_id: userId,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};
