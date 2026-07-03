import { Request, Response } from "express";
import { dbPool } from "../../config/db";
import { sendResponse } from "../../helpers/responseHelper";
import { sendNotificationToSingleUser, sendNotificationToMultipleUser } from "../helpers/notificationHelper";
import logger from "../../utils/logger";

export const submitToken = async (req: Request, res: Response) => {
  const user_id = req.user?.user_id;
  const user_uuid = req.user?.user_uuid;

  if (!user_id || !user_uuid) {
    logger.error("No user_id or user_uuid found in request - authentication required");
    return sendResponse(res, 401, false, "Unauthorized");
  }
  try {
    const { fcmToken, device_type, app_version, build_number } = req.body;

    const formatted_app_version = `${app_version}(${build_number})`;

    logger.info(`📥 [${user_id}] Submit Token API called`, {
      user_id,
      user_uuid,
      fcmToken,
      device_type,
      app_version,
      build_number,
      formatted_app_version: formatted_app_version,
    });

    if (!fcmToken || !device_type || !app_version || !build_number) {
      logger.warn(`⚠️ [${user_id}] Missing required fields for submitToken`, {
        user_id,
        fcmToken,
        device_type,
        app_version,
        build_number,
      });
      return sendResponse(res, 400, false, "Missing required fields");
    }

    const query = `
      UPDATE tbl_logins 
      SET fcm_device_token = ?, device_type = ?, app_version = ? 
      WHERE user_uuid = ?;
    `;

    const queryParams = [fcmToken, device_type, app_version, user_uuid];

    logger.info(`📤 [${user_id}] Executing query to update FCM token and app version`, {
      user_id,
      query,
      queryParams,
    });

    const [result]: any = await dbPool.execute(query, queryParams);

    if (result.affectedRows > 0) {
      logger.info(`✅ [${user_id}] FCM token and app version updated successfully`, {
        user_id,
        user_uuid,
        fcmToken,
        device_type,
        app_version,
      });
      return sendResponse(res, 200, true, "FCM token and app version updated successfully");
    } else {
      logger.warn(`⚠️ [${user_id}] Failed to update FCM token and app version`, {
        user_id,
        user_uuid,
        fcmToken,
        device_type,
        app_version,
      });
      return sendResponse(res, 500, false, "Failed to update FCM token and app version");
    }
  } catch (error) {
    logger.error(`❌ [${user_id}] Error updating FCM token and app version`, {
      user_id,
      error,
    });
    return sendResponse(res, 500, false, "Internal Server Error");
  }
};



export const notifyUser = async (req: Request, res: Response) => {
  const user_id = req.user?.user_id;

  // Ensure user_id is available (authentication required)
  if (!user_id) {
    logger.error("No user_id found in request - authentication required");
    return sendResponse(res, 401, false, "Unauthorized");
  }

  try {
    const { user_uuid, title, body } = req.body;

    logger.info(`📥 [${user_id}] Notify User API called`, { user_id, user_uuid, title, body });

    if (!user_uuid || !title || !body) {
      logger.warn(`⚠️ [${user_id}] Missing required fields for notifyUser`, { user_id, user_uuid, title, body });
      return sendResponse(res, 400, false, "Missing required fields");
    }

    let tokens: string[] = [];

    // If user_uuid is an array, fetch tokens for all provided IDs.
    if (Array.isArray(user_uuid)) {
      const placeholders = user_uuid.map(() => '?').join(',');
      const query = `SELECT fcm_device_token FROM tbl_logins WHERE user_uuid IN (${placeholders})`;

      logger.info(`📤 [${user_id}] Fetching FCM tokens for multiple users`, { user_id, query, user_uuid });

      const [rows]: any = await dbPool.execute(query, user_uuid);
      tokens = rows.map((row: any) => row.fcm_device_token).filter((t: string) => !!t);

      logger.info(`📤 [${user_id}] Fetched FCM tokens for multiple users`, { user_id, tokens });
    } else {
      const query = `SELECT fcm_device_token FROM tbl_logins WHERE user_uuid = ?`;

      logger.info(`📤 [${user_id}] Fetching FCM token for single user`, { user_id, query, user_uuid });

      const [rows]: any = await dbPool.execute(query, [user_uuid]);
      if (rows.length > 0 && rows[0].fcm_device_token) {
        tokens.push(rows[0].fcm_device_token);
      }

      logger.info(`📤 [${user_id}] Fetched FCM token for single user`, { user_id, tokens });
    }

    if (tokens.length === 0) {
      logger.warn(`⚠️ [${user_id}] No FCM tokens found for the provided user_uuid(s)`, { user_id, user_uuid });
      return sendResponse(res, 404, false, "No FCM token(s) found for the provided user_uuid(s)");
    }

    // Use multicast API even for a single token.
    let result;
    if (tokens.length === 1) {
      logger.info(`📱 [${user_id}] Sending notification to a single user`, { user_id, token: tokens[0], title, body });
      result = await sendNotificationToSingleUser(
        tokens[0],
        title,
        body,
        { type: "custom_notification" }
      );
    } else {
      logger.info(`📱 [${user_id}] Sending notification to multiple users`, { user_id, tokens, title, body });
      result = await sendNotificationToMultipleUser(
        tokens,
        title,
        body,
        { type: "custom_notification" }
      );
    }

    if (!result.success) {
      logger.error(`❌ [${user_id}] Failed to send notification`, { user_id, result });
      return sendResponse(res, 500, false, "Failed to send notification", result.error);
    }

    logger.info(`✅ [${user_id}] Notification sent successfully`, { user_id, result });
    return sendResponse(res, 200, true, "Notification sent successfully", result.response);
  } catch (error) {
    logger.error(`❌ [${user_id}] Error sending notification`, { user_id, error });
    return sendResponse(res, 500, false, "Internal Server Error");
  }
};






// import { Request, Response } from "express";
// import { dbPool } from "../../config/db";
// import { sendResponse } from "../../helpers/responseHelper";
// import { sendNotificationToSingleUser } from "../helpers/notificationHelper"; 


// // API to store FCM device token for the logged-in user.
// export const submitToken = async (req: Request, res: Response) => {
//   try {
//     const userUuid = req.user?.user_uuid;
//     const { token, device_type } = req.body;

//     if (!userUuid || !token || !device_type) {
//       return sendResponse(res, 400, false, "Missing required fields");
//     }

//     const query = `
//       UPDATE tbl_logins 
//       SET fcm_device_token = ?, device_type = ? 
//       WHERE user_uuid = ?;
//     `;
    
//     const [result]: any = await dbPool.execute(query, [token, device_type, userUuid]);

//     if (result.affectedRows > 0) {
//       return sendResponse(res, 200, true, "FCM token updated successfully");
//     } else {
//       return sendResponse(res, 500, false, "Failed to update FCM token");
//     }
//   } catch (error) {
//     console.error("Error updating FCM token:", error);
//     return sendResponse(res, 500, false, "Internal Server Error");
//   }
// };


// // API to send a push notification to a single user.
// export const notifyUser = async (req: Request, res: Response) => {
//   try {
//     const { user_uuid, title, body } = req.body;

//     if (!user_uuid || !title || !body) {
//       return sendResponse(res, 400, false, "Missing required fields");
//     }

//     // Fetch the FCM token of the user
//     const query = `SELECT fcm_device_token FROM tbl_logins WHERE user_uuid = ?`;
//     const [rows]: any = await dbPool.execute(query, [user_uuid]);

//     if (rows.length === 0 || !rows[0].fcm_device_token) {
//       return sendResponse(res, 404, false, "FCM token not found for the user");
//     }

//     const fcmToken = rows[0].fcm_device_token;

//     // Send push notification
//     const notificationPayload = {
//       title,
//       body,
//       data: { type: "custom_notification" }
//     };

//     await sendNotificationToSingleUser(fcmToken, title, body, { type: "custom_notification" });

//     return sendResponse(res, 200, true, "Notification sent successfully");
//   } catch (error) {
//     console.error("Error sending notification:", error);
//     return sendResponse(res, 500, false, "Internal Server Error");
//   }
// };
