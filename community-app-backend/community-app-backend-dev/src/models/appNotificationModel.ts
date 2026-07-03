import { Pool } from "mysql2/promise";
import { selectQuery } from "../helpers/queryHelper";

export class appNotificationModel {
    private db: Pool;
  
    constructor(dbPool: Pool) {
      this.db = dbPool;
    }
  
    // Get member_id using user_uuid
    async getMemberIdByUserUuid(userUuid: string) {
      const query = "SELECT member_id FROM tbl_logins WHERE user_uuid = ?";
      const [rows]: any = await this.db.execute(query, [userUuid]);
      return rows.length > 0 ? rows[0] : null;
    }
  
    // Fetch notifications using member_id
    async getAppNotifications(memberId: number, community_id: number) {
      const query = "SELECT * FROM tbl_notifications WHERE member_id = ? AND community_id = ? ORDER BY created_at DESC";
      const [rows]: any = await this.db.execute(query, [memberId, community_id]);
      return rows;
    }
  

    // ✅ Update notification status as read
    async updateNotificationAsRead(notification_uuid: string, member_id: number, community_id: number): Promise<boolean> {
      const query = `
        UPDATE tbl_notifications 
        SET notification_is_read = 1 
        WHERE notification_uuid = ? AND member_id = ? AND community_id = ?
      `;
  
      const [result]: any = await this.db.execute(query, [notification_uuid, member_id, community_id]);
      
      return result.affectedRows > 0;
    }

    async updateAllNotificationsAsRead(member_id: number): Promise<boolean> {
      const query = `
        UPDATE tbl_notifications 
        SET notification_is_read = 1 
        WHERE member_id = ?
      `;
      const [result]: any = await this.db.execute(query, [member_id]);
      return result.affectedRows > 0;
    }
}