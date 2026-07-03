import express from "express";
import {
  registerMobile,
  verifyOTP,
  loginWithMobile,
  verifyLoginOTP,
  requestAccountDeletion
} from "../controllers/authController";
import { createProfile } from "../controllers/profileController";
import { verifyToken } from "../middleware/authMiddleware"; // Import the verifyToken middleware
import { uploadProfilePhoto } from "../middleware/multerMiddleware";

const authRouter = express.Router();

// Public routes (no authentication required)
authRouter.post("/register/mobile", registerMobile);
authRouter.post("/register/verify-otp", verifyOTP);
authRouter.post("/login/mobile", loginWithMobile);
authRouter.post("/login/verify-otp", verifyLoginOTP);
authRouter.post("/delete-account", requestAccountDeletion);

// Protected route (authentication required)
authRouter.post("/profile", verifyToken, uploadProfilePhoto, createProfile); // Applying the verifyToken middleware here

export default authRouter;
