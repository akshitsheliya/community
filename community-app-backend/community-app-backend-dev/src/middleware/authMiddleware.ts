import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { dbPool } from "../config/db";
import dotenv from "dotenv";
import logger from "../utils/logger";

// Load environment variables
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env file");
}

const secretKey = process.env.JWT_SECRET;

// Define a custom interface for the user payload
interface UserPayload extends jwt.JwtPayload {
  user_uuid: string;
  phone_number?: string;
  community_uuid?: string; 
}

interface AuthUser {
  user_id: number;
  user_uuid: string;
  phone_number?: string;
  community_id: number;
  community_uuid: string;
  member_id?: number;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
// Middleware to verify JWT token and check if user still exists
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("=== verifyToken Middleware ===");
    console.log("Request URL:", req.originalUrl);
    console.log("Request Method:", req.method);
    
    const authHeader = req.headers.authorization;
    const queryToken = typeof req.query.token === "string" ? req.query.token : "";
    console.log("Auth Header:", authHeader);

    if (!authHeader && !queryToken) {
      logger.error("No token provided", { 
        user_id: "unknown",
        url: req.originalUrl,
        method: req.method,
        headers: req.headers
      });
      console.log("❌ No authorization header found");
      res.status(401).json({ success: false, message: "Access Denied: No token provided" });
      return;
    }

    const token = authHeader
      ? authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : authHeader
      : queryToken;

    console.log("Extracted token:", token.substring(0, 50) + "...");

    // Verify token
    let decoded = jwt.verify(token, secretKey) as any;
    console.log("Decoded token payload:", decoded);

    // 1) Fetch user_uuid using old user_id
    if (!decoded.user_uuid && decoded.user_id) {
      const [rows]: any = await dbPool.query(
        "SELECT user_uuid FROM tbl_logins WHERE user_id = ?",
        [decoded.user_id]
      );
      if (rows.length > 0) decoded.user_uuid = rows[0].user_uuid;
    }

    // 2) Fetch community_uuid using old community_id
    if (!decoded.community_uuid && decoded.community_id) {
      const [rows2]: any = await dbPool.query(
        "SELECT community_uuid FROM tbl_community WHERE community_id = ?",
        [decoded.community_id]
      );
      if (rows2.length > 0) decoded.community_uuid = rows2[0].community_uuid;
    }
  
    if (!decoded.user_uuid || !decoded.community_uuid) {
      logger.error("Invalid token payload even after fallback", { decoded });

      res.status(401).json({
        success: false,
        message: "Session expired or invalid. Please log in again."
      });
      
      return;
    }

    const [userRows]: any = await dbPool.query(
      "SELECT user_id FROM tbl_logins WHERE user_uuid = ?",
      [decoded.user_uuid]
    );

    const [communityRows]: any = await dbPool.query(
      "SELECT community_id FROM tbl_community WHERE community_uuid = ?",
      [decoded.community_uuid]
    );

    if (userRows.length === 0 || communityRows.length === 0) {
      logger.error("Session expired or user/community not found", { decoded });
      res.status(401).json({
        success: false,
        message: "Session expired. Please log in again."
      });
      return;
    }

    const user_id = userRows[0].user_id;
    const community_id = communityRows[0].community_id;
    
    // Attach clean data
    (req as AuthRequest).user = {
      user_id,
      user_uuid: decoded.user_uuid,
      phone_number: decoded.phone_number,
      community_id,
      community_uuid: decoded.community_uuid,
      // member_id,
    };

    logger.info(`Token verified`, {
      user_id,
      // member_id,
      community_uuid: decoded.community_uuid,
      method: req.method,
      url: req.originalUrl
    });

    next();

  } catch (error) {
    logger.error("Token Verification Error", { error });
    res.status(401).json({
      success: false,
      message: "Invalid or Expired Token",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};


// Admin authentication middleware
export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;

    if (!user || (!user.user_id && !user.user_uuid)) {
      const errorMessage = "Access denied. Invalid user.";
      logger.error(errorMessage, { user_id: "unknown" });
      res.status(403).json({
        success: false,
        message: errorMessage,
      });
      return;
    }

    // Use user_uuid or user_id to find the member_id from tbl_logins
    const identifier = user.user_id ? "user_id" : "user_uuid";
    const identifierValue = user.user_id || user.user_uuid;

    // Query to get member_id and is_community_admin from tbl_logins and tbl_member_profile
    const query = `
      SELECT 
        tbl_logins.member_id, 
        tbl_member_profile.is_community_admin 
      FROM tbl_logins
      INNER JOIN tbl_member_profile ON tbl_logins.member_id = tbl_member_profile.member_id
      WHERE tbl_logins.${identifier} = ${identifierValue}
    `;
    
    const [rows]: any = await dbPool.query(query);

    if (rows.length === 0 || !rows[0].member_id) {
      const errorMessage = "Access denied. User not linked to a member profile.";
      logger.error(errorMessage, { user_id: user.user_id?.toString() || "unknown" });
      res.status(403).json({
        success: false,
        message: errorMessage,
      });
      return;
    }

    const { member_id, is_community_admin } = rows[0];

    // Check if the user is a community admin
    if (is_community_admin !== 1) {
      const errorMessage = "Access denied. Admins only.";
      logger.error(errorMessage, { user_id: user.user_id?.toString() || "unknown" });
      res.status(403).json({
        success: false,
        message: errorMessage,
      });
      return;
    }

    // Attach member_id to the request for further use
    (req as AuthRequest).user = { ...user, member_id };

    logger.info("Admin authentication successful", { user_id: user.user_id?.toString() || "unknown" });

    next();
  } catch (error) {
    const errorMessage = `Admin Authentication Error: ${
      error instanceof Error ? error.message : "Unknown error occurred"
    }`;
    logger.error(errorMessage, { user_id: (req as AuthRequest).user?.user_id?.toString() || "unknown" });
    res.status(500).json({
      success: false,
      message: "Internal server error while authenticating admin.",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};
