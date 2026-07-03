import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware'; // Adjust path as needed
import { AppVersionModel } from '../models/appVersionModel';
import { sendResponse } from '../helpers/responseHelper';
import { getMessage } from '../utils/translation';
import logger from '../utils/logger';

const appVersionModel = new AppVersionModel();

export const getAppVersion = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const userId = user?.user_id;

  if (!userId) {
    logger.error(`❌ [${userId || 'unknown'}] Unauthorized access attempt: No user_id found`, {
      user_id: userId || 'unknown',
    });
    return sendResponse(res, 401, false, getMessage('unauthorized', req.lang));
  }

  // Optional: Check for phone_number or community_id if needed
  const { phone_number, community_id } = user;
  if (!community_id) {
    logger.warn(`⚠️ [${userId}] No community_id found for user_id: ${userId}`, {
      user_id: userId,
    });
    // Handle as needed, e.g., proceed or return error
  }

  try {
    logger.info(`📥 [${userId}] Fetching app version for user_id: ${userId}`, {
      user_id: userId,
      method: req.method,
      url: req.originalUrl,
    });

    const id = userId.toString();
    const appVersion = await appVersionModel.getAppVersion(id);

    if (!appVersion) {
      logger.warn(`⚠️ [${userId}] No login record found for user_id: ${userId}`, {
        user_id: userId,
      });
      return sendResponse(res, 404, false, getMessage('record_not_found', req.lang));
    }

    logger.info(`✅ [${userId}] Successfully fetched app version for user_id: ${userId}`, {
      user_id: userId,
    });
    return sendResponse(res, 200, true, getMessage('app_version_retrieved', req.lang), {
      version: appVersion,
    });
  } catch (error: any) {
    logger.error(`❌ [${userId}] Error fetching app version: ${error?.message}`, {
      user_id: userId,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage('int_server_err', req.lang));
  }
};