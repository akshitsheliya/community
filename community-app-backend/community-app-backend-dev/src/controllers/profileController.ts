import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { getMessage } from "../utils/translation";
import { validateRequest } from "../helpers/requestHelper";
import { sendResponse } from "../helpers/responseHelper";
import { TblMemberProfile } from "../models/profileModel";
import { getFilteredCommunityAdmins } from "../models/marksheetModel";
import { sendNotificationToMultipleUser } from "../firebase/helpers/notificationHelper";
import { storeNotification } from "../middleware/storeNotificationsMiddleware";
import logger from "../utils/logger";
import { AuthRequest } from "../middleware/authMiddleware";
import { dbPool } from "../config/db";

const memberProfileModel = new TblMemberProfile(dbPool);

export const createProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    phone_number,
    first_name,
    father_name,
    surname,
    gender,
    number_of_family_members,
  } = req.body;

  const { user } = req as AuthRequest;
  const user_id = user?.user_id;
  const community_id = user?.community_id;

  if (!user_id || !community_id) {
    return sendResponse(res, 401, false, getMessage("Auth_token_err", req.lang));
  }

  // Validate request body
  const validation = validateRequest(req.body, [
    "phone_number",
    "first_name",
    "father_name",
    "surname",
    "gender",
    "number_of_family_members",
  ]);

  if (!validation.success) {
    return sendResponse(res, 400, false, validation.message || "Invalid request data");
  }

  if (number_of_family_members > 20) {
    return sendResponse(res, 400, false, getMessage("number_of_family_members", req.lang));
  }

  // Profile photo
  let profilePhotoRelative: string | null = null;
  let profilePhotoFull: string | null = null;

  if (req.file) {
    profilePhotoRelative = `profile_photos/${req.file.filename}`;
    profilePhotoFull = `${process.env.BASE_URL}/Uploads/${profilePhotoRelative}`;
  }

  try {
    const added_on = moment().format();
    let member_id: number;
    let member_uuid: string;

    // STEP 1: Check existing member by phone
    const existingMember = await memberProfileModel.getMemberByPhone(phone_number);

    if (existingMember) {
      member_id = existingMember.member_id;
      member_uuid = existingMember.member_uuid;

      // STEP 2: Check if member already in this community
      const alreadyInCommunity = await memberProfileModel.isMemberInCommunity(member_id, community_id);
      if (alreadyInCommunity) {
        return sendResponse(res, 409, false, "User already registered in this community");
      }

      logger.info(`👤 Existing member reused: ${member_id}`, { user_id });
    } else {
      // STEP 2: Create new global member
      member_uuid = uuidv4();

      const newProfile = await memberProfileModel.createProfile(
        member_uuid,
        phone_number,
        first_name,
        father_name,
        surname,
        profilePhotoRelative || "",
        gender,
        added_on
      );

      member_id = newProfile.insertId;

      // Attach member_id to login
      await memberProfileModel.updateLoginMemberId(member_id, phone_number);

      logger.info(`🆕 New member created: ${member_id}`, { user_id });
    }

    // STEP 3: Create family for this member
    const family = await memberProfileModel.createFamily(
      uuidv4(),
      member_id,
      number_of_family_members,
      added_on
    );

    const family_sr_id = family.insertId;

    // Sync family_sr_id in member profile to avoid NULL family_sr_id records
    await memberProfileModel.updateProfileFamilyId(member_uuid, family_sr_id);

    // STEP 4: Link member to community
    const family_number = await memberProfileModel.getNextFamilyNumber();

    await memberProfileModel.linkMemberToCommunity(
      uuidv4(),
      community_id,
      member_id,
      family_sr_id,
      family_number,
      added_on
    );

    // STEP 5: Notify community admins
    const isDemo = (user as any)?.is_demo_account ?? 0;
    const adminTokensData = await getFilteredCommunityAdmins(community_id, isDemo);

    if (adminTokensData && adminTokensData.length > 0) {
      const tokensByLanguage: Record<string, { tokens: string[]; admins: any[] }> = {};

      for (const admin of adminTokensData) {
        const lang = admin.app_language || "gu_IN";
        if (!tokensByLanguage[lang]) tokensByLanguage[lang] = { tokens: [], admins: [] };

        if (admin.fcm_device_token) {
          tokensByLanguage[lang].tokens.push(admin.fcm_device_token);
          tokensByLanguage[lang].admins.push(admin);
        }
      }

      for (const lang in tokensByLanguage) {
        const { tokens, admins } = tokensByLanguage[lang];
        const title = lang === "gu_IN" ? "નવો સભ્ય નોંધાયો છે" : "New Member Registration";
        const body = lang === "gu_IN"
          ? `નવા સભ્ય ${surname} ${first_name} ${father_name} ની નોંધણી થઈ છે. નામ ચકાસી ને સભ્ય ને મંજૂર કરો.`
          : `${surname} ${first_name} ${father_name} has just registered now. Please review their account and approve it.`;

        await sendNotificationToMultipleUser(tokens, title, body, { type: "new_member", member_uuid });

        for (const admin of admins) {
          await storeNotification(admin.member_id, "new_member", body, community_id);
        }
      }

      logger.info(`✅ [${user_id}] Admin notifications sent successfully`, { user_id });
    } else {
      logger.warn(`⚠️ [${user_id}] No admins found for community_id: ${community_id}`, { user_id });
    }

    // STEP 6: Response
    sendResponse(res, 200, true, getMessage("profile_created", req.lang), {
      is_approved: 0,
      member_id,
      family_sr_id,
      family_number,
      profile_photo: profilePhotoFull,
      url: process.env.DEV_URL
    });

  } catch (error: any) {
    logger.error(`❌ [${user_id}] Error in createProfile:`, {
      user_id,
      message: error.message,
      stack: error.stack,
    });

    sendResponse(res, 500, false, getMessage("server_error", req.lang));
  }
};
