import { Pool } from "mysql2/promise";
import {
  selectQuery,
  insertQuery,
  deleteQuery,
  updateQuery,
} from "../helpers/queryHelper";

export class DonorModel {
  private db: Pool;

  constructor(dbPool: Pool) {
    this.db = dbPool;
  }

  // Add donor
  async addDonor(donorData: {
    member_id: string | null;
    donor_name: string;
    donor_mobile_no: string;
    is_lifetime_donor: number;
    donation_category: string;
    donation_year: string | null;
    added_on: Date;
    updated_on: Date;
    donor_photo: string | null; // Photo column
    donor_type: string | null;
    community_id: number;
    added_by: number;
  }): Promise<number> {
    const query = `
      INSERT INTO tbl_donors (
        donor_id, member_id, donor_name, donor_mobile_no, 
        is_lifetime_donor, donation_category, donation_year, 
        added_on, updated_on, donor_photo, donor_type, community_id, added_by
      ) VALUES (
        UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `;

    const values = [
      donorData.member_id,
      donorData.donor_name,
      donorData.donor_mobile_no,
      donorData.is_lifetime_donor,
      donorData.donation_category,
      donorData.donation_year,
      donorData.added_on,
      donorData.updated_on,
      donorData.donor_photo, // Pass photo path
      donorData.donor_type,
      donorData.community_id,
      donorData.added_by,
    ];

    const result = await insertQuery(this.db, query, values);

    return result.insertId; // Return inserted ID
  }

  // Add donor from member list
  async addDonorFromMembers(donorDataFromMembers: {
    member_id: string | null;
    donor_name: string;
    donor_mobile_no: string;
    is_lifetime_donor: number;
    donation_category: string;
    donation_year: string | null;
    donor_photo: string | null;
    donor_type: string | null;
    added_on: Date;
    updated_on: Date;
    community_id: number;
    added_by: number;
  }): Promise<any> {
    const query = `
      INSERT INTO tbl_donors (
        donor_id, member_id, donor_name, donor_mobile_no, 
        is_lifetime_donor, donation_category, donation_year, 
        donor_photo, donor_type, added_on, updated_on, community_id, added_by
      ) VALUES (
        UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `;
    const values = [
      donorDataFromMembers.member_id,
      donorDataFromMembers.donor_name,
      donorDataFromMembers.donor_mobile_no,
      donorDataFromMembers.is_lifetime_donor,
      donorDataFromMembers.donation_category,
      donorDataFromMembers.donation_year,
      donorDataFromMembers.donor_photo,
      donorDataFromMembers.donor_type,
      donorDataFromMembers.added_on,
      donorDataFromMembers.updated_on,
      donorDataFromMembers.community_id,
      donorDataFromMembers.added_by,
    ];
    return await insertQuery(this.db, query, values);
  }

  async getAllMembers(
    pageSize: number = 50,
    pageNumber: number = 1,
    filters: any = {}
  ): Promise<{ data: any[]; total: number }> {
    const offset = (pageNumber - 1) * pageSize;

    const conditions: string[] = [
      "(mp.is_demo_account = 0 OR mp.is_demo_account IS NULL)",
      // Removed invalid "l.is_active" condition
    ];
    const params: any[] = [];

    // Community filter is required - explicitly check for it
    if (!filters.community_id) {
      throw new Error("Community ID is required to fetch members");
    }

    conditions.push("cmr.community_id = ?");
    params.push(filters.community_id);

    if (filters.search) {
      conditions.push(`(
        mp.first_name LIKE ? OR 
        mp.father_name LIKE ? OR 
        mp.surname LIKE ?
      )`);
      params.push(
        `%${filters.search}%`,
        `%${filters.search}%`,
        `%${filters.search}%`
      );
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    try {
      // Count
      const countQuery = `
        SELECT COUNT(DISTINCT mp.member_id) AS total
        FROM tbl_member_profile mp
        INNER JOIN tbl_community_member_relation cmr ON mp.member_id = cmr.member_id
        ${whereClause}
      `;
      const countResult = await selectQuery(this.db, countQuery, params);
      const total = countResult?.[0]?.total ?? 0;

      // Data
      const dataQuery = `
        SELECT 
          mp.*,
          cmr.family_number,
          cmr.is_approved,
          cmr.is_login_active
        FROM tbl_member_profile mp
        INNER JOIN tbl_community_member_relation cmr ON mp.member_id = cmr.member_id
        ${whereClause}
        ORDER BY FIELD(mp.designation, 'committee member', 'sah mantri', 'mantri', 'up pramukh', 'pramukh') DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
      const data = await selectQuery(this.db, dataQuery, params);

      return { data, total };
    } catch (err) {
      console.error("Error in getAllMembers:", err);
      throw err;
    }
  }
  // Get member details
  async getMemberDetailsByUuid(member_uuid: string): Promise<any> {
    const query = `
      SELECT 
        member_id,
        first_name, 
        father_name,
        surname, 
        phone_number,
        profile_photo
      FROM 
        tbl_member_profile 
      WHERE 
        member_uuid = ?
    `;
    const rows = await selectQuery(this.db, query, [member_uuid]);
    return rows && rows.length > 0 ? rows[0] : null;
  }

  // Get donor by member id
  async getDonorByMemberId(member_id: string): Promise<any> {
    const query = `
      SELECT 
        * 
      FROM 
        tbl_donors 
      WHERE 
        member_id = ?
    `;
    const result = await selectQuery(this.db, query, [member_id]);

    // Check if result is an array with at least one element
    if (Array.isArray(result) && result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  }

  async getDonors(
    pageSize: number = 10,
    pageNumber: number = 1,
    donation_category?: string,
    donation_year?: string,
    community_id?: number
  ): Promise<{ data: any[]; total: number }> {
    const offset = (pageNumber - 1) * pageSize;

    let query = `
      SELECT 
        d.donor_id,
        d.member_id,
        d.donor_name,
        d.donor_mobile_no,
        d.is_lifetime_donor,
        d.donation_category,
        d.donation_year,
        d.added_on,
        d.updated_on,
        d.donor_photo,
        d.donor_type,
        m.profile_photo,
        m.*,
        f.number_of_family_members
      FROM tbl_donors d
      LEFT JOIN tbl_member_profile m ON d.member_id = m.member_id
      LEFT JOIN tbl_families f ON m.member_id = f.family_main_member_id
      WHERE d.community_id = ?
    `;

    const queryParams: (string | number)[] = [community_id!];

    if (donation_category) {
      query += ` AND d.donation_category = ?`;
      queryParams.push(donation_category);
    }

    if (donation_year) {
      query += ` AND d.donation_year = ?`;
      queryParams.push(donation_year);
    }

    query += ` ORDER BY d.added_on DESC LIMIT ${pageSize} OFFSET ${offset}`;

    const donors = await selectQuery(this.db, query, queryParams);

    // Count query with same filters
    let countQuery = `SELECT COUNT(*) as total FROM tbl_donors WHERE community_id = ?`;
    const countParams: (string | number)[] = [community_id!];

    if (donation_category) {
      countQuery += ` AND donation_category = ?`;
      countParams.push(donation_category);
    }

    if (donation_year) {
      countQuery += ` AND donation_year = ?`;
      countParams.push(donation_year);
    }

    const countResult = await selectQuery(this.db, countQuery, countParams);
    const total = countResult[0].total;

    return { data: donors, total };
  }

  // Get donor by ID
  async getDonorById(donor_id: string): Promise<any> {
    const query = "SELECT * FROM tbl_donors WHERE donor_id = ?";
    const result = await selectQuery(this.db, query, [donor_id]);

    return result.length > 0 ? result[0] : null;
  }

  // Delete donor
  async deleteDonor(donor_id: string, community_id: number): Promise<any> {
    const query =
      "DELETE FROM tbl_donors WHERE donor_id = ? AND community_id = ?";
    return await deleteQuery(this.db, query, [donor_id, community_id]);
  }

  async updateDonor(
    donor_id: string,
    donor_name: string,
    donor_photo: string | null,
    donor_mobile_no: string | null,
    donation_category: string | null,
    donation_year: number | null,
    is_lifetime_donor: number,
    donor_type: string | null,
    community_id: number
  ) {
    const query = `
    UPDATE tbl_donors
    SET 
      donor_name = ?,
      donor_photo = ?,
      donor_mobile_no = ?,
      donation_category = ?,
      donation_year = ?,
      is_lifetime_donor = ?,
      donor_type = ?
    WHERE donor_id = ? AND community_id = ?
  `;

    const [result] = await this.db.execute(query, [
      donor_name,
      donor_photo,
      donor_mobile_no,
      donation_category,
      donation_year,
      is_lifetime_donor,
      donor_type,
      donor_id,
      community_id,
    ]);
    return result;
  }
}
