import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

import { languageMiddleware } from "./middleware/languageMiddleware";
import { errorHandler } from "./middleware/errorHandler";
import { verifyToken } from "./middleware/authMiddleware";
import { checkCommunityAccess } from "./middleware/checkCommunityAccess";

import router from "./router";
import familyRoutes from "./routes/familyRoutes";
import newsRoutes from "./routes/newsRoutes";
import memberRoutes from "./routes/familyMemberRoutes";
import authRoutes from "./routes/authRoutes";
import marksheetRoutes from "./routes/marksheetRoutes";
import updateProfileRoutes from "./routes/updateProfileRoutes";
import familyRepresentativeRoutes from "./routes/familyRepresentativeRoutes";
import deleteMemberRoutes from "./routes/deleteMemberRoutes";
import committeeMemberRoutes from "./routes/committeeMemberRoutes";
import awardEligibleRoutes from "./routes/awardEligibleRoutes";
import memberlistRoutes from "./routes/memberlistRoutes";
import albumRoutes from "./routes/albumGalleryRoutes";
import photoRoutes from "./routes/photoGalleryRoutes";
import donorsRoutes from "./routes/donorsRoutes";
import userVerificationRoutes from "./routes/userVerificationRoutes";
import countRoutes from "./routes/countRoutes";
import adminRoutes from "./routes/adminRoutes";
import faceRoutes from "./routes/faceRoutes";
import notificationRoutes from "./firebase/routes/notificationRoutes";
import uploadSelfieRoutes from "./routes/faceRoutes";
import abroadMemberRoutes from "./routes/abroadMemberRoutes";
import surnameRoutes from "./routes/surnameRoutes";
import languageRoutes from "./routes/appLanguageRoutes";
import appNotificationRoutes from "./routes/appNotificationRoutes";
import appVersionRoutes from "./routes/appVersionRoutes";
import communityNumberRoutes from "./routes/communityNumberRoutes";
import businessRoutes from "./routes/businessRoutes";
import familyGraphRoutes from "./routes/familyGraphRoutes";
import familyMatcherRoutes from './routes/familyMatcherRoutes';
import familyJoinRequestRoutes from './routes/familyJoinRequestRoutes';

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Modify the static files serving section:
const uploadDir = process.env.UPLOAD_PATH;

if (!uploadDir) {
  console.error("UPLOAD_PATH environment variable is not set.");
  process.exit(1);
}

const logsdir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsdir)) {
  fs.mkdirSync(logsdir);
}

app.use(
  "/uploads",
  express.static(uploadDir)
  // serveIndex(uploadDir, { icons: true })
);

// Register the language middleware globally
app.use(languageMiddleware);

// Mount the router
app.use(router);

app.use("/api", authRoutes);

// app.use(verifyToken);
// app.use(checkCommunityAccess);

// Routes
app.use(
  "/api",
  familyRoutes,
  newsRoutes,
  memberRoutes,
  marksheetRoutes,
  updateProfileRoutes,
  familyRepresentativeRoutes,
  committeeMemberRoutes,
  awardEligibleRoutes,
  deleteMemberRoutes,
  memberlistRoutes,
  donorsRoutes,
  albumRoutes,
  photoRoutes,
  userVerificationRoutes,
  countRoutes,
  adminRoutes,
  faceRoutes,
  notificationRoutes,
  surnameRoutes,
  uploadSelfieRoutes,
  abroadMemberRoutes,
  languageRoutes,  
  appNotificationRoutes,
  appVersionRoutes,
  communityNumberRoutes,
  businessRoutes
);

app.use('/api/family-graph', familyGraphRoutes);
app.use('/api/family-matcher', familyMatcherRoutes);
app.use('/api/family-join', familyJoinRequestRoutes);

app.use(errorHandler);

export default app;