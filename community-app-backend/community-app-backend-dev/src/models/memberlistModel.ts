import { Pool } from "mysql2/promise";
import { dbPool } from "../config/db";
import { selectQuery } from "../helpers/queryHelper";

export class familylistModel {
  private db: Pool;

  constructor() {
    this.db = dbPool;
  }

  async getFamilyMembersByFamilyUuid(familyUuid: string) {
    const query = `
      SELECT
        tmp.member_id,  -- Include member_id for comparison
        tmp.member_uuid,
        tmp.first_name,
        tmp.father_name,
        tmp.surname,
        tmp.address,
        tmp.phone_number,
        tmp.email_id,
        tmp.gender,
        tmp.date_of_birth,
        tmp.blood_group,
        tmp.marital_status,
        tmp.education,
        tmp.profile_photo,
        tmp.id_proof,
        tmp.business_or_job_or_any,
        tmp.business_details,
        tmp.relationship,
        tmp.is_family_representative,
        tmp.is_community_admin,
        tmp.current_resident, 
        tf.family_uuid,
        tf.number_of_family_members,
        tf.family_main_member_id, -- Include family_main_member_id
        l.user_uuid  -- Will be NULL if no matching row in tbl_logins
      FROM
        tbl_member_profile tmp
      INNER JOIN
        tbl_families tf ON tmp.family_sr_id = tf.family_sr_id
      LEFT JOIN 
        tbl_logins l ON tmp.member_id = l.member_id  -- Changed to LEFT JOIN
      WHERE
        tf.family_uuid = ?;
    `;
    return await selectQuery(this.db, query, [familyUuid]);
  }
}
