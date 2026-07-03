import { Pool } from "mysql2/promise";
import { dbPool } from "../config/db";
import logger from "../utils/logger";

export class AwardEligibleModel {
  private db: Pool;

  constructor() {
    this.db = dbPool;
  }

  async getAwardEligibleStudents(
    community_id: number,
    standard: string = "",
    stream: string = "",
    medium: string = "",
    marksheet_year: string = "",
    approvedOnly: boolean = false
  ): Promise<any[]> {
    let dataQuery = `
      SELECT 
        tm.marksheet_uuid,
        tm.marksheet_photo,
        tm.student_name,
        tm.standard,
        tm.medium,
        tm.stream,
        tm.percentage,
        tm.student_rank,
        tm.marksheet_year,
        tm.father_full_name,
        tm.father_phone_number
      FROM tbl_marksheets tm
      INNER JOIN tbl_marksheet_configuration mc
        ON mc.community_id = tm.community_id
      WHERE mc.is_active = 1
        AND tm.community_id = ?
    `;

    // Always include community_id as first parameter
    let params: any[] = [community_id];
    let conditions: string[] = [];

    if (standard) {
      conditions.push(`LOWER(tm.standard) = ?`);
      params.push(standard.toLowerCase());
    }

    if (stream) {
      conditions.push(`LOWER(tm.stream) = ?`);
      params.push(stream.toLowerCase());
    }

    if (medium) {
      conditions.push(`LOWER(tm.medium) = ?`);
      params.push(medium.toLowerCase());
    }

    if (marksheet_year) {
      conditions.push(`tm.marksheet_year = ?`);
      params.push(marksheet_year);
    }

    if (approvedOnly) {
      conditions.push(`tm.is_approved = 1`);
    }

    if (conditions.length > 0) {
      dataQuery += ` AND ` + conditions.join(" AND ");
    }

    dataQuery += ` AND tm.student_rank BETWEEN 1 AND 5 
                  ORDER BY tm.student_rank ASC`;

    logger.debug(`Executing query: ${dataQuery} with params: ${JSON.stringify(params)}`);

    try {
      const [rows] = await this.db.execute<any[]>(dataQuery, params);
      logger.debug(
        `Query returned ${rows.length} rows for community=${community_id}, std=${standard}, medium=${medium}, stream=${stream}, year=${marksheet_year}`
      );
      return rows as any[];
    } catch (error: any) {
      logger.error(`Error executing getAwardEligibleStudents query: ${error.message}`, {
        query: dataQuery,
        params,
        stack: error.stack,
      });
      throw error;
    }
  }

  async getTop5ForAllGroups(community_id: number): Promise<any[]> {
    const [configRows] = await this.db.execute(
      `
      SELECT marksheet_std, marksheet_year
      FROM tbl_marksheet_configuration
      WHERE is_active = 1
        AND community_id = ?
      `,
      [community_id]
    );

    const configs = configRows as { marksheet_std: string; marksheet_year: string }[];

    const standards: { standard: string; marksheet_year: string }[] = [];
    configs.forEach((config) => {
      const stdList = config.marksheet_std.split(',').map((std) => std.trim());
      stdList.forEach((std) => {
        standards.push({
          standard: std,
          marksheet_year: config.marksheet_year,
        });
      });
    });

    logger.info(`Found ${standards.length} active standards for community ${community_id}`);

    const mediums = ['english', 'gujarati'];
    const streams = ['science', 'commerce', 'arts'];
    const result: any[] = [];

    for (const { standard, marksheet_year } of standards) {
      for (const medium of mediums) {
        if (['11', '12'].includes(standard)) {
          // For Std 11 & 12 → loop through streams
          for (const stream of streams) {
            const students = await this.getAwardEligibleStudents(
              community_id,
              standard,
              stream,
              medium,
              marksheet_year,
              true
            );
            result.push({
              standard,
              medium,
              stream,
              marksheet_year,
              students,
            });
          }
        } else {
          // For other standards → no stream
          const students = await this.getAwardEligibleStudents(
            community_id,
            standard,
            '', // empty stream
            medium,
            marksheet_year,
            true
          );
          result.push({
            standard,
            medium,
            stream: null,
            marksheet_year,
            students,
          });
        }
      }
    }

    return result;
  }

  async getAllApprovedForAllGroups(community_id: number): Promise<any[]> {
    const [rows] = await this.db.execute<any[]>(
      `
      SELECT
        tm.student_name,
        tm.father_full_name,
        tm.standard,
        tm.medium,
        tm.stream,
        tm.marksheet_year
      FROM tbl_marksheets tm
      WHERE tm.community_id = ?
        AND tm.is_approved = 1
      ORDER BY
        CAST(tm.standard AS UNSIGNED) ASC,
        tm.id ASC,
        LOWER(tm.medium) ASC
      `,
      [community_id]
    );

    const grouped = new Map<string, any>();

    rows.forEach((row: any) => {
      const standard = String(row.standard ?? "");
      const medium = String(row.medium ?? "");
      const stream = row.stream ?? null;
      const marksheet_year = row.marksheet_year ?? "";
      const key = `${standard}|${medium}|${stream ?? ""}|${marksheet_year}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          standard,
          medium,
          stream,
          marksheet_year,
          students: [],
        });
      }

      grouped.get(key).students.push({
        student_name: row.student_name,
        father_full_name: row.father_full_name,
      });
    });

    return Array.from(grouped.values());
  }
}
