import { Pool } from "mysql2/promise";
import { selectQuery } from "../helpers/queryHelper";

export class MemberProfileModel {
  private db: Pool;

  constructor(dbPool: Pool) {
    this.db = dbPool;
  }

  async getFamilyRepresentatives() {
    const query = `
      SELECT 
        phone_number, 
        first_name, 
        father_name, 
        surname,
        id_proof,
        profile_photo,
        date_of_birth  -- Added date_of_birth to the query
      FROM 
        tbl_member_profile 
      WHERE 
        is_family_representative = 1
    `;
    return await selectQuery(this.db, query, []);
  }
}