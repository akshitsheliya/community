import { Pool, PoolConnection, ResultSetHeader, RowDataPacket, FieldPacket } from "mysql2/promise";
import { dbPool } from "../config/db";
import { insertQuery, selectQuery } from "../helpers/queryHelper";
import { v4 as uuidv4 } from 'uuid';

// Interface for SELECT query results
interface ClusterRow extends RowDataPacket {
  cluster_id: number;
}

interface CountRow extends RowDataPacket {
  count: number;
}

export class TblPhotoAlbums {
  private db: Pool;

  constructor(db: Pool = dbPool) {
    this.db = db;
  }

  async createPhotoAlbum(photo_album_year: string, photo_album_name: string, added_by: string) {
    const albumUuid = uuidv4(); // Generate UUID for album folder
  
    const query = `
      INSERT INTO tbl_photo_albums (photo_album_year, photo_album_name, added_by, added_on, album_uuid, folder_name)
      VALUES (?, ?, ?, NOW(), ?, ?)
    `;
  
    const result = await insertQuery(this.db, query, [photo_album_year, photo_album_name, added_by, albumUuid, albumUuid]);
  
    return { insertId: result.insertId, albumUuid }; // Return albumUuid
  }

  async getAlbumByUuid(albumUuid: string): Promise<any> {
    const query = `
      SELECT photo_album_id, photo_album_year, photo_album_name, folder_name, album_uuid
      FROM tbl_photo_albums
      WHERE album_uuid = ?
      LIMIT 1
    `;
    
    try {
      const [rows] = await this.db.execute(query, [albumUuid]);
      if (Array.isArray(rows) && rows.length > 0) {
        return rows[0];  // Return the first matching album
      }
      return null;  // Return null if no album is found
    } catch (error) {
      console.error("Error fetching album by UUID:", error);
      throw error;
    }
  }

  async getAlbumById(albumId: number) {
    const query = `
      SELECT 
        photo_album_id, 
        CONCAT(photo_album_year, '-', photo_album_name) AS full_album_name,
        photo_album_year,
        photo_album_name,
        added_on, 
        added_by,
        album_uuid
      FROM tbl_photo_albums
      WHERE photo_album_id = ?
    `;

    try {
      const result = await selectQuery(this.db, query, [albumId]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("Error fetching album by ID:", error);
      throw error;
    }
  }

  async getAllAlbums() {
    const query = `
      SELECT 
        photo_album_id, 
        CONCAT(photo_album_year, '-', photo_album_name) AS full_album_name,
        photo_album_year,
        photo_album_name,
        added_on, 
        added_by,
        album_uuid
      FROM tbl_photo_albums
      ORDER BY added_on DESC
    `;

    return await selectQuery(this.db, query);
  }

  async deletePhotosByAlbumId(photo_album_id: number) {
    const query = `
      DELETE FROM tbl_photos 
      WHERE photo_album_id = ?
    `;
    return await insertQuery(this.db, query, [photo_album_id]);
  }

  async deletePhotoAlbum(albumUuid: string) {
    const connection: PoolConnection = await this.db.getConnection(); // Get a connection for transaction
    try {
      await connection.beginTransaction(); // Start transaction

      // Get all cluster_ids associated with the album’s photos in tbl_selfie_photos
      const getClustersQuery = `
        SELECT DISTINCT cluster_id
        FROM tbl_selfie_photos
        WHERE album_uuid = ?
      `;
      const [clusterRows, clusterFields]: [ClusterRow[], FieldPacket[]] = await connection.execute(getClustersQuery, [albumUuid]);
      const clusterIds = clusterRows.map(row => row.cluster_id);

      // Delete the album from tbl_photo_albums
      // Cascades will delete related tbl_photos and tbl_selfie_photos entries
      const deleteAlbumQuery = `
        DELETE FROM tbl_photo_albums 
        WHERE album_uuid = ?
      `;
      const [result, deleteFields]: [ResultSetHeader, FieldPacket[]] = await connection.execute(deleteAlbumQuery, [albumUuid]);

      // Check if album was found
      if (result.affectedRows === 0) {
        throw new Error("Album not found");
      }

      // Check if clusters are still referenced elsewhere
      if (clusterIds.length > 0) {
        for (const clusterId of clusterIds) {
          // Check if cluster is referenced by selfies in tbl_facedata
          const checkSelfiesQuery = `
            SELECT COUNT(*) AS count
            FROM tbl_facedata
            WHERE cluster_id = ?
          `;
          const [selfieResult, selfieFields]: [CountRow[], FieldPacket[]] = await connection.execute(checkSelfiesQuery, [clusterId]);
          const selfieCount = selfieResult[0].count;

          // Check if cluster is referenced by photos in other albums in tbl_selfie_photos
          const checkOtherAlbumsQuery = `
            SELECT COUNT(*) AS count
            FROM tbl_selfie_photos
            WHERE cluster_id = ? AND album_uuid != ?
          `;
          const [otherAlbumsResult, otherAlbumsFields]: [CountRow[], FieldPacket[]] = await connection.execute(checkOtherAlbumsQuery, [clusterId, albumUuid]);
          const otherAlbumsCount = otherAlbumsResult[0].count;

          // If cluster is not referenced by selfies or other albums, delete it
          if (selfieCount === 0 && otherAlbumsCount === 0) {
            const deleteClusterQuery = `
              DELETE FROM tbl_face_clusters
              WHERE cluster_id = ?
            `;
            const [deleteResult, deleteFields]: [ResultSetHeader, FieldPacket[]] = await connection.execute(deleteClusterQuery, [clusterId]);
            console.log(`Deleted cluster ${clusterId}: ${deleteResult.affectedRows} rows affected`);
          }
        }
      }

      await connection.commit(); // Commit transaction
      return { success: true, message: "Album and related data deleted successfully" };
    } catch (error) {
      await connection.rollback(); // Rollback transaction on error
      console.error("Error deleting album and related data:", error);
      throw error;
    } finally {
      connection.release(); // Release the connection
    }
  }

  async updatePhotoAlbum(albumUuid: string, photo_album_year: string, photo_album_name: string, folderName: string) {
    const query = `
      UPDATE tbl_photo_albums 
      SET photo_album_year = ?, photo_album_name = ?, folder_name = ?
      WHERE album_uuid = ?
    `;
  
    return await insertQuery(this.db, query, [photo_album_year, photo_album_name, folderName, albumUuid]);
  }
}