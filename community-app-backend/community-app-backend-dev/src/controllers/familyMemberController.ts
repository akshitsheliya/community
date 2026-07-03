import { Request, Response } from "express";
import { dbPool } from "../config/db";
import { v4 as uuidv4 } from "uuid";
import { MemberProfileModel } from "../models/familyMemberModel";
import { getMessage } from "../utils/translation";
import moment from "moment";
import { sendResponse } from "../helpers/responseHelper";
import logger from "../utils/logger";

interface User {
  user_id: number;
  user_uuid: string;
}

interface AuthenticatedRequest extends Request {
  user?: User;
  files?: {
    [fieldname: string]: Express.Multer.File[];
  };
}

const memberModel = new MemberProfileModel(dbPool);



export const storeAdditionalMemberData = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const connection = await dbPool.getConnection();

  try {
    await connection.beginTransaction();

    const memberData = req.body;
    const user_id = req.user?.user_id;
    const user_uuid = req.user?.user_uuid;

    if (!user_id || !user_uuid) {
      logger.error("No user_id or user_uuid found in request - authentication required");
      await connection.rollback();
      sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
      return;
    }

    // Check if user is registered and approved
    const registerStatusRows = await memberModel.getUserRegistrationStatus(user_uuid);
    if (!registerStatusRows.length || registerStatusRows[0].is_approved !== 1) {
      await connection.rollback();
      sendResponse(res, 403, false, "user_not_approved");
      return;
    }

    // Get family_sr_id and family_number for logged-in user by user_id
    const familyInfoRows = await memberModel.getFamilyInfoByUserId(user_id);
    if (!familyInfoRows?.length) {
      await connection.rollback();
      sendResponse(res, 404, false, getMessage("family_info_not_found", req.lang));
      return;
    }
    const family_sr_id = familyInfoRows[0].family_sr_id;
    const family_number = familyInfoRows[0].family_number;

    // Fetch community_id for logged-in user
    const communityIdRows = await memberModel.getCommunityIdFromToken(user_id);
    if (!communityIdRows?.length || !communityIdRows[0].community_id) {
      await connection.rollback();
      sendResponse(res, 404, false, getMessage("community_id_not_found", req.lang));
      return;
    }
    const community_id = communityIdRows[0].community_id;

    // Validate required fields
    const requiredFields = ["first_name", "father_name", "surname", "gender", "address"];
    for (const field of requiredFields) {
      if (!memberData[field]) {
        await connection.rollback();
        sendResponse(res, 400, false, `${field} is required.`);
        return;
      }
    }

    // === NEW: Handle phone number properly ===
    let phone_number = memberData.phone_number?.trim() || null;

    // Validate phone number format if provided
    if (phone_number) {
      if (!/^[0-9]+$/.test(phone_number) || phone_number.length !== 10) {
        await connection.rollback();
        logger.warn(`❌ [${user_id}] Invalid phone number: ${phone_number}`, { user_id });
        sendResponse(res, 400, false, getMessage("invalid_phone_number", req.lang));
        return;
      }

      // === REQUIREMENT 1: Check for duplicate phone number globally ===
      const phoneExists = await memberModel.isPhoneNumberExists(phone_number);
      if (phoneExists) {
        phone_number = null;
        /*
        await connection.rollback();
        logger.warn(`❌ [${user_id}] Phone number already in use: ${phone_number}`, { user_id });
        sendResponse(res, 400, false, "Phone number already registered");
        return;*/
      }
    }
    // If phone_number is null/empty → allowed, and NO login entry will be created later

    // Generate new member_uuid
    const new_member_uuid = uuidv4();
    const baseUrl = process.env.BASE_URL;
    const id_proof_file = req.files?.id_proof?.[0];
    const profile_photo_file = req.files?.profile_photo?.[0];

    const id_proof_relative = id_proof_file ? `idproof/${id_proof_file.filename}` : null;
    const profile_photo_relative = profile_photo_file ? `profile_photos/${profile_photo_file.filename}` : null;

    const id_proof_full = id_proof_relative ? `${baseUrl}/Uploads/${id_proof_relative}` : null;
    const profile_photo_full = profile_photo_relative ? `${baseUrl}/Uploads/${profile_photo_relative}` : null;

    // Prepare values for insertFamilyMember (phone_number can be null)
    const values = [
      new_member_uuid,
      family_sr_id,
      memberData.first_name || null,
      memberData.father_name || null,
      memberData.surname || null,
      memberData.gender || null,
      memberData.date_of_birth || null,
      phone_number, // ← can be null
      memberData.address || null,
      memberData.business_or_job_or_any || null,
      memberData.business_category_id || null,
      memberData.business_details || null,
      memberData.profession_sector || null,
      memberData.education || null,
      memberData.blood_group || null,
      memberData.marital_status || null,
      id_proof_relative,
      memberData.email_id || null,
      memberData.is_committee_member || null,
      memberData.is_community_admin || null,
      memberData.relationship || null,
      memberData.is_family_representative || null,
      profile_photo_relative,
      memberData.current_resident || null,
    ];

    // Insert new family member
    const member_id = await memberModel.insertFamilyMember(values);
    if (!member_id) {
      await connection.rollback();
      logger.error(`❌ [${user_id}] Failed to add new family member`, { user_id });
      sendResponse(res, 400, false, getMessage("failed_2_add_new_mem", req.lang));
      return;
    }

    // Insert into tbl_community_member_relation
    const added_on = moment().format();
    const community_member_relation_id = uuidv4();

    await memberModel.insertCommunityMemberRelationComplete(
      community_member_relation_id,
      community_id,
      member_id,
      family_sr_id,
      family_number,
      added_on
    );

    // === REQUIREMENT 2 & 3: Create login entry ONLY if phone_number is provided ===
    if (phone_number) {
      // Create login entry with a new user_uuid
      const login_user_uuid = uuidv4();
      await memberModel.insertLoginEntry(
        login_user_uuid,
        phone_number,
        member_id,
        added_on
      );
      logger.info(`✅ Login entry created for new member with phone: ${phone_number}`);
    }
    // If no phone → no login entry (as required)

    await connection.commit();

    // Fetch the inserted member details
    const member = await memberModel.getMemberDetailsById(member_id);

    const formattedMember = {
      member_uuid: new_member_uuid,
      family_sr_id: family_sr_id,
      id_proof_path: id_proof_full,
      profile_photo_path: profile_photo_full,
      first_name: member.first_name,
      father_name: member.father_name,
      surname: member.surname,
      gender: member.gender,
      date_of_birth: member.date_of_birth ? moment(member.date_of_birth).format("YYYY-MM-DD") : null,
      phone_number: member.phone_number,
      address: member.address,
      current_resident: member.current_resident,
    };

    logger.info(`✅ [${user_id}] New family member added successfully with member_id: ${member_id}`, { user_id });

    sendResponse(res, 200, true, getMessage("new_fml_mem_add_suc", req.lang), formattedMember);
  } catch (error: any) {
    await connection.rollback();
    const user_id = req.user?.user_id;
    logger.error(`❌ [${user_id}] Error during database operation: ${error?.message}`, {
      user_id,
      stack: error?.stack,
    });
    sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  } finally {
    connection.release();
  }
};