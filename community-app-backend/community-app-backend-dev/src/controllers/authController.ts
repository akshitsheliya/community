import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { generateOTP } from "../utils/otp";
import jwt from "jsonwebtoken";
import { getMessage } from "../utils/translation";
import { TblLogins } from "../models/loginModel";
import { dbPool } from "../config/db";
import { validateRequest } from "../helpers/requestHelper";
import { sendResponse } from "../helpers/responseHelper";
import logger from "../utils/logger";
import { sendOtpViaMadzApi } from "../helpers/madzSmsHelper";

const JWT_SECRET = process.env.JWT_SECRET as string;

const tblLogins = new TblLogins(dbPool);

const extractMadzIds = (madzResponse: any): { batchid: string | null; msgid: string | null } => {
  const source = madzResponse?.data ?? madzResponse ?? {};
  const description = source?.description ?? {};
  const batchDetails = Array.isArray(description?.batch_dtl) ? description.batch_dtl : [];
  const firstBatchDetail = batchDetails.length > 0 ? batchDetails[0] : {};

  const batchid =
    source.batchid ??
    description.batchid ??
    description.batch_id ??
    source.batchId ??
    source.BatchId ??
    source.BATCHID ??
    null;
  const msgid =
    source.msgid ??
    firstBatchDetail?.msgid ??
    firstBatchDetail?.msg_id ??
    firstBatchDetail?.MsgId ??
    source.msgId ??
    source.MsgId ??
    source.MSGID ??
    null;

  return {
    batchid: batchid ? String(batchid) : null,
    msgid: msgid ? String(msgid) : null,
  };
};

const extractMadzErrorMessage = (error: any): string => {
  return (
    error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    "Failed to send OTP from SMS provider"
  );
};

// API: /api/register/mobile - Step 1: Register Mobile Number
export const registerMobile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let user_id: number | undefined;
  const { phone_number, appVersionCode, buildNumber, community_uuid } = req.body;

  console.log(`[registerMobile] Starting with phone_number: ${phone_number}`);
  logger.info("Received phone_number", { req_parameter: req.body });

  const validationResult = validateRequest(req.body, ["phone_number"]);
  if (!validationResult.success) {
    logger.error("Validation failed for phone number", { user_id, phone_number });
    return sendResponse(res, 400, false, validationResult.message!);
  }

  if (!/^\d{10}$/.test(phone_number)) {
    logger.error("Phone number invalid", { user_id, phone_number });
    return sendResponse(res, 400, false, getMessage("phone_invalid", req.lang));
  }

  if (!community_uuid) {
    logger.error("Missing community_uuid at register/sentOtp", { phone_number });
    return sendResponse(res, 400, false, "Missing community_uuid");
  }

  const community = await tblLogins.getCommunityUuid(community_uuid);
  if (!community || community.length === 0) {
    logger.warn("Invalid community_uuid", { user_id, community_uuid, phone_number });
    return sendResponse(res, 400, false, "Invalid Community!");
  }

  if (appVersionCode && buildNumber) {
    await tblLogins.updateAppVersion(phone_number, appVersionCode, buildNumber);
    logger.info("App version updated", { user_id, phone_number, appVersionCode, buildNumber });
  }

  try {
    const isRegisteredInFamily = await tblLogins.isPhonenumberInMemberProfile(phone_number, community_uuid);
    if (isRegisteredInFamily) {
      logger.warn("Attempt to register number already assigned to a family", { user_id, phone_number, community_uuid });
      return sendResponse(res, 400, false, getMessage("phone_already_in_family", req.lang));
    }

    // ✅ Additional check: If user exists and has member_id, check if already in this community
    const existingUser = await tblLogins.getUserByPhoneNumber(phone_number);
    if (existingUser.length > 0 && existingUser[0].member_id) {
      const member_id = existingUser[0].member_id;
      const community_id = await tblLogins.getCommunityIdByUuid(community_uuid);

      if (community_id) {
        const alreadyInCommunity = await tblLogins.checkCommunityMemberRelation(member_id, community_id);
        if (alreadyInCommunity) {
          logger.warn("User already registered in this community", { user_id: existingUser[0].user_id, phone_number, community_uuid });
          return sendResponse(res, 400, false, "You are already registered in this community. Please login instead.");
        }
      }
    }

    console.log(`[registerMobile] Proceeding with registration flow`);
    // Note: existingUser already fetched above for community check

    let otp = generateOTP();
    let skipsend = false;

    const staticOtpNumbers = [
      "7016286682", "6352363598", "6355368300", "7990603898",
      "9510507673", "9106323757", "9723471492", "7698967485", "8799263376",
    ];

    if (staticOtpNumbers.includes(phone_number)) {
      otp = Number(process.env.STATIC_OTP);
      skipsend = true;
    }

    if (existingUser.length > 0) {
      user_id = existingUser[0].user_id;
      console.log(`[registerMobile] User exists, user_id: ${user_id}`);
      logger.info("User already exists in the database", { user_id, phone_number });

      if (existingUser[0].member_id) {
        // logger.error("User already registered", { user_id, phone_number });
        // return sendResponse(res, 400, false, getMessage("user_registered", req.lang));

        if (skipsend) {
          console.log(`[registerMobile] Using STATIC_OTP for user_id: ${user_id}`);
          logger.info("Registering user with STATIC_OTP", { user_id, phone_number });
          user_id = await tblLogins.updateOTP(phone_number, `${process.env.STATIC_OTP}`);
          logger.info("OTP updated", { user_id, phone_number });
          return sendResponse(res, 200, true, getMessage("otp_sent", req.lang));
        }

        if (process.env.MADZ_SMS_API_URL) {
          let madzResponse: any = null;
          try {
            madzResponse = await sendOtpViaMadzApi(phone_number, otp);
          } catch (error) {
            logger.error("MADZ SMS API request failed", { user_id, phone_number, error });
            return sendResponse(res, 400, false, extractMadzErrorMessage(error));
          }
          const { batchid, msgid } = extractMadzIds(madzResponse);
          user_id = await tblLogins.updateOTP(phone_number, otp.toString(), batchid, msgid);
          console.log(`[registerMobile] OTP updated, new user_id: ${user_id}`);
          logger.info("OTP updated", { user_id, phone_number });
          return sendResponse(res, 200, true, getMessage("otp_sent", req.lang));
        } else {
          logger.info("Registering user with STATIC_OTP", { user_id, phone_number });
          user_id = await tblLogins.updateOTP(phone_number, `${process.env.STATIC_OTP}`);
          console.log(`[registerMobile] STATIC_OTP updated, user_id: ${user_id}`);
          logger.info("OTP updated", { user_id, phone_number });
          return sendResponse(res, 200, true, getMessage("otp_sent", req.lang));
        }
      } else {
        const user_uuid = uuidv4();
        logger.info("Registering new user", { user_id, user_uuid, phone_number });

        if (skipsend) {
          console.log(`[registerMobile] Using STATIC_OTP for user_id: ${user_id}`);
          logger.info("Registering user with STATIC_OTP", { user_id, phone_number });
          user_id = await tblLogins.updateOTP(phone_number, `${process.env.STATIC_OTP}`);
          logger.info("OTP updated", { user_id, phone_number });
          return sendResponse(res, 200, true, getMessage("otp_sent", req.lang));
        }

        if (process.env.MADZ_SMS_API_URL) {
          let madzResponse: any = null;
          try {
            madzResponse = await sendOtpViaMadzApi(phone_number, otp);
          } catch (error) {
            logger.error("MADZ SMS API request failed", { user_id, phone_number, error });
            return sendResponse(res, 400, false, extractMadzErrorMessage(error));
          }
          const { batchid, msgid } = extractMadzIds(madzResponse);
          user_id = await tblLogins.updateOTP(phone_number, otp.toString(), batchid, msgid);
          console.log(`[registerMobile] OTP updated, new user_id: ${user_id}`);
          logger.info("OTP updated", { user_id, phone_number });
          return sendResponse(res, 200, true, getMessage("otp_sent", req.lang));
        } else {
          logger.info("Registering user with STATIC_OTP", { user_id, phone_number });
          user_id = await tblLogins.updateOTP(phone_number, `${process.env.STATIC_OTP}`);
          console.log(`[registerMobile] STATIC_OTP updated, user_id: ${user_id}`);
          logger.info("OTP updated", { user_id, phone_number });
          return sendResponse(res, 200, true, getMessage("otp_sent", req.lang));
        }
      }
    } else {
      const user_uuid = uuidv4();
      logger.info("Registering new user", { user_id, user_uuid, phone_number });

      if (skipsend) {
        logger.info("Registering user with STATIC_OTP", { user_id, phone_number });
        user_id = await tblLogins.insertNewUser(user_uuid, phone_number, `${process.env.STATIC_OTP}`);
        console.log(`[registerMobile] New user inserted, user_id: ${user_id}`);
        logger.info("New user inserted", { user_id, phone_number });
        return sendResponse(res, 200, true, getMessage("otp_sent", req.lang));
      }

      if (process.env.MADZ_SMS_API_URL) {
        let madzResponse: any = null;
        try {
          madzResponse = await sendOtpViaMadzApi(phone_number, otp);
        } catch (error) {
          logger.error("MADZ SMS API request failed", { user_id, phone_number, error });
          return sendResponse(res, 400, false, extractMadzErrorMessage(error));
        }
        const { batchid, msgid } = extractMadzIds(madzResponse);
        user_id = await tblLogins.insertNewUser(user_uuid, phone_number, otp.toString());
        await tblLogins.updateOTP(phone_number, otp.toString(), batchid, msgid);
        console.log(`[registerMobile] New user inserted, user_id: ${user_id}`);
        logger.info("New user inserted", { user_id, phone_number });
        return sendResponse(res, 200, true, getMessage("otp_sent", req.lang));
      } else {
        logger.info("Registering new user with STATIC_OTP", { user_id, phone_number });
        user_id = await tblLogins.insertNewUser(user_uuid, phone_number, `${process.env.STATIC_OTP}`);
        console.log(`[registerMobile] New user inserted with STATIC_OTP, user_id: ${user_id}`);
        logger.info("New user inserted", { user_id, phone_number });
        return sendResponse(res, 200, true, getMessage("otp_sent", req.lang));
      }
    }
  } catch (error: any) {
    logger.error(`❌ [${user_id}] Failed to register mobile number: ${error?.message}`, {
      user_id,
      phone_number,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

// API: /api/register/verify-otp - Step 2: Verify OTP for Registration

export const verifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { phone_number, otp, appVersionCode, buildNumber, community_uuid } = req.body;

  let user_id: number | any;

  logger.info("📩 Received OTP verification request", { phone_number });

  // ----------------------------
  // 1️⃣ Validate Request Body
  // ----------------------------
  const validation = validateRequest(req.body, ["phone_number", "otp", "community_uuid"]);
  if (!validation.success) {
    return sendResponse(res, 400, false, validation.message!);
  }

  // ----------------------------
  // 2️⃣ Update App Version (Optional)
  // ----------------------------
  if (appVersionCode && buildNumber) {
    await tblLogins.updateAppVersion(phone_number, appVersionCode, buildNumber);
  }

  try {
    // ----------------------------
    // 3️⃣ Verify OTP
    // ----------------------------
    const user = await tblLogins.getUserByPhoneNumberAndOTP(phone_number, otp);

    if (!user || user.length === 0) {
      return sendResponse(res, 400, false, getMessage("invalid_otp", req.lang));
    }

    user_id = user[0].user_id;

    // ----------------------------
    // 4️⃣ Validate Community UUID
    // ----------------------------
    const community_id = await tblLogins.getCommunityIdByUuid(community_uuid);

    if (!community_id) {
      return sendResponse(res, 400, false, "Invalid community.");
    }

    // ----------------------------
    // 5️⃣ Check if User Has Profile (member_id)
    // ----------------------------
    const memberDetails = await tblLogins.getMemberDetailsByUserId(user_id);

    if (!memberDetails || !memberDetails.member_id) {
      // User exists but hasn't created profile yet
      logger.info("User verified OTP but needs to create profile first", { user_id, phone_number });
      const communityUuid = await tblLogins.getCommunityUUIDById(community_id);
      return sendResponse(res, 200, true, "OTP verified. Please create your profile to continue.", {
        token: jwt.sign(
          {
            phone_number,
            user_uuid: user[0].user_uuid,
            community_uuid: communityUuid,
          },
          JWT_SECRET,
          { expiresIn: "9999y" }
        ),
        url: `${process.env.DEV_URL}/?token=${jwt.sign(
          {
            phone_number,
            user_uuid: user[0].user_uuid,
            community_uuid: communityUuid,
          },
          JWT_SECRET,
          { expiresIn: "9999y" }
        )}`,
        userData: {
          user_id,
          user_uuid: user[0].user_uuid,
          phone_number,
          member_id: null,
          community_id,
          community_uuid,
          needs_profile: true,
          is_approved: 0,
          is_login_active: 1,
        }
      });
    }

    const member_id = memberDetails.member_id;

    // ----------------------------
    // 6️⃣ Check if Already Registered in Community
    // ----------------------------
    const alreadyExists = await tblLogins.checkCommunityMemberRelation(member_id, community_id);

    if (alreadyExists) {
      return sendResponse(
        res,
        400,
        false,
        "You are already registered in this community. Please login instead."
      );
    }

    await tblLogins.createCommunityRelation(member_id, community_id, user_id);


    logger.info("Skipping family and community relation creation as per requirements", {
      user_id,
      member_id,
      community_id
    });

    // ----------------------------
    // 7️⃣ Generate JWT Token
    // ----------------------------
    const communityUuid = await tblLogins.getCommunityUUIDById(community_id);
    const token = jwt.sign(
      {
        phone_number,
        user_uuid: user[0].user_uuid,
        community_uuid: communityUuid,
      },
      JWT_SECRET,
      { expiresIn: "9999y" }
    );

    // ----------------------------
    // 8️⃣ SUCCESS RESPONSE
    // ----------------------------
    return sendResponse(res, 200, true, "OTP Verified Successfully", {
      token,
      url: `${process.env.DEV_URL}/?token=${token}`,
      userData: {
        user_id,
        user_uuid: user[0].user_uuid,
        phone_number,
        member_id,
        community_id,
        community_uuid,
        is_approved: user[0].is_approved,
        is_login_active: user[0].is_login_active,
      }
    });

  } catch (error: any) {
    logger.error("❌ OTP verification error", {
      phone_number,
      user_id,
      error: error.message
    });

    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};



// API: /api/login/mobile - Step 1: Enter Phone Number for Login
export const loginWithMobile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { phone_number, appVersionCode, buildNumber, community_uuid } = req.body;
  let user_id: number | undefined;

  console.log(`[loginWithMobile] Starting with phone_number: ${phone_number}`);
  logger.info("Received request parameters", { req_parameter: req.body });

  // Validate request body
  const validationResult = validateRequest(req.body, ["phone_number"]);
  if (!validationResult.success) {
    logger.error("Validation failed for phone_number", { user_id, phone_number });
    return sendResponse(res, 400, false, validationResult.message!);
  }

  if (!/^\d{10}$/.test(phone_number)) {
    logger.error("Invalid phone_number format", { user_id, phone_number });
    return sendResponse(res, 400, false, getMessage("phone_invalid", req.lang));
  }

  try {
    // Step 1: Get user info and member_id
    const user = await tblLogins.getUserByPhoneNumberForLogin(phone_number);
    console.log(`[loginWithMobile] User query result:`, user);

    if (user.length === 0) {
      logger.error("User not found, registration required", { user_id, phone_number });
      return sendResponse(res, 400, false, getMessage("register_first", req.lang));
    }

    user_id = user[0].user_id;
    console.log(`[loginWithMobile] User found, user_id: ${user_id}`);

    // Check if user has completed profile (member_id is not null)
    if (!user[0].member_id) {
      logger.error("User has not completed profile", { user_id, phone_number });
      return sendResponse(res, 400, false, getMessage("create_profile_first", req.lang));
    }

    const member_id = user[0].member_id;
    let selectedCommunityUUID: string | null = null;

    // Handle community validation
    if (community_uuid) {
      // If community_uuid is provided, validate it
      const communityIdFromUUID = await tblLogins.getCommunityIdByUuid(community_uuid);
      if (!communityIdFromUUID) {
        logger.warn("Invalid community_uuid", { user_id, community_uuid, phone_number });
        return sendResponse(res, 400, false, "Invalid Community!");
      }

      // Step 3: Check if member is part of this specific community
      const memberCommunityIds = await tblLogins.getCommunityIdsByMemberId(member_id);
      if (!memberCommunityIds.includes(communityIdFromUUID)) {
        logger.warn("Community mismatch", {
          user_id,
          phone_number,
          provided_community_uuid: community_uuid,
        });
        return sendResponse(res, 400, false, "Invalid Community! You are not a member of this community");
      }

      // ✅ Community is valid
      selectedCommunityUUID = community_uuid;
    } else {
      // If community_uuid is not provided, check if member is part of ANY community
      logger.info("No community_uuid provided, checking if user is member of any community", { user_id, phone_number });

      // Check if this member_id is in any community
      const memberCommunityIds = await tblLogins.getCommunityIdsByMemberId(member_id);
      if (memberCommunityIds.length === 0) {
        logger.error("User is not a member of any community", { user_id, phone_number });
        return sendResponse(res, 400, false, "You are not member of any community");
      }

      // Member belongs to at least one community, proceed with login
      logger.info("User is member of communities without specifying community_uuid", {
        user_id,
        phone_number,
        community_count: memberCommunityIds.length
      });

      // ✅ Automatically pick the first community and fetch its UUID
      const firstCommunityId = memberCommunityIds[0];
      const communityUUID = await tblLogins.getCommunityUUIDById(firstCommunityId);

      selectedCommunityUUID = communityUUID;
      logger.info("User auto-logged into first community", {
        user_id,
        phone_number,
        auto_selected_community_uuid: communityUUID,
      });
    }

    // Check account status
    if (user[0].is_login_active === 1 && user[0].is_approved === 0) {
      logger.error("Account is under review", { user_id, phone_number });
      return sendResponse(res, 400, false, getMessage("acc_in_review", req.lang));
    }

    if (user[0].is_login_active === 0) {
      logger.error("Account is locked", { user_id, phone_number });
      return sendResponse(res, 400, false, getMessage("acc_lock", req.lang));
    }

    // Update app version if provided
    if (appVersionCode && buildNumber) {
      await tblLogins.updateAppVersion(phone_number, appVersionCode, buildNumber);
      logger.info("App version updated during login", { user_id, phone_number, appVersionCode, buildNumber });
    }

    // Generate and send OTP
    let otp: any = generateOTP();
    let skipsend = false;

    const staticOtpNumbers = [
      "7016286682", "6352363598", "6355368300", "7990603898",
      "9510507673", "9106323757", "9723471492", "7698967485", "8799263376",
    ];

    if (staticOtpNumbers.includes(phone_number)) {
      otp = process.env.STATIC_OTP;
      skipsend = true;
    }

    if (skipsend) {
      user_id = await tblLogins.updateOTPLogin(phone_number, otp.toString());
      console.log(`[loginWithMobile] OTP updated, user_id: ${user_id}`);
      logger.info("OTP updated for login", { user_id, phone_number });
      return sendResponse(res, 200, true, getMessage("otp_sent", req.lang), { community_uuid: selectedCommunityUUID });
    }

    if (process.env.MADZ_SMS_API_URL) {
      let madzResponse: any = null;
      try {
        madzResponse = await sendOtpViaMadzApi(phone_number, otp);
      } catch (error) {
        logger.error("MADZ SMS API request failed", { user_id, phone_number, error });
        return sendResponse(res, 400, false, extractMadzErrorMessage(error));
      }
      const { batchid, msgid } = extractMadzIds(madzResponse);
      user_id = await tblLogins.updateOTPLogin(phone_number, otp.toString(), batchid, msgid);
      console.log(`[loginWithMobile] OTP updated, user_id: ${user_id}`);
      logger.info("OTP updated for login", { user_id, phone_number });
      return sendResponse(res, 200, true, getMessage("otp_sent", req.lang), { community_uuid: selectedCommunityUUID });
    } else {
      user_id = await tblLogins.updateOTPLogin(phone_number, `${process.env.STATIC_OTP}`);
      console.log(`[loginWithMobile] STATIC_OTP updated, user_id: ${user_id}`);
      logger.info("OTP updated with STATIC_OTP", { user_id, phone_number });
      return sendResponse(res, 200, true, getMessage("otp_sent", req.lang), { community_uuid: selectedCommunityUUID });
    }
  } catch (error: any) {
    logger.error(`❌ [${user_id}] Failed to process login request: ${error?.message}`, {
      user_id,
      phone_number,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

// API: /api/login/verify-otp - Step 2: Verify OTP for Login
export const verifyLoginOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { phone_number, otp, appVersionCode, buildNumber, community_uuid } = req.body;
  let user_id: number | undefined;

  console.log(`[verifyLoginOTP] Starting with phone_number: ${phone_number}, otp: ${otp}`);
  logger.info("Received request parameters", { user_id, phone_number });

  // Validate request body
  const validationResult = validateRequest(req.body, ["phone_number", "otp"]);
  if (!validationResult.success) {
    logger.error("Validation failed for OTP verification", { user_id, phone_number, otp });
    return sendResponse(res, 400, false, validationResult.message!);
  }

  if (appVersionCode && buildNumber) {
    await tblLogins.updateAppVersion(phone_number, appVersionCode, buildNumber);
    logger.info("App version updated during OTP verification", { user_id, phone_number, appVersionCode, buildNumber });
  }

  try {
    const user = await tblLogins.getUserByPhoneNumberAndOTP(phone_number, otp);
    console.log(`[verifyLoginOTP] User query result:`, user);

    if (user.length === 0) {
      logger.error("Invalid OTP", { user_id, phone_number, otp });
      return sendResponse(res, 400, false, getMessage("invalid_otp", req.lang));
    }

    user_id = user[0].user_id;
    const member_id = user[0].member_id;
    console.log(`[verifyLoginOTP] User found, user_id: ${user_id}, member_id: ${member_id}`);

    if (user[0].is_login_active === 1 && user[0].is_approved === 0) {
      logger.error("Account is under review", { user_id, phone_number });
      return sendResponse(res, 400, false, getMessage("acc_in_review", req.lang));
    }

    if (user[0].is_login_active === 0) {
      logger.error("Account is locked", { user_id, phone_number });
      return sendResponse(res, 400, false, getMessage("acc_lock", req.lang));
    }

    if (user[0].is_login_active === 1 && user[0].is_approved === 1) {
      logger.info("Checking if user is a community admin", { user_id, phone_number });
      const [adminCheck]: any = await dbPool.query(
        `SELECT is_community_admin FROM tbl_member_profile WHERE member_id = ?`,
        [member_id]
      );

      const isAdmin = adminCheck.length > 0 && adminCheck[0].is_community_admin === 1;
      let community_id: number | null = null;

      // Handle the case when community_uuid is not provided
      if (!community_uuid) {
        logger.info("No community_uuid provided, checking member's communities", { user_id, member_id });

        if (!member_id) {
          logger.error("No member_id associated with this phone number", { user_id, phone_number });
          return sendResponse(res, 400, false, "User not associated with any member profile.");
        }

        // Get all community IDs associated with the member
        const communityIds = await tblLogins.getCommunityIdsByMemberId(member_id);

        if (communityIds.length === 0) {
          logger.error("Member not associated with any community", { user_id, member_id });
          return sendResponse(res, 400, false, "User is not associated with any community.");
        }

        // Use the first community ID (assuming a member can belong to multiple communities)
        community_id = communityIds[0];
        logger.info(`Using first available community_id: ${community_id}`, { user_id, member_id });
      } else {
        // If community_uuid is provided, continue with original flow
        community_id = await tblLogins.getCommunityIdByUuid(community_uuid);

        if (!community_id) {
          logger.error("Invalid community_uuid", { user_id, community_uuid, phone_number });
          return sendResponse(res, 400, false, "Invalid community.");
        }
      }

      // Now we have a valid community_id from either path
      const communityUuid = await tblLogins.getCommunityUUIDById(community_id);
      const token = jwt.sign(
        {
          phone_number,
          user_uuid: user[0].user_uuid,
          community_uuid: communityUuid
        },
        JWT_SECRET,
        { expiresIn: "9999y" }
      );

      logger.info("OTP verified and token generated successfully", { user_id, phone_number, community_id });

      await tblLogins.updateLastLogin(phone_number);

      const responseData: Record<string, any> = {
        token,
        url: `${process.env.DEV_URL}/?token=${token}`,
        community_uuid
      };

      if (isAdmin) {
        responseData.admin = 1;
        responseData.message = getMessage("admin_check_success", req.lang);
      }

      logger.info("Login OTP verified successfully", { user_id, phone_number });
      return sendResponse(res, 200, true, getMessage("login_successful", req.lang), responseData);
    }
  } catch (error: any) {
    logger.error(`❌ [${user_id}] Failed to verify login OTP: ${error?.message}`, {
      user_id,
      phone_number,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

// API: /api/account/delete-request - Submit Account Deletion Request
export const requestAccountDeletion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let user_id: number | undefined;

  console.log(`[requestAccountDeletion] Starting`);
  logger.info("Received account deletion request", { user_id });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.error("No or invalid auth header", { user_id });
      return sendResponse(res, 401, false, getMessage("Auth_token_err", req.lang));
    }

    const token = authHeader.split(" ")[1];

    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.error("Invalid or expired token", { user_id, error });
      return sendResponse(res, 401, false, getMessage("Invalid_or_expired_token", req.lang));
    }

    if (!decodedToken || !decodedToken.user_id || !decodedToken.phone_number) {
      logger.error("Invalid token structure", { user_id });
      return sendResponse(res, 401, false, getMessage("Invalid_token_structure", req.lang));
    }

    user_id = decodedToken.user_id;
    const { phone_number, reason_for_delete_account } = req.body;
    console.log(`[requestAccountDeletion] Processing for user_id: ${user_id}`);

    logger.info("Processing account deletion request", { user_id, phone_number });

    const checkUserQuery = `SELECT * FROM tbl_logins WHERE user_id = ?`;
    const [userRows]: any = await dbPool.query(checkUserQuery, [user_id]);

    if (userRows.length === 0) {
      logger.error(`User ID ${user_id} not found in tbl_logins`, { user_id, phone_number });
      return sendResponse(res, 400, false, getMessage("user_does_not_exist", req.lang));
    }

    const insertQuery = `
      INSERT INTO tbl_delete_account_requests (user_id, phone_number, reason_for_delete_account)
      VALUES (?, ?, ?)
    `;

    await dbPool.query(insertQuery, [user_id, phone_number, reason_for_delete_account || null]);

    logger.info("Account deletion request successfully inserted", { user_id, phone_number });
    sendResponse(res, 200, true, getMessage("account_del_request_success", req.lang));
  } catch (error: any) {
    logger.error(`❌ [${user_id}] Error adding account deletion request: ${error?.message}`, {
      user_id,
      stack: error?.stack,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};
