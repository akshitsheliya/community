import { Request, Response } from "express";
import { dbPool } from "../config/db";
import { TblFeeds } from "../models/newsModel";
import { validateRequest } from "../helpers/requestHelper";
import { sendResponse } from "../helpers/responseHelper";
import { getMessage, Language } from "../utils/translation";
import { isCommunityAdmin } from "../helpers/adminCheckHelper";
import logger from "../utils/logger";
import fs from "fs";
import path from "path";
import { storeNotification } from "../middleware/storeNotificationsMiddleware";
import { sendNotificationToMultipleUser } from "../firebase/helpers/notificationHelper";
import { getPaginationFromRequest } from "../helpers/paginationHelper";
import { AuthRequest } from "../middleware/authMiddleware";

const newsModel = new TblFeeds(dbPool);

// GET/API: /api/news - Get all news feeds
export const getNewsFeeds = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user } = req as AuthRequest;
  const community_id = user?.community_id;
  const userId = req.user?.user_id;
  const userUuid = req.user?.user_uuid;

  if (!userId || !userUuid || !community_id) {
    logger.error("No user_id, user_uuid, or community_id found in request - authentication required");
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  try {
    logger.info(`📥 [${userId}] Fetching news feeds`, {
      user_id: userId,
      method: req.method,
      url: req.originalUrl,
    });

    const newsFeeds = await newsModel.getAllNews(community_id);  // Fetch all news without limit and offset
    const totalCount = await newsModel.getNewsCount(community_id);

    if (userUuid) {
      try {
        const lastFetchedTime = await newsModel.getUserFeedDateTime(userUuid);

        if (lastFetchedTime) {
          const hasNew = await newsModel.unreadnotice(lastFetchedTime);
          if (hasNew) {
            await newsModel.updateFeedDateTime(userUuid);
            logger.info(`✅ [${userId}] Updated feed_date_time`, {
              user_id: userId,
              user_uuid: userUuid,
            });
          } else {
            logger.info(`📥 [${userId}] No new news since last feed_date_time`, {
              user_id: userId,
              user_uuid: userUuid,
            });
          }
        } else {
          await newsModel.updateFeedDateTime(userUuid);
          logger.info(`✅ [${userId}] Set initial feed_date_time`, {
            user_id: userId,
            user_uuid: userUuid,
          });
        }
      } catch (updateError) {
        logger.error(`❌ [${userId}] Failed to update feed_date_time`, {
          user_id: userId,
          user_uuid: userUuid,
          error: updateError,
        });
      }
    }

    const baseUrl = process.env.BASE_URL;
    const enhancedNewsFeeds = newsFeeds.map((feed) => ({
      ...feed,
      feed_photo_video: feed.feed_photo_video
        ? `${baseUrl}/Uploads/${feed.feed_photo_video}`
        : null,
    }));

    if (newsFeeds.length === 0) {
      logger.info(`📥 [${userId}] No news feeds found`, { user_id: userId });
      sendResponse(res, 200, true, getMessage("news_feed_fsuc", req.lang), enhancedNewsFeeds);
      return;
    }

    logger.info(`✅ [${userId}] Successfully fetched ${newsFeeds.length} news feeds`, {
      user_id: userId,
    });

    sendResponse(
      res,
      200,
      true,
      getMessage("news_feed_fsuc", req.lang),
      enhancedNewsFeeds,
      totalCount
    );
  } catch (error: any) {
    logger.error(`❌ [${userId}] Error fetching news feeds: ${error?.message}`, {
      user_id: userId,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

// GET/API: /api/news/newsUUID - Get a single news feed by UUID
export const getNewsByUuid = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.user_id;
  const { newsUuid } = req.params;

  // Ensure user_id is available for logging
  if (!userId) {
    logger.error("No user_id found in request - authentication required");
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  if (!newsUuid) {
    logger.warn(`⚠️ [${userId}] News UUID not provided`, { user_id: userId });
    sendResponse(res, 400, false, getMessage("news_uuid_req", req.lang));
    return;
  }

  try {
    logger.info(`📥 [${userId}] Fetching news by UUID: ${newsUuid}`, {
      user_id: userId,
      method: req.method,
      url: req.originalUrl,
    });

    const news = await newsModel.getNewsByUuid(newsUuid);

    if (!news) {
      logger.info(`📥 [${userId}] News with UUID ${newsUuid} not found`, {
        user_id: userId,
      });
      sendResponse(res, 200, true, getMessage("news_notf", req.lang), []);
      return;
    }

    const baseUrl = process.env.BASE_URL;
    const enhancedNews = {
      ...news,
      feed_photo_video: news.feed_photo_video
        ? `${baseUrl}/Uploads/${news.feed_photo_video}`
        : null,
    };

    logger.info(
      `✅ [${userId}] Successfully fetched news with UUID: ${newsUuid}`,
      { user_id: userId }
    );
    sendResponse(
      res,
      200,
      true,
      getMessage("news_suc", req.lang),
      enhancedNews
    );
  } catch (error: any) {
    logger.error(
      `❌ [${userId}] Error fetching news with UUID: ${error?.message}`,
      {
        user_id: userId,
        stack: error?.stack,
      }
    );
    return sendResponse(
      res,
      500,
      false,
      getMessage("int_server_err", req.lang)
    );
  }
};

// CREATE/API: /api/news - Create a new news feed
export const createNews = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user } = req as AuthRequest;
  const userId = user?.user_id;
  const userUuid = user?.user_uuid;
  const community_id = user?.community_id;

  // Ensure user_id is available for logging
  if (!userId || !userUuid || !community_id) {
    logger.error(
      "No user_id or user_uuid found in request - authentication required"
    );
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  try {
    logger.info(`📥 [${userId}] Attempting to create a new news post`, {
      user_id: userId,
      method: req.method,
      url: req.originalUrl,
    });

    logger.info(`📥 [${userId}] Received request parameters:`, {
      user_id: userId,
      feed_title: req.body.feed_title,
      feed_description: req.body.feed_description,
      feed_type: req.body.feed_type,
      channel_id: req.body.channel_id,
      event_date_time: req.body.event_date_time,
      event_address: req.body.event_address,
      event_latitude: req.body.event_latitude,
      event_longitude: req.body.event_longitude,
    });

    if (!(await isCommunityAdmin(userUuid))) {
      logger.warn(
        `⚠️ [${userId}] Attempted to create news without admin rights`,
        { user_id: userId }
      );
      sendResponse(res, 403, false, getMessage("admin_authority", req.lang));
      return;
    }

    const requiredFields = ["feed_title", "feed_type"];
    const validation = validateRequest(req.body, requiredFields);

    if (!validation.success) {
      logger.warn(`⚠️ [${userId}] Invalid fields: ${validation.message}`, {
        user_id: userId,
      });
      sendResponse(res, 400, false, validation.message!);
      return;
    }

    if (
      (req.body.feed_type === "event" || req.body.feed_type === "meeting") &&
      (!req.body.event_date_time ||
        !req.body.event_address ||
        req.body.event_latitude === undefined ||
        req.body.event_longitude === undefined)
    ) {
      logger.warn(`⚠️ [${userId}] Missing required event details`, {
        user_id: userId,
      });
      sendResponse(res, 400, false, getMessage("event_fields_req", req.lang));
      return;
    }

    if (!req.file) {
      logger.warn(`⚠️ [${userId}] No photo or video uploaded`, {
        user_id: userId,
      });
      sendResponse(
        res,
        400,
        false,
        getMessage("photo_upload_required", req.lang)
      );
      return;
    }

    const baseUrl = process.env.BASE_URL!;
    const filename = req.file.filename;
    const feedPhotoVideoRelative = `news/${filename}`;
    const feedPhotoVideoFull = `${baseUrl}/Uploads/${feedPhotoVideoRelative}`;

    logger.info(`📷 [${userId}] Uploaded file: ${feedPhotoVideoRelative}`, {
      user_id: userId,
    });

    const feedId = await newsModel.createNews({
      channel_id: req.body.channel_id || null,
      feed_title: req.body.feed_title,
      feed_description: req.body.feed_description || null,
      feed_type: req.body.feed_type,
      feed_photo_video: feedPhotoVideoRelative,
      event_date_time: req.body.event_date_time || null,
      event_address: req.body.event_address || null,
      event_latitude: req.body.event_latitude || null,
      event_longitude: req.body.event_longitude || null,
      community_id,
      added_by: userId,
    });

    logger.info(
      `✅ [${userId}] Successfully created news feed with ID: ${feedId}`,
      { user_id: userId }
    );

    const allUsers = await newsModel.getAllUsersForNotification(community_id);
    const notificationType = "new_news";

    const groupedTokens: Record<string, string[]> = {};
    const groupedMemberIds: Record<string, number[]> = {};

    for (const user of allUsers) {
      const lang = user.app_language || "gu_IN"; // Default to Gujarati if not provided

      if (!groupedTokens[lang]) {
        groupedTokens[lang] = [];
        groupedMemberIds[lang] = [];
      }

      groupedTokens[lang].push(user.fcm_device_token);
      groupedMemberIds[lang].push(user.member_id);
    }

    logger.info(
      `📱 [${userId}] Prepared notifications for ${
        Object.keys(groupedTokens).length
      } languages`,
      { user_id: userId }
    );

    // Helper function to chunk an array
    const chunkArray = <T>(arr: T[], size: number): T[][] => {
      return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
      );
    };

    for (const lang of Object.keys(groupedTokens)) {
      const tokens = groupedTokens[lang];
      const memberIds = groupedMemberIds[lang];

      const notificationTitle =
        lang === "gu_IN"
          ? `${req.body.feed_title} 📢`
          : `${req.body.feed_title} 📢`;
      const notificationBody =
        lang === "gu_IN"
          ? `${req.body.feed_description}`
          : `${req.body.feed_description}`;

      logger.info(`📱 [${userId}] Sending notification for language: ${lang}`, {
        user_id: userId,
      });

      for (const member_id of memberIds) {
        const stored = await storeNotification(
          member_id,
          notificationType,
          `${notificationTitle} - ${notificationBody}`,
          community_id
        );
        if (stored) {
          logger.info(
            `✅ [${userId}] Notification stored for member_id: ${member_id}`,
            { user_id: userId }
          );
        } else {
          logger.warn(
            `⚠️ [${userId}] Failed to store notification for member_id: ${member_id}`,
            { user_id: userId }
          );
        }
      }

      // Break tokens into batches of 500
      const tokenChunks = chunkArray(tokens, 500);
      logger.info(
        `📱 [${userId}] Sending notifications in ${tokenChunks.length} batch(es) for language: ${lang}`,
        { user_id: userId }
      );

      for (const tokenBatch of tokenChunks) {
        const batchResult = await sendNotificationToMultipleUser(
          tokenBatch,
          notificationTitle,
          notificationBody,
          {
            type: notificationType,
            feed_id: feedId.toString(),
          }
        );

        logger.info(
          `✅ [${userId}] Sent batch of ${tokenBatch.length} notifications for language: ${lang}`,
          { user_id: userId, batchResult }
        );
      }
    }

    logger.info(`✅ [${userId}] Successfully sent all notifications`, {
      user_id: userId,
    });
    sendResponse(res, 201, true, getMessage("news_create_suc", req.lang), {
      feedId,
      feed_photo_video: feedPhotoVideoFull,
    });
  } catch (error: any) {
    logger.error(`❌ [${userId}] Error creating news feed: ${error?.message}`, {
      user_id: userId,
      stack: error?.stack,
    });
    return sendResponse(
      res,
      500,
      false,
      getMessage("int_server_err", req.lang)
    );
  }
};

// DELETE/API: /api/news/newsUUID - Delete a news feed by UUID
export const deleteNewsByUuid = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user } = req as AuthRequest;
  const community_id = user?.community_id;
  const userId = req.user?.user_id;
  const userUuid = req.user?.user_uuid;
  const { newsUuid } = req.params;

  // Ensure user_id is available for logging
  if (!userId || !userUuid || !community_id) {
    logger.error(
      "No user_id or user_uuid or community_id found in request - authentication required"
    );
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  try {
    logger.info(
      `📥 [${userId}] Attempting to delete news with UUID: ${newsUuid}`,
      {
        user_id: userId,
        method: req.method,
        url: req.originalUrl,
      }
    );

    if (!(await isCommunityAdmin(userUuid))) {
      logger.warn(
        `⚠️ [${userId}] Attempted to delete news without admin rights`,
        { user_id: userId }
      );
      sendResponse(res, 403, false, getMessage("admin_authority", req.lang));
      return;
    }

    if (!newsUuid) {
      logger.warn(`⚠️ [${userId}] News UUID not provided`, { user_id: userId });
      sendResponse(res, 400, false, getMessage("news_uuid_req", req.lang));
      return;
    }

    const deleted = await newsModel.deleteNews(newsUuid, community_id);

    if (!deleted) {
      logger.warn(`⚠️ [${userId}] News with UUID ${newsUuid} not found`, {
        user_id: userId,
      });
      sendResponse(res, 404, false, getMessage("news_notf", req.lang), []);
      return;
    }

    logger.info(
      `✅ [${userId}] Successfully deleted news with UUID: ${newsUuid}`,
      { user_id: userId }
    );
    sendResponse(res, 200, true, getMessage("news_del_suc", req.lang));
  } catch (error: any) {
    logger.error(
      `❌ [${userId}] Error deleting news with UUID: ${error?.message}`,
      {
        user_id: userId,
        stack: error?.stack,
      }
    );
    return sendResponse(
      res,
      500,
      false,
      getMessage("int_server_err", req.lang)
    );
  }
};

// UPDATE/API: /api/news/newsUUID - Update a news feed by UUID
export const updateNews = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user } = req as AuthRequest;
  const community_id = user?.community_id;
  const userId = req.user?.user_id;
  const userUuid = req.user?.user_uuid;
  const { newsUuid } = req.params;

  // Ensure user_id is available for logging
  if (!userId || !userUuid || !community_id) {
    logger.error(
      "No user_id or user_uuid or community_id found in request - authentication required"
    );
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  try {
    logger.info(
      `📥 [${userId}] Attempting to update news with UUID: ${newsUuid}`,
      {
        user_id: userId,
        method: req.method,
        url: req.originalUrl,
      }
    );

    logger.info(`📥 [${userId}] Received request parameters:`, {
      user_id: userId,
      feed_title: req.body.feed_title,
      feed_description: req.body.feed_description,
      feed_type: req.body.feed_type,
      channel_id: req.body.channel_id,
      event_date_time: req.body.event_date_time,
      event_address: req.body.event_address,
      event_latitude: req.body.event_latitude,
      event_longitude: req.body.event_longitude,
    });

    if (!(await isCommunityAdmin(userUuid))) {
      logger.warn(
        `⚠️ [${userId}] Attempted to update news without admin rights`,
        { user_id: userId }
      );
      sendResponse(res, 403, false, getMessage("admin_authority", req.lang));
      return;
    }

    const newsExists = await newsModel.getNewsByUuid(newsUuid);
    if (!newsExists) {
      logger.warn(`⚠️ [${userId}] News with UUID ${newsUuid} not found`, {
        user_id: userId,
      });
      sendResponse(res, 404, false, getMessage("news_notf", req.lang));
      return;
    }

    let feedPhotoVideoRelative = newsExists.feed_photo_video;
    let feedPhotoVideoFull = feedPhotoVideoRelative
      ? `${process.env.BASE_URL}/Uploads/${feedPhotoVideoRelative}`
      : null;

    if (req.file) {
      const filename = req.file.filename;
      feedPhotoVideoRelative = `news/${filename}`;
      feedPhotoVideoFull = `${process.env.BASE_URL}/Uploads/${feedPhotoVideoRelative}`;
      logger.info(
        `📷 [${userId}] Uploaded new file: ${feedPhotoVideoRelative}`,
        { user_id: userId }
      );

      const oldFilePath = path.join(
        __dirname,
        "../../Uploads",
        newsExists.feed_photo_video || ""
      );
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
        logger.info(`✅ [${userId}] Deleted old file: ${oldFilePath}`, {
          user_id: userId,
        });
      }
    }

    const updatePayload = {
      channel_id: req.body.channel_id || null,
      feed_title: req.body.feed_title,
      feed_description: req.body.feed_description || null,
      feed_type: req.body.feed_type,
      feed_photo_video: feedPhotoVideoRelative,
      event_date_time: req.body.event_date_time || null,
      event_address: req.body.event_address || null,
      event_latitude: req.body.event_latitude || null,
      event_longitude: req.body.event_longitude || null,
    };

    logger.info(`📤 [${userId}] Updating news with UUID: ${newsUuid}`, {
      user_id: userId,
      payload: updatePayload,
    });

    const updatedNews = await newsModel.updateNews(newsUuid, updatePayload, community_id);

    if (updatedNews) {
      logger.info(
        `✅ [${userId}] Successfully updated news with UUID: ${newsUuid}`,
        { user_id: userId }
      );
      sendResponse(res, 200, true, getMessage("news_update_suc", req.lang), {
        feed_uuid: newsUuid,
        feed_photo_video: feedPhotoVideoFull,
      });
    } else {
      logger.warn(
        `⚠️ [${userId}] Failed to update news with UUID: ${newsUuid}`,
        { user_id: userId }
      );
      sendResponse(res, 400, false, getMessage("news_update_err", req.lang));
    }
  } catch (error: any) {
    logger.error(
      `❌ [${userId}] Error updating news with UUID: ${error?.message}`,
      {
        user_id: userId,
        stack: error?.stack,
      }
    );
    return sendResponse(
      res,
      500,
      false,
      getMessage("int_server_err", req.lang)
    );
  }
};
