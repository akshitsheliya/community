import { Pool } from "mysql2/promise";
import { deleteQuery } from "../helpers/queryHelper";

export class UserModel {
    private db: Pool;

    constructor(db: Pool) {
        this.db = db;
    }

    async deleteUser(phoneNumber: string): Promise<any> {
        try {
            // 🔹 Fetch member details using phone_number
            const [memberResult]: any = await this.db.execute(
                "SELECT member_id, family_sr_id FROM tbl_member_profile WHERE phone_number = ?",
                [phoneNumber]
            );
    
            if (!memberResult || memberResult.length === 0) {
                return { success: false, message: "User not found" };
            }
    
            const memberId = memberResult[0].member_id;
            const familySrId = memberResult[0].family_sr_id;
    
            if (!memberId) {
                return { success: false, message: "Member ID not found in database" };
            }
    
            // 🔹 Step 1️⃣: Delete related records to avoid foreign key constraint errors
            await deleteQuery(this.db, "DELETE FROM tbl_notifications WHERE member_id = ?", [memberId]);
            await deleteQuery(this.db, "DELETE FROM tbl_donors WHERE member_id = ?", [memberId]);
    
            // 🔹 Fetch user_id from tbl_logins before deleting
            const [userResult]: any = await this.db.execute(
                "SELECT user_id FROM tbl_logins WHERE member_id = ?",
                [memberId]
            );
    
            if (userResult.length > 0) {
                const userId = userResult[0].user_id;
    
                // 🔹 Delete from tbl_facedata first (Fix foreign key constraint)
                await deleteQuery(this.db, "DELETE FROM tbl_facedata WHERE upload_by_user_id = ?", [userId]);
            }
    
            if (familySrId) {
                const [familyMembers]: any = await this.db.execute(
                    "SELECT member_id FROM tbl_member_profile WHERE family_sr_id = ?",
                    [familySrId]
                );
    
                const memberIdsToDelete = familyMembers.map((m: any) => m.member_id);
                const memberIdsString = memberIdsToDelete.join(",");
    
                await deleteQuery(this.db, `DELETE FROM tbl_marksheets WHERE user_id IN (SELECT user_id FROM tbl_logins WHERE member_id IN (${memberIdsString}))`, []);
                await deleteQuery(this.db, `DELETE FROM tbl_community_member_relation WHERE member_id IN (${memberIdsString})`, []);
                await deleteQuery(this.db, `DELETE FROM tbl_logins WHERE member_id IN (${memberIdsString})`, []);
                await deleteQuery(this.db, `DELETE FROM tbl_member_profile WHERE member_id IN (${memberIdsString})`, []);
                await deleteQuery(this.db, "DELETE FROM tbl_families WHERE family_sr_id = ?", [familySrId]);
            } else {
                await deleteQuery(this.db, "DELETE FROM tbl_marksheets WHERE user_id IN (SELECT user_id FROM tbl_logins WHERE member_id = ?)", [memberId]);
                await deleteQuery(this.db, "DELETE FROM tbl_community_member_relation WHERE member_id = ?", [memberId]);
                await deleteQuery(this.db, "DELETE FROM tbl_logins WHERE member_id = ?", [memberId]);
                await deleteQuery(this.db, "DELETE FROM tbl_member_profile WHERE member_id = ?", [memberId]);
            }
    
            return { success: true, message: "User and related records deleted successfully" };
        } catch (error: any) {
            console.error("Error deleting user:", error);
            return { success: false, message: "Error deleting user", error: error };
        }
    }
    
    

    // 🔹 New API: Delete only the specified member_uuid
    async deleteMemberByUUID(memberUUID: string): Promise<any> {
        try {
            const [memberResult]: any = await this.db.execute(
                "SELECT member_id FROM tbl_member_profile WHERE member_uuid = ?",
                [memberUUID]
            );
    
            if (!memberResult || memberResult.length === 0) {
                return { success: false, message: "Member not found" };
            }
    
            const memberId = memberResult[0].member_id;
            if (!memberId) {
                return { success: false, message: "Invalid member ID" };
            }
    
            // 🔹 Delete references from tbl_donors first
            await deleteQuery(this.db, "DELETE FROM tbl_donors WHERE member_id = ?", [memberId]);
    
            // 🔹 Delete related records
            await deleteQuery(this.db, "DELETE FROM tbl_marksheets WHERE user_id IN (SELECT user_id FROM tbl_logins WHERE member_id = ?)", [memberId]);
            await deleteQuery(this.db, "DELETE FROM tbl_community_member_relation WHERE member_id = ?", [memberId]);
            await deleteQuery(this.db, "DELETE FROM tbl_logins WHERE member_id = ?", [memberId]);
            await deleteQuery(this.db, "DELETE FROM tbl_member_profile WHERE member_id = ?", [memberId]);
    
            return { success: true, message: "Member deleted successfully" };
        } catch (error: any) {
            console.error("Error deleting member by UUID:", error);
            return { success: false, message: "Error deleting member", error: error };
        }
    }
    

}
