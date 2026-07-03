import { Pool } from "mysql2/promise";
import { selectQuery } from "../helpers/queryHelper";

export class surnameModel {
  private db: Pool;

  constructor(dbPool: Pool) {
    this.db = dbPool;
  }

  async getSurnames(search: string) {
    let query = `
      SELECT DISTINCT surname 
      FROM tbl_member_profile 
      WHERE 1=1 `; // Base query

    const params: string[] = [];

    if (search) {
      query += ` AND surname LIKE ?`; // Add filter condition
      params.push(`%${search}%`); // Use wildcard for partial matching
    }

    return await selectQuery(this.db, query, params);
  }
}
