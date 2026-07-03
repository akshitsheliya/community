import admin from "../../config/firebaseConfig";
import logger from "../../utils/logger";
import { dbPool } from "../../config/db"; 

/**
 * Send push notification to a single user (using multicast with one token).
 * @param {string} fcmToken - FCM device token.
 * @param {string} title - Notification title.
 * @param {string} body - Notification body.
 * @param {object} data - Additional data payload.
 */
export const sendNotificationToSingleUser = async (
  fcmToken: string,
  title: string,
  body: string,
  data: { [key: string]: string } = {}
) => {
  try {
    logger.info("Preparing to send notification to a single user", { fcmToken, title, body, data });

    let badgeCount = 1;

    // Dynamically fetch unread notification count if member_id is present
    if (data.member_id) {
      const [rows]: any = await dbPool.execute(
        `SELECT COUNT(*) AS unread FROM tbl_notifications WHERE member_id = ? AND notification_is_read = 0`,
        [data.member_id]
      );
      badgeCount = rows[0]?.unread || 1;
      logger.info("Calculated dynamic badge count", { member_id: data.member_id, badgeCount });
    }

    const message: admin.messaging.MulticastMessage = {
      tokens: [fcmToken],
      notification: {
        title,
        body,
      },
      data,
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: badgeCount,
          },
        },
      },
      android: {
        notification: {
          sound: "default",
        },
      },
    };

    logger.info("Constructed message for single user", { message });

    const response = await admin.messaging().sendEachForMulticast(message);
    logger.info("Notification sent successfully to a single user", { fcmToken, response });

    return { success: true, response };
  } catch (error) {
    logger.error("Error sending notification to a single user", { fcmToken, error });
    return { success: false, error };
  }
};


/**
 * Send push notification to multiple users.
 * @param {string[]} tokens - Array of FCM device tokens.
 * @param {string} title - Notification title.
 * @param {string} body - Notification body.
 * @param {object} data - Additional data payload.
 */
export const sendNotificationToMultipleUser = async (
  tokens: string[],
  title: string,
  body: string,
  data: { [key: string]: string } = {}
) => {
  try {
    logger.info("Preparing to send notification to multiple users", { tokens, title, body, data });

    const badgeCounts: { [key: string]: number } = {}; // Store badge counts for each member

    // Dynamically calculate badge count for each user
    for (let token of tokens) {
      const memberId = data.member_id; // Assuming member_id is passed in the data for each user

      if (memberId) {
        const [rows]: any = await dbPool.execute(
          `SELECT COUNT(*) AS unread FROM tbl_notifications WHERE member_id = ? AND notification_is_read = 0`,
          [memberId]
        );
        const unreadCount = rows[0]?.unread || 1; // Default to 1 if no unread notifications
        badgeCounts[memberId] = unreadCount; // Store the unread count for the user
        logger.info("Calculated dynamic badge count for member", { memberId, unreadCount });
      }
    }

    // Construct the message for multiple users
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        badgeCounts: JSON.stringify(badgeCounts), // Send badge count data in payload for Android handling
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: Object.values(badgeCounts)[0] || 1, // Default badge for iOS (first member's unread count)
          },
        },
      },
      android: {
        notification: {
          sound: "default",
        },
      },
    };

    logger.info("Constructed message for multiple users", { message });

    const response = await admin.messaging().sendEachForMulticast(message);
    logger.info("Notification sent successfully to multiple users", { tokens, response });

    return { success: true, response };
  } catch (error) {
    logger.error("Error sending notification to multiple users", { tokens, error });
    return { success: false, error };
  }
};
