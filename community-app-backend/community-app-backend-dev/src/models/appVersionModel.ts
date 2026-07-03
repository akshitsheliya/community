import { Pool } from 'mysql2/promise';
import { dbPool } from '../config/db';

export class AppVersionModel {
  private db: Pool;

  constructor() {
    this.db = dbPool;
  }

  async getAppVersion(id: string): Promise<string | null> {
    const query = `SELECT app_version FROM tbl_logins WHERE user_id = ?`;
    const params = [id];

    try {
      const [rows] = await this.db.execute(query, params);
      const result = rows as any[];

      if (result.length === 0) {
        return null;
      }

 return result[0].app_version;
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }
}