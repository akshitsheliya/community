import { Request, Response } from "express";
import { dbPool } from "../config/db";
import { surnameModel } from "../models/surnameModel";
import { sendResponse } from "../helpers/responseHelper";
import { getMessage } from "../utils/translation";
import logger from "../utils/logger";

const surname = new surnameModel(dbPool);

export const getSurnames = async (req: Request, res: Response) => {
  const user_id = req.user?.user_id;

  // Ensure user_id is available (authentication required)
  // if (!user_id) {
  //   logger.error(`❌ [${user_id || 'unknown'}] Unauthorized access attempt: No user_id found`, {
  //     user_id: user_id || 'unknown',
  //     method: req.method,
  //     url: req.originalUrl
  //   });
  //   return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  // }

  try {
    const search = (req.query.search as string) || "";

    logger.info(`📥 [${user_id}] Fetching surnames`, {
      user_id,
      method: req.method,
      url: req.originalUrl,
      query: { search },
    });

    logger.info(
      `📤 [${user_id}] Querying surnames with search term: ${search}`,
      {
        user_id,
        method: req.method,
        url: req.originalUrl,
      }
    );

    const surnames = await surname.getSurnames(search);

    if (!surnames || surnames.length === 0) {
      logger.info(
        `📥 [${user_id}] No surnames found for search term: ${search}`,
        {
          user_id,
          method: req.method,
          url: req.originalUrl,
        }
      );

      return sendResponse(
        res,
        200,
        true,
        getMessage("surnames_not_found", req.lang)
      );
    }

    logger.info(
      `✅ [${user_id}] Retrieved ${surnames.length} surname(s) successfully`,
      {
        user_id,
        method: req.method,
        url: req.originalUrl,
      }
    );

    // Add community_uuid to each surname record
    const dataWithCommunity = surnames.map((surname: any) => ({
      ...surname,
    }));

    sendResponse(
      res,
      200,
      true,
      getMessage("surnames_retrieved", req.lang),
      dataWithCommunity
    );
  } catch (error) {
    logger.error(`❌ [${user_id}] Error fetching surnames`, {
      user_id,
      method: req.method,
      url: req.originalUrl,
      error,
    });

    sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};
