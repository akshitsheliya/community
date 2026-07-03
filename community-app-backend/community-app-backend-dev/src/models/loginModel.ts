import { Pool } from "mysql2/promise";
import moment from "moment";
import {
  selectQuery,
  insertQuery,
  deleteQuery,
  updateQuery,
} from "../helpers/queryHelper";

export interface ILogin {
  user_id?: number;
  member_id?: number;
  user_uuid?: string;
  phone_number: string;
  otp?: string;
  is_approved?: number;
  is_login_active?: number;
  verified_by?: number;
  added_on?: string;
  updated_on?: string;
  last_login_date?: string;
}

export class TblLogins {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  // Get user by phone number
  public async getUserByPhoneNumber(phone_number: string): Promise<ILogin[]> {
    const query =
      "SELECT member_id, user_id, user_uuid FROM tbl_logins WHERE phone_number = ?";
    const rows = await selectQuery(this.db, query, [phone_number]);
    return rows as ILogin[];
  }

  // public async isPhonenumberInMemberProfile(
  //   phone_number: string
  // ): Promise<boolean> {
  //   const query = `SELECT member_id FROM tbl_member_profile WHERE phone_number = ? LIMIT 1`;
  //   const result = await selectQuery(this.db, query, [phone_number]);
  //   return result.length > 0;
  // }

  public async isPhonenumberInMemberProfile(
    phone_number: string,
    community_uuid: string
  ): Promise<boolean> {
    const query = `SELECT tmp.member_id FROM tbl_member_profile tmp INNER JOIN tbl_community_member_relation tcmr ON tmp.member_id = tcmr.member_id INNER JOIN tbl_community tc ON tcmr.community_id = tc.community_id WHERE tmp.phone_number = '${phone_number}' AND tc.community_uuid = '${community_uuid}' LIMIT 1`;
    // console.log("isPhonenumberInMemberProfile Query: ", query);
    const result = await selectQuery(this.db, query, [phone_number, community_uuid]);
    // console.log("isPhonenumberInMemberProfile Result: ", result);
    return result.length > 0;
  }

  public async isValidCommunity(community_uuid: string): Promise<boolean> {
    const query = `SELECT community_id FROM tbl_community WHERE community_uuid = ? LIMIT 1`;
    const result = await selectQuery(this.db, query, [community_uuid]);
    return result.length > 0;
  }

  public async isPhonenumberInCommunity(
    phone_number: string
  ): Promise<boolean> {
    const query = `SELECT * FROM tbl_member_profile LEFT JOIN `;
    const result = await selectQuery(this.db, query, [phone_number]);
    return result.length > 0;
  }

  // Update OTP and added_on for a given phone number
  public async updateOTP(
    phone_number: string,
    otp: string,
    batchid?: string | null,
    msgid?: string | null
  ): Promise<number> {
    const query =
      "UPDATE tbl_logins SET otp = ?, batchid = ?, msgid = ?, added_on = ? WHERE phone_number = ?";
    await updateQuery(this.db, query, [
      otp,
      batchid ?? null,
      msgid ?? null,
      moment().format(),
      phone_number,
    ]);
    const selectQueryStr =
      "SELECT user_id FROM tbl_logins WHERE phone_number = ?";
    const rows = await selectQuery(this.db, selectQueryStr, [phone_number]);
    if (rows.length === 0) {
      throw new Error(`No user found for phone_number: ${phone_number}`);
    }
    return (rows as ILogin[])[0].user_id!;
  }

  // Insert a new user
  public async insertNewUser(
    user_uuid: string,
    phone_number: string,
    otp: string
  ): Promise<number> {
    const query =
      "INSERT INTO tbl_logins (user_uuid, phone_number, otp, added_on) VALUES (?, ?, ?, ?)";
    const result = await insertQuery(this.db, query, [
      user_uuid,
      phone_number,
      otp,
      moment().format(),
    ]);
    return result.insertId;
  }

  // Get user by phone number and OTP
  public async getUserByPhoneNumberAndOTP(
    phone_number: string,
    otp: string
  ): Promise<ILogin[]> {
    const query = `
      SELECT l.*, cmr.is_login_active, cmr.is_approved, cmr.verified_by 
      FROM tbl_logins l 
      LEFT JOIN tbl_community_member_relation cmr ON l.member_id = cmr.member_id 
      WHERE l.phone_number = ? AND l.otp = ?`;
    const rows = await selectQuery(this.db, query, [phone_number, otp]);
    return rows as ILogin[];
  }

  // Update OTP and updated_on for login
  public async updateOTPLogin(
    phone_number: string,
    otp: string,
    batchid?: string | null,
    msgid?: string | null
  ): Promise<number> {
    const query =
      "UPDATE tbl_logins SET otp = ?, batchid = ?, msgid = ?, updated_on = ? WHERE phone_number = ?";
    await updateQuery(this.db, query, [
      otp,
      batchid ?? null,
      msgid ?? null,
      moment().format(),
      phone_number,
    ]);
    const selectQueryStr =
      "SELECT user_id FROM tbl_logins WHERE phone_number = ?";
    const rows = await selectQuery(this.db, selectQueryStr, [phone_number]);
    if (rows.length === 0) {
      throw new Error(`No user found for phone_number: ${phone_number}`);
    }
    return (rows as ILogin[])[0].user_id!;
  }

  // Get user by phone number for login
  public async getUserByPhoneNumberForLogin(
    phone_number: string
  ): Promise<ILogin[]> {
    const query = `
      SELECT l.*, cmr.is_login_active, cmr.is_approved, cmr.verified_by 
      FROM tbl_logins l 
      LEFT JOIN tbl_community_member_relation cmr ON l.member_id = cmr.member_id 
      WHERE l.phone_number = ?`;
    const rows = await selectQuery(this.db, query, [phone_number]);
    return rows as ILogin[];
  }

  // Update last login timestamp
  public async updateLastLogin(phone_number: string): Promise<void> {
    const query =
      "UPDATE tbl_logins SET last_login_date = ? WHERE phone_number = ?";
    await updateQuery(this.db, query, [moment().format(), phone_number]);
  }

  public async updateAppVersion(
    phone_number: string,
    appVersionCode: string,
    buildNumber: string
  ): Promise<void> {
    const appVersionFormat = `${appVersionCode}(${buildNumber})`;
    const query =
      "UPDATE tbl_logins SET app_version = ? WHERE phone_number = ?";
    await updateQuery(this.db, query, [appVersionFormat, phone_number]);
  }

  public async getCommunityUuid(
    community_uuid: string
  ): Promise<string | null> {
    const query =
      "SELECT community_uuid FROM tbl_community WHERE community_uuid = ?";
    const result = await selectQuery(this.db, query, [community_uuid]);
    return result.length > 0 ? result[0].community_uuid : null;
  }

  public async getCommunityIdByUuid(
    community_uuid: string
  ): Promise<number | null> {
    const query =
      "SELECT community_id FROM tbl_community WHERE community_uuid = ?";
    const result = await selectQuery(this.db, query, [community_uuid]);
    return result.length > 0 ? result[0].community_id : null;
  }

  // ----------------------------
  // ✅ NEW LOGIC STARTS HERE
  // ----------------------------
  public async getMemberDetailsByUserId(user_id: number): Promise<any | null> {
    const query = `
      SELECT member_id 
      FROM tbl_logins 
      WHERE user_id = ?
    `;
    const result = await selectQuery(this.db, query, [user_id]);
    return result.length > 0 ? result[0] : null;
  }

  public async getFamilyByMemberId(member_id: number): Promise<any | null> {
  const query = `
    SELECT family_sr_id 
    FROM tbl_member_profile 
    WHERE member_id = ?
  `;
  const result = await selectQuery(this.db, query, [member_id]);
  return result.length > 0 ? result[0] : null;
  }

  public async checkCommunityMemberRelation(member_id: number, community_id: number): Promise<boolean> {
  const query = `
    SELECT 1 
    FROM tbl_community_member_relation 
    WHERE member_id = ? AND community_id = ? 
    LIMIT 1
  `;
  const result = await selectQuery(this.db, query, [member_id, community_id]);
  return result.length > 0;
  }

  // ✅ BULLETPROOF METHOD - Count exact relations
  public async countCommunityMemberRelations(member_id: number, community_id: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM tbl_community_member_relation 
      WHERE member_id = ? AND community_id = ?
    `;
    const result = await selectQuery(this.db, query, [member_id, community_id]);
    return result.length > 0 ? Number(result[0].count) : 0;
  }

  // ✅ BULLETPROOF METHOD - Insert only if not exists
  public async insertCommunityMemberRelationSafe(data: {
    community_member_relation_id: string;
    community_id: number;
    member_id: number;
    family_sr_id?: number | null;
    is_login_active?: number;
    is_approved?: number;
  }): Promise<{ success: boolean; message: string; alreadyExists: boolean }> {
    
    // Final check before insert
    const existingCount = await this.countCommunityMemberRelations(data.member_id, data.community_id);
    
    if (existingCount > 0) {
      return {
        success: false,
        message: "User already registered in this community",
        alreadyExists: true
      };
    }

    // Proceed with insert only if count is 0
    const getMaxQuery = `SELECT family_number FROM tbl_community_member_relation ORDER BY family_number DESC LIMIT 1`;
    const [row] = await selectQuery(this.db, getMaxQuery, []);
    const nextFamilyNumber = Number(row?.family_number ?? 0) + 1;

    const query = `
      INSERT INTO tbl_community_member_relation 
        (community_member_relation_id, community_id, member_id, family_sr_id, is_login_active, is_approved, family_number)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.community_member_relation_id,
      data.community_id,
      data.member_id,
      data.family_sr_id ?? null,
      data.is_login_active ?? 1,
      data.is_approved ?? 0,
      nextFamilyNumber,
    ];

    await insertQuery(this.db, query, params);
    
    return {
      success: true,
      message: "Community member relation created successfully",
      alreadyExists: false
    };
  }

  public async insertCommunityMemberRelation(data: {
  community_member_relation_id: string;
  community_id: number;
  member_id: number;
  family_sr_id?: number | null;
  is_login_active?: number;
  is_approved?: number;
}): Promise<void> {

  const getMaxQuery = `SELECT family_number FROM tbl_community_member_relation ORDER BY family_number DESC LIMIT 1`;
    const [row] = await selectQuery(this.db, getMaxQuery, [data.family_sr_id]);
    const nextFamilyNumber = Number(row?.family_number ?? 0) + 1;

  const query = `
    INSERT INTO tbl_community_member_relation 
      (community_member_relation_id, community_id, member_id, family_sr_id, is_login_active, is_approved, family_number)
    VALUES (?, ?, ?, ?, ?, ?,?)
  `;

  const params = [
    data.community_member_relation_id,
    data.community_id,
    data.member_id,
    data.family_sr_id ?? null,
    data.is_login_active ?? 1,
    data.is_approved ?? 0,
    nextFamilyNumber,
  ];

  await insertQuery(this.db, query, params);
  }
  
  public async insertFamilies(p0: {
    family_uuid: string;
    family_main_member_id: number;
    number_of_family_members: number;
  }): Promise<number> {
    const query = `
      INSERT INTO tbl_families 
        (family_uuid, family_main_member_id, number_of_family_members, added_on, updated_on)
      VALUES (?, ?, ?, NOW(), NOW())
    `;

    const params = [
      p0.family_uuid,
      p0.family_main_member_id,
      p0.number_of_family_members,
    ];

    const result = await insertQuery(this.db, query, params);
    // return result.affectedRows > 0;
    return Number(result.insertId??0);
  }


  // ----------------------------
  // ✅ NEW LOGIC ENDS HERE
  // ----------------------------

  public async getCommunityIdsByMemberId(member_id: number): Promise<number[]> {
    const query = `
      SELECT cmr.community_id 
      FROM tbl_community_member_relation cmr
      WHERE cmr.member_id = ?
    `;
    const result = await selectQuery(this.db, query, [member_id]);
    return result.map((row: any) => row.community_id);
  }


  public async createCommunityRelation(
  member_id: number,
  community_id: number,
  user_id: number
) {

  //Get family_sr_id from member_profile
  const familyQuery = `
    SELECT family_sr_id
    FROM tbl_member_profile
    WHERE member_id = ?
    LIMIT 1
  `;

  const [family]: any = await this.db.query(familyQuery, [member_id]);

  if (!family.length) {
    throw new Error("Member profile not found");
  }

  let family_sr_id = family[0].family_sr_id;


  // If NULL → get from old community relation
  if (!family_sr_id) {

    const oldFamilyQuery = `
      SELECT family_sr_id
      FROM tbl_community_member_relation
      WHERE member_id = ?
      AND family_sr_id IS NOT NULL
      LIMIT 1
    `;

    const [oldFamily]: any = await this.db.query(oldFamilyQuery, [member_id]);

    if (oldFamily.length) {
      family_sr_id = oldFamily[0].family_sr_id;
    }
  }

  // safety check
  if (!family_sr_id) {
    throw new Error("family_sr_id not found for member");
  }


  //Check relation already exists
  const checkQuery = `
    SELECT community_member_relation_id
    FROM tbl_community_member_relation
    WHERE community_id = ?
    AND member_id = ?
    LIMIT 1
  `;

  const [exists]: any = await this.db.query(checkQuery, [
    community_id,
    member_id
  ]);

  if (exists.length) {
    return "already_exists";
  }


  // Get next family_number (community wise increase)
  const familyNumberQuery = `
    SELECT IFNULL(MAX(family_number),0) + 1 AS next_family_number
    FROM tbl_community_member_relation
    WHERE community_id = ?
  `;

  const [familyNumber]: any = await this.db.query(familyNumberQuery, [
    community_id
  ]);

  const nextFamilyNumber = familyNumber[0].next_family_number;


  // Insert relation
  const insertQuery = `
    INSERT INTO tbl_community_member_relation
    (
      community_member_relation_id,
      community_id,
      member_id,
      family_sr_id,
      family_number,
      is_login_active,
      is_approved
    )
    VALUES
    (
      UUID(),
      ?, ?, ?, ?, 1, 0
    )
  `;

  await this.db.query(insertQuery, [
    community_id,
    member_id,
    family_sr_id,
    nextFamilyNumber
  ]);

  return "created";
}
  // Get community UUID from community_id
  public async getCommunityUUIDById(
    community_id: number
  ): Promise<string | null> {
    const query =
      "SELECT community_uuid FROM tbl_community WHERE community_id = ?";
    const result = await selectQuery(this.db, query, [community_id]);
    return result.length > 0 ? result[0].community_uuid : null;
  }
}
