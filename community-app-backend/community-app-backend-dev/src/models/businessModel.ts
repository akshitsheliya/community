import { Pool } from "mysql2/promise";
import { insertQuery, selectQuery } from "../helpers/queryHelper";
import { RowDataPacket } from "mysql2";

interface Business {
  business_uuid: string;
  added_by: number;
  community_id: number;
  business_name: string;
  business_photo: string | null;
  business_logo: string | null;
  city: string | null;
  state: string | null;
  business_type: string | null;
  category: string | null;
  address: string | null;
  contact_number: string;
  contact_email: string | null;
  services_products: string | null;
}

export class BusinessModel {
  private db: Pool;

  constructor(dbPool: Pool) {
    this.db = dbPool;
  }

  async addBusiness(data: Business) {
    const query = `
  INSERT INTO tbl_business
    (business_uuid, added_by, community_id, business_name, business_photo, business_logo, 
     city, state, business_type, category, address, contact_number, contact_email, created_at, updated_at, services_products)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
`;

const result = await insertQuery(this.db, query, [
  data.business_uuid,
  data.added_by,
  data.community_id,
  data.business_name,
  data.business_photo,
  data.business_logo,
  data.city,
  data.state,
  data.business_type,
  data.category, 
  data.address,
  data.contact_number,
  data.contact_email,
  data.services_products,
]);
    return result as {insertId: number};
  }

  async getAllBusinesses(community_id: number, search: string) {
    let query = `
      SELECT * FROM tbl_business
      WHERE community_id = ?
    `;
    const params: any[] = [community_id];
  
    if (search) {
      query += ` AND (business_name LIKE ? OR category LIKE ?) `;
      params.push(`%${search}%`, `%${search}%`);
    }
  
    const rows = await selectQuery(this.db, query, params);
    return Array.isArray(rows) ? rows : [rows];
  }
  
  
  async updateBusiness(
    business_uuid: string,
    community_id: number,
    data: Partial<Business> & { updated_by: number }
  ) {
    const query = `
      UPDATE tbl_business
      SET
        business_name = ?, 
        business_photo = ?, 
        business_logo = ?, 
        city = ?, 
        state = ?, 
        business_type = ?,
        category =?, 
        address = ?, 
        contact_number = ?, 
        contact_email = ?,
        updated_at = NOW(),
        services_products = ?
      WHERE business_uuid = ? AND community_id = ?
    `;
  
    // Convert all possibly undefined values to null explicitly
    const params = [
      data.business_name ?? null,
      data.business_photo ?? null,
      data.business_logo ?? null,
      data.city ?? null,
      data.state ?? null,
      data.business_type ?? null,
      data.category ?? null,  
      data.address ?? null,
      data.contact_number ?? null,
      data.contact_email ?? null,
      data.services_products ?? null,
      business_uuid,
      community_id,
      
    ];
  
    const [result]: any = await this.db.execute(query, params);
    return result;
  }
  
  async deleteBusiness(business_uuid: string, community_id: number) {
    const query = `
      DELETE FROM tbl_business
      WHERE business_uuid = ? AND community_id = ?
    `;
  
    const [result]: any = await this.db.execute(query, [business_uuid, community_id]);
    return result;
  }

  async getBusinessByUUID(business_uuid: string, community_id: number) {
    const query = `
      SELECT 
        business_id,
        business_uuid,
        added_by,
        community_id,
        business_name,
        business_photo,
        business_logo,
        city,
        state,
        business_type,
        category,
        address,
        contact_number,
        contact_email,
        created_at,
        updated_at,
        services_products
      FROM tbl_business
      WHERE business_uuid = ? AND community_id = ?
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(query, [business_uuid, community_id]);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  }

  async getAllBusinessCategories() {
    const query = `
      SELECT id, services_eng, services_guj
      FROM tbl_business_category
      ORDER BY id ASC
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(query);
    return Array.isArray(rows) ? rows : [];
  }
}