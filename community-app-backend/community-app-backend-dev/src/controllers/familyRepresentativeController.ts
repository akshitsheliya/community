import { Request, Response } from "express";
import { dbPool } from "../config/db";
import { MemberProfileModel } from "../models/familyRepresentativeModel";
import { sendResponse } from "../helpers/responseHelper";
import { getMessage } from "../utils/translation";
import moment from "moment";
import logger from "../utils/logger";

const memberModel = new MemberProfileModel(dbPool);

export const getFamilyRepresentatives = async (req: Request, res: Response) => {
  const userId = req.user?.user_id;

  // Ensure user_id is available
  if (!userId) {
    logger.error(`❌ [${userId || 'unknown'}] Unauthorized access attempt: No user_id found`, {
      user_id: userId || 'unknown'
    });
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  try {
    logger.info(`📥 [${userId}] Fetching family representatives`, {
      user_id: userId,
      method: req.method,
      url: req.originalUrl
    });

    logger.info(`📤 [${userId}] Querying family representatives`, { user_id: userId });
    const representatives = await memberModel.getFamilyRepresentatives();

    if (!representatives || representatives.length === 0) {
      logger.info(`📥 [${userId}] No family representatives found`, { user_id: userId });
      return sendResponse(res, 200, true, getMessage("no_representatives_found", req.lang), []);
    }

    const baseUrl = process.env.BASE_URL;
    const formattedRepresentatives = representatives.map((rep) => ({
      ...rep,
      profile_photo: rep.profile_photo ? `${baseUrl}/uploads/${rep.profile_photo}` : null,
      id_proof: rep.id_proof ? `${baseUrl}/uploads/${rep.id_proof}` : null,
      date_of_birth: rep.date_of_birth ? moment(rep.date_of_birth).format("YYYY-MM-DD") : null,
    }));

    logger.info(`✅ [${userId}] Successfully fetched ${formattedRepresentatives.length} family representatives`, { user_id: userId });
    sendResponse(
      res,
      200,
      true,
      getMessage("representatives_retrieved_successfully", req.lang),
      formattedRepresentatives
    );
  } catch (error: any) {
    logger.error(`❌ [${userId}] Error fetching family representatives: ${error?.message}`, {
      user_id: userId,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};