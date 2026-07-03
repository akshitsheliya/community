import { selectQuery } from "./queryHelper";
import { dbPool } from "../config/db";

const isCommunityAdmin = async (userUuid: string): Promise<boolean> => {
    try {
      const query = `
        SELECT m.is_community_admin
        FROM tbl_logins l
        INNER JOIN tbl_member_profile m
          ON l.member_id = m.member_id
        WHERE l.user_uuid = ?
        LIMIT 1
      `;
      
      const rows = await selectQuery(dbPool, query, [userUuid]);
      return rows.length > 0 && rows[0].is_community_admin === 1;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };
  

export { isCommunityAdmin };
