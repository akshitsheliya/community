import { Request, Response } from "express";
import { PhotoModel } from "../models/photoGalleryModel";
import { sendResponse } from "../helpers/responseHelper";
import { getMessage } from "../utils/translation";
import path from "path";
import fs from "fs";
import { TblPhotoAlbums } from "../models/albumGalleryModel";
import { dbPool } from "../config/db";
import { isCommunityAdmin } from "../helpers/adminCheckHelper";
import { getPaginationFromRequest } from "../helpers/paginationHelper";
import sharp from "sharp";
import logger from "../utils/logger";
import { v4 as uuidv4 } from "uuid";

interface AuthenticatedRequest extends Request {
  user?: {
    user_uuid: string;
    user_id: number;
  };
}

const photoModel = new PhotoModel();
const photoAlbumModel = new TblPhotoAlbums(dbPool);

export const uploadPhoto = async (req: AuthenticatedRequest, res: Response) => {
  const userUuid = req.user?.user_uuid;
  const user_id = req.user?.user_id || "unknown_user";
  const albumUuid = req.params.album_uuid;

  if (!userUuid) {
    logger.error(`❌ [${user_id}] Unauthorized access attempt: No user_uuid found`, { user_id });
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  if (!(await isCommunityAdmin(userUuid))) {
    logger.error(`❌ [${user_id}] User lacks admin authority`, { user_id, userUuid });
    return sendResponse(res, 403, false, getMessage("admin_authority", req.lang));
  }

  let photoUuid: string | undefined;

  try {
    if (!req.file) {
      logger.warn(`⚠️ [${user_id}] No file provided for photo upload`, { user_id, albumUuid });
      return sendResponse(res, 400, false, getMessage("photo_upload_required", req.lang));
    }

    if (!albumUuid) {
      logger.warn(`⚠️ [${user_id}] Album UUID not provided in request`, { user_id });
      return sendResponse(res, 400, false, getMessage("inv_req_data", req.lang));
    }

    logger.info(`📥 [${user_id}] Fetching album details for UUID: ${albumUuid}`, { user_id, albumUuid });

    const albumDetails = await photoAlbumModel.getAlbumByUuid(albumUuid);
    if (!albumDetails) {
      logger.warn(`⚠️ [${user_id}] No album found for UUID: ${albumUuid}`, { user_id, albumUuid });
      return sendResponse(res, 404, false, getMessage("album_not_found", req.lang));
    }

    const photoAlbumUuid = albumDetails.photo_album_id;
    const fullAlbumName = albumDetails.folder_name;
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const filename = req.file.filename;
    const thumbFilename = filename.replace(/(\.[\w\d_-]+)$/i, "_thumb$1");
    const photoUuid = uuidv4();

    const thumbFolderName = `thumb_${albumUuid}`;
    const albumPath = `${process.env.UPLOAD_PATH}/gallery/${fullAlbumName}`;
    const thumbDir = path.join(albumPath, thumbFolderName);

    if (!fs.existsSync(thumbDir)) {
      fs.mkdirSync(thumbDir, { recursive: true });
      logger.info(`📁 [${user_id}] Created thumbnail directory at: ${thumbDir}`, { user_id, albumUuid });
    } else {
      logger.info(`📁 [${user_id}] Thumbnail directory already exists at: ${thumbDir}`, { user_id, albumUuid });
    }

    const thumbPath = path.join(thumbDir, thumbFilename);

    logger.info(`📤 [${user_id}] Generating thumbnail for photo: ${filename}`, { user_id, albumUuid, photoUuid });

    const metadata = await sharp(req.file.path).metadata();
    const { width, height } = metadata;

    if (width && height) {
      if (width > height) {
        logger.info(`📤 [${user_id}] Resizing landscape image ${filename} to width 300px`, { user_id, albumUuid, photoUuid });
        await sharp(req.file.path).resize({ width: 300 }).toFile(thumbPath);
      } else if (height > width) {
        logger.info(`📤 [${user_id}] Resizing portrait image ${filename} to height 300px`, { user_id, albumUuid, photoUuid });
        await sharp(req.file.path).resize({ height: 300 }).toFile(thumbPath);
      } else {
        logger.info(`📤 [${user_id}] Resizing square image ${filename} to 300x300px`, { user_id, albumUuid, photoUuid });
        await sharp(req.file.path).resize(300, 300).toFile(thumbPath);
      }
    } else {
      logger.warn(`⚠️ [${user_id}] Metadata missing for ${filename}, using fallback resize`, { user_id, albumUuid, photoUuid });
      await sharp(req.file.path).resize(300, 300).toFile(thumbPath);
    }

    const photoFilename = filename;
    const thumbFilenameOnly = thumbFilename;

    const fullPhotoUrl = `${baseUrl}/Uploads/gallery/${albumUuid}/${filename}`;
    const fullThumbUrl = `${baseUrl}/Uploads/gallery/${albumUuid}/${thumbFolderName}/${thumbFilename}`;

    logger.info(`📤 [${user_id}] Adding photo to database for album ID: ${photoAlbumUuid}`, {
      user_id,
      albumUuid,
      photoUuid,
    });

    const result = await photoModel.addPhoto({
      photo_uuid: photoUuid,
      photo_url: photoFilename,
      thumb_url: thumbFilenameOnly,
      photo_album_id: photoAlbumUuid,
      added_by: user_id.toString(),
    });

    if (result?.insertId) {
      logger.info(`✅ [${user_id}] Photo uploaded successfully with ID: ${result.insertId}`, {
        user_id,
        albumUuid,
        photoUuid,
        photo_id: result.insertId,
      });
      return sendResponse(
        res,
        200,
        true,
        getMessage("photo_uploaded_success", req.lang),
        {
          photo_id: result.insertId,
          photo_uuid: photoUuid,
          photo_url: fullPhotoUrl,
          thumb_url: fullThumbUrl,
          photo_album_id: photoAlbumUuid,
        }
      );
    }

    logger.error(`❌ [${user_id}] Photo upload failed: No insertId returned from database`, { user_id, albumUuid, photoUuid });
    return sendResponse(res, 500, false, getMessage("photo_upload_failed", req.lang));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ [${user_id}] Error in uploadPhoto: ${errorMessage}`, {
      user_id,
      albumUuid: albumUuid || 'unknown',
      photoUuid: photoUuid || 'unknown',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};

// Get photos by album with pagination
export const getPhotosByAlbum = async (req: Request, res: Response) => {
  const user_id = req.user?.user_id || "unknown_user";
  const albumUuid = req.params.album_uuid;

  if (!albumUuid || typeof albumUuid !== "string" || albumUuid.trim() === "") {
    logger.warn(`⚠️ [${user_id}] Invalid or missing album UUID in request`, { user_id });
    return sendResponse(res, 400, false, "invalid_album_uuid");
  }

  try {
    logger.info(`📥 [${user_id}] Fetching album details for UUID: ${albumUuid}`, { user_id, albumUuid });

    const albumDetails = await photoAlbumModel.getAlbumByUuid(albumUuid);
    if (!albumDetails) {
      logger.warn(`⚠️ [${user_id}] No album found for UUID: ${albumUuid}`, { user_id, albumUuid });
      return sendResponse(res, 404, false, getMessage("album_not_found", req.lang));
    }

    const photoAlbumId = albumDetails.photo_album_id;
    const fullAlbumName = albumDetails.folder_name;

    const { page, limit } = getPaginationFromRequest(req);
    logger.info(`📤 [${user_id}] Fetching photos for album ID: ${photoAlbumId}`, {
      user_id,
      albumUuid,
      page,
      limit,
    });

    const { data: photos, total } = await photoModel.getPhotosByAlbumId(photoAlbumId, limit, page);

    if (!photos || photos.length === 0) {
      logger.info(`📤 [${user_id}] No photos found for album ID: ${photoAlbumId}`, { user_id, albumUuid });
      return sendResponse(res, 200, true, "no_photos_found", [], total);
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const thumbFolderName = `thumb_${albumUuid}`;
    const enhancedPhotos = photos.map((photo) => {
      logger.info(`📤 [${user_id}] Enhancing photo ID ${photo.photo_id} with full URLs`, {
        user_id,
        albumUuid,
        photo_id: photo.photo_id,
      });
      return {
        ...photo,
        photo_url: `${baseUrl}/Uploads/gallery/${albumUuid}/${photo.photo_url}`,
        thumb_url: photo.thumb_url
          ? `${baseUrl}/Uploads/gallery/${albumUuid}/${thumbFolderName}/${photo.thumb_url}`
          : null,
      };
    });

    logger.info(`✅ [${user_id}] Fetched ${photos.length} photos successfully for album UUID: ${albumUuid}`, {
      user_id,
      albumUuid,
    });
    return sendResponse(res, 200, true, "photos_fetched_success", enhancedPhotos, total);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ [${user_id}] Error fetching photos for album UUID ${albumUuid}: ${errorMessage}`, {
      user_id,
      albumUuid,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return sendResponse(res, 500, false, getMessage("int_server_err", req.lang));
  }
};