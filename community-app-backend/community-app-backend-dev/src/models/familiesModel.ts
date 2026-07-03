import { Pool } from "mysql2/promise";
import logger from "../utils/logger";

import * as mysql from "mysql2";
import { cleanQueryForLog } from "../helpers/queryHelper";


export interface IFamily {
  family_sr_id: number;
  family_uuid: string;
  family_main_member_id: number;
  number_of_family_members: number;
  added_on: string;
  updated_on: string;
}

export class TblFamilies {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }


  public async getAllFamilyDetails(
    pageSize: number = 10,
    pageNumber: number = 1,
    search: string = '',
    communityId?: number,
    userId?: number
  ): Promise<any> {
    const offset = (pageNumber - 1) * pageSize;
    const searchTokens = (search || "").trim().split(/\s+/).filter(Boolean);

    const baseCondition = `
      cmr.is_login_active = 1 AND cmr.is_approved = 1 AND 
      (mp.is_demo_account = 0 OR mp.is_demo_account IS NULL)
      ${communityId ? 'AND cmr.community_id = ?' : ''}
      AND f.family_sr_id = cmr.family_sr_id
    `;

    const baseJoins = `
      FROM tbl_families f
      JOIN tbl_member_profile mp ON f.family_main_member_id = mp.member_id
      JOIN tbl_logins l ON mp.member_id = l.member_id
      JOIN tbl_community_member_relation cmr ON mp.member_id = cmr.member_id
      `;

    logger.info("step 1-----------");
    if (searchTokens.length === 0) {
      logger.info("step 2-----------");
      const countQuery = `
        SELECT COUNT(*) as total, SUM(f.number_of_family_members) as totalMembers
        ${baseJoins}
        WHERE ${baseCondition}
    `;
      const [countResult] = await this.db.query(
        countQuery,
        communityId ? [communityId] : []
      );
      const total = Array.isArray(countResult) && countResult.length > 0 ? (countResult[0] as any).total : 0;
      const totalMembers = Array.isArray(countResult) && countResult.length > 0 ? (countResult[0] as any).totalMembers : 0;




      const dataQuery = `
  SELECT
    f.family_sr_id,
    f.number_of_family_members,
    f.family_uuid,
    cmr.family_number,
    mp.address,
    mp.phone_number,
    mp.profile_photo,
    CONCAT(mp.surname, ' ', mp.first_name, ' ', mp.father_name) AS main_member_name
  ${baseJoins}
  WHERE ${baseCondition}
  ORDER BY f.family_sr_id ASC
  LIMIT ${pageSize} OFFSET ${offset}
`;

      const dataParams = communityId ? [communityId] : [];

      const fullQuery = mysql.format(dataQuery, dataParams);

      const logQuery = cleanQueryForLog(fullQuery);


      logger.info(`[${userId}] Family DATA SQL: ` + logQuery, {
        user_id: userId,
        communityId
      });

      console.log("---------------------------------------------------");

      // execute the query normally
      const [dataResult] = await this.db.query(dataQuery, dataParams);



      return { data: dataResult, total, totalMembers };
    } else {
      logger.info("step 3-----------");
      const searchConditions = searchTokens
        .map(() => "(mp.surname LIKE ? OR mp.first_name LIKE ? OR mp.father_name LIKE ?)")
        .join(" AND ");
      const searchParams = searchTokens.flatMap((token) => {
        const pattern = `%${token}%`;
        return [pattern, pattern, pattern];
      });
      const countQuery = `
        SELECT COUNT(*) as total, SUM(f.number_of_family_members) as totalMembers
        ${baseJoins}
        WHERE ${baseCondition} AND ${searchConditions}
      `;
      const [countResult] = await this.db.query(
        countQuery,
        communityId ? [communityId, ...searchParams] : searchParams
      );
      const total = Array.isArray(countResult) && countResult.length > 0 ? (countResult[0] as any).total : 0;
      const totalMembers = Array.isArray(countResult) && countResult.length > 0 ? (countResult[0] as any).totalMembers : 0;

      const dataQuery = `
        SELECT
    f.family_sr_id,
      f.number_of_family_members,
      f.family_uuid,
      cmr.family_number,
      mp.address,
      mp.phone_number,
      mp.profile_photo,
      CONCAT(mp.surname, ' ', mp.first_name, ' ', mp.father_name) AS main_member_name
        ${baseJoins}
        WHERE ${baseCondition} AND ${searchConditions}
      ORDER BY f.family_sr_id ASC
        LIMIT ${pageSize} OFFSET ${offset}
    `;
      const dataParams = communityId ? [communityId, ...searchParams] : searchParams;

      const fullDataQuery = mysql.format(dataQuery, dataParams);

      logger.info(`[${userId}] Family DATA SQL-withsearch: ` + fullDataQuery, {
        user_id: userId,
        communityId
      });

      const [dataResult] = await this.db.query(
        dataQuery,
        dataParams
      );

      return { data: dataResult, total, totalMembers };
    }
  }


  // Fetch members by family ID with pagination and search
  public async getMembersByFamilyId(
    familyId: string,
    pageSize: number = 10,
    pageNumber: number = 1,
    search: string = ''
  ): Promise<any> {
    const offset = (pageNumber - 1) * pageSize;
    const searchTokens = (search || "").trim().split(/\s+/).filter(Boolean);

    if (searchTokens.length === 0) {
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM tbl_member_profile 
        WHERE family_sr_id = ?
      `;
      const [countResult] = await this.db.query(countQuery, [familyId]);
      const total = Array.isArray(countResult) && countResult.length > 0 ? (countResult[0] as any).total : 0;

      const dataQuery = `
        SELECT *
      FROM tbl_member_profile
        WHERE family_sr_id = ?
      ORDER BY member_id DESC
        LIMIT ${pageSize} OFFSET ${offset}
    `;
      const [dataResult] = await this.db.query(dataQuery, [familyId]);

      return { data: dataResult, total };
    } else {
      const searchConditions = searchTokens
        .map(() => "(surname LIKE ? OR first_name LIKE ? OR father_name LIKE ?)")
        .join(" AND ");
      const searchParams = searchTokens.flatMap((token) => {
        const pattern = `%${token}%`;
        return [pattern, pattern, pattern];
      });

      const countQuery = `
        SELECT COUNT(*) as total 
        FROM tbl_member_profile 
        WHERE family_sr_id = ?
      AND ${searchConditions}
        `;
      const [countResult] = await this.db.query(countQuery, [familyId, ...searchParams]);
      const total = Array.isArray(countResult) && countResult.length > 0 ? (countResult[0] as any).total : 0;

      const dataQuery = `
        SELECT *
      FROM tbl_member_profile
        WHERE family_sr_id = ?
      AND ${searchConditions}
        ORDER BY member_id DESC
        LIMIT ${pageSize} OFFSET ${offset}
    `;
      const [dataResult] = await this.db.query(dataQuery, [familyId, ...searchParams]);

      return { data: dataResult, total };
    }
  }
}
