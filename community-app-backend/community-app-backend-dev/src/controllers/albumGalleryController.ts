import { Request, Response } from "express";
import { dbPool } from "../config/db";
import { TblPhotoAlbums } from "../models/albumGalleryModel";
import { validateRequest } from "../helpers/requestHelper";
import { sendResponse } from "../helpers/responseHelper";
import { getMessage } from "../utils/translation";
import fs from 'fs';
import path from 'path';
import { isCommunityAdmin } from "../helpers/adminCheckHelper";
import { PhotoModel } from "../models/photoGalleryModel";
import logger from '../utils/logger';

const photoModel = new PhotoModel();
const photoAlbumModel = new TblPhotoAlbums(dbPool);

// Create album
export const createPhotoAlbum = async (req: Request, res: Response) => {
  const userUuid = req.user?.user_uuid;
  const user_id = String(req.user?.user_id || "unknown_user");

  if (!userUuid) {
    logger.error(`〓 [${user_id}] Unauthorized access attempt: No user_uuid found`, { user_id });
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  if (!(await isCommunityAdmin(userUuid))) {
    logger.error(`〓 [${user_id}] User lacks admin authority`, { user_id, userUuid });
    sendResponse(res, 403, false, getMessage("admin_authority", req.lang));
    return;
  }

  const { photo_album_year, photo_album_name } = req.body;

  logger.info(`📥 [${user_id}] Received request to create photo album`, {
    user_id,
    photo_album_year,
    photo_album_name,
  });

  const validation = validateRequest(req.body, ["photo_album_year", "photo_album_name"]);
  if (!validation.success) {
    logger.warn(`⚠️ [${user_id}] Invalid request data: ${validation.message}`, { user_id });
    return sendResponse(res, 400, false, getMessage("inv_req_data", req.lang), validation.message);
  }

  try {
    const added_by = req.user?.user_id;

    if (!added_by) {
      logger.error(`〓 [${user_id}] Unauthorized: No user_id found in token`, { user_id });
      return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    }

    logger.info(`📤 [${user_id}] Creating photo album: ${photo_album_name} for year ${photo_album_year}`, {
      user_id,
      added_by,
    });

    const { insertId, albumUuid } = await photoAlbumModel.createPhotoAlbum(photo_album_year, photo_album_name, String(added_by));

    const albumDir = path.join(__dirname, '../../Uploads/gallery', albumUuid);
    fs.mkdirSync(albumDir, { recursive: true });
    logger.info(`📁 [${user_id}] Created directory for album at: ${albumDir}`, { user_id, albumUuid });

    const newAlbum = await photoAlbumModel.getAlbumById(insertId);
    if (!newAlbum) {
      logger.warn(`⚠️ [${user_id}] Failed to retrieve newly created album with ID: ${insertId}`, { user_id, albumUuid });
    }

    logger.info(`✅ [${user_id}] Photo album created successfully`, { user_id, albumUuid, insertId });
    sendResponse(res, 200, true, getMessage("album_create_success", req.lang), newAlbum);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`〓 [${user_id}] Error creating photo album: ${errorMessage}`, {
      user_id,
      albumUuid: req.body.albumUuid || 'unknown',
      stack: error instanceof Error ? error.stack : undefined,
    });
    sendResponse(res, 500, false, getMessage("album_create_error", req.lang));
  }
};

// Get albums
export const getPhotoAlbums = async (req: Request, res: Response) => {
  const user_id = String(req.user?.user_id || "unknown_user");

  try {
    logger.info(`📥 [${user_id}] Fetching all photo albums`, { user_id });

    const albums = await photoAlbumModel.getAllAlbums();

    if (albums.length === 0) {
      logger.info(`📤 [${user_id}] No photo albums found`, { user_id });
      return sendResponse(res, 404, false, getMessage("album_no_records", req.lang));
    }

    logger.info(`✅ [${user_id}] Fetched ${albums.length} photo albums successfully`, { user_id });
    sendResponse(res, 200, true, getMessage("album_fetch_success", req.lang), albums);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`〓 [${user_id}] Error fetching photo albums: ${errorMessage}`, {
      user_id,
      stack: error instanceof Error ? error.stack : undefined,
    });
    sendResponse(res, 500, false, getMessage("album_fetch_error", req.lang));
  }
};

// Delete album
export const deletePhotoAlbum = async (req: Request, res: Response) => {
  const userUuid = req.user?.user_uuid;
  const user_id = String(req.user?.user_id || "unknown_user");
  const albumUuid = req.params.album_uuid;

  if (!userUuid) {
    logger.error(`〓 [${user_id}] Unauthorized access attempt: No user_uuid found`, { user_id });
    sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
    return;
  }

  if (!albumUuid) {
    logger.warn(`⚠️ [${user_id}] Album UUID not provided`, { user_id });
    return sendResponse(res, 400, false, "album_uuid_required");
  }

  try {
    logger.info(`📥 [${user_id}] Fetching album for deletion`, { user_id, albumUuid });

    const album = await photoAlbumModel.getAlbumByUuid(albumUuid);
    if (!album) {
      logger.warn(`⚠️ [${user_id}] Album not found with UUID: ${albumUuid}`, { user_id, albumUuid });
      return sendResponse(res, 404, false, getMessage("album_not_found", req.lang));
    }

    logger.info(`📤 [${user_id}] Deleting photos for album ID: ${album.photo_album_id}`, { user_id, albumUuid });
    await photoAlbumModel.deletePhotosByAlbumId(album.photo_album_id);

    logger.info(`📤 [${user_id}] Deleting album with UUID: ${albumUuid}`, { user_id, albumUuid });
    await photoAlbumModel.deletePhotoAlbum(albumUuid);

    const albumDir = path.join(__dirname, '../../Uploads/gallery', album.folder_name);
    try {
      fs.rmSync(albumDir, { recursive: true, force: true });
      logger.info(`📁 [${user_id}] Deleted directory at: ${albumDir}`, { user_id, albumUuid });
    } catch (fsError: unknown) {
      const fsErrorMessage = fsError instanceof Error ? fsError.message : String(fsError);
      logger.error(`〓 [${user_id}] Error deleting directory ${albumDir}: ${fsErrorMessage}`, {
        user_id,
        albumUuid,
        stack: fsError instanceof Error ? fsError.stack : undefined,
      });
    }

    logger.info(`✅ [${user_id}] Album with UUID ${albumUuid} deleted successfully`, { user_id, albumUuid });
    sendResponse(res, 200, true, getMessage("album_delete_success", req.lang));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`〓 [${user_id}] Error deleting photo album with UUID ${albumUuid}: ${errorMessage}`, {
      user_id,
      albumUuid,
      stack: error instanceof Error ? error.stack : undefined,
    });
    sendResponse(res, 500, false, getMessage("album_delete_error", req.lang));
  }
};

// Update album and return updated information
export const updatePhotoAlbum = async (req: Request, res: Response) => {
  const userUuid = req.user?.user_uuid;
  const user_id = String(req.user?.user_id || "unknown_user");
  const albumUuid = req.params.album_uuid;
  const { photo_album_year, photo_album_name } = req.body;

  if (!userUuid) {
    logger.error(`〓 [${user_id}] Unauthorized access attempt: No user_uuid found`, { user_id });
    return sendResponse(res, 401, false, getMessage("unauthorized", req.lang));
  }

  if (!albumUuid) {
    logger.warn(`⚠️ [${user_id}] Album UUID not provided`, { user_id });
    return sendResponse(res, 400, false, "album_uuid_required");
  }

  logger.info(`📥 [${user_id}] Received request to update photo album`, {
    user_id,
    albumUuid,
    photo_album_year,
    photo_album_name,
  });

  const validation = validateRequest(req.body, ["photo_album_year", "photo_album_name"]);
  if (!validation.success) {
    logger.warn(`⚠️ [${user_id}] Invalid request data: ${validation.message}`, { user_id, albumUuid });
    return sendResponse(res, 400, false, getMessage("inv_req_data", req.lang), validation.message);
  }

  try {
    logger.info(`📤 [${user_id}] Fetching album for update`, { user_id, albumUuid });
    const existingAlbum = await photoAlbumModel.getAlbumByUuid(albumUuid);
    if (!existingAlbum) {
      logger.warn(`⚠️ [${user_id}] Album not found with UUID: ${albumUuid}`, { user_id, albumUuid });
      return sendResponse(res, 404, false, getMessage("album_not_found", req.lang));
    }

    const folderName = existingAlbum.folder_name;
    logger.info(`📤 [${user_id}] Updating album details in database`, { user_id, albumUuid });

    await photoAlbumModel.updatePhotoAlbum(albumUuid, photo_album_year, photo_album_name, folderName);

    const updatedAlbum = await photoAlbumModel.getAlbumByUuid(albumUuid);
    logger.info(`✅ [${user_id}] Album with UUID ${albumUuid} updated successfully`, { user_id, albumUuid });

    sendResponse(res, 200, true, getMessage("album_update_success", req.lang), updatedAlbum);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`〓 [${user_id}] Error updating photo album with UUID ${albumUuid}: ${errorMessage}`, {
      user_id,
      albumUuid,
      stack: error instanceof Error ? error.stack : undefined,
    });
    sendResponse(res, 500, false, getMessage("album_update_error", req.lang));
  }
};