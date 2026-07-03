import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { sendResponse } from "../helpers/responseHelper";
import logger from "../utils/logger";
import { getMessage } from "../utils/translation";
import { v4 as uuidv4 } from "uuid";
import { BusinessModel } from "../models/businessModel";
import { dbPool } from "../config/db";
import { isCommunityAdmin } from "../helpers/adminCheckHelper";

const businessModel = new BusinessModel(dbPool);

const getBusinessMediaUrl = (path?: string | null): string | null => {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  return path ? `${baseUrl}/uploads/business/${path}` : null;
};

export const addBusiness = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const userId = user?.user_id;
  const community_id = user?.community_id;

  if (!userId || !community_id) {
    logger.error("🔒 Unauthorized: Missing user_id or community_id in token");
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  try {
    const {
      business_name,
      city,
      state,
      business_type,
      category,
      address,
      contact_number,
      contact_email,
      services_products,
    } = req.body;

    console.log("Request Body:", req.body);


    const business_uuid = uuidv4();
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const businessPhotoPath = files?.business_photo?.[0]?.filename
      ? `photos/${files.business_photo[0].filename}`
      : null;

    const businessLogoPath = files?.business_logo?.[0]?.filename
      ? `logos/${files.business_logo[0].filename}`
      : null;

      console.log("Files:", req.files);


      const data = {
        business_uuid,
        added_by: userId,
        community_id,
        business_name: business_name ?? null,
        business_photo: businessPhotoPath ?? null,
        business_logo: businessLogoPath ?? null,
        city: city ?? null,
        state: state ?? null,
        business_type: business_type ?? null,
        category: category ?? null,
        address: address ?? null,
        contact_number: contact_number ?? null,
        contact_email: contact_email ?? null,
        services_products: services_products ?? null,
      };
      
    const result = await businessModel.addBusiness(data);

    const responseData = {
      ...data,
      id: result.insertId,
      business_photo: getBusinessMediaUrl(businessPhotoPath),
      business_logo: getBusinessMediaUrl(businessLogoPath),
    };

    logger.info(`✅ [${userId}] Business added successfully: ${business_uuid}`);
    return sendResponse(res, 201, true, getMessage("business_added_success", req.lang), responseData);
  } catch (error: any) {
    logger.error(`❌ [${userId}] Error adding business`, {
      message: error.message,
      stack: error.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

export const getAllBusinesses = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const userId = user?.user_id;
  const userUuid = user?.user_uuid;
  const community_id = user?.community_id;
  const search = (req.query.search as string)?.trim() || "";

  if (!userId || !community_id || !userUuid) {
    logger.error("🔒 Unauthorized: Missing user_id or community_id in token");
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  try {
    const isAdmin = await isCommunityAdmin(userUuid);

    const businesses = await businessModel.getAllBusinesses(community_id, search);

    if (!businesses || businesses.length === 0) {
      return sendResponse(res, 200, true, getMessage("business_not_found", req.lang), []);
    }

    const businessesWithUrls = businesses.map((biz: any) => ({
      ...biz,
      business_photo: getBusinessMediaUrl(biz.business_photo),
      business_logo: getBusinessMediaUrl(biz.business_logo),
      can_edit: biz.added_by === userId,
      isAdmin_can_edit: isAdmin
    }));

    return sendResponse(
      res,
      200,
      true,
      getMessage("businesses_fetched_success", req.lang),
      businessesWithUrls
    );
  } catch (error: any) {
    logger.error(`❌ [${userId}] Error fetching businesses`, {
      message: error.message,
      stack: error.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};


export const getBusinessByUUID = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const userId = user?.user_id;
  const community_id = user?.community_id;

  if (!userId || !community_id) {
    logger.error("🔒 Unauthorized: Missing user_id or community_id in token");
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  try {
    const { business_uuid } = req.params;

    const business = await businessModel.getBusinessByUUID(business_uuid, community_id);

    if (!business) {
      return sendResponse(res, 404, false, getMessage("business_not_found", req.lang));
    }

    const businessWithUrls = {
      business_id: business.business_id,
      business_uuid: business.business_uuid,
      added_by: business.added_by,
      community_id: business.community_id,
      business_name: business.business_name,
      business_photo: getBusinessMediaUrl(business.business_photo),
      business_logo: getBusinessMediaUrl(business.business_logo),
      city: business.city,
      state: business.state,
      business_type: business.business_type,
      category: business.category,
      address: business.address,
      contact_number: business.contact_number,
      contact_email: business.contact_email,
      created_at: business.created_at,
      updated_at: business.updated_at,
      services_products: business.services_products,
    };

    return sendResponse(
      res,
      200,
      true,
      getMessage("business_fetched_success", req.lang),
      [businessWithUrls]
    );
  } catch (error: any) {
    logger.error(`❌ [${userId}] Error fetching business by UUID`, {
      message: error.message,
      stack: error.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

export const updateBusiness = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const userId = user?.user_id;
  const community_id = user?.community_id;

  if (!userId || !community_id) {
    logger.error("🔒 Unauthorized: Missing user_id or community_id in token");
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  try {
    const { business_uuid } = req.params;

    // Get existing business info
    const existing = await businessModel.getBusinessByUUID(business_uuid, community_id);
    if (!existing) {
      return sendResponse(res, 404, false, getMessage("business_not_found", req.lang));
    }

    const {
      business_name,
      city,
      state,
      business_type,
      category,
      address,
      contact_number,
      contact_email,
      services_products,
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const businessPhotoPath = files?.business_photo?.[0]?.filename
      ? `photos/${files.business_photo[0].filename}`
      : existing.business_photo;

    const businessLogoPath = files?.business_logo?.[0]?.filename
      ? `logos/${files.business_logo[0].filename}`
      : existing.business_logo;

    const data = {
      business_name: business_name ?? existing.business_name,
      business_photo: businessPhotoPath,
      business_logo: businessLogoPath,
      city: city ?? existing.city,
      state: state ?? existing.state,
      business_type: business_type ?? existing.business_type,
      category: category ?? existing.category,
      address: address ?? existing.address,
      contact_number: contact_number ?? existing.contact_number,
      contact_email: contact_email ?? existing.contact_email,
      updated_by: userId,
      services_products: services_products ?? existing.services_products,
    };

    const result = await businessModel.updateBusiness(business_uuid, community_id, data);

    if (result.affectedRows === 0) {
      return sendResponse(res, 404, false, getMessage("business_not_found", req.lang));
    }

    const updatedData = {
      ...data,
      business_id: existing.business_id,
      added_by: existing.added_by,
      business_photo: getBusinessMediaUrl(data.business_photo),
      business_logo: getBusinessMediaUrl(data.business_logo),
    };

    return sendResponse(res, 200, true, getMessage("business_updated_success", req.lang), updatedData);
  } catch (error: any) {
    logger.error(`❌ [${userId}] Error updating business`, {
      message: error.message,
      stack: error.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

export const deleteBusiness = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const userId = user?.user_id;
  const community_id = user?.community_id;

  if (!userId || !community_id) {
    logger.error("🔒 Unauthorized: Missing user_id or community_id in token");
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  try {
    const { business_uuid } = req.params;

    const result = await businessModel.deleteBusiness(business_uuid, community_id);

    if (result.affectedRows === 0) {
      return sendResponse(res, 404, false, getMessage("business_not_found", req.lang));
    }

    return sendResponse(res, 200, true, getMessage("business_deleted_success", req.lang));
  } catch (error: any) {
    logger.error(`❌ [${userId}] Error deleting business`, {
      message: error.message,
      stack: error.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

export const getAllBusinessCategories = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const userId = user?.user_id;
  const community_id = user?.community_id;

  if (!userId || !community_id) {
    logger.error("🔒 Unauthorized: Missing user_id or community_id in token");
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  try {
    const categories = await businessModel.getAllBusinessCategories();

    const english = categories.map(cat => cat.services_eng);
    const gujarati = categories.map(cat => cat.services_guj);

    return sendResponse(res, 200, true, getMessage("categories_fetched_success", req.lang), {
      english,
      gujarati
    });
  } catch (error: any) {
    logger.error(`❌ [${userId}] Error fetching business categories`, {
      message: error.message,
      stack: error.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

