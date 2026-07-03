import { Request, Response } from "express";
import { dbPool } from "../config/db";
import { DonorModel } from "../models/donorsModel";
import { sendResponse } from "../helpers/responseHelper";
import { getMessage } from "../utils/translation";
import { isCommunityAdmin } from "../helpers/adminCheckHelper";
import { getPaginationFromRequest } from "../helpers/paginationHelper";
import moment from "moment";
import logger from "../utils/logger";
import { AuthRequest } from "../middleware/authMiddleware";

const donorModel = new DonorModel(dbPool);

// Create new donor
export const createDonor = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user } = req as AuthRequest;
  const user_id = user?.user_id;
  const userUuid = user?.user_uuid;
  const community_id = user?.community_id;

  // Ensure user_id and userUuid are available (authentication required)
  if (!user_id || !userUuid || !community_id) {
    logger.error(
      "No user_id or userUuid found in request - authentication required"
    );
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  logger.info(`📥 [${user_id}] Initiating create donor process`, { user_id });

  if (!(await isCommunityAdmin(userUuid))) {
    logger.warn(`⚠️ [${user_id}] User lacks community admin privileges`, {
      user_id,
    });
    sendResponse(res, 403, false, getMessage("admin_authority", req.lang));
    return;
  }

  // Validate request file
  if (!req.file) {
    logger.warn(`⚠️ [${user_id}] No photo uploaded for donor`, { user_id });
    return sendResponse(
      res,
      400,
      false,
      getMessage("photo_upload_required", req.lang)
    );
  }

  const {
    donor_name,
    donor_mobile_no,
    donation_category,
    donation_year,
    donor_type,
  } = req.body;

  logger.info(`📥 [${user_id}] Received request parameters for new donor:`, {
    user_id,
    donor_name,
    donor_mobile_no,
    donation_category,
    donation_year,
    donor_type,
  });

  // Validate required fields
  if (!donor_name || !donor_mobile_no || !donation_category || !donor_type) {
    logger.warn(`⚠️ [${user_id}] Missing required fields in donor data`, {
      user_id,
      donor_name,
      donor_mobile_no,
      donation_category,
      donor_type,
    });
    return sendResponse(
      res,
      400,
      false,
      getMessage("all_fields_req", req.lang)
    );
  }

  if (donation_category === "one time donor" && !donation_year) {
    logger.warn(`⚠️ [${user_id}] Donation year required for one-time donors`, {
      user_id,
    });
    return sendResponse(
      res,
      400,
      false,
      getMessage("donation_year_required", req.lang)
    );
  }

  const is_lifetime_donor = donation_category === "life time donor" ? 1 : 0;

  // Handle donor photo
  const baseUrl = process.env.BASE_URL;
  const filename = req.file.filename;
  const relativeFilepath = `donor/${filename}`;

  const donorData = {
    member_id: null,
    donor_name,
    donor_mobile_no,
    is_lifetime_donor,
    donation_category,
    donation_year:
      donation_category === "one time donor" ? donation_year : null,
    added_on: new Date(),
    updated_on: new Date(),
    donor_photo: relativeFilepath,
    donor_type,
    community_id: community_id,
    added_by: user_id,
  };

  try {
    const result = await donorModel.addDonor(donorData);
    const fullDonorPhoto = `${baseUrl}/Uploads/${donorData.donor_photo}`;
    logger.info(
      `✅ [${user_id}] Donor created successfully with ID ${result}`,
      { user_id }
    );
    sendResponse(
      res,
      201,
      true,
      getMessage("donor_added_successfully", req.lang),
      { donor_id: result, donor_photo: fullDonorPhoto, registered: 0 }
    );
  } catch (error: any) {
    logger.error(`❌ [${user_id}] Error creating donor: ${error?.message}`, {
      user_id: user_id,
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

// Get all members
export const getAllMembers = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const community_id = user?.community_id;
  const user_id = req.user?.user_id;

  if (!user_id || !community_id) {
    logger.error(
      "No user_id or community_id found in request - authentication required"
    );
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  try {
    const { page, limit } = getPaginationFromRequest(req);

    const filters = {
      search: req.query.search as string,
      community_id: community_id, // This ensures we only get members from this community
    };

    logger.info(
      `📥 [${user_id}] Request to get members for community_id=${community_id}`,
      {
        user_id,
        ...filters,
      }
    );

    const result = await donorModel.getAllMembers(limit, page, filters);

    if (!result.data || result.data.length === 0) {
      logger.info(
        `📊 [${user_id}] No members found for community_id=${community_id}`,
        { user_id }
      );
      return sendResponse(
        res,
        201,
        true,
        getMessage("no_members_found", req.lang),
        [],
        0
      );
    }

    const baseUrl = process.env.BASE_URL;
    const formattedMembers = result.data.map((member) => ({
      ...member,
      profile_photo: member.profile_photo
        ? `${baseUrl}/Uploads/${member.profile_photo}`
        : null,
      id_proof: member.id_proof
        ? `${baseUrl}/Uploads/${member.id_proof}`
        : null,
      date_of_birth: member.date_of_birth
        ? moment(member.date_of_birth).format("YYYY-MM-DD")
        : null,
    }));

    logger.info(
      `✅ [${user_id}] Retrieved ${formattedMembers.length} member(s) successfully for community_id=${community_id}`,
      { user_id }
    );

    sendResponse(
      res,
      200,
      true,
      getMessage("family_member_details_retrieved", req.lang),
      formattedMembers,
      result.total
    );
  } catch (error: any) {
    logger.error(`❌ [${user_id}] Error getting members: ${error?.message}`, {
      user_id,
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

// Create new donor from members list
export const createDonorFromMember = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const user_id = user?.user_id;
  const userUuid = user?.user_uuid;
  const community_id = user?.community_id;

  // Ensure user_id and userUuid are available (authentication required)
  if (!user_id || !userUuid || !community_id) {
    logger.error(
      "No user_id or userUuid found in request - authentication required"
    );
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  logger.info(`📥 [${user_id}] Initiating create donor from member process`, {
    user_id,
  });

  try {
    if (!(await isCommunityAdmin(userUuid))) {
      logger.warn(`⚠️ [${user_id}] User lacks community admin privileges`, {
        user_id,
      });
      sendResponse(res, 403, false, getMessage("admin_authority", req.lang));
      return;
    }

    const { member_uuid } = req.params;
    const { donation_category, donation_year, donor_type } = req.body;

    logger.info(
      `📥 [${user_id}] Received request to create donor from member:`,
      {
        user_id,
        member_uuid,
        donation_category,
        donation_year,
        donor_type,
      }
    );

    if (!member_uuid || !donation_category || !donor_type) {
      logger.warn(`⚠️ [${user_id}] Missing required fields`, { user_id });
      return sendResponse(
        res,
        400,
        false,
        getMessage("all_fields_req", req.lang)
      );
    }

    if (!["life time donor", "one time donor"].includes(donation_category)) {
      logger.warn(`⚠️ [${user_id}] Invalid donation category`, {
        user_id,
        donation_category,
      });
      return sendResponse(
        res,
        400,
        false,
        getMessage("invalid_donation_category", req.lang)
      );
    }

    if (donation_category === "one time donor" && !donation_year) {
      logger.warn(
        `⚠️ [${user_id}] Donation year required for one-time donors`,
        { user_id }
      );
      return sendResponse(
        res,
        400,
        false,
        getMessage("donation_year_required", req.lang)
      );
    }

    const member = await donorModel.getMemberDetailsByUuid(member_uuid);
    if (!member) {
      logger.warn(`⚠️ [${user_id}] Member not found`, { user_id, member_uuid });
      return sendResponse(
        res,
        404,
        false,
        getMessage("members_not_found", req.lang)
      );
    }

    const existingDonor = await donorModel.getDonorByMemberId(member.member_id);
    if (existingDonor) {
      logger.warn(`⚠️ [${user_id}] Member already a donor`, {
        user_id,
        member_id: member.member_id,
      });
      return sendResponse(
        res,
        400,
        false,
        getMessage("member_already_donor", req.lang)
      );
    }

    const is_lifetime_donor = donation_category === "life time donor" ? 1 : 0;

    const donorDataFromMembers = {
      member_id: member.member_id,
      donor_name: `${member.surname} ${member.first_name} ${member.father_name}`,
      donor_mobile_no: member.phone_number,
      is_lifetime_donor,
      donation_category,
      donation_year:
        donation_category === "one time donor" ? donation_year : null,
      donor_photo: member.profile_photo,
      donor_type,
      added_on: new Date(),
      updated_on: new Date(),
      community_id,
      added_by: user_id,
    };

    logger.info(`📤 [${user_id}] Creating donor from member details:`, {
      user_id,
      ...donorDataFromMembers,
    });

    const result = await donorModel.addDonorFromMembers(donorDataFromMembers);
    const baseUrl = process.env.BASE_URL;
    const fullDonorPhoto = donorDataFromMembers.donor_photo
      ? `${baseUrl}/Uploads/${donorDataFromMembers.donor_photo}`
      : null;

    logger.info(
      `✅ [${user_id}] Donor created successfully with donor ID: ${result}`,
      { user_id }
    );

    sendResponse(
      res,
      201,
      true,
      getMessage("donor_added_successfully", req.lang),
      { donor_id: result, donor_photo: fullDonorPhoto, registered: 1 }
    );
  } catch (error: any) {
    logger.error(
      `❌ [${user_id}] Error creating donor from member: ${error?.message}`,
      {
        user_id: user_id,
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

// Get all donors
export const getAllDonors = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const user_id = req.user?.user_id;
  const community_id = user?.community_id;

  if (!user_id || !community_id) {
    logger.error(
      "No user_id or community_id found in request - authentication required"
    );
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  try {
    const { page, limit } = getPaginationFromRequest(req);
    const donation_category = req.query.donation_category as string | undefined;
    const donation_year = req.query.donation_year as string | undefined;

    logger.info(
      `📥 [${user_id}] Fetching donors with filters: donation_category=${donation_category}, donation_year=${donation_year}, page=${page}, limit=${limit}`,
      { user_id }
    );

    const result = await donorModel.getDonors(
      limit,
      page,
      donation_category,
      donation_year,
      community_id
    );
    const baseUrl = process.env.BASE_URL;

    if (!result.data || result.data.length === 0) {
      logger.info(`📤 [${user_id}] No donors found`, { user_id });
      return sendResponse(
        res,
        201,
        true,
        getMessage("donors_not_found", req.lang),
        [],
        0
      );
    }

    const enhancedData = result.data.map((donor) => ({
      ...donor,
      donor_photo: donor.donor_photo
        ? `${baseUrl}/Uploads/${donor.donor_photo}`
        : null,
      profile_photo: donor.profile_photo
        ? `${baseUrl}/Uploads/${donor.profile_photo}`
        : null,
      date_of_birth: donor.date_of_birth
        ? moment(donor.date_of_birth).format("YYYY-MM-DD")
        : null,
      registered: donor.member_id ? 1 : 0,
    }));

    logger.info(
      `📤 [${user_id}] Donors successfully retrieved: ${result.total} donors found`,
      { user_id }
    );

    sendResponse(
      res,
      200,
      true,
      getMessage("donors_retrieved", req.lang),
      enhancedData,
      result.total
    );
  } catch (error: any) {
    logger.error(`❌ [${user_id}] Error getting donors: ${error?.message}`, {
      user_id,
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

// Delete donor
export const deleteDonor = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const community_id = user?.community_id;
  const user_id = req.user?.user_id;

  // Ensure user_id is available (authentication required)
  if (!user_id || !community_id) {
    logger.error(
      "No user_id or community_id found in request - authentication required"
    );
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  try {
    const donor_id = req.params.donor_id;
    logger.info(
      `📥 [${user_id}] Request to delete donor with ID: ${donor_id}`,
      { user_id }
    );

    if (!donor_id) {
      logger.warn(`📤 [${user_id}] Donor ID not provided in the request`, {
        user_id,
      });
      return sendResponse(
        res,
        201,
        true,
        getMessage("donors_not_found", req.lang),
        []
      );
    }

    // Check if the donor exists
    const donorExists = await donorModel.getDonorById(donor_id);
    if (!donorExists) {
      logger.warn(`📤 [${user_id}] Donor with ID ${donor_id} not found`, {
        user_id,
      });
      return sendResponse(
        res,
        404,
        false,
        getMessage("donors_not_found", req.lang),
        []
      );
    }

    // Proceed to delete the donor
    await donorModel.deleteDonor(donor_id, community_id);
    logger.info(
      `📤 [${user_id}] Donor with ID ${donor_id} deleted successfully`,
      { user_id }
    );

    sendResponse(
      res,
      200,
      true,
      getMessage("donor_deleted_successfully", req.lang)
    );
  } catch (error: any) {
    logger.error(
      `❌ [${user_id}] Error deleting donor with ID: ${error?.message}`,
      {
        user_id: user_id,
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

// Update donor
export const updateDonor = async (req: Request, res: Response) => {
  const { user } = req as AuthRequest;
  const community_id = user?.community_id;
  const user_id = req.user?.user_id;
  const userUuid = req.user?.user_uuid;

  // Ensure user_id and userUuid are available (authentication required)
  if (!user_id || !userUuid || !community_id) {
    logger.error(
      "No user_id or user_uuid or community_id found in request - authentication required"
    );
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  try {
    const { donor_id } = req.params;

    logger.info(
      `📥 [${user_id}] Initiating update donor process for ID: ${donor_id}`,
      { user_id }
    );

    if (!donor_id) {
      logger.warn(`📤 [${user_id}] Donor ID is missing in request parameters`, {
        user_id,
      });
      return sendResponse(res, 400, false, "Donor ID is required in URL");
    }

    if (!(await isCommunityAdmin(userUuid))) {
      logger.warn(`📤 [${user_id}] User lacks community admin privileges`, {
        user_id,
      });
      return sendResponse(
        res,
        403,
        false,
        getMessage("admin_authority", req.lang)
      );
    }

    // Fetch the current donor record
    const currentDonor = await donorModel.getDonorById(donor_id);
    if (!currentDonor) {
      logger.warn(`📤 [${user_id}] Donor with ID ${donor_id} not found`, {
        user_id,
      });
      return sendResponse(
        res,
        404,
        false,
        getMessage("donors_not_found", req.lang),
        []
      );
    }

    const {
      donor_name,
      donor_mobile_no,
      donation_category,
      donation_year,
      donor_type,
    } = req.body;

    logger.info(`📥 [${user_id}] Received update request with parameters:`, {
      user_id,
      donor_name,
      donor_mobile_no,
      donation_category,
      donation_year,
      donor_type,
    });

    if (!donor_name) {
      logger.warn(`📤 [${user_id}] Donor name is missing in the request`, {
        user_id,
      });
      return sendResponse(
        res,
        400,
        false,
        getMessage("all_fields_req", req.lang)
      );
    }

    // Determine the donor photo
    const donorPhoto = req.file
      ? `donor/${req.file.filename}`
      : currentDonor.donor_photo;

    // Update donor record
    const result = await donorModel.updateDonor(
      donor_id,
      donor_name,
      donorPhoto,
      donor_mobile_no,
      donation_category,
      donation_year ? parseInt(donation_year) : null,
      donation_category === "life time donor" ? 1 : 0,
      donor_type,
      community_id
    );

    if (result && "affectedRows" in result && result.affectedRows > 0) {
      const baseUrl = process.env.BASE_URL || "http://localhost:3000";
      const fullDonorPhotoUrl = donorPhoto
        ? `${baseUrl}/Uploads/${donorPhoto}`
        : null;

      logger.info(
        `📤 [${user_id}] Donor with ID ${donor_id} updated successfully`,
        { user_id }
      );

      return sendResponse(
        res,
        200,
        true,
        getMessage("donor_updated", req.lang),
        {
          donor_id,
          donor_name,
          donor_photo: fullDonorPhotoUrl,
          donor_mobile_no,
          donation_category,
          donation_year: donation_year ? parseInt(donation_year) : null,
          is_lifetime_donor: donation_category === "life time donor" ? 1 : 0,
          donor_type,
        }
      );
    }

    logger.error(`❌ [${user_id}] Failed to update donor with ID ${donor_id}`, {
      user_id,
    });
    return sendResponse(
      res,
      500,
      false,
      getMessage("int_server_err", req.lang)
    );
  } catch (error: any) {
    logger.error(
      `❌ [${user_id}] Error updating donor with ID: ${error?.message}`,
      {
        user_id: user_id,
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
