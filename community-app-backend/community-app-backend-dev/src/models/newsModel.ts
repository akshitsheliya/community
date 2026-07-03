import { Pool } from "mysql2/promise";
import {
  selectQuery,
  insertQuery,
  deleteQuery,
  updateQuery,
} from "../helpers/queryHelper";

export interface INews {
  feed_id?: number; // Auto-increment
  feed_uuid?: string; // Auto-generated UUID
  channel_id?: number; // Make channel_id optional
  feed_title: string;
  feed_description?: string;
  feed_type: "news" | "maran_nondh" | "event" | "meeting";
  feed_photo_video?: string | null | undefined;
  event_date_time?: string;
  event_address?: string;
  event_latitude?: number;
  event_longitude?: number;
  added_on?: string;
  updated_on?: string;
  community_id?: number;
  added_by?: number;
}

export class TblFeeds {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  public async getAllNews(community_id: number): Promise<INews[]> {
    const query = `
    SELECT * FROM tbl_feeds
    WHERE community_id = ?
    ORDER BY added_on DESC
  `;
    const rows = await selectQuery(this.db, query, [community_id]);
    return rows as INews[];
  }

  public async getNewsCount(community_id: number): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM tbl_feeds WHERE community_id = ?`;
    const rows = await selectQuery(this.db, query, [community_id]);
    return rows[0].count;
  }

  // Fetch a single news by UUID
  public async getNewsByUuid(newsUuid: string): Promise<INews | null> {
    const query = `SELECT * FROM tbl_feeds WHERE feed_uuid = ?;`;
    const rows = await selectQuery(this.db, query, [newsUuid]);
    return rows.length > 0 ? (rows[0] as INews) : null;
  }

  // Create a new news entry
  public async createNews(newsData: INews): Promise<number> {
    const query = `
    INSERT INTO tbl_feeds (
      feed_uuid, channel_id, feed_title, feed_description, feed_type, 
     event_date_time, event_address, event_latitude, 
      event_longitude, feed_photo_video, added_on, updated_on, community_id, added_by

    ) 
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?);
  `;
    const result = await insertQuery(this.db, query, [
      newsData.channel_id,
      newsData.feed_title,
      newsData.feed_description || null,
      newsData.feed_type,
      newsData.event_date_time || null,
      newsData.event_address || null,
      newsData.event_latitude || null,
      newsData.event_longitude || null,
      newsData.feed_photo_video, // Pass buffer directly
      newsData.community_id || null,
      newsData.added_by || null,
    ]);

    return result.insertId;
  }

  public async getAllUsersForNotification(community_id: number): Promise<any[]> {
    const query = `
      SELECT 
        l.member_id, 
        l.fcm_device_token, 
        l.app_language
      FROM 
        tbl_logins l
      INNER JOIN 
        tbl_community_member_relation cmr 
        ON l.member_id = cmr.member_id
      WHERE 
        l.fcm_device_token IS NOT NULL 
        AND l.fcm_device_token != ''
        AND cmr.community_id = ?
    `;
    return await selectQuery(this.db, query, [community_id]);
  }
  

  // Delete a news entry by UUID
  public async deleteNews(newsUuid: string, community_id: number): Promise<boolean> {
    const query = `DELETE FROM tbl_feeds WHERE feed_uuid = ? AND community_id = ?;`;
    const result = await deleteQuery(this.db, query, [newsUuid, community_id]);
    return result.affectedRows > 0;
  }

  // 1. Get last feed_read_date_time for a user
  public async getUserFeedDateTime(userUuid: string): Promise<string | null> {
    const query = `SELECT feed_read_date_time FROM tbl_logins WHERE user_uuid = ?`;
    const rows = await selectQuery(this.db, query, [userUuid]);
    return rows.length > 0 ? rows[0].feed_read_date_time : null;
  }

  // 2. Check if there is any news created after that time
  public async unreadnotice(since: string): Promise<boolean> {
    const query = `SELECT COUNT(*) as count FROM tbl_feeds WHERE added_on > ?`;
    const rows = await selectQuery(this.db, query, [since]);
    return rows[0].count > 0;
  }

  // 3. Update feed_read_date_time for the user
  public async updateFeedDateTime(userUuid: string): Promise<void> {
    const query = `UPDATE tbl_logins SET feed_read_date_time = NOW() WHERE user_uuid = ?`;
    await updateQuery(this.db, query, [userUuid]);
  }

  // Update a news entry by UUID
  public async updateNews(
    newsUuid: string,
    newsData: Partial<INews>,
    community_id: number
  ): Promise<boolean> {
    const fields = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(newsData)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    // Add updated_on timestamp
    fields.push(`updated_on = NOW()`);

    values.push(newsUuid, community_id); 

    const query = `UPDATE tbl_feeds SET ${fields.join(
      ", "
    )} WHERE feed_uuid = ? AND community_id = ?;`;

    const result = await updateQuery(this.db, query, values);
    return result.affectedRows > 0;
  }
}
