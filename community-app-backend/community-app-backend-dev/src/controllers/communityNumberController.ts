import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { dbPool } from "../config/db";
import { CommunityNumberModel } from "../models/communityNumberModel";
import { sendResponse } from "../helpers/responseHelper";
import { getMessage } from "../utils/translation";
import logger from "../utils/logger";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  getMemberIdByUserUUID,
  isUserRegisteredInCommunity,
} from "../models/updateProfileModel";

const communityNumberModel = new CommunityNumberModel(dbPool);

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_EXPIRY = "9999y";

export const changeCommunity = async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const { community_uuid: newCommunityUUID } = req.body;

    if (!user || !user.user_uuid) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }


    if (!newCommunityUUID) {
      return res.status(400).json({
        success: false,
        message: "community_uuid is required",
      });
    }

    // console.log("community_uuid--------------------------------", newCommunityUUID);

    const member_id = await getMemberIdByUserUUID(user.user_uuid);

    // console.log("member_id------------------------------------", member_id);

    if (!member_id) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const isRegistered = await isUserRegisteredInCommunity(
      member_id,
      newCommunityUUID
    );

    if (!isRegistered) {
      return res.status(403).json({
        success: false,
        message: "You are not registered in this community",
      });
    }
    const newToken = jwt.sign(
      {
        user_uuid: user.user_uuid,
        member_id,
        community_uuid: newCommunityUUID,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return res.status(200).json({
      success: true,
      message: "Community switched successfully",
      data: {
        token: newToken,
        community_uuid: newCommunityUUID,
      },
    });

  } catch (error) {
    logger.error("changeCommunity error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



export const getCommunity = async (req: Request, res: Response) => {
  const community_number = Number(req.query.community_number);

  if (isNaN(community_number)) {
    logger.warn("Invalid community_number received", {
      community_number,
      url: req.originalUrl,
    });
    return sendResponse(
      res,
      400,
      false,
      getMessage("invalid_community_number", req.lang)
    );
  }

  try {
    logger.info(`Fetching community for number: ${community_number}`, {
      community_number,
    });

    const community = await communityNumberModel.getCommunityByCommunityNumber(
      community_number
    );

    if (!community || community.length === 0) {
      logger.info("No community found", { community_number });
      return sendResponse(
        res,
        404,
        false,
        getMessage("community_not_found", req.lang)
      );
    }

    logger.info("Community found successfully", { community_number });
    return sendResponse(
      res,
      200,
      true,
      getMessage("community_found", req.lang),
      community
    );
  } catch (error: any) {
    logger.error(`Error fetching community: ${error.message}`, {
      community_number,
      stack: error.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};


