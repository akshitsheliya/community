import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  getLoginData,
  getProfileData,
  updateProfileData,
  getUpdatedUserData,
  getLoginDataByMemberUUID,
  getFamilySRID,
  updateFamilyMemberCount,
  updatePhoneNumberInLogins,
  checkPhoneNumberExists,
  getUserCommunities,
  createLoginEntry,
} from "../models/updateProfileModel";
import { v4 as uuidv4 } from "uuid";
import { sendResponse } from "../helpers/responseHelper";
import { validateRequest } from "../helpers/requestHelper";
import { getMessage, Language } from "../utils/translation";
import moment from "moment";
import logger from "../utils/logger";
// import { updateFamilyMember } from "./familyMemberController";

// Define the interface for the user payload in the token
export interface UserPayload {
  user_id: number;
  user_uuid: string;
}

// Extend the Express Request interface to include the 'user' property
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// Helper function to fetch and format communities (avoids duplication)
const fetchAndFormatCommunities = async (
  member_id: number,
  user_id: number
): Promise<{ community_uuid: string | null; community_list: any[] }> => {
  try {
    const communitiesData = await getUserCommunities(member_id);

    logger.info(`Fetched ${communitiesData.length} communities`, { user_id });

    const community_list = communitiesData.map((comm: any) => ({
      community_uuid: comm.community_uuid,
      community_name: comm.community_name || "Unknown Community",
      description: comm.description || "",
      is_admin: Boolean(comm.is_admin),
      joined_at: comm.joined_at
        ? moment(comm.joined_at).format("YYYY-MM-DD")
        : null,
    }));

    return {
      community_uuid: community_list[0]?.community_uuid || null,
      community_list,
    };
  } catch (err: any) {
    logger.error(`Error fetching communities`, {
      user_id,
      error: err.message,
    });

    return {
      community_uuid: null,
      community_list: [],
    };
  }
};



// Get logged-in user's data
export const getLoggedInUserData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user_id = req.user?.user_id;
  const user_uuid = req.user?.user_uuid;

  // Ensure user_id and user_uuid are available (authentication required)
  if (!user_id || !user_uuid) {
    logger.error(
      "No user_id or user_uuid found in request - authentication required"
    );
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  logger.info(
    `📥 [${user_id}] Fetching logged-in user data for user_uuid: ${user_uuid}`,
    { user_id }
  );

  try {
    // Step 1: Get data from tbl_logins
    const loginData = await getLoginData(user_uuid);
    if (loginData.length === 0) {
      logger.warn(`❌ [${user_id}] User not found in tbl_logins`, { user_id });
      sendResponse(
        res,
        404,
        false,
        getMessage("User_not_fnd_in_logins_tbl", req.lang)
      );
      return;
    }

    const { member_id } = loginData[0];
    console.log(`DEBUG: Using member_id: ${member_id}`);  // Debug

    // Step 2: Get data from tbl_member_profile
    const profileData = await getProfileData(member_id);
    if (profileData.length === 0) {
      logger.warn(`❌ [${user_id}] User not found in tbl_member_profile`, {
        user_id,
      });
      sendResponse(
        res,
        404,
        false,
        getMessage("User_not_fnd_in_mem_prof_tbl", req.lang)
      );
      return;
    }

    // Step 3: Get community data using helper (now ALL communities)

    const tokenCommunityUUID = req.user?.community_uuid;
    if (!tokenCommunityUUID) {
      sendResponse(res, 400, false, "Community not found in token");
      return;
    }


    const { community_list } = await fetchAndFormatCommunities(member_id, user_id);

    const profile = profileData[0];
    const baseUrl = process.env.BASE_URL || ''; // Fallback to empty string if env var missing

    const isMainMember = profile.member_id === profile.family_main_member_id;

    let relationship = profile.relationship;
    if (!relationship || typeof relationship === "string") {
      relationship = { value: "himself", label: "પોતે", name: "relationship" };
    }

    // Step 4: Combine data, construct full URLs, and format date_of_birth
    const userData = {
      first_name: profile.first_name,
      father_name: profile.father_name,
      surname: profile.surname,
      gender: profile.gender,
      phone_number: profile.phone_number,
      family_uuid: profile.family_uuid,
      member_uuid: profile.member_uuid,
      user_uuid: profile.user_uuid,
      profile_photo: profile.profile_photo
        ? `${baseUrl}/Uploads/${profile.profile_photo}`
        : null,
      number_of_family_members: profile.number_of_family_members,
      date_of_birth: profile.date_of_birth
        ? moment(profile.date_of_birth).format("YYYY-MM-DD")
        : null,
      address: profile.address,
      business_or_job_or_any: profile.business_or_job_or_any,
      business_details: profile.business_details,
      education: profile.education,
      blood_group: profile.blood_group,
      marital_status: profile.marital_status,
      id_proof: profile.id_proof
        ? `${baseUrl}/Uploads/${profile.id_proof}`
        : null,
      email_id: profile.email_id,
      current_resident: profile.current_resident,
      relationship: relationship,
      is_community_admin: profile.is_community_admin,
      isMainMember: isMainMember,
      community_uuid: tokenCommunityUUID,
      community_list,
    };

    logger.info(`✅ [${user_id}] User data retrieved successfully`, {
      user_id,
    });

    sendResponse(
      res,
      200,
      true,
      getMessage("user_data_ret_suc", req.lang),
      userData
    );
  } catch (error: any) {
    logger.error(`❌ [${user_id}] Error fetching user data: ${error.message}`, {
      user_id,
      stack: error.stack,
    });
    sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

export const updateLoggedInUserData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user_id = req.user?.user_id;

  // Ensure user_id is available (authentication required)
  if (!user_id) {
    logger.error("No user_id found in request - authentication required");
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  try {
    logger.info(`📥 [${user_id}] Received request parameters:`, {
      user_id,
      first_name: req.body.first_name,
      father_name: req.body.father_name,
      surname: req.body.surname,
      gender: req.body.gender,
      date_of_birth: req.body.date_of_birth,
      phone_number: req.body.phone_number,
      address: req.body.address,
      business_or_job_or_any: req.body.business_or_job_or_any,
      business_details: req.body.business_details,
      education: req.body.education,
      blood_group: req.body.blood_group,
      marital_status: req.body.marital_status,
      email_id: req.body.email_id,
      current_resident: req.body.current_resident,
      relationship: req.body.relationship,
    });

    const member_uuid = req.params.member_uuid;

    logger.info(
      `📥 [${user_id}] Initiating profile update for member_uuid: ${member_uuid}`,
      { user_id }
    );

    if (!member_uuid) {
      logger.warn(
        `❌ [${user_id}] member_uuid not found in the request parameters`,
        { user_id }
      );
      sendResponse(res, 400, false, "member_UUID_not_found");
      return;
    }

    const profileData = await getLoginDataByMemberUUID(member_uuid);
    if (profileData.length === 0) {
      logger.warn(
        `❌ [${user_id}] User with member_uuid: ${member_uuid} not found`,
        { user_id }
      );
      sendResponse(res, 404, false, getMessage("user_not_found", req.lang));
      return;
    }

    const { member_id, phone_number: existingPhoneNumber } = profileData[0];
    const newPhoneNumber = req.body.phone_number;

    // Check if the phone number is masked (skip updates for masked numbers)
    const isPhoneNumberMasked = newPhoneNumber === "**********";
    if (isPhoneNumberMasked) {
      logger.info(
        `🔸 [${user_id}] Masked phone number detected, skipping phone number update`,
        { user_id }
      );
      // Remove phone_number from the request body to prevent updates
      delete req.body.phone_number;
    }
    // Continue with phone number validation only if number is not masked
    else if (newPhoneNumber && newPhoneNumber !== existingPhoneNumber) {
      const phoneExists = await checkPhoneNumberExists(newPhoneNumber);
      if (phoneExists) {
        logger.warn(
          `❌ [${user_id}] Phone number already used by another user: ${newPhoneNumber}`,
          { user_id }
        );
        sendResponse(
          res,
          400,
          false,
          getMessage("phone_already_used_in_other_family", req.lang)
        );
        return;
      }
    }

    // File handling
    let id_proof_relative = null;
    let profile_photo_relative = null;
    const baseUrl = process.env.BASE_URL || ''; // Fallback to empty string if env var missing
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files?.id_proof?.[0]) {
      id_proof_relative = `idproof/${files.id_proof[0].filename}`;
      logger.info(`📷 [${user_id}] ID Proof uploaded: ${id_proof_relative}`, {
        user_id,
      });
    }

    if (files?.profile_photo?.[0]) {
      profile_photo_relative = `profile_photos/${files.profile_photo[0].filename}`;
      logger.info(
        `📷 [${user_id}] Profile photo uploaded: ${profile_photo_relative}`,
        { user_id }
      );
    }

    // Prepare data for profile update
    logger.info(
      `🔸 [${user_id}] Updating profile data for member_id: ${member_id}`,
      { user_id }
    );

    // Use the phone number from request only if it's not masked
    const phoneNumberToUpdate = isPhoneNumberMasked ? existingPhoneNumber : req.body.phone_number;

    const updateResult = await updateProfileData(member_id, {
      first_name: req.body.first_name || null,
      father_name: req.body.father_name || null,
      surname: req.body.surname || null,
      gender: req.body.gender || null,
      date_of_birth: req.body.date_of_birth || null,
      phone_number: phoneNumberToUpdate,
      address: req.body.address || null,
      business_or_job_or_any: req.body.business_or_job_or_any || null,
      business_details: req.body.business_details || null,
      education: req.body.education || null,
      blood_group: req.body.blood_group || null,
      marital_status: req.body.marital_status || null,
      email_id: req.body.email_id || null,
      current_resident: req.body.current_resident || null,
      relationship: req.body.relationship || null,
      id_proof: id_proof_relative,
      profile_photo: profile_photo_relative,
    });

    // Update phone number in tbl_logins if it's changed and not masked
    // OR create login entry if phone number is being added for the first time
    if (newPhoneNumber && !isPhoneNumberMasked) {
      // Case 1: Phone number changed (update existing login)
      if (newPhoneNumber !== existingPhoneNumber && existingPhoneNumber) {
        logger.info(
          `🔄 [${user_id}] Updating phone number for member_id: ${member_id} from ${existingPhoneNumber} to ${newPhoneNumber}`,
          { user_id }
        );
        await updatePhoneNumberInLogins(member_id, newPhoneNumber);
      }
      // Case 2: Phone number added for first time (create new login entry)
      else if (!existingPhoneNumber || existingPhoneNumber === '' || existingPhoneNumber === null) {
        logger.info(
          `📝 [${user_id}] Creating new login entry for member_id: ${member_id}, phone: ${newPhoneNumber}`,
          { user_id }
        );
        
        const login_user_uuid = uuidv4();
        const added_on = moment().format();
        
        await createLoginEntry(login_user_uuid, newPhoneNumber, member_id, added_on);
        
        logger.info(
          `✅ [${user_id}] Login entry created successfully for member_id: ${member_id}`,
          { user_id }
        );
      }
    }

    if (updateResult.affectedRows === 0) {
      logger.warn(
        `❌ [${user_id}] No changes were made to the user profile for member_id: ${member_id}`,
        { user_id }
      );
      sendResponse(
        res,
        400,
        false,
        getMessage("No_change_made_to_user_prof", req.lang)
      );
      return;
    }

    // Handle family members count update
    const familyData = await getFamilySRID(member_id);
    if (familyData.length > 0) {
      console.log("this is familyData.length > 0 ---------------------------------------------------", familyData.length > 0);

      const { family_sr_id } = familyData[0];
      const number_of_family_members = req.body.number_of_family_members;

      if (number_of_family_members !== undefined) {
        console.log("this is number of familiy me,mber --------------------", number_of_family_members);

        // Add your validation here
        if (number_of_family_members > 20) {
          console.log("number of family mebers ----------------", number_of_family_members);

          logger.info(
            `❌ [${user_id}] number_of_family_members exceeds limit (20).`,
            { user_id }
          );
          sendResponse(
            res,
            400,
            false,
            getMessage("number_of_family_members", req.lang)
            );
          return;
        }
        console.log("this is update line ===============================================================");

        logger.info(
          `🔸 [${user_id}] Updating family member count for family_sr_id: ${family_sr_id}`,
          { user_id }
        );
        console.log(`family_sr_id ------------------------------------------------------------------ : ${family_sr_id} and number_of_family_members ------------------------------: ${number_of_family_members}`);

        await updateFamilyMemberCount(family_sr_id, number_of_family_members);
        
      }
    }

    const updatedUserData = await getUpdatedUserData(member_id);
    const user = updatedUserData[0];

    // Fetch updated community data using helper (now ALL communities)
    const { community_uuid, community_list } = await fetchAndFormatCommunities(member_id, user_id);

    let relationship = user.relationship;
    if (!relationship || typeof relationship === "string") {
      relationship = { value: "himself", label: "પોતે", name: "relationship" };
    }

    const formattedUserData = {
      ...user,
      isMainMember: user.member_id === user.family_main_member_id,
      profile_photo: user.profile_photo
        ? `${baseUrl}/Uploads/${user.profile_photo}`
        : null,
      id_proof: user.id_proof ? `${baseUrl}/Uploads/${user.id_proof}` : null,
      date_of_birth: user.date_of_birth
        ? moment(user.date_of_birth).format("YYYY-MM-DD")
        : null,
      relationship,
      community_uuid,
      community_list,
    };

    logger.info(
      `✅ [${user_id}] User profile updated successfully for member_id: ${member_id}`,
      { user_id }
    );
    sendResponse(
      res,
      200,
      true,
      getMessage("User_prof_update_suc", req.lang),
      formattedUserData
    );
  } catch (error: any) {
    logger.error(`❌ [${user_id}] Error in profile update process: ${error?.message}`, {
      user_id: user_id,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};
