import { Pool } from "mysql2/promise";
import { selectQuery } from "../helpers/queryHelper";
import moment from "moment";

export class CountModel {
  private db: Pool;

  constructor(dbPool: Pool) {
    this.db = dbPool;
  }

  // Get count of unverified users
  async getUnverifiedUsersCount(community_id: number): Promise<number> {
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM tbl_member_profile mp
      INNER JOIN tbl_logins l ON mp.member_id = l.member_id
      INNER JOIN tbl_community_member_relation cmr ON mp.member_id = cmr.member_id
      WHERE cmr.is_approved = 0 AND cmr.is_login_active = 1 AND cmr.community_id = ?;
    `;
    const countResult = await selectQuery(this.db, countQuery, [community_id]);
    return countResult[0]?.total || 0;
  }

  // Get latest app versions from tbl_app_version
  async getAppVersions(
    community_id: number
  ): Promise<{
    latest_ios_app_version: string | null;
    latest_android_app_version: string | null;
    force_update: number | null;
  }> {
    const id = community_id === 1 ? 1 : 2;

    const query = `
    SELECT latest_ios_app_version, latest_android_app_version, force_update
    FROM tbl_app_version
    WHERE id = ?
    LIMIT 1;
  `;

    const rows = await selectQuery(this.db, query, [id]);

    return rows.length > 0
      ? {
        latest_ios_app_version: rows[0].latest_ios_app_version,
        latest_android_app_version: rows[0].latest_android_app_version,
        force_update: rows[0].force_update,
      }
      : {
        latest_ios_app_version: null,
        latest_android_app_version: null,
        force_update: null,
      };
  }

  // Get count of unapproved marksheets from tbl_marksheets
  async getUnapprovedMarksheetsCount(community_id: number): Promise<number> {
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM tbl_marksheets 
      WHERE (approved_by_user_id IS NULL OR approved_by_user_id = 0) AND community_id = ?;
    `;
    const countResult = await selectQuery(this.db, countQuery, [community_id]);
    return countResult[0]?.total || 0;
  }

  // get community description from tbl_community
  async getCommunityDescription(community_id: number): Promise<string | null> {
    const query = `
    SELECT community_description 
    FROM tbl_community 
    WHERE community_id = ?
    LIMIT 1;
  `;
    const result = await selectQuery(this.db, query, [community_id]);
    return result[0]?.community_description || null;
  }
  // Get active marksheet configurations from tbl_marksheet_configuration with formatted date
  async getActiveMarksheetConfigs(): Promise<
    { year: string; standards: string; lastDate: string | null }[]
  > {
    const configQuery = `
      SELECT marksheet_year, marksheet_std, marksheet_last_date_to_submit as last_date
      FROM tbl_marksheet_configuration
      WHERE is_active = 1;
    `;
    const configResult = await selectQuery(this.db, configQuery);

    return configResult.map((row: any) => ({
      year: row.marksheet_year,
      standards: row.marksheet_std,
      lastDate: row.last_date
        ? moment(row.last_date).format("YYYY-MM-DD")
        : null,
    }));
  }

  // Get member_id from user_id
  async getMemberId(userId: number): Promise<number | null> {
    const query = `SELECT member_id FROM tbl_logins WHERE user_id = ? LIMIT 1;`;
    const [rows]: any = await this.db.execute(query, [userId]);
    return rows.length > 0 ? rows[0].member_id : null;
  }

  // Get family details using member_id
  async getFamilyData(
    memberId: number
  ): Promise<{
    family_sr_id: number;
    number_of_family_members: number;
  } | null> {
    const query = `
      SELECT f.family_sr_id, f.number_of_family_members 
      FROM tbl_families f
      JOIN tbl_member_profile mp ON f.family_sr_id = mp.family_sr_id
      WHERE mp.member_id = ? 
      LIMIT 1;
    `;
    const [rows]: any = await this.db.execute(query, [memberId]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Get count of registered family members
  async getRegisteredFamilyCount(familySrId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) AS registeredCount 
      FROM tbl_member_profile 
      WHERE family_sr_id = ?;
    `;
    const [rows]: any = await this.db.execute(query, [familySrId]);
    return rows.length > 0 ? rows[0].registeredCount : 0;
  }

  // Get count of unread notifications for a member
  async getUnreadNotificationsCount(memberId: number): Promise<number> {
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM tbl_notifications 
      WHERE member_id = ? AND notification_is_read = 0;
    `;
    const [rows]: any = await this.db.execute(countQuery, [memberId]);
    return rows.length > 0 ? rows[0].total : 0;
  }

  // Get last feed_read_date_time for a user
  async getUserFeedDateTime(userUuid: string): Promise<string | null> {
    const query = `
    SELECT feed_read_date_time
    FROM tbl_logins
    WHERE user_uuid = ?
    LIMIT 1
  `;

    const rows = await selectQuery(this.db, query, [userUuid]);

    if (!rows.length || !rows[0].feed_read_date_time) {
      return null;
    }

    return rows[0].feed_read_date_time;
  }


  // Check if there is any new news created after a specific time
  async unreadnotice(
    since: string,
    community_id: number
  ): Promise<boolean> {
    const query = `
    SELECT COUNT(*) AS count
    FROM tbl_feeds
    WHERE added_on > ?
      AND community_id = ?
  `;

    const rows = await selectQuery(this.db, query, [since, community_id]);

    return rows.length > 0 && Number(rows[0].count) > 0;
  }

}