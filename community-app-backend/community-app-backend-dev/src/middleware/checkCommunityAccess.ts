import { Request, Response, NextFunction } from "express";
import { dbPool } from "../config/db";
import { selectQuery } from "../helpers/queryHelper";
import { sendResponse } from "../helpers/responseHelper"; 
import { AuthRequest } from "./authMiddleware";
import logger from "../utils/logger"; 

export const checkCommunityAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(`[checkCommunityAccess] Incoming request`, {
      method: req.method,
      path: req.path,
    });

    const publicAuthPaths = [
      "/api/register/mobile",
      "/api/register/verify-otp",
      "/api/login/mobile",
      "/api/login/verify-otp",
      "/api/profile",
    ];

    if (publicAuthPaths.includes(req.path)) {
      logger.info(`[checkCommunityAccess] Skipped: public route`, { path: req.path });
      return next();
    }

    const authReq = req as AuthRequest;
    const user_id = authReq.user?.user_id;

    if (!user_id) {
      logger.warn(`[checkCommunityAccess] Unauthorized access — user_id missing`);
      return sendResponse(res, 401, false, "Unauthorized: user_id missing");
    }

    logger.info(`[checkCommunityAccess] user_id found`, { user_id });

    const loginRows = await selectQuery(
      dbPool,
      "SELECT member_id FROM tbl_logins WHERE user_id = ?",
      [user_id]
    );

    if (loginRows.length === 0 || !loginRows[0].member_id) {
      logger.warn(`[checkCommunityAccess] No member_id linked to user_id`, { user_id });
      return sendResponse(res, 400, false, "Member not linked to user");
    }

    const member_id = loginRows[0].member_id;
    logger.info(`[checkCommunityAccess] member_id found`, { member_id });

    const communityRows = await selectQuery(
      dbPool,
      "SELECT * FROM tbl_community_member_relation WHERE member_id = ?",
      [member_id]
    );

    if (communityRows.length === 0) {
      logger.warn(`[checkCommunityAccess] Invalid Request: No community access for member`, { member_id });
      return sendResponse(res, 403, false, "Invalid Request");
    }

    logger.info(`[checkCommunityAccess] Access granted`, { user_id, member_id });

    if (authReq.user) {
      authReq.user.member_id = member_id;
    }

    next();
  } catch (err) {
    logger.error(`[checkCommunityAccess] Error occurred`, {
      error: err,
      path: req.path,
      user: (req as AuthRequest).user,
    });
    return sendResponse(res, 500, false, "Internal server error");
  }
};
