import { Pool } from "mysql2/promise";
import { dbPool } from "../config/db";
import { updateQuery } from "../helpers/queryHelper";

export class appLanguage {
  private db: Pool;

  constructor(db: Pool = dbPool) {
    this.db = db;
  }

  async updateAppLanguage(user_uuid: string, app_language: string) {
    const query = `
      UPDATE tbl_logins 
      SET app_language = ?, updated_on = NOW() 
      WHERE user_uuid = ?
    `;

    const result = await updateQuery(this.db, query, [app_language, user_uuid]);
    return result;
  }
}
