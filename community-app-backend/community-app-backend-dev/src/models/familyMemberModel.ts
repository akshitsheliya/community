import { Pool } from "mysql2/promise";
import { selectQuery, insertQuery, updateQuery } from "../helpers/queryHelper";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";

export class MemberProfileModel {
  private db: Pool;

  constructor(dbPool: Pool) {
    this.db = dbPool;
  }

  async getFamilySrId(user_uuid: string) {
    const query = `
      SELECT tmp.family_sr_id
      FROM tbl_logins AS tl
      JOIN tbl_member_profile AS tmp ON tl.member_id = tmp.member_id
      WHERE tl.user_uuid = ?
    `;
    return await selectQuery(this.db, query, [user_uuid]);
  }

  async getUserRegistrationStatus(user_uuid: string) {
    const query = `
      SELECT cmr.is_approved
      FROM tbl_logins tl
      JOIN tbl_community_member_relation cmr ON tl.member_id = cmr.member_id
      WHERE tl.user_uuid = ?
    `;
    return await selectQuery(this.db, query, [user_uuid]);
  }

  async getMaxFamilyMembers(family_sr_id: number) {
    const query = `
      SELECT number_of_family_members
      FROM tbl_families
      WHERE family_sr_id = ?
    `;
    return await selectQuery(this.db, query, [family_sr_id]);
  }

  async countFamilyMembers(family_sr_id: number) {
    const query = `
      SELECT COUNT(*) AS memberCount 
      FROM tbl_member_profile 
      WHERE family_sr_id = ?
    `;
    return await selectQuery(this.db, query, [family_sr_id]);
  }

  async insertFamilyMember(values: any[]) {
    const query = `
      INSERT INTO tbl_member_profile (
        member_uuid,
        family_sr_id,
        first_name,
        father_name,
        surname,
        gender,
        date_of_birth,
        phone_number,
        address,
        business_or_job_or_any,
        business_category_id,
        business_details,
        profession_sector,
        education,
        blood_group,
        marital_status,
        id_proof,
        email_id,
        is_committee_member,
        is_community_admin,
        relationship,
        is_family_representative,
        profile_photo,
        current_resident, 
        added_on,
        updated_on
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const result = await insertQuery(this.db, query, values);
    if (result.affectedRows > 0) {
      return result.insertId;
    } else {
      return null;
    }
  }

  async isPhoneNumberExists(phone_number: string) {
    const query = `SELECT COUNT(*) AS count FROM tbl_logins WHERE phone_number = ?`;
    const result = await selectQuery(this.db, query, [phone_number]);
    return result[0]?.count > 0;
  }

  // NEW: Fetch the community_id from tbl_community
  async getCommunityId() {
    const query = `SELECT community_id FROM tbl_community LIMIT 1`;
    const result = await selectQuery(this.db, query);
    return result[0]?.community_id;
  }

  // NEW: Insert into tbl_community_member_relation
  async insertCommunityMemberRelation(
    community_member_relation_id: string,
    community_id: number,
    member_id: number,
    added_on: string
  ) {
    const query = `
      INSERT INTO tbl_community_member_relation 
        (community_member_relation_id, community_id, member_id, added_on) 
      VALUES (?, ?, ?, ?)
    `;
    return await insertQuery(this.db, query, [
      community_member_relation_id,
      community_id,
      member_id,
      added_on
    ]);
  }

  // NEW: Fetch member details by member_id
  async getMemberDetailsById(member_id: number) {
    const query = `SELECT * FROM tbl_member_profile WHERE member_id = ?`;
    const result = await selectQuery(this.db, query, [member_id]);
    return result[0];
  }

  async getFamilyInfoByUserId(user_id: number) {
    const query = `
      SELECT mp.family_sr_id, cmr.family_number
      FROM tbl_logins tl
      JOIN tbl_member_profile mp ON tl.member_id = mp.member_id
      JOIN tbl_community_member_relation cmr ON tl.member_id = cmr.member_id
      WHERE tl.user_id = ?
    `;
    return await selectQuery(this.db, query, [user_id]);
  }

  async getCommunityIdFromToken(user_id: number) {
    const query = `
      SELECT cmr.community_id
      FROM tbl_logins tl
      JOIN tbl_community_member_relation cmr ON tl.member_id = cmr.member_id
      WHERE tl.user_id = ?
    `;
    return await selectQuery(this.db, query, [user_id]);
  }

  async insertCommunityMemberRelationComplete(
    community_member_relation_id: string,
    community_id: number,
    member_id: number,
    family_sr_id: number,
    family_number: string,
    added_on: string
  ) {
    const query = `
       INSERT INTO tbl_community_member_relation 
      (
        community_member_relation_id,
        community_id,
        member_id,
        family_sr_id,
        family_number,
        is_approved,
        is_login_active,
        added_on
      ) 
    VALUES (?, ?, ?, ?, ?, 1, 1, ?)
  `;
    return await insertQuery(this.db, query, [
      community_member_relation_id,
      community_id,
      member_id,
      family_sr_id,
      family_number,
      added_on
    ]);
  }
  async getLoginByMemberId(member_id: number) {
    const query = `SELECT * FROM tbl_logins WHERE member_id = ?`;
    const result = await selectQuery(this.db, query, [member_id]);
    return result.length > 0 ? result[0] : null;
  }

  async getMemberIdByUuid(member_uuid: string) {
    const query = `SELECT member_id FROM tbl_member_profile WHERE member_uuid = ?`;
    const result = await selectQuery(this.db, query, [member_uuid]);
    return result[0]?.member_id || null;
  }
  async insertLoginEntry(
    user_uuid: string,
    phone_number: string,
    member_id: number,
    added_on: string
  ) {
    const query = `
      INSERT INTO tbl_logins (user_uuid, phone_number, member_id, added_on)
      VALUES (?, ?, ?, ?)
    `;
    const result = await insertQuery(this.db, query, [
      user_uuid,
      phone_number,
      member_id,
      added_on
    ]);
    console.log("this is a ");

    console.log(`INSERT INTO tbl_logins (user_uuid, phone_number, member_id, added_on)
      VALUES (${user_uuid}, ${phone_number}, ${member_id}, ${added_on})
    `);

    return result.insertId;

  }

  // Update phone number in member profile
  async updateMemberPhoneNumber(member_id: number, phone_number: string | null) {
    const query = `
      UPDATE tbl_member_profile 
      SET phone_number = ?, updated_on = NOW()
      WHERE member_id = ?
    `;
    return await updateQuery(this.db, query, [phone_number, member_id]);
  }

  // Check if member has login entry
  async hasLoginEntry(member_id: number) {
    const query = `SELECT COUNT(*) AS count FROM tbl_logins WHERE member_id = ?`;
    const result = await selectQuery(this.db, query, [member_id]);
    return result[0]?.count > 0;
  }

  // Create login entry for existing member when phone number is added
  async createLoginForExistingMember(member_id: number, phone_number: string) {
    const existing = await this.getLoginByMemberId(member_id);
    if (existing) {
      console.log(" Login already exists, skipping insert......................................................................................................................");
      return existing.user_id;
    }

    const user_uuid = uuidv4();
    const added_on = moment().format();

    console.log(" INSERTING INTO tbl_logins");

    return await this.insertLoginEntry(
      user_uuid,
      phone_number,
      member_id,
      added_on
    );
  }


  // Update login phone number
  async updateLoginPhoneNumber(member_id: number, phone_number: string) {
    const query = `
      UPDATE tbl_logins 
      SET phone_number = ?, updated_on = NOW()
      WHERE member_id = ?
    `;
    return await updateQuery(this.db, query, [phone_number, member_id]);
  }

  // Get member by UUID
  async getMemberByUuid(member_uuid: string) {
    const query = `SELECT * FROM tbl_member_profile WHERE member_uuid = ?`;
    const result = await selectQuery(this.db, query, [member_uuid]);
    return result[0] || null;
  }

  // Update member profile (general update) - includes phone_number
  async updateMemberProfile(member_id: number, data: any) {
    const query = `
      UPDATE tbl_member_profile 
      SET 
        first_name = COALESCE(?, first_name),
        father_name = COALESCE(?, father_name),
        surname = COALESCE(?, surname),
        gender = COALESCE(?, gender),
        date_of_birth = COALESCE(?, date_of_birth),
        phone_number = COALESCE(?, phone_number),
        address = COALESCE(?, address),
        business_or_job_or_any = COALESCE(?, business_or_job_or_any),
        business_details = COALESCE(?, business_details),
        education = COALESCE(?, education),
        blood_group = COALESCE(?, blood_group),
        marital_status = COALESCE(?, marital_status),
        email_id = COALESCE(?, email_id),
        relationship = COALESCE(?, relationship),
        current_resident = COALESCE(?, current_resident),
        updated_on = NOW()
      WHERE member_id = ?
    `;

    const values = [
      data.first_name || null,
      data.father_name || null,
      data.surname || null,
      data.gender || null,
      data.date_of_birth || null,
      data.phone_number || null,
      data.address || null,
      data.business_or_job_or_any || null,
      data.business_details || null,
      data.education || null,
      data.blood_group || null,
      data.marital_status || null,
      data.email_id || null,
      data.relationship || null,
      data.current_resident || null,
      member_id
    ];

    return await updateQuery(this.db, query, values);
  }

  // Simple method to update member and handle login table automatically
  async updateMemberWithPhoneHandling(member_id: number, data: any) {
    const oldMember = await this.getMemberDetailsById(member_id);
    const oldPhone = oldMember?.phone_number;
    const newPhone = data.phone_number?.trim() || null;

    // Update member profile
    await this.updateMemberProfile(member_id, data);

    // Handle login table when phone number is provided
    if (newPhone) {
      const hasLogin = await this.hasLoginEntry(member_id);
      if (!hasLogin) {
        // Create new login entry
        await this.createLoginForExistingMember(member_id, newPhone);
      } else if (newPhone !== oldPhone) {
        // Update existing login entry only if phone changed
        await this.updateLoginPhoneNumber(member_id, newPhone);
      }
    }
  }
}