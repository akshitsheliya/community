import { Pool } from "mysql2/promise";
import { RowDataPacket } from "mysql2";
import { selectQuery, insertQuery, updateQuery } from "../helpers/queryHelper";

export interface IMemberProfile {
  member_id: number;
  member_uuid: string;
  family_sr_id: number;
  first_name: string;
  father_name: string;
  surname: string;
  gender: string;
  phone_number: string;
  added_on: string;
  profile_photo: string; // Stored as relative path (e.g., profile_photos/${filename})
}

export class TblMemberProfile {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  // Insert a new member profile
  public async createProfile(
    member_uuid: string,
    phone_number: string,
    first_name: string,
    father_name: string,
    surname: string,
    profile_photo: string, // Expects relative path (e.g., profile_photos/${filename})
    gender: string,
    added_on: string
  ): Promise<any> {
    const query = `
      INSERT INTO tbl_member_profile 
      (member_uuid, phone_number, first_name, father_name, surname, profile_photo, gender, added_on) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await insertQuery(this.db, query, [
      member_uuid,
      phone_number,
      first_name,
      father_name,
      surname,
      profile_photo, // Stored as relative path
      gender,
      added_on,
    ]);
    return result;
  }


  // Fetch community-wise admins with FCM tokens for notifications
// public async getCommunityAdminsForNotification(
//   community_id: number,
//   isDemo: number
// ): Promise<any[]> {
//   const query = `
//     SELECT 
//       l.member_id,
//       l.fcm_device_token,
//       l.app_language
//     FROM tbl_logins l
//     INNER JOIN tbl_member_profile mp 
//       ON l.member_id = mp.member_id
//     INNER JOIN tbl_community_member_relation cmr 
//       ON l.member_id = cmr.member_id
//     WHERE mp.is_community_admin = 1
//       AND l.fcm_device_token IS NOT NULL
//       AND cmr.community_id = ?
//       AND cmr.is_login_active = 1
//       AND (mp.is_demo_account = ? OR (mp.is_demo_account IS NULL AND ? = 0));
//   `;

//   return await selectQuery(this.db, query, [community_id, isDemo, isDemo]);
// }

  // Create a new family
  public async createFamily(
    family_uuid: string,
    family_main_member_id: number,
    number_of_family_members: number,
    added_on: string
  ): Promise<any> {
    const query = `
      INSERT INTO tbl_families
      (family_uuid, family_main_member_id, number_of_family_members, added_on)
      VALUES (?, ?, ?, ?)
    `;
    const result = await insertQuery(this.db, query, [
      family_uuid,
      family_main_member_id,
      number_of_family_members,
      added_on,
    ]);
    return result;
  }

  // Update member profile with family_sr_id
  public async updateProfileFamilyId(
    member_uuid: string,
    family_sr_id: number
  ): Promise<any> {
    const query = `
      UPDATE tbl_member_profile 
      SET family_sr_id = ?
      WHERE member_uuid = ?
    `;
    const result = await updateQuery(this.db, query, [
      family_sr_id,
      member_uuid,
    ]);
    return result;
  }

  // Update tbl_logins with member_id
  public async updateLoginMemberId(
    member_id: number,
    phone_number: string
  ): Promise<any> {
    const query = `
      UPDATE tbl_logins 
      SET member_id = ? 
      WHERE phone_number = ?
    `;
    const result = await updateQuery(this.db, query, [
      member_id,
      phone_number,
    ]);
    return result;
  }

  // Fetch the next family_number for tbl_community_member_relation
  public async getNextFamilyNumber(): Promise<number> {
    const query = `
      SELECT MAX(family_number) AS max_family_number 
      FROM tbl_community_member_relation
    `;
    const rows: RowDataPacket[] = await selectQuery(this.db, query);
    return (rows[0]?.max_family_number || 0) + 1;
  }

  // Link member to community
  public async linkMemberToCommunity(
    community_member_relation_id: string,
    community_id: number,
    member_id: number,
    family_sr_id: number,
    family_number: number,
    added_on: string
  ): Promise<any> {
    const query = `
      INSERT INTO tbl_community_member_relation 
      (community_member_relation_id, community_id, member_id, family_sr_id, family_number, added_on, is_approved, is_login_active) 
      VALUES (?, ?, ?, ?, ?, ?, 0, 1)
    `;
    const result = await insertQuery(this.db, query, [
      community_member_relation_id,
      community_id,
      member_id,
      family_sr_id,
      family_number,
      added_on,
    ]);
    return result;
  }

  // Fetch member profile details by member_uuid
  public async getProfileByUuid(
    member_uuid: string
  ): Promise<IMemberProfile | null> {
    const query = `
      SELECT * 
      FROM tbl_member_profile 
      WHERE member_uuid = ?
    `;
    const rows = await selectQuery(this.db, query, [member_uuid]);
    return rows.length > 0 ? (rows[0] as IMemberProfile) : null; // Returns profile_photo as relative path
  }

  // Fetch the last family_sr_id
  public async getLastFamilyNumber(): Promise<number> {
    const query = "SELECT MAX(family_sr_id) AS last_family_number FROM tbl_families";
    const rows: RowDataPacket[] = await selectQuery(this.db, query);
    return rows[0]?.last_family_number || 0;
  }

  public async getMemberByPhone(phone_number: string): Promise<any | null> {
  const query = `
    SELECT mp.member_id, mp.member_uuid
    FROM tbl_member_profile mp
    INNER JOIN tbl_logins l ON mp.member_id = l.member_id
    WHERE l.phone_number = ?
    LIMIT 1
  `;
  const rows = await selectQuery(this.db, query, [phone_number]);
  return rows.length ? rows[0] : null;
}

  public async isMemberInCommunity(
  member_id: number,
  community_id: number
): Promise<boolean> {
  const query = `
    SELECT COUNT(*) AS count
    FROM tbl_community_member_relation
    WHERE member_id = ? AND community_id = ?
  `;
  const rows: RowDataPacket[] = await selectQuery(this.db, query, [
    member_id,
    community_id,
  ]);
  return rows[0].count > 0;
}


  public async checkPhoneNumber(phone_number: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) AS count
      FROM tbl_logins
      WHERE phone_number = ?
    `;
    const rows: RowDataPacket[] = await selectQuery(this.db, query, [phone_number]);
    return rows[0].count > 0;
  }
}

export class UserVerificationModel {
  private db: Pool;

  constructor(dbPool: Pool) {
    this.db = dbPool;
  }

  // Fetch unverified users with all details from tbl_member_profile
  async getUnverifiedUsers(community_id: number): Promise<any> {
    // Ensure community_id is a number
    const communityId = Number(community_id);
    
    if (isNaN(communityId)) {
      throw new Error('Invalid community ID');
    }
  
    // Get total count of unverified users for the logged-in community
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM tbl_member_profile mp
      INNER JOIN tbl_logins l ON mp.member_id = l.member_id
      INNER JOIN tbl_community_member_relation cmr ON mp.member_id = cmr.member_id
      WHERE cmr.is_approved = 0 
        AND cmr.is_login_active = 1
        AND cmr.community_id = ?;
    `;
  
    const countResult = await selectQuery(this.db, countQuery, [communityId]);
    const total = countResult[0].total;
  
    // Get all unverified users for the same community (no pagination)
    const query = `
      SELECT 
        mp.member_id,
        mp.member_uuid,
        mp.*, 
        l.phone_number,
        cmr.family_sr_id,
        cmr.family_number,
        cmr.reject_reason
      FROM tbl_member_profile mp
      INNER JOIN tbl_logins l ON mp.member_id = l.member_id
      INNER JOIN tbl_community_member_relation cmr ON mp.member_id = cmr.member_id
      WHERE cmr.is_approved = 0 
        AND cmr.is_login_active = 1
        AND cmr.community_id = ?;
    `;
  
    const users = await selectQuery(this.db, query, [communityId]);
  
    return {
      data: users,
      total: total,
    };
  }

  // Approve user query
  async approveUser(member_uuid: string, admin_user_id: number, community_id: number) {
    const query = `
      UPDATE tbl_community_member_relation cmr 
      INNER JOIN tbl_member_profile mp 
        ON cmr.member_id = mp.member_id
      SET cmr.is_approved = 1, cmr.verified_by = ?
      WHERE mp.member_uuid = ? AND cmr.community_id = ?
    `;
    return await updateQuery(this.db, query, [admin_user_id, member_uuid, community_id]);
  }

  // Fetch FCM token by member_uuid
  async getFcmTokenByMemberUuid(member_uuid: string) {
    const query = `
    SELECT fcm_device_token, member_id, app_language 
    FROM tbl_logins 
    WHERE member_id = (
      SELECT member_id FROM tbl_member_profile WHERE member_uuid = ?
    )
  `;
    const [rows]: any = await this.db.execute(query, [member_uuid]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Reject user
  async rejectUser(member_uuid: string, reject_reason: string, community_id: number) {
    const query = `
      UPDATE tbl_community_member_relation cmr 
      INNER JOIN tbl_member_profile mp 
        ON cmr.member_id = mp.member_id
      SET cmr.is_approved = 0, 
          cmr.is_login_active = 0, 
          cmr.reject_reason = ?
      WHERE mp.member_uuid = ? 
        AND cmr.community_id = ?
    `;
    return await updateQuery(this.db, query, [reject_reason, member_uuid, community_id]);
  }
}