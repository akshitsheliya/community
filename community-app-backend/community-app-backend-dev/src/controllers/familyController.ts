import { Request, Response } from "express";
import { dbPool } from "../config/db";
import { TblFamilies } from "../models/familiesModel";
import { validateRequest } from "../helpers/requestHelper";
import { sendResponse } from "../helpers/responseHelper";
import { getMessage } from "../utils/translation";
import { getPaginationFromRequest } from "../helpers/paginationHelper";
import { AuthRequest } from "../middleware/authMiddleware";
import moment from "moment";
import logger from "../utils/logger";

const familyModel = new TblFamilies(dbPool);

export const getFamilyDetails = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const userId = req.user?.user_id;
  const community_id = user?.community_id;

  console.log("test 1------------------------------------------------", userId );
  if (!userId) {
    logger.error(`❌ [${userId || 'unknown'}] Unauthorized access attempt: No user_id found`, {
      user_id: userId || 'unknown'
    });
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  const { page, limit } = getPaginationFromRequest(req);
  const search = (req.query.search as string) || "";

  try {
    logger.info(`📥 [${userId}] Fetching family details`, {
      user_id: userId,
      method: req.method,
      url: req.originalUrl,
      query: { search, page, limit },
      community_id
    });

    const result = await familyModel.getAllFamilyDetails(limit, page, search, community_id, userId);
    
    console.log("test 2------------------------------------------------", userId, community_id);
    if (!result.data || result.data.length === 0) {
      logger.info(`📥 [${userId}] No family details found`, { user_id: userId });
      return sendResponse(
        res,
        200, 
        true,
        getMessage("no_families_found", req.lang),
        [],
        0
      );
    }

    const baseUrl = process.env.BASE_URL;
    const enhancedData = result.data.map((user: any) => ({
      ...user,
      profile_photo: user.profile_photo
        ? `${baseUrl}/uploads/${user.profile_photo}`
        : null,
    }));

    const dataWithTotal = [
      ...enhancedData,
      { total: result.total, totalMembers: result.totalMembers },
    ];

    logger.info(`✅ [${userId}] Successfully fetched ${enhancedData.length} family details, total: ${result.total}, totalMembers: ${result.totalMembers}`, { user_id: userId });

    sendResponse(
      res,
      200,
      true,
      getMessage("fml_details_done", req.lang),
      dataWithTotal
    );
  } catch (error: any) {
    logger.error(`❌ [${userId}] Error fetching family details: ${error?.message}`, {
      user_id: userId,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};


export const getMembersByFamilyId = async (req: Request, res: Response) => {
  const userId = req.user?.user_id;
  const { familyId } = req.params;

  // Ensure user_id is available
  if (!userId) {
    logger.error(`❌ [${userId || 'unknown'}] Unauthorized access attempt: No user_id found`, {
      user_id: userId || 'unknown'
    });
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  // Validate the request using the helper
  const validation = validateRequest(req.params, ["familyId"]);
  if (!validation.success) {
    logger.warn(`⚠️ [${userId}] Invalid request data: ${validation.message}`, { user_id: userId });
    return sendResponse(
      res,
      400,
      false,
      validation.message || getMessage("inv_req_data", req.lang)
    );
  }

  const { page, limit } = getPaginationFromRequest(req);
  const search = (req.query.search as string) || "";

  try {
    logger.info(`📥 [${userId}] Fetching members for familyId: ${familyId}`, {
      user_id: userId,
      method: req.method,
      url: req.originalUrl,
      params: { familyId },
      query: { search, page, limit }
    });

    logger.info(`📤 [${userId}] Querying members for familyId: ${familyId}, search: ${search}, page: ${page}, limit: ${limit}`, { user_id: userId });
    const result = await familyModel.getMembersByFamilyId(
      familyId as string,
      limit,
      page,
      search
    );

    if (!result.data || result.data.length === 0) {
      logger.info(`📥 [${userId}] No members found for familyId: ${familyId}`, { user_id: userId });
      return sendResponse(
        res,
        200,
        true,
        getMessage("no_members_found", req.lang),
        [],
        0
      );
    }

    const baseUrl = process.env.BASE_URL;
    const enhancedData = result.data.map((member: any) => ({
      ...member,
      profile_photo: member.profile_photo
        ? `${baseUrl}/uploads/${member.profile_photo}`
        : null,
      id_proof: member.id_proof
        ? `${baseUrl}/uploads/${member.id_proof}`
        : null,
      date_of_birth: member.date_of_birth
        ? moment(member.date_of_birth).format("YYYY-MM-DD")
        : null,
    }));

    logger.info(`✅ [${userId}] Successfully fetched ${enhancedData.length} members for familyId: ${familyId}, total: ${result.total}`, { user_id: userId });
    sendResponse(
      res,
      200,
      true,
      getMessage("fml_mem_suc", req.lang),
      enhancedData,
      result.total
    );
  } catch (error: any) {
    logger.error(`❌ [${userId}] Error fetching members for familyId: ${error?.message}`, {
      user_id: userId,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};