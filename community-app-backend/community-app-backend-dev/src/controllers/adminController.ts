import { Request, Response } from "express";
import { dbPool } from "../config/db";
import { validateRequest } from "../helpers/requestHelper";
import { sendResponse } from "../helpers/responseHelper";

/**
 * Assigns Community Admin role to a user based on their phone number.
 * Requires the requester to be a community admin (checked via middleware).
 */
export const assignCommunityAdmin = async (req: Request, res: Response) => {
  try {
    // Admin check is already done via authenticateAdmin middleware
    const { phone_number } = req.body;

    // Validate request
    const validation = validateRequest(req.body, ["phone_number"]);
    if (!validation.success) {
      return sendResponse(res, 400, false, "Invalid request data", validation.message);
    }

    // Begin database transaction
    const connection = await dbPool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if the provided phone number is linked to a verified user
      const [verifiedUser] = await connection.query(
        `SELECT cmr.is_approved 
         FROM tbl_logins l
         JOIN tbl_community_member_relation cmr ON l.member_id = cmr.member_id
         WHERE l.phone_number = ? AND cmr.is_approved = 1`,
        [phone_number]
      );

      if (!Array.isArray(verifiedUser) || verifiedUser.length === 0) {
        await connection.release();
        return sendResponse(res, 400, false, "User not approved");
      }

      // Update the user to become a community admin
      const [updateResult] = await connection.query(
        `UPDATE tbl_member_profile SET is_community_admin = 1 WHERE phone_number = ?`,
        [phone_number]
      );

      if ("affectedRows" in updateResult && updateResult.affectedRows === 0) {
        await connection.release();
        return sendResponse(res, 500, false, "Failed to update admin role");
      }

      // Commit the transaction
      await connection.commit();
      await connection.release();

      sendResponse(res, 200, true, "Admin role assigned successfully");
    } catch (error) {
      await connection.rollback();
      await connection.release();
      console.error("Error updating community admin:", error);
      sendResponse(res, 500, false, "Internal server error");
    }
  } catch (error) {
    console.error("Database connection error:", error);
    sendResponse(res, 500, false, "Database connection error");
  }
};