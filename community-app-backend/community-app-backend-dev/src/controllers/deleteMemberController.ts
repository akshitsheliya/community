import { Request, Response, NextFunction } from "express";
import { dbPool } from "../config/db";
import { UserModel } from "../models/deleteMemberModel";
import { sendResponse } from "../helpers/responseHelper";
import { getMessage } from "../utils/translation";
import logger from "../utils/logger";

const userModel = new UserModel(dbPool);

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user_id = (req as any).user?.user_id;
  const phoneNumber = (req as any).user?.phone_number;

  // Ensure user_id is available (authentication required)
  if (!user_id || !phoneNumber) {
    logger.error("No user_id or phone_number found in request - authentication required");
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  logger.info(`📥 [${user_id}] Initiating user delete process`, {
    user_id,
    phone_number: phoneNumber,
  });

  try {
    const result = await userModel.deleteUser(phoneNumber);

    if (result.success) {
      logger.info(`✅ [${user_id}] User deleted successfully`, {
        user_id,
        phone_number: phoneNumber,
      });
      sendResponse(res, 200, true, result.message);
    } else {
      logger.warn(`🚫 [${user_id}] Failed to delete user`, {
        user_id,
        phone_number: phoneNumber,
        error: result.error,
      });
      sendResponse(res, 400, false, result.message, result.error);
    }
  } catch (error: any) {
    logger.error(`❌ [${user_id}] Error adding abroad member: ${error?.message}`, {
      user_id: user_id,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

export const deleteMemberByUUID = async (req: Request, res: Response) => {
  const user_id = (req as any).user?.user_id;

  // Ensure user_id is available (authentication required)
  if (!user_id) {
    logger.error("No user_id found in request - authentication required");
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  const { member_uuid } = req.params;

  logger.info(`📥 [${user_id}] Initiating delete member process`, {
    user_id,
    member_uuid,
  });

  try {
    if (!member_uuid) {
      logger.warn(`⚠️ [${user_id}] Missing member UUID in request`, { user_id });
      return sendResponse(res, 400, false, "Member UUID is required.");
    }

    const result = await userModel.deleteMemberByUUID(member_uuid);

    if (result.success) {
      logger.info(`✅ [${user_id}] Member with UUID ${member_uuid} deleted successfully`, { user_id });
      sendResponse(res, 200, true, result.message);
    } else {
      logger.warn(`🚫 [${user_id}] Failed to delete member with UUID ${member_uuid}`, {
        user_id,
        error: result.error,
      });
      sendResponse(res, 400, false, result.message, result.error);
    }
  } catch (error: any) {
    logger.error(`❌ [${user_id}] Error deleting member with UUID ${member_uuid}: ${error?.message}`, {
      user_id: user_id,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};