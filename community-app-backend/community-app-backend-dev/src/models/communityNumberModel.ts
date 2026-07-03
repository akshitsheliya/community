import { Pool } from "mysql2/promise";
import { selectQuery } from "../helpers/queryHelper";

export class CommunityNumberModel {
  private db: Pool;

  constructor(dbPool: Pool) {
    this.db = dbPool;
  }

  async getCommunityByCommunityNumber(community_number: number) {
    const query = `
      SELECT * FROM tbl_community WHERE community_number = ?
    `;
    return await selectQuery(this.db, query, [community_number]);
  }
}
