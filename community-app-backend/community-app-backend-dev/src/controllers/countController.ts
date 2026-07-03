import { Request, Response } from "express";
import { dbPool } from "../config/db";
import { CountModel } from "../models/countModel";
import { sendResponse } from "../helpers/responseHelper";
import { getMessage } from "../utils/translation";
import { AuthRequest } from "../middleware/authMiddleware";
import logger from "../utils/logger";

const dashboardCount = new CountModel(dbPool);

export const getCounts = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const community_id = user?.community_id;
  const userId = req.user?.user_id;
  const userUuid = req.user?.user_uuid;

  // Ensure user_id is available
  if (!userId || !userUuid || !community_id) {
    logger.error(`❌ [${userId || 'unknown'}] Unauthorized access attempt: No user_id or user_uuid found`, {
      user_id: userId || 'unknown'
    });
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  try {
    logger.info(`📥 [${userId}] Fetching dashboard counts`, {
      user_id: userId,
      method: req.method,
      url: req.originalUrl,
      user_uuid: userUuid
    });

    // Fetch counts and configurations
    logger.info(`📤 [${userId}] Fetching unverified users count`, { user_id: userId });
    const totalUnverifiedUsers = await dashboardCount.getUnverifiedUsersCount(community_id);

    logger.info(`📤 [${userId}] Fetching unapproved marksheets count`, { user_id: userId });
    const totalMarksheets = await dashboardCount.getUnapprovedMarksheetsCount(community_id);

    logger.info(`📤 [${userId}] Fetching active marksheet configurations`, { user_id: userId });
    const activeStandards = await dashboardCount.getActiveMarksheetConfigs();

    // Fetch community description
    logger.info(`📤 [${userId}] Fetching community description`, { user_id: userId });
    const communityDescription = await dashboardCount.getCommunityDescription(community_id);

    // Fetch app versions
    logger.info(`📤 [${userId}] Fetching latest app versions`, { user_id: userId });
    const appVersions = await dashboardCount.getAppVersions(community_id);

    // Calculate remaining family members and unread notifications
    let remainingFamilyMembers = 0;
    let unreadNotificationsCount = 0;
    let familyMembersStatus: string | null = "0/0";
    let unreadnotice = false;

    logger.info(`📤 [${userId}] Fetching member_id for user_id: ${userId}`, { user_id: userId });
    const memberId = await dashboardCount.getMemberId(userId);
    if (memberId) {
      logger.info(`📤 [${userId}] Fetching family data for member_id: ${memberId}`, { user_id: userId });
      const familyData = await dashboardCount.getFamilyData(memberId);
      if (familyData) {
        const totalFamilyMembers = familyData.number_of_family_members;
        logger.info(`📤 [${userId}] Fetching registered family count for family_sr_id: ${familyData.family_sr_id}`, { user_id: userId });
        const registeredMembers = await dashboardCount.getRegisteredFamilyCount(familyData.family_sr_id);
        remainingFamilyMembers = totalFamilyMembers - registeredMembers;

        // Only assign status if not all members are registered
        if (registeredMembers === totalFamilyMembers) {
          familyMembersStatus = null;
        } else {
          familyMembersStatus = `(${registeredMembers}/${totalFamilyMembers})`;
        }
      } else {
        logger.warn(`⚠️ [${userId}] No family data found for member_id: ${memberId}`, { user_id: userId });
      }

      logger.info(`📤 [${userId}] Fetching unread notifications count for member_id: ${memberId}`, { user_id: userId });
      unreadNotificationsCount = await dashboardCount.getUnreadNotificationsCount(memberId);
    } else {
      logger.warn(`⚠️ [${userId}] No member_id found for user_id: ${userId}`, { user_id: userId });
    }

    logger.info(`📤 [${userId}] Checking unread news for user_uuid: ${userUuid}`, { user_id: userId });
    try {
      const lastTime = await dashboardCount.getUserFeedDateTime(userUuid);

      if (!lastTime) {
        unreadnotice = true;
      } else {
        unreadnotice = await dashboardCount.unreadnotice(lastTime, community_id);
      }

    } catch (err) {
      logger.error(
        `❌ [${userId}] Failed to determine new news for user_uuid: ${userUuid}`,
        { user_id: userId, error: err }
      );

      // Safety fallback
      unreadnotice = false;
    }


    logger.info(`✅ [${userId}] Successfully fetched dashboard counts`, {
      user_id: userId,
      unverifiedUsers: totalUnverifiedUsers,
      marksheetsCount: totalMarksheets,
      activeStandards: activeStandards.length,
      remainingFamilyMembers,
      unreadNotifications: unreadNotificationsCount,
      familyMembersStatus,
      unreadnotice,
      communityDescription,
      latest_ios_app_version: appVersions.latest_ios_app_version,
      latest_android_app_version: appVersions.latest_android_app_version,
      force_update: appVersions.force_update,
    });
    sendResponse(res, 200, true, getMessage("counts_fetch_success", req.lang), {
      unverifiedUsers: totalUnverifiedUsers,
      marksheetsCount: totalMarksheets,
      activeStandards,
      remainingFamilyMembers,
      unreadNotifications: unreadNotificationsCount,
      familyMembersStatus,
      unreadnotice,
      communityDescription,
      latest_ios_app_version: appVersions.latest_ios_app_version,
      latest_android_app_version: appVersions.latest_android_app_version,
      force_update: appVersions.force_update
    });
  } catch (error: any) {
    logger.error(`❌ [${userId}] Error fetching dashboard counts: ${error?.message}`, {
      user_id: userId,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};