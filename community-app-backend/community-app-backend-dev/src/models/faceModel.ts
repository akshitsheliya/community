import { dbPool } from "../config/db";
import logger from "../utils/logger";

export const getUnprocessedPhotos = async (album_uuid?: string) => {
  const query = `
    SELECT p.photo_id, p.photo_url, p.thumb_url, p.photo_album_id, pa.album_uuid
    FROM tbl_photos p
    JOIN tbl_photo_albums pa ON p.photo_album_id = pa.photo_album_id
    WHERE p.is_processed = 0
    ${album_uuid ? "AND pa.album_uuid = ?" : ""}
  `;
  const params = album_uuid ? [album_uuid] : [];
  const [rows]: any = await dbPool.execute(query, params);
  return rows;
};

export const markPhotoProcessed = async (photo_id: number): Promise<void> => {
  const query = `
    UPDATE tbl_photos
    SET is_processed = 1
    WHERE photo_id = ?
  `;
  await dbPool.execute(query, [photo_id]);
};

export const insertSelfie = async (
  upload_by_user_id: number,
  selfie_uuid: string,
  img_selfie: string,
  embedding?: string
) => {
  const query = `
    INSERT INTO tbl_facedata (upload_by_user_id, selfie_uuid, img_selfie, embedding, added_on, processing_status, is_processed)
    VALUES (?, ?, ?, ?, NOW(), 'pending', 0)
  `;
  const [result]: any = await dbPool.execute(query, [
    upload_by_user_id,
    selfie_uuid,
    img_selfie,
    embedding || null,
  ]);
  return result.insertId;
};

export const updateSelfieCluster = async (selfie_id: number, cluster_id: number): Promise<void> => {
  const query = `
    UPDATE tbl_facedata
    SET cluster_id = ?
    WHERE id = ?
  `;
  await dbPool.execute(query, [cluster_id, selfie_id]);
};

export const getSelfieByUuid = async (selfie_uuid: string) => {
  const query = `
    SELECT * FROM tbl_facedata WHERE selfie_uuid = ?
  `;
  const [rows]: any = await dbPool.execute(query, [selfie_uuid]);
  return rows[0];
};

export const getSelfiesByUserId = async (user_id: number) => {
  const query = `
    SELECT id, selfie_uuid, img_selfie, added_on, processing_status
    FROM tbl_facedata
    WHERE upload_by_user_id = ?
    ORDER BY added_on DESC
  `;
  const [rows]: any = await dbPool.execute(query, [user_id]);
  return rows;
};

export const deleteSelfie = async (selfie_uuid: string, user_id: number): Promise<boolean> => {
  const query = `
    DELETE FROM tbl_facedata
    WHERE selfie_uuid = ? AND upload_by_user_id = ?
  `;
  const [result]: any = await dbPool.execute(query, [selfie_uuid, user_id]);
  return result.affectedRows > 0;
};

export const insertCluster = async (embedding: string): Promise<number> => {
  const query = `
    INSERT INTO tbl_face_clusters (embedding, created_at)
    VALUES (?, NOW())
  `;
  const [result]: any = await dbPool.execute(query, [embedding]);
  return result.insertId;
};

export const getAllClusters = async () => {
  const query = `
    SELECT cluster_id, embedding
    FROM tbl_face_clusters
  `;
  const [rows]: any = await dbPool.execute(query);
  return rows;
};

export const insertPhotoClusterLink = async (
  photo_id: number,
  cluster_id: number,
  album_uuid: string,
  distance: number
): Promise<void> => {
  const query = `
    INSERT INTO tbl_selfie_photos (photo_id, cluster_id, album_uuid, distance)
    VALUES (?, ?, ?, ?)
  `;
  await dbPool.execute(query, [photo_id, cluster_id, album_uuid, distance]);
};

export async function getPhotosByCluster(cluster_id: number): Promise<any[]> {
  try {
    const [rows] = await dbPool.execute(
      `
      SELECT p.photo_id, p.photo_url, p.thumb_url, pa.album_uuid, sp.distance
      FROM tbl_selfie_photos sp
      JOIN tbl_photos p ON sp.photo_id = p.photo_id
      JOIN tbl_photo_albums pa ON p.photo_album_id = pa.photo_album_id
      WHERE sp.cluster_id = ?
      `,
      [cluster_id]
    );
    return rows as any[];
  } catch (error) {
    logger.error(`Error fetching photos by cluster ${cluster_id}:`, error);
    throw error;
  }
}

export const getUnprocessedSelfies = async () => {
  const query = `
    SELECT id, selfie_uuid, img_selfie
    FROM tbl_facedata
    WHERE is_processed = 0
    ORDER BY added_on ASC
  `;
  const [rows]: any = await dbPool.execute(query);
  return rows; // Return all unprocessed selfies
};

export const markSelfieProcessed = async (selfie_id: number): Promise<void> => {
  const query = `
    UPDATE tbl_facedata
    SET is_processed = 1, processing_status = 'completed'
    WHERE id = ?
  `;
  await dbPool.execute(query, [selfie_id]);
};

export const updateSelfieEmbedding = async (selfie_id: number, embedding: string): Promise<void> => {
  const query = `
    UPDATE tbl_facedata
    SET embedding = ?
    WHERE id = ?
  `;
  await dbPool.execute(query, [embedding, selfie_id]);
};