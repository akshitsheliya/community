import { Pool } from "mysql2/promise";
import { selectQuery, updateQuery } from "../helpers/queryHelper";

export class MemberProfileModel {
  private db: Pool;

  constructor(dbPool: Pool) {
    this.db = dbPool;
  }

  async getCommitteeMember(community_id: number) {
    const query = `
      SELECT 
        mp.*, 
        f.number_of_family_members
      FROM 
        tbl_member_profile mp
      LEFT JOIN 
        tbl_families f ON mp.member_id = f.family_main_member_id
      JOIN 
        tbl_community_member_relation cmr ON cmr.member_id = mp.member_id
      WHERE 
        mp.is_committee_member = 1
        AND (mp.is_demo_account = 0 OR mp.is_demo_account IS NULL)
        AND cmr.community_id = ?
      ORDER BY 
        FIELD(mp.designation, 'pramukh', 'up pramukh', 'mantri', 'sah mantri', 'committee member');
    `;
    return await selectQuery(this.db, query, [community_id]);
  }
  
  

  async addCommitteeMember(member_uuid: string, designation: string) {
    const query = `
      UPDATE tbl_member_profile
      SET is_committee_member = 1, designation = ?
      WHERE member_uuid = ?;
    `;
    return await updateQuery(this.db, query, [designation, member_uuid]);
  }
  
  async getMemberByUuid(member_uuid: string): Promise<any> {
    const query = `
      SELECT member_id, is_committee_member, designation
      FROM tbl_member_profile
      WHERE member_uuid = ?;
    `;
    const result = await selectQuery(this.db, query, [member_uuid]);
    return result.length > 0 ? result[0] : null;
  }
  
  async getDesignationCount(designation: string, community_id: number): Promise<number> {
    const query = `
      SELECT COUNT(*) AS count
      FROM tbl_member_profile mp
      INNER JOIN tbl_community_member_relation cmr ON mp.member_id = cmr.member_id
      WHERE mp.is_committee_member = 1 AND mp.designation = ? AND cmr.community_id = ?;
    `;
    const result = await selectQuery(this.db, query, [designation, community_id]);
    return result.length > 0 ? result[0].count : 0;
  }
  
  
  async updateCommitteeMemberDesignation(member_uuid: string, designation: string) {
    const query = `
      UPDATE tbl_member_profile
      SET designation = ?
      WHERE member_uuid = ?;
    `;
    return await updateQuery(this.db, query, [designation, member_uuid]);
  }

  async removeCommitteeMember(member_uuid: string) {
    const query = `
      UPDATE tbl_member_profile
      SET is_committee_member = 0, designation = null
      WHERE member_uuid = ?;
    `;
    return await updateQuery(this.db, query, [member_uuid]);
  }
}
