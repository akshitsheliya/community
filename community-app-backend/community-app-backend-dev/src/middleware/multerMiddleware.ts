import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";
import { dbPool } from "../config/db";
import { TblPhotoAlbums } from "../models/albumGalleryModel";

// Function to ensure directory exists
const ensureDirectoryExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create middleware to set upload destination based on file type
export const configureUpload = () => {
  const storage = multer.diskStorage({
    destination: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: null | Error, destination: string) => void
    ) => {
      const uploadDir =
        process.env.UPLOAD_PATH || path.join(__dirname, "../../uploads");
      let folder = path.join(uploadDir, "others"); // Default folder

      // Determine folder based on the field name
      switch (file.fieldname) {
        case "id_proof":
          folder = path.join(uploadDir, "idproof");
          break;
        case "profile_photo":
          folder = path.join(uploadDir, "profile_photos");
          break;
        case "marksheet_photo":
          folder = path.join(uploadDir, "marksheets");
          break;
        case "gallery":
          folder = path.join(uploadDir, "gallery");
          break;
        case "feed_photo_video":
          folder = path.join(uploadDir, "news");
          break;
        case "donor_photo":
          folder = path.join(uploadDir, "donor");
          break;
        case "selfie":
          folder = path.join(uploadDir, "selfies");
          break; 
        case "passport_photo":
          folder = path.join(uploadDir, "passport_photos");
          break;
        case "business_photo":
          folder = path.join(uploadDir, "business","photos");
          break;
        case "business_logo":
          folder = path.join(uploadDir, "business","logos");
          break;   
        default:
          break;
      }

      ensureDirectoryExists(folder);
      cb(null, folder); 
    },
    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: null | Error, filename: string) => void
    ) => {
      const ext = path.extname(file.originalname); 
      const uniqueFilename = `${uuidv4()}${ext}`; 
      cb(null, uniqueFilename); 
    },
  });

  // File filter for images
  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const allowedExtensions = /\.(jpg|jpeg|png|gif|heic|webp|jfif|heif|avif)$/i;
    if (!file.originalname.toLowerCase().match(allowedExtensions)) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  };

  return multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
    fileFilter,
  });
};

// Create specific upload middleware for multiple files in one route
export const uploadProfileFiles = configureUpload().fields([
  { name: 'id_proof', maxCount: 1 },
  { name: 'profile_photo', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
  { name: 'selfie', maxCount: 1 },
]);

// Middleware for gallery uploads that needs async operations
export const handleGalleryUpload = async (req: Request, res: any, next: any) => {
  const upload = configureUpload().single("gallery");

  // Use the upload middleware
  upload(req, res, async (err: any) => {
    if (err) {
      return next(err);
    }

    // If no file or no album_uuid, just continue
    if (!req.file || !req.params.album_uuid) {
      return next();
    }

    try {
      // Now we can use await here
      const albumUuid = req.params.album_uuid;
      const albumModel = new TblPhotoAlbums(dbPool);
      const albumDetails = await albumModel.getAlbumByUuid(albumUuid);

      if (!albumDetails || !albumDetails.folder_name) {
        return next(new Error("Album not found!"));
      }

      // Move the file to the correct album folder
      const uploadDir = process.env.UPLOAD_PATH || path.join(__dirname, "../../uploads");
      const tempPath = req.file.path;
      const targetFolder = path.join(uploadDir, "gallery", albumDetails.folder_name);
      
      // Ensure directory exists
      ensureDirectoryExists(targetFolder);
      
      // Move the file
      const targetPath = path.join(targetFolder, req.file.filename);
      fs.renameSync(tempPath, targetPath);
      
      // Update the file path in the request
      req.file.path = targetPath;
      
      next();
    } catch (error) {
      next(error);
    }
  });
};

export const uploadBusinessMedia = configureUpload().fields([
  { name: "business_photo", maxCount: 1 },
  { name: "business_logo", maxCount: 1 },
]);

export const uploadMarksheet = configureUpload().single("marksheet_photo");
export const uploadGallery = configureUpload().single("gallery"); 
export const uploadNewsImage = configureUpload().single("feed_photo_video");
export const uploadDonorPhoto = configureUpload().single("donor_photo");
export const uploadSelfies = configureUpload().single("selfie");
export const uploadPassportPhoto = configureUpload().single("passport_photo");
export const uploadIdProof = configureUpload().single("id_proof");
export const uploadProfilePhoto = configureUpload().single("profile_photo");

export default configureUpload();