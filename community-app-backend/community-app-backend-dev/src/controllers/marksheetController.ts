import { Request, Response, NextFunction } from "express";
import {
  addMarksheet,
  getMarksheetByUser,
  getLoginData,
  getMarksheets,
  approveMarksheetQuery,
  rejectMarksheetByUuid,
  editMarksheetById,
  getUserIdByUuid,
  getMarksheetOwnerId,
  deleteMarksheetById,
  getMarksheetDetails,
  getFilteredCommunityAdmins,
} from "../models/marksheetModel";
import { getMessage } from "../utils/translation";
import { validateRequest } from "../helpers/requestHelper";
import { sendResponse } from "../helpers/responseHelper";
import path from "path";
import { runPythonScript } from "../utils/pythonHelper";
import { dbPool } from "../config/db";
import { getPaginationFromRequest } from "../helpers/paginationHelper";
import { AuthRequest } from "../middleware/authMiddleware";
import logger from "../utils/logger";
import {
  sendNotificationToMultipleUser,
  sendNotificationToSingleUser,
} from "../firebase/helpers/notificationHelper";
import { storeNotification } from "../middleware/storeNotificationsMiddleware";

export const storeMarksheet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const connection = await dbPool.getConnection();
  const { user } = req as AuthRequest;
  const user_id = user?.user_id;
  const user_uuid = user?.user_uuid;
  const community_id = user?.community_id;

  if (!user_id || !user_uuid || !community_id) {
    logger.error(`❌ [${user_id || 'unknown'}] Unauthorized access attempt: Missing required user fields`, {
      user_id: user_id || 'unknown',
      community_id: community_id || 'unknown',
      method: req.method,
      url: req.originalUrl
    });
    await connection.rollback();
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    connection.release();
    return;
  }
  

  try {
    await connection.beginTransaction();

    const requiredFields = [
      "marksheet_year",
      "student_name",
      "standard",
      "medium",
      "percentage",
      "marksheet_photo",
      "father_full_name",
      "father_phone_number",
    ];
    const validation = validateRequest(req.body, requiredFields);

    logger.info(`📥 [${user_id}] Validating marksheet data`, {
      user_id,
      method: req.method,
      url: req.originalUrl,
      body: req.body
    });

    if (!validation.success) {
      logger.warn(`⚠️ [${user_id}] Validation failed for marksheet data`, {
        user_id,
        method: req.method,
        url: req.originalUrl,
        validationMessage: validation.message
      });
      await connection.rollback();
      sendResponse(res, 400, false, validation.message!);
      connection.release();
      return;
    }

    logger.info(`📤 [${user_id}] Fetching login data for user_uuid: ${user_uuid}`, {
      user_id,
      method: req.method,
      url: req.originalUrl
    });
    const loginData = await getLoginData(user_uuid);
    if (!loginData.length) {
      logger.warn(`⚠️ [${user_id}] User not found in tbl_logins`, {
        user_id,
        method: req.method,
        url: req.originalUrl,
        user_uuid
      });
      await connection.rollback();
      sendResponse(res, 404, false, getMessage("User_not_fnd_in_logins_tbl", req.lang));
      connection.release();
      return;
    }

    logger.info(`📤 [${user_id}] Storing marksheet data`, {
      user_id,
      method: req.method,
      url: req.originalUrl,
      body: {
        marksheet_year: req.body.marksheet_year,
        student_name: req.body.student_name,
        standard: req.body.standard,
        medium: req.body.medium,
        percentage: req.body.percentage,
        stream: req.body.stream,
        father_phone_number: req.body.father_phone_number,
        father_full_name: req.body.father_full_name,
        marksheet_photo: req.body.marksheet_photo
      }
    });

    const result = await addMarksheet({
      marksheet_year: req.body.marksheet_year,
      student_name: req.body.student_name,
      standard: req.body.standard,
      medium: req.body.medium,
      percentage: req.body.percentage,
      stream: req.body.stream,
      father_phone_number: req.body.father_phone_number,
      father_full_name: req.body.father_full_name,
      user_id,
      community_id,
      marksheet_photo: req.body.marksheet_photo,
    });
    

    const uploaderIsDemo = loginData[0].is_demo_account ?? 0;
    logger.info(`📤 [${user_id}] Fetching community admins for notification, isDemo: ${uploaderIsDemo}`, {
      user_id,
      method: req.method,
      url: req.originalUrl
    });
    const adminData = await getFilteredCommunityAdmins(uploaderIsDemo, community_id);

    const notificationType = "new_marksheet";

    // Group admin tokens by language
    const groupedTokens: Record<string, string[]> = {};
    const groupedMemberIds: Record<string, number[]> = {};

    for (const admin of adminData) {
      const lang = admin.app_language || "gu_IN";
      if (!groupedTokens[lang]) {
        groupedTokens[lang] = [];
        groupedMemberIds[lang] = [];
      }
      groupedTokens[lang].push(admin.fcm_device_token);
      groupedMemberIds[lang].push(admin.member_id);
    }

    // Send localized notifications per language group
    for (const lang of Object.keys(groupedTokens)) {
      const tokens = groupedTokens[lang];
      const memberIds = groupedMemberIds[lang];

      if (tokens.length === 0) {
        logger.warn(`⚠️ [${user_id}] No FCM tokens found for language: ${lang}`, {
          user_id,
          method: req.method,
          url: req.originalUrl
        });
        continue;
      }

      const notificationMsg =
        lang === "gu_IN"
          ? `${req.body.student_name} ની નવી માર્કશીટ આવી છે. ચકાસણી કરીને મંજૂર કરો.`
          : `${req.body.student_name} has added a new marksheet.`;

      const notificationTitle =
        lang === "gu_IN" ? "નવી MARKશીટ ઉમેરાઈ 📄" : "New Marksheet Added 📄";

      for (const member_id of memberIds) {
        logger.info(`📤 [${user_id}] Storing notification for admin member_id: ${member_id}`, {
          user_id,
          method: req.method,
          url: req.originalUrl
        });
        const isStored = await storeNotification(
          member_id,
          notificationType,
          notificationMsg,
          community_id
        );
        if (isStored) {
          logger.info(`✅ [${user_id}] Notification stored successfully for admin member_id: ${member_id}`, {
            user_id,
            method: req.method,
            url: req.originalUrl
          });
        } else {
          logger.warn(`⚠️ [${user_id}] Failed to store notification for admin member_id: ${member_id}`, {
            user_id,
            method: req.method,
            url: req.originalUrl
          });
        }
      }

      logger.info(`📱 [${user_id}] Sending notification to admins for new marksheet, language: ${lang}`, {
        user_id,
        method: req.method,
        url: req.originalUrl,
        tokenCount: tokens.length
      });
      await sendNotificationToMultipleUser(
        tokens,
        notificationTitle,
        notificationMsg,
        {
          type: notificationType,
          marksheet_uuid: result.marksheet_uuid,
        }
      );
    }

    const baseUrl = process.env.BASE_URL;
    const enhancedResult = {
      ...result,
      marksheet_photo: req.body.marksheet_photo
        ? `${baseUrl}/Uploads/${req.body.marksheet_photo}`
        : null,
    };

    await connection.commit();

    logger.info(`✅ [${user_id}] Marksheet stored successfully with UUID: ${result.marksheet_uuid}`, {
      user_id,
      method: req.method,
      url: req.originalUrl
    });

    sendResponse(
      res,
      201,
      true,
      getMessage("marksheet_data_stored", req.lang),
      enhancedResult
    );
  } catch (error: any) {
    await connection.rollback();
    logger.error(`❌ [${user_id}] Error storing marksheet data`, {
      user_id,
      method: req.method,
      url: req.originalUrl,
      message: error.message,
      stack: error.stack
    });

    if (error.code === "ER_SIGNAL_EXCEPTION" || error.sqlState === "45000") {
      sendResponse(res, 400, false, getMessage("invalid_stream", req.lang));
    } else if (
      error.message === "No active standards found for the given year" ||
      error.message === "Standard is not active for the given year" ||
      error.message === "Submission date for this year has expired"
    ) {
      sendResponse(res, 400, false, error.message);
    } else {
      sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
    }
  } finally {
    connection.release();
  }
};

export const getMarksheet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user } = req as AuthRequest;
  const community_id = user?.community_id;
  const user_id = req.user?.user_id;
  const user_uuid = req.user?.user_uuid;

  // Ensure user_id and user_uuid are available (authentication required)
  if (!user_id || !user_uuid || !community_id) {
    logger.error(`❌ [${user_id || 'unknown'}] Unauthorized access attempt: No user_id or user_uuid found`, {
      user_id: user_id || 'unknown',
      method: req.method,
      url: req.originalUrl
    });
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  try {
    logger.info(`📥 [${user_id}] Fetching marksheet data for user_uuid: ${user_uuid}`, {
      user_id,
      method: req.method,
      url: req.originalUrl
    });

    logger.info(`📤 [${user_id}] Fetching login data for user_uuid: ${user_uuid}`, {
      user_id,
      method: req.method,
      url: req.originalUrl
    });
    const loginData = await getLoginData(user_uuid);
    if (!loginData.length) {
      logger.warn(`⚠️ [${user_id}] User not found in tbl_logins`, {
        user_id,
        method: req.method,
        url: req.originalUrl,
        user_uuid
      });
      sendResponse(res, 404, false, getMessage("User_not_fnd_in_logins_tbl", req.lang));
      return;
    }

    logger.info(`📤 [${user_id}] Fetching marksheet data for user_id: ${user_id}`, {
      user_id,
      method: req.method,
      url: req.originalUrl
    });
    const marksheetData = await getMarksheetByUser(user_id, community_id);

    if (!marksheetData.length) {
      logger.info(`📥 [${user_id}] No marksheet data found`, {
        user_id,
        method: req.method,
        url: req.originalUrl
      });
      sendResponse(res, 200, true, getMessage("No_marksheet_data_fnd", req.lang), []);
      return;
    }

    const baseUrl = process.env.BASE_URL;
    const enhancedData = marksheetData.map((marksheet) => ({
      ...marksheet,
      marksheet_photo: marksheet.marksheet_photo
        ? `${baseUrl}/Uploads/${marksheet.marksheet_photo}`
        : null,
    }));

    logger.info(`✅ [${user_id}] Retrieved ${enhancedData.length} marksheet(s) successfully`, {
      user_id,
      method: req.method,
      url: req.originalUrl
    });

    sendResponse(
      res,
      200,
      true,
      getMessage("Marksheet_data_ret_suc", req.lang),
      enhancedData
    );
  } catch (error) {
    logger.error(`❌ [${user_id}] Error fetching marksheet data`, {
      user_id,
      method: req.method,
      url: req.originalUrl,
      error
    });
    sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

//commented AI part for process marksheet
// export const processMarkSheet = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const user_id = req.user?.user_id;

//   // Ensure user_id is available (authentication required)
//   if (!user_id) {
//     logger.error(`❌ [${user_id || 'unknown'}] Unauthorized access attempt: No user_id found`, {
//       user_id: user_id || 'unknown',
//       method: req.method,
//       url: req.originalUrl
//     });
//     sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
//     return;
//   }

//   try {
//     logger.info(`📥 [${user_id}] Initiating marksheet processing`, {
//       user_id,
//       method: req.method,
//       url: req.originalUrl
//     });

//     if (!req.file) {
//       logger.warn(`⚠️ [${user_id}] No file uploaded for marksheet processing`, {
//         user_id,
//         method: req.method,
//         url: req.originalUrl
//       });
//       sendResponse(res, 400, false, "No file uploaded");
//       return;
//     }

//     const baseUrl = process.env.BASE_URL;
//     const filename = req.file.filename;
//     const marksheetUrl = `${baseUrl}/Uploads/marksheets/${filename}`;
//     const relativePath = `marksheets/${filename}`;
//     const imagePath = req.file.path;

//     const ocrScriptPath = path.join(__dirname, "../../ocr/process_Marksheet.py");

//     logger.info(`📤 [${user_id}] Running OCR script for marksheet: ${filename}`, {
//       user_id,
//       method: req.method,
//       url: req.originalUrl
//     });

//     const results = await runPythonScript(ocrScriptPath, [imagePath]);

//     if (!results || results.length === 0) {
//       logger.warn(`⚠️ [${user_id}] No results returned from OCR script`, {
//         user_id,
//         method: req.method,
//         url: req.originalUrl
//       });
//       sendResponse(res, 500, false, "No results returned from Python script");
//       return;
//     }

//     const parsedData = JSON.parse(results[0]);
//     const extractedData = {
//       ...parsedData,
//       relativePath,
//       marksheetUrl,
//     };

//     logger.info(`✅ [${user_id}] Marksheet processed successfully`, {
//       user_id,
//       method: req.method,
//       url: req.originalUrl,
//       extractedData: {
//         student_name: parsedData.student_name,
//         marksheet_year: parsedData.marksheet_year,
//         standard: parsedData.standard,
//         medium: parsedData.medium,
//         percentage: parsedData.percentage
//       }
//     });

//     sendResponse(res, 200, true, "Marksheet processed successfully", extractedData);
//   } catch (error) {
//     logger.error(`❌ [${user_id}] Error processing marksheet image`, {
//       user_id,
//       method: req.method,
//       url: req.originalUrl,
//       error
//     });
//     sendResponse(res, 500, false, "Failed to process image", (error as Error).message);
//   }
// };

export const processMarkSheet = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user_id = req.user?.user_id;

  // Ensure user_id is available (authentication required)
  if (!user_id) {
    logger.error(`❌ [${user_id || 'unknown'}] Unauthorized access attempt: No user_id found`, {
      user_id: user_id || 'unknown',
      method: req.method,
      url: req.originalUrl
    });
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  try {
    logger.info(`📥 [${user_id}] Initiating marksheet upload`, {
      user_id,
      method: req.method,
      url: req.originalUrl
    });

    if (!req.file) {
      logger.warn(`⚠️ [${user_id}] No file uploaded for marksheet`, {
        user_id,
        method: req.method,
        url: req.originalUrl
      });
      sendResponse(res, 400, false, "No file uploaded");
      return;
    }

    const baseUrl = process.env.BASE_URL;
    const filename = req.file.filename;
    const marksheetUrl = `${baseUrl}/Uploads/marksheets/${filename}`;
    const relativePath = `marksheets/${filename}`;

    const uploadedData = {
      relativePath,
      marksheetUrl,
      filename,
      student_name: null,
      marksheet_year: null,
      standard: null,
      medium: null,
      percentage: null,
    };

    logger.info(`✅ [${user_id}] Marksheet uploaded successfully`, {
      user_id,
      method: req.method,
      url: req.originalUrl,
      filename
    });

    sendResponse(res, 200, true, "Marksheet uploaded successfully", uploadedData);
  } catch (error) {
    logger.error(`❌ [${user_id}] Error uploading marksheet`, {
      user_id,
      method: req.method,
      url: req.originalUrl,
      error
    });
    sendResponse(res, 500, false, "Failed to upload marksheet", (error as Error).message);
  }
};

export const getAllMarksheets = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user } = req as AuthRequest;
  const community_id = user?.community_id;
  const user_id = req.user?.user_id;

  // Ensure user_id is available (authentication required)
  if (!user_id || !community_id) {
    logger.error(`❌ [${user_id || 'unknown'}] Unauthorized access attempt: No user_id found`, {
      user_id: user_id || 'unknown',
      method: req.method,
      url: req.originalUrl
    });
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  try {
    const { page, limit } = getPaginationFromRequest(req);
    const filters = req.query;

    logger.info(`📥 [${user_id}] Fetching all marksheets`, {
      user_id,
      method: req.method,
      url: req.originalUrl,
      query: { ...filters, page, limit }
    });

    logger.info(`📤 [${user_id}] Querying marksheets with pagination: page=${page}, limit=${limit}`, {
      user_id,
      method: req.method,
      url: req.originalUrl,
      filters
    });
    const result = await getMarksheets(filters, limit, page, community_id);

    if (!result.data || result.data.length === 0) {
      logger.info(`📥 [${user_id}] No marksheets found`, {
        user_id,
        method: req.method,
        url: req.originalUrl,
        filters
      });
      sendResponse(res, 201, true, getMessage("marksheet_nf", req.lang), [], 0);
      return;
    }

    const baseUrl = process.env.BASE_URL;
    const enhancedData = result.data.map((marksheet) => ({
      ...marksheet,
      marksheet_photo: marksheet.marksheet_photo
        ? `${baseUrl}/Uploads/${marksheet.marksheet_photo}`
        : null,
    }));

    logger.info(`✅ [${user_id}] Retrieved ${result.total} marksheet(s) successfully`, {
      user_id,
      method: req.method,
      url: req.originalUrl
    });

    sendResponse(
      res,
      200,
      true,
      getMessage("marksheet_success", req.lang),
      enhancedData,
      result.total
    );
  } catch (error) {
    logger.error(`❌ [${user_id}] Error fetching all marksheets`, {
      user_id,
      method: req.method,
      url: req.originalUrl,
      error
    });
    if (!res.headersSent) {
      sendResponse(res, 500, false, getMessage("failed_fetch_marksheet", req.lang), []);
    }
  }
};

export const approveMarksheet = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user } = req as AuthRequest;
  const user_id = req.user?.user_id;
  const community_id = user?.community_id;

  // Ensure user_id is available (authentication required)
  if (!user_id || !community_id) {
    logger.error("No user_id found in request - authentication required");
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  try {
    const { id } = req.params;

    logger.info(`📥 [${user_id}] Admin attempting to approve marksheet with ID: ${id}`, { user_id });

    const result = await approveMarksheetQuery(id, user_id, community_id);

    if (!result.success) {
      logger.warn(`⚠️ [${user_id}] Marksheet approval failed for ID: ${id}`, { user_id });
      sendResponse(res, 400, false, result.message || getMessage("marksheet_not_found", req.lang));
      return;
    }

    const studentDetails = await getMarksheetDetails(id);

    if (studentDetails?.fcm_device_token) {
      const lang = studentDetails.app_language || "gu_IN";
      const studentName = studentDetails.student_name;
      const percentage = studentDetails.percentage;

      const title =
        lang === "gu_IN"
          ? "તમારી માર્કશીટ મંજૂર થઈ! 🎉"
          : "Your Marksheet Approved 🎉";

      const dbMessage =
        lang === "gu_IN"
          ? `${studentName} ની માર્કશીટ મળી ગઈ છે. જો ઈનામ ને પાત્ર થશો તો તમને મેસેજ દ્વારા જાણ કરવામાં આવશે.`
          : `${studentName}'s marksheet has been received. You will be notified via message if you are eligible for the prize.`;

      logger.info(`📱 [${user_id}] Sending notification to student ${studentName} (ID: ${id})`, { user_id });

      await sendNotificationToSingleUser(
        studentDetails.fcm_device_token,
        title,
        dbMessage,
        {
          marksheetId: id,
          studentName,
          percentage: percentage.toString(),
          type: "marksheet_approve",
        }
      );

      const notificationStored = await storeNotification(
        studentDetails.member_id,
        "marksheet_approve",
        dbMessage,
        community_id
      );

      if (!notificationStored) {
        logger.warn(`⚠️ [${user_id}] Failed to store notification for member_id: ${studentDetails.member_id}`, { user_id });
      } else {
        logger.info(`📤 [${user_id}] Notification stored successfully for member_id: ${studentDetails.member_id}`, { user_id });
      }
    } else {
      logger.warn(`⚠️ [${user_id}] No FCM token found for student with ID: ${id}`, { user_id });
    }

    logger.info(`✅ [${user_id}] Marksheet approved successfully for ID: ${id}`, { user_id });

    sendResponse(res, 200, true, getMessage("marksheet_approved", req.lang));
  } catch (error) {
    logger.error(`❌ [${user_id}] Error approving marksheet with ID: ${req.params.id}`, { user_id, error });
    sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

export const rejectMarksheet = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user } = req as AuthRequest;
  const user_id = req.user?.user_id;
  const community_id = user?.community_id;


  // Ensure user_id is available (authentication required)
  if (!user_id || !community_id) {
    logger.error("No user_id or community_id found in request - authentication required");
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  try {
    const { marksheet_uuid } = req.params;
    const { rejection_reason } = req.body;

    logger.info(`📥 [${user_id}] Admin attempting to reject marksheet with UUID: ${marksheet_uuid}`, { user_id });

    if (!marksheet_uuid || typeof marksheet_uuid !== "string") {
      logger.warn(`⚠️ [${user_id}] Invalid marksheet UUID provided`, { user_id });
      sendResponse(res, 400, false, getMessage("Invalid_marksheet_ID", req.lang));
      return;
    }

    if (!rejection_reason) {
      logger.warn(`⚠️ [${user_id}] No rejection reason provided`, { user_id });
      sendResponse(res, 400, false, getMessage("rejection_reason_required", req.lang));
      return;
    }

    const result = await rejectMarksheetByUuid(marksheet_uuid, rejection_reason, user_id, community_id);

    if (!result.success) {
      logger.warn(`⚠️ [${user_id}] Failed to reject marksheet UUID: ${marksheet_uuid}`, { user_id, message: result.message });
      switch (result.message) {
        case "Marksheet not found":
          sendResponse(res, 404, false, getMessage("marksheet_not_found", req.lang));
          break;
        case "Marksheet already approved":
          sendResponse(res, 400, false, getMessage("already_approved", req.lang));
          break;
        case "Marksheet already rejected":
          sendResponse(res, 400, false, getMessage("already_rejected", req.lang));
          break;
        default:
          sendResponse(res, 500, false, getMessage("failed_to_reject_marksheet", req.lang));
      }
      return;
    }

    const studentDetails = await getMarksheetDetails(marksheet_uuid);

    if (studentDetails?.fcm_device_token) {
      const lang = studentDetails.app_language || "gu_IN";
      const studentName = studentDetails.student_name;

      const title =
        lang === "gu_IN" ? "માર્કશીટ નકારાઈ ગઈ ❌" : "Marksheet Rejected ❌";

      const message =
        lang === "gu_IN"
          ? `${studentName} ની માર્કશીટ ${rejection_reason} થી રિજેક્ટ થઈ છે.`
          : `${studentName}, your marksheet has been rejected. Reason: ${rejection_reason}`;

      logger.info(`📱 [${user_id}] Sending rejection notification to student: ${studentName} (UUID: ${marksheet_uuid})`, { user_id });

      await sendNotificationToSingleUser(
        studentDetails.fcm_device_token,
        title,
        message,
        {
          marksheetUuid: marksheet_uuid,
          studentName,
          rejectionReason: rejection_reason,
          type: "marksheet_reject",
        }
      );

      const notificationStored = await storeNotification(
        studentDetails.member_id,
        "marksheet_reject",
        message,
        community_id
      );

      if (!notificationStored) {
        logger.warn(`⚠️ [${user_id}] Failed to store notification for member_id: ${studentDetails.member_id}`, { user_id });
      } else {
        logger.info(`📤 [${user_id}] Rejection notification stored successfully for member_id: ${studentDetails.member_id}`, { user_id });
      }
    } else {
      logger.warn(`⚠️ [${user_id}] No FCM token found for student with UUID: ${marksheet_uuid}`, { user_id });
    }

    logger.info(`✅ [${user_id}] Marksheet rejected successfully for UUID: ${marksheet_uuid}`, { user_id });

    sendResponse(res, 200, true, getMessage("marksheet_rejected", req.lang));
  } catch (error) {
    logger.error(`❌ [${user_id}] Error rejecting marksheet with UUID: ${req.params.marksheet_uuid}`, { user_id, error });
    sendResponse(res, 500, false, getMessage("failed_to_reject_marksheet", req.lang));
  }
};

export const editMarksheet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user } = req as AuthRequest;
  const community_id = user?.community_id;
  const user_id = req.user?.user_id;

  // Ensure user_id is available (authentication required)
  if (!user_id || !community_id) {
    logger.error("No user_id or community_id found in request - authentication required");
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  try {
    const id = req.params.id;

    logger.info(`📥 [${user_id}] Initiating edit for marksheet with ID: ${id}`, { user_id });

    if (!id) {
      logger.warn(`⚠️ [${user_id}] Invalid marksheet ID provided`, { user_id });
      sendResponse(res, 400, false, getMessage("Invalid_marksheet_ID", req.lang));
      return;
    }

    const result = await editMarksheetById(id, req.body, community_id);

    if (result.error) {
      logger.warn(`⚠️ [${user_id}] Failed to edit marksheet`, { user_id, error: result.error });
      if (result.error === "no_valid_fields") {
        sendResponse(res, 400, false, getMessage("no_valid_fields", req.lang));
      } else if (result.error === "marksheet_not_found") {
        sendResponse(res, 404, false, getMessage("marksheet_not_found", req.lang));
      }
      return;
    }

    logger.info(`✅ [${user_id}] Marksheet updated successfully for ID: ${id}`, { user_id });

    sendResponse(res, 200, true, getMessage("marksheet_updated", req.lang), result.data);
  } catch (error) {
    logger.error(`❌ [${user_id}] Error editing marksheet with ID: ${req.params.id}`, { user_id, error });
    sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

export const deleteMarksheet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user } = req as AuthRequest;
  const community_id = user?.community_id;
  const user_id = req.user?.user_id;
  const user_uuid = req.user?.user_uuid;

  // Ensure user_id and user_uuid are available (authentication required)
  if (!user_id || !user_uuid || !community_id) {
    logger.error("No user_id or user_uuid or community_id found in request - authentication required");
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  try {
    const { id } = req.params;

    logger.info(`📥 [${user_id}] Initiating deletion of marksheet with ID: ${id}`, { user_id });

    if (!id || typeof id !== "string" || id.length !== 36) {
      logger.warn(`⚠️ [${user_id}] Invalid marksheet ID provided`, { user_id });
      sendResponse(res, 400, false, getMessage("Invalid_marksheet_ID", req.lang));
      return;
    }

    const userId = await getUserIdByUuid(user_uuid);
    if (!userId) {
      logger.warn(`⚠️ [${user_id}] User not found`, { user_id, user_uuid });
      sendResponse(res, 404, false, getMessage("user_not_found", req.lang));
      return;
    }

    const marksheetOwner = await getMarksheetOwnerId(id);
    if (!marksheetOwner) {
      logger.warn(`⚠️ [${user_id}] Marksheet not found`, { user_id, id });
      sendResponse(res, 404, false, getMessage("marksheet_not_found", req.lang));
      return;
    }

    if (marksheetOwner !== userId) {
      logger.warn(`⚠️ [${user_id}] Access denied: User is not the owner of the marksheet`, { user_id });
      sendResponse(res, 403, false, getMessage("access_denied", req.lang));
      return;
    }

    const result = await deleteMarksheetById(id, community_id);
    if (result.affectedRows === 0) {
      logger.warn(`⚠️ [${user_id}] Marksheet not found for deletion`, { user_id, id });
      sendResponse(res, 404, false, getMessage("marksheet_not_found", req.lang));
      return;
    }

    logger.info(`✅ [${user_id}] Marksheet deleted successfully for ID: ${id}`, { user_id });

    sendResponse(res, 200, true, getMessage("marksheet_deleted", req.lang));
  } catch (error) {
    logger.error(`❌ [${user_id}] Error deleting marksheet with ID: ${req.params.id}`, { user_id, error });
    sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

export const adminCheck = async (req: Request, res: Response) => {
  const user_id = req.user?.user_id;

  // Ensure user_id is available (authentication required)
  if (!user_id) {
    logger.error("No user_id found in request - authentication required");
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  try {
    logger.info(`📥 [${user_id}] Performing admin check`, { user_id });

    logger.info(`✅ [${user_id}] Admin check successful`, { user_id });

    sendResponse(res, 200, true, getMessage("admin_check_success", req.lang));
  } catch (error) {
    logger.error(`❌ [${user_id}] Error during admin check`, { user_id, error });
    sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};