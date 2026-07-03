import { Request, Response } from "express";
import { appLanguage } from "../models/appLanguageModel";
import { dbPool } from "../config/db";
import { validateRequest } from "../helpers/requestHelper";
import { sendResponse } from "../helpers/responseHelper";
import { getMessage } from "../utils/translation";
import logger from "../utils/logger";

const language = new appLanguage(dbPool);

export const updateAppLanguage = async (req: Request, res: Response) => {
  const userId = req.user?.user_id;
  const userUuid = req.user?.user_uuid;

  // Ensure user_id and user_uuid are available
  if (!userId || !userUuid) {
    logger.error(`❌ [${userId}] Unauthorized access attempt: No user_id or user_uuid found`, {
      user_id: userId || 'unknown'
    });
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  const { app_language } = req.body;

  try {
    logger.info(`📥 [${userId}] Attempting to update app language`, {
      user_id: userId,
      method: req.method,
      url: req.originalUrl
    });

    logger.info(`📥 [${userId}] Received request parameters:`, {
      user_id: userId,
      app_language
    });

    const validation = validateRequest(req.body, ["app_language"]);
    if (!validation.success) {
      logger.warn(`⚠️ [${userId}] Invalid request data: ${validation.message}`, { user_id: userId });
      return sendResponse(res, 400, false, getMessage("inv_req_data", req.lang), validation.message);
    }

    logger.info(`📤 [${userId}] Updating language for user_uuid ${userUuid} to ${app_language}`, { user_id: userId });

    await language.updateAppLanguage(userUuid, app_language);

    logger.info(`✅ [${userId}] Successfully updated app language to ${app_language} for user_uuid ${userUuid}`, { user_id: userId });
    sendResponse(res, 200, true, getMessage("language_update_success", req.lang), {
      user_uuid: userUuid,
      app_language,
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ [${userId}] Error updating app language: ${errorMessage}`, { user_id: userId, error });
    sendResponse(res, 500, false, getMessage("language_update_error", req.lang));
  }
};