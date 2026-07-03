import { Request, Response } from "express";
import { PythonShell } from "python-shell";
import path from "path";
import { dbPool } from "../config/db";
import * as faceModel from "../models/faceModel";
import { v4 as uuidv4 } from "uuid";
import { getMessage } from "../utils/translation";
import logger from "../utils/logger";
import fs from "fs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const UPLOAD_PATH = process.env.UPLOAD_PATH || path.join(__dirname, "../../Uploads");
const BATCH_SIZE = 10;

// Log UPLOAD_PATH for debugging
logger.info(`UPLOAD_PATH: ${UPLOAD_PATH}`);

// Admin-triggered face recognition
export const triggerFaceRecognition = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.user?.user_id;
    const { album_uuid } = req.params;

    if (!user_id) {
      logger.error("Unauthorized access attempt.");
      res.status(401).json({ message: getMessage("unauthorized_access", req.lang) });
      return;
    }

    if (!album_uuid) {
      logger.error("Missing album_uuid in request.");
      res.status(400).json({ message: "Album UUID is required" });
      return;
    }

    // Get unprocessed photos for the specified album_uuid
    const unprocessedPhotos = await faceModel.getUnprocessedPhotos(album_uuid);
    if (unprocessedPhotos.length === 0) {
      res.status(200).json({ message: `No unprocessed photos found for album ${album_uuid}.` });
      return;
    }

    // Process in batches of 10
    for (let i = 0; i < unprocessedPhotos.length; i += BATCH_SIZE) {
      const batch = unprocessedPhotos.slice(i, i + BATCH_SIZE);
      await processPhotoBatch(batch);
    }

    res.status(200).json({ message: `Face recognition completed for album ${album_uuid}.` });
  } catch (error) {
    logger.error("Face Recognition Error:", error);
    res.status(500).json({ message: getMessage("int_server_err", req.lang) });
  }
};

// Selfie upload
export const uploadSelfie = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id || !req.file) {
      logger.error("Invalid request: Missing user_id or file.");
      res.status(400).json({ message: getMessage("invalid_request", req.lang) });
      return;
    }

    const selfie_uuid = uuidv4();
    const img_selfie = req.file.filename;

    // Insert selfie without processing
    const selfie_id = await faceModel.insertSelfie(user_id, selfie_uuid, img_selfie);

    res.status(201).json({
      message: getMessage("selfie_uploaded_success", req.lang),
      selfie_id,
      selfie_uuid,
      img_selfie: `${BASE_URL}/uploads/selfies/${img_selfie}`,
    });
  } catch (error) {
    logger.error("Upload Selfie Error:", error);
    res.status(500).json({ message: getMessage("int_server_err", req.lang) });
  }
};

// Get all selfies for a user
export const getUserSelfies = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      logger.error("Unauthorized access attempt to get selfies.");
      res.status(401).json({ message: getMessage("unauthorized_access", req.lang) });
      return;
    }

    const selfies = await faceModel.getSelfiesByUserId(user_id);
    const enhancedSelfies = selfies.map((selfie: any) => ({
      id: selfie.id,
      selfie_uuid: selfie.selfie_uuid,
      img_selfie: selfie.img_selfie ? `${BASE_URL}/uploads/selfies/${selfie.img_selfie}` : null,
      added_on: selfie.added_on,
      processing_status: selfie.processing_status,
    }));

    res.status(200).json({
      message: getMessage("selfies_retrieved_success", req.lang),
      selfies: enhancedSelfies,
    });
  } catch (error) {
    logger.error("Get Selfies Error:", error);
    res.status(500).json({ message: getMessage("int_server_err", req.lang) });
  }
};

// Get photos for a selfie
export const getSelfiePhotos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { selfie_uuid, album_uuid } = req.params;
    const user_id = req.user?.user_id;

    if (!selfie_uuid || !album_uuid || !user_id) {
      logger.error("Missing parameters.");
      res.status(400).json({ message: getMessage("missing_params", req.lang) });
      return;
    }

    const selfie = await faceModel.getSelfieByUuid(selfie_uuid);
    if (!selfie || selfie.upload_by_user_id !== user_id) {
      res.status(404).json({ message: getMessage("selfie_not_found", req.lang) });
      return;
    }

    if (!selfie.cluster_id) {
      res.status(200).json({ message: "No matching photos found.", photos: [] });
      return;
    }

    const photos = await faceModel.getPhotosByCluster(selfie.cluster_id);
    const filteredPhotos = photos.filter((photo: any) => photo.album_uuid === album_uuid);
    const enhancedPhotos = filteredPhotos.map((photo: any) => ({
      ...photo,
      photo_url: `${process.env.BASE_URL}/uploads/gallery/${photo.album_uuid}/${photo.photo_url}`,
      thumb_url: `${process.env.BASE_URL}/uploads/gallery/${photo.album_uuid}/${photo.thumb_url}`,
    }));

    res.status(200).json({
      message: getMessage("photos_fetched_success", req.lang),
      photos: enhancedPhotos,
    });
  } catch (error) {
    logger.error("Get Selfie Photos Error:", error);
    res.status(500).json({ message: getMessage("int_server_err", req.lang) });
  }
};

// Delete selfie
export const deleteSelfie = async (req: Request, res: Response): Promise<void> => {
  try {
    const { selfie_uuid } = req.params;
    const user_id = req.user?.user_id;

    if (!selfie_uuid || !user_id) {
      res.status(400).json({ message: getMessage("missing_params", req.lang) });
      return;
    }

    const success = await faceModel.deleteSelfie(selfie_uuid, user_id);
    if (!success) {
      res.status(404).json({ message: getMessage("selfie_not_found", req.lang) });
      return;
    }

    res.status(200).json({ message: getMessage("selfie_deleted_success", req.lang) });
  } catch (error) {
    logger.error("Delete Selfie Error:", error);
    res.status(500).json({ message: getMessage("delete_failed", req.lang) });
  }
};

// Process all unprocessed selfies sequentially
export const processNextSelfie = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all unprocessed selfies
    const selfies = await faceModel.getUnprocessedSelfies();
    if (!selfies || selfies.length === 0) {
      res.status(200).json({ message: "No unprocessed selfies found." });
      return;
    }

    const processedSelfies: any[] = [];

    // Process each selfie one by one
    for (const selfie of selfies) {
      const selfiePath = path.join(UPLOAD_PATH, "selfies", selfie.img_selfie);

      // Verify file exists
      if (!fs.existsSync(selfiePath)) {
        logger.error(`Selfie file not found: ${selfiePath}`);
        await faceModel.markSelfieProcessed(selfie.id); // Mark as processed to skip
        processedSelfies.push({
          selfie_id: selfie.id,
          selfie_uuid: selfie.selfie_uuid,
          status: "failed",
          message: "Selfie file not found",
        });
        continue;
      }

      // Process selfie to get embedding
      const embedding = await processSelfie(selfiePath);
      if (!embedding) {
        logger.error(`No faces detected in selfie UUID ${selfie.selfie_uuid}`);
        await faceModel.markSelfieProcessed(selfie.id); // Mark as processed to skip
        processedSelfies.push({
          selfie_id: selfie.id,
          selfie_uuid: selfie.selfie_uuid,
          status: "failed",
          message: "No faces detected in selfie",
        });
        continue;
      }

      // Update embedding
      await faceModel.updateSelfieEmbedding(selfie.id, JSON.stringify(embedding));

      // Match to existing clusters
      const cluster_id = await matchSelfieToCluster(embedding);
      await faceModel.updateSelfieCluster(selfie.id, cluster_id);

      // Mark selfie as processed
      await faceModel.markSelfieProcessed(selfie.id);

      // Get matching photos
      const matchingPhotos = await faceModel.getPhotosByCluster(cluster_id);
      const enhancedPhotos = matchingPhotos.map((photo: any) => ({
        ...photo,
        photo_url: `${process.env.BASE_URL}/Uploads/gallery/${photo.album_uuid}/${photo.photo_url}`,
        thumb_url: `${process.env.BASE_URL}/Uploads/gallery/${photo.album_uuid}/${photo.thumb_url}`,
      }));

      processedSelfies.push({
        selfie_id: selfie.id,
        selfie_uuid: selfie.selfie_uuid,
        status: "success",
        matchingPhotos: enhancedPhotos,
      });

      logger.info(`Selfie UUID ${selfie.selfie_uuid} processed successfully`);
    }

    res.status(200).json({
      message: `Processed ${processedSelfies.length} selfies.`,
      selfies: processedSelfies,
    });
  } catch (error) {
    logger.error("Process Selfie Error:", error);
    res.status(500).json({ message: getMessage("int_server_err", req.lang) });
  }
};

// Helper: Process a batch of photos
async function processPhotoBatch(photos: any[]): Promise<void> {
  // const pythonPath = path.join(__dirname, "../../.venv/Scripts/python.exe");
  const pythonPath = path.join(__dirname, "../../../pycomm/bin/python" )
  const scriptPath = path.join(__dirname, "../../ocr/face_recognition_s.py");

  for (const photo of photos) {
    // Check if photo is already processed
    const [rows]: any = await dbPool.execute(
      "SELECT is_processed FROM tbl_photos WHERE photo_id = ?",
      [photo.photo_id]
    );
    if (rows.length > 0 && rows[0].is_processed === 1) {
      logger.info(`Skipping photo ${photo.photo_id}: already processed`);
      continue;
    }

    // Log raw photo_url for debugging
    logger.info(`Raw photo_url for photo ${photo.photo_id}: ${photo.photo_url}`);

    // Construct local path: gallery/<album_uuid>/<filename>
    const photoPath = path.join("gallery", photo.album_uuid, photo.photo_url);
    const normalizedPhotoPath = path.normalize(path.join(UPLOAD_PATH, photoPath));

    // Verify file exists
    if (!fs.existsSync(normalizedPhotoPath)) {
      logger.error(`File not found for photo ${photo.photo_id}: ${normalizedPhotoPath}`);
      continue;
    }

    const options = {
      pythonPath,
      args: [normalizedPhotoPath, "process"],
    };

    try {
      logger.info(`Processing photo ${photo.photo_id} at path ${normalizedPhotoPath}`);
      const results = await PythonShell.run(scriptPath, options);

      // Check if results are empty or invalid
      if (!results || results.length === 0) {
        logger.error(`No output from Python script for photo ${photo.photo_id}`);
        continue;
      }

      // Parse JSON output
      let data;
      try {
        data = JSON.parse(results[0]);
      } catch (parseError) {
        logger.error(`Invalid JSON output for photo ${photo.photo_id}: ${results[0]}`);
        continue;
      }

      if (data.error) {
        logger.error(`Error processing photo ${photo.photo_id}: ${data.error}`);
        continue;
      }

      for (const face of data.faces) {
        const embedding = face.embedding;
        const cluster_id = await matchToCluster(embedding);
        await faceModel.insertPhotoClusterLink(photo.photo_id, cluster_id, photo.album_uuid, face.distance);
      }

      await faceModel.markPhotoProcessed(photo.photo_id);
      logger.info(`Photo ${photo.photo_id} processed successfully`);
    } catch (error: any) {
      logger.error(`Error processing photo ${photo.photo_id}: ${error.message}`);
    }
  }
}

// Helper: Process selfie to get embedding
async function processSelfie(selfiePath: string): Promise<number[] | null> {
  // const pythonPath = path.join(__dirname, "../../.venv/Scripts/python.exe");
  const pythonPath = path.join(__dirname, "../../../pycomm/bin/python" )
  const scriptPath = path.join(__dirname, "../../ocr/face_recognition_s.py");

  const options = {
    pythonPath,
    args: [selfiePath, "selfie"],
  };

  try {
    logger.info(`Processing selfie at path ${selfiePath}`);
    const results = await PythonShell.run(scriptPath, options);

    // Check if results are empty or invalid
    if (!results || results.length === 0) {
      logger.error(`No output from Python script for selfie`);
      return null;
    }

    // Parse JSON output
    let data;
    try {
      data = JSON.parse(results[0]);
    } catch (parseError) {
      logger.error(`Invalid JSON output for selfie: ${results[0]}`);
      return null;
    }

    if (data.error || !data.embedding) {
      logger.error(`Error processing selfie: ${data.error || "No embedding"}`);
      return null;
    }

    logger.info(`Selfie processed successfully`);
    return data.embedding;
  } catch (error: any) {
    logger.error(`Error processing selfie: ${error.message}`);
    return null;
  }
}

// Helper: Match selfie embedding to a cluster
async function matchSelfieToCluster(embedding: number[]): Promise<number> {
  const clusters = await faceModel.getAllClusters();
  let minDistance = Infinity;
  let matchedClusterId: number | null = null;
  const threshold = 0.6;

  for (const cluster of clusters) {
    const clusterEmbedding = JSON.parse(cluster.embedding);
    const distance = computeDistance(embedding, clusterEmbedding);

    if (distance < minDistance && distance < threshold) {
      minDistance = distance;
      matchedClusterId = cluster.cluster_id;
    }
  }

  if (!matchedClusterId) {
    matchedClusterId = await faceModel.insertCluster(JSON.stringify(embedding));
  }

  return matchedClusterId;
}

// Helper: Match photo face embedding to a cluster
async function matchToCluster(embedding: number[]): Promise<number> {
  const clusters = await faceModel.getAllClusters();
  let minDistance = Infinity;
  let matchedClusterId: number | null = null;
  const threshold = 0.6;

  for (const cluster of clusters) {
    const clusterEmbedding = JSON.parse(cluster.embedding);
    const distance = computeDistance(embedding, clusterEmbedding);

    if (distance < minDistance && distance < threshold) {
      minDistance = distance;
      matchedClusterId = cluster.cluster_id;
    }
  }

  if (!matchedClusterId) {
    matchedClusterId = await faceModel.insertCluster(JSON.stringify(embedding));
  }

  return matchedClusterId;
}

// Helper: Compute Euclidean distance between embeddings
function computeDistance(emb1: number[], emb2: number[]): number {
  if (emb1.length !== emb2.length) return Infinity;
  return Math.sqrt(emb1.reduce((sum, val, i) => sum + (val - emb2[i]) ** 2, 0));
}