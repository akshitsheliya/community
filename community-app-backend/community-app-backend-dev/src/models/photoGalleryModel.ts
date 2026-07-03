import { Pool } from "mysql2/promise";
import { dbPool } from "../config/db";
import { insertQuery } from "../helpers/queryHelper";

export class PhotoModel {
  private db: Pool;

  constructor() {
    this.db = dbPool;
  }

  // Add a new photo
  async addPhoto(photoData: {
    photo_uuid: string;
    photo_url: string;
    thumb_url: string;
    photo_album_id: number;
    added_by: string;
  }): Promise<any> {
    const query = `
      INSERT INTO tbl_photos (photo_uuid, photo_url, thumb_url, photo_album_id, added_by, added_on)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
  
    const values = [
      photoData.photo_uuid,
      photoData.photo_url,
      photoData.thumb_url,
      photoData.photo_album_id,
      photoData.added_by,
    ];
  
    return await insertQuery(this.db, query, values);
  }
  

  // Update photo URLs in the database
  async updatePhotoUrls(photoId: number, newPhotoUrl: string, newThumbUrl: string): Promise<any> {
    const query = `
      UPDATE tbl_photos 
      SET photo_url = ?, thumb_url = ?
      WHERE photo_id = ?
    `;
    
    const values = [newPhotoUrl, newThumbUrl, photoId];
    
    return await insertQuery(this.db, query, values);
  }

  // Retrieve album ID by UUID
  async getPhotoAlbumIdByAlbumUuid(albumUuid: string): Promise<number | null> {
    const query = `
      SELECT photo_album_id
      FROM tbl_photo_albums
      WHERE album_uuid = ?
    `;
    try {
      const [rows] = await dbPool.execute(query, [albumUuid]);
      if (Array.isArray(rows) && rows.length > 0) {
        return (rows[0] as any).photo_album_id;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting photo_album_id:", error);
      return null;
    }
  }

  // Retrieve photos by album ID with pagination
  async getPhotosByAlbumId(
    photoAlbumId: number,
    pageSize: number = 10,
    pageNumber: number = 1
  ): Promise<{ data: any[]; total: number }> {
    const offset = (pageNumber - 1) * pageSize;

    // Count total photos
    const countQuery = `SELECT COUNT(*) as total FROM tbl_photos WHERE photo_album_id = ?`;
    const [countRows] = await dbPool.execute(countQuery, [photoAlbumId]);
    const total = (countRows as any)[0].total;

    // Select both photo_url and thumb_url
    const query = `
      SELECT photo_id, photo_url, thumb_url, added_on 
      FROM tbl_photos
      WHERE photo_album_id = ?
      ORDER BY added_on DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    const [rows] = await dbPool.execute(query, [photoAlbumId]);

    return {
      data: rows as any[],
      total: total,
    };
  }
}
