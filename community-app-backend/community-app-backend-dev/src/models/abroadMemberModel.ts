import { Pool } from "mysql2/promise";
import { selectQuery } from "../helpers/queryHelper";

export interface UserPayload {
  user_id: number;
  user_uuid: string;
  phone_number?: string;
  member_id?: number;
}

declare module "express" {
  interface Request {
    user?: UserPayload;
  }
}

export class AbroadMemberModel {
  private db: Pool;

  constructor(dbPool: Pool) {
    this.db = dbPool;
  }

  async getAllMembers(community_id: number) {
    const query = `
      SELECT 
        am.id,
        am.abroad_uuid,
        am.member_id,
        am.full_name,
        am.passport_photo,
        am.govt_private,
        am.designation,
        am.career,
        am.experience_year,
        am.success_mantra,
        am.contact_number,
        am.country,
        am.city,
        am.thoughts_on_committee,
        am.created_at,
        am.updated_at,
        mp.member_uuid
      FROM 
        tbl_abroad_member am
      LEFT JOIN 
        tbl_member_profile mp ON am.member_id = mp.member_id
      WHERE 
        am.community_id = ?
    `;
    return await selectQuery(this.db, query, [community_id]);
  }
  

  async getMemberByUuid(abroad_uuid: string, community_id: number) {
    const query = `
      SELECT 
        am.id,
        am.abroad_uuid,
        am.member_id,
        am.full_name,
        am.passport_photo,
        am.govt_private,
        am.designation,
        am.career,
        am.experience_year,
        am.success_mantra,
        am.contact_number,
        am.country,
        am.city,
        am.thoughts_on_committee,
        am.created_at,
        am.updated_at,
        mp.member_uuid
      FROM 
        tbl_abroad_member am
      LEFT JOIN 
        tbl_member_profile mp ON am.member_id = mp.member_id
      WHERE 
        am.abroad_uuid = ? AND am.community_id = ?
    `;
  
    const [rows] = await this.db.execute(query, [abroad_uuid, community_id]);
    return (rows as any).length > 0 ? (rows as any)[0] : null;
  }
  

  async getMemberByMemberId(member_id: number) {
    const query = `
      SELECT 
        am.id,
        am.abroad_uuid,
        am.member_id,
        am.full_name,
        am.passport_photo,
        am.govt_private,
        am.designation,
        am.career,
        am.experience_year,
        am.success_mantra,
        am.contact_number,
        am.country,
        am.city,
        am.thoughts_on_committee,
        am.created_at,
        am.updated_at,
        mp.member_uuid
      FROM 
        tbl_abroad_member am
      LEFT JOIN 
        tbl_member_profile mp ON am.member_id = mp.member_id
      WHERE 
        am.member_id = ?
    `;
    const [rows] = await this.db.execute(query, [member_id]);
    return rows as any;
  }

  async getMemberIdFromUserUuid(user_uuid: string): Promise<number | null> {
    const query = `
      SELECT member_id 
      FROM tbl_logins 
      WHERE user_uuid = ?
    `;
    const [rows] = await this.db.execute(query, [user_uuid]);
    return (rows as any).length > 0 ? (rows as any)[0].member_id : null;
  }

  async addMember(
    abroad_uuid: string,
    member_id: number,
    full_name: string,
    passport_photo: string | null,
    govt_private: string | null,
    designation: string | null,
    career: string | null,
    experience_year: number | null,
    success_mantra: string | null,
    contact_number: string | null,
    country: string | null,
    city: string | null,
    thoughts_on_committee: string | null,
    community_id: number,
    added_by: number
  ) {
    const query = `
      INSERT INTO tbl_abroad_member 
        (abroad_uuid, member_id, full_name, passport_photo, govt_private, designation, 
         career, experience_year, success_mantra, contact_number, country, city, 
         thoughts_on_committee, community_id, added_by)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await this.db.execute(query, [
      abroad_uuid, member_id, full_name, passport_photo, govt_private, designation,
      career, experience_year, success_mantra, contact_number, country, city,
      thoughts_on_committee, community_id, added_by
    ]);
    return result;
  }
  

  async updateMember(
    abroad_uuid: string,
    full_name: string,
    passport_photo: string | null,
    govt_private: string | null,
    designation: string | null,
    career: string | null,
    experience_year: number | null,
    success_mantra: string | null,
    contact_number: string | null,
    country: string | null,
    city: string | null,
    thoughts_on_committee: string | null,
    community_id: number
  ) {
    const query = `
      UPDATE tbl_abroad_member
      SET 
        full_name = ?,
        passport_photo = ?,
        govt_private = ?,
        designation = ?,
        career = ?,
        experience_year = ?,
        success_mantra = ?,
        contact_number = ?,
        country = ?,
        city = ?,
        thoughts_on_committee = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE 
        abroad_uuid = ? AND community_id = ?
    `;
    const [result] = await this.db.execute(query, [
      full_name, passport_photo, govt_private, designation, career,
      experience_year, success_mantra, contact_number, country, city, thoughts_on_committee,
      abroad_uuid, community_id
    ]);
    return result;
  }

  async deleteMember(abroad_uuid: string, community_id: number) {
    const query = `
      DELETE FROM tbl_abroad_member
      WHERE abroad_uuid = ? AND community_id = ?
    `;
    const [result] = await this.db.execute(query, [abroad_uuid, community_id]);
    return result;
  }
}