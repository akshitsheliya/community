import { dbPool } from "../config/db";
import { v4 as uuidv4 } from "uuid";

export const storeNotification = async (
  member_id: number,
  notification_type: string,
  notification_message: string,
  community_id: number
): Promise<boolean> => {
  try {
    // Basic validation
    if (!member_id || !community_id) {
      console.error("❌ Invalid data for storing notification:", {
        member_id,
        community_id,
      });
      return false;
    }

    const notification_uuid = uuidv4();

    const query = `
      INSERT INTO tbl_notifications 
        (notification_uuid, member_id, notification_type, notification_message, created_at, notification_is_read, community_id)
      VALUES (?, ?, ?, ?, NOW(), ?, ?)
    `;

    const params = [
      notification_uuid,
      member_id,
      notification_type,
      notification_message,
      0,
      community_id,
    ];

    console.log("📝 Storing notification:", {
      uuid: notification_uuid,
      member_id,
      community_id,
    });

    const [result]: any = await dbPool.execute(query, params);

    if (result && result.affectedRows > 0) {
      console.log("✅ Notification stored:", notification_uuid);
      return true;
    } else {
      console.warn("⚠️ Insert failed, no rows affected for:", notification_uuid);
      return false;
    }
  } catch (error: any) {
    console.error("❌ Error storing notification:", error);
    return false;
  }
};
