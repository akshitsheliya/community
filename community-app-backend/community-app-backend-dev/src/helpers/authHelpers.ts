import { dbPool } from "../config/db";

export const isCommunityAdmin = async (memberId: number, communityId: number): Promise<boolean> => {
  try {
    const [rows]: any = await dbPool.query(
      `SELECT is_community_admin FROM tbl_member_profile 
       WHERE member_id = ? AND is_community_admin = 1`,
      [memberId]
    );
    return rows.length > 0;
  } catch (error) {
    console.error("Error checking community admin status:", error);
    return false;
  }
};

export const getMemberIdFromToken = async (reqUser: any): Promise<number | null> => {
  if (!reqUser) return null;
  
  const { user_uuid, phone_number } = reqUser;
  
  if (!user_uuid && !phone_number) return null;
  
  try {
    const [rows]: any = await dbPool.query(
      `SELECT member_id FROM tbl_logins 
       WHERE user_uuid = ? OR phone_number = ? 
       LIMIT 1`,
      [user_uuid, phone_number]
    );
    
    if (rows && rows.length > 0 && rows[0].member_id) {
      return rows[0].member_id;
    }
    
    return null;
  } catch (err) {
    console.error('getMemberIdFromToken error:', err);
    return null;
  }
};

export const getCommunityIdFromToken = async (reqUser: any): Promise<number> => {
  if (!reqUser?.community_uuid) return 1;  // default
  
  try {
    const [rows]: any = await dbPool.query(
      `SELECT community_id FROM tbl_community WHERE community_uuid = ?`,
      [reqUser.community_uuid]
    );
    
    return rows[0]?.community_id || 1;
  } catch (err) {
    return 1;
  }
};
