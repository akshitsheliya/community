import { dbPool } from "../config/db";
import { insertQuery, selectQuery } from "../helpers/queryHelper";
import { v4 as uuidv4 } from "uuid";
import logger from "../utils/logger";

export interface Marksheet {
  id?: number;
  marksheet_uuid?: string;
  user_id?: number;
  marksheet_photo?: string;
  marksheet_year: string;
  student_name: string;
  standard: string;
  medium: string;
  percentage: string;
  stream: string;
  father_full_name?: string;
  father_phone_number: string;
  is_approved?: "1" | "0";
  approved_by_user_id?: number;
  rejection_reason?: string;
  added_on?: Date;
  updated_at?: Date;
  community_id?: number;
}

// Upload marksheet
export const addMarksheet = async (marksheet: Marksheet) => {
  // Verify active standards and last date for the given year
  const configQuery = `
    SELECT GROUP_CONCAT(marksheet_std SEPARATOR ',') as active_standards,
           MAX(marksheet_last_date_to_submit) as last_date
    FROM tbl_marksheet_configuration
    WHERE marksheet_year = ?
    AND is_active = 1;
  `;
  const configResult = await selectQuery(dbPool, configQuery, [
    marksheet.marksheet_year,
  ]);
  const activeStandardsStr = configResult[0]?.active_standards || "";
  const lastDate = configResult[0]?.last_date || null;

  if (!activeStandardsStr) {
    throw new Error("No active standards found for the given year");
  }

  // Check if today exceeds the last submission date
  const today = new Date();
  if (lastDate && new Date(lastDate) < today) {
    throw new Error("Submission date for this year has expired");
  }

  // Parse standards: support both range (e.g., '1-9') and explicit list (e.g., '1,2,3')
  const standardsList = activeStandardsStr.split(",").flatMap((std: string) => {
    if (std.includes("-")) {
      const [start, end] = std.split("-").map(Number);
      return Array.from({ length: end - start + 1 }, (_, i) =>
        (start + i).toString()
      );
    }
    return [std];
  });

  // Check if the provided standard is in the active list
  if (!standardsList.includes(marksheet.standard)) {
    throw new Error("Standard is not active for the given year");
  }

  // Proceed with original insertion
  const query = `
  INSERT INTO tbl_marksheets (
    marksheet_uuid, marksheet_year, student_name, standard, medium,
    percentage, stream, father_full_name, father_phone_number,
    marksheet_photo, user_id, community_id, added_on
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
`;
  const marksheet_uuid = uuidv4();

  const values = [
    marksheet_uuid,
    marksheet.marksheet_year,
    marksheet.student_name,
    marksheet.standard,
    marksheet.medium,
    marksheet.percentage,
    marksheet.stream,
    marksheet.father_full_name,
    marksheet.father_phone_number,
    marksheet.marksheet_photo,
    marksheet.user_id,
    marksheet.community_id, 
  ];

  await insertQuery(dbPool, query, values);
  return { success: true, marksheet_uuid };
};

// Get marksheet upload by logged in user
export const getMarksheetByUser = async (user_id: number, community_id: number) => {
  const query = `
    SELECT *
    FROM tbl_marksheets
    WHERE user_id = ? AND community_id = ?
  `;
  return await selectQuery(dbPool, query, [user_id, community_id]);
};


// Fetch user login data from tbl_logins using user_uuid
export const getLoginData = async (user_uuid: string) => {
  const query = `
    SELECT l.user_id, mp.is_demo_account
    FROM tbl_logins l
    JOIN tbl_member_profile mp ON l.member_id = mp.member_id
    WHERE l.user_uuid = ?
  `;
  return await selectQuery(dbPool, query, [user_uuid]);
};

export const getFilteredCommunityAdmins = async (
  community_id: number,
  isDemo: number
) => {
  try {
    const query = `
      SELECT 
        l.fcm_device_token,
        l.app_language,
        mp.member_id
      FROM tbl_member_profile mp
      INNER JOIN tbl_logins l 
          ON mp.member_id = l.member_id
      INNER JOIN tbl_community_member_relation cmr 
          ON mp.member_id = cmr.member_id
      WHERE 
          mp.is_community_admin = 1
      AND cmr.community_id = ?            -- STRICT: Only this community
      AND cmr.is_login_active = 1
      AND l.fcm_device_token IS NOT NULL
      AND (
            (mp.is_demo_account is null AND ? = 0)
         OR (mp.is_demo_account = 1 AND ? = 1)
          )
      AND NOT EXISTS (                   -- 🚀 BLOCK ADMINS IN MULTIPLE COMMUNITIES
        SELECT 1 
        FROM tbl_community_member_relation cmr2
        WHERE cmr2.member_id = mp.member_id
        GROUP BY cmr2.member_id
        HAVING COUNT(cmr2.community_id) > 1
      );
    `;

    //logger.info(`🔎 [${query}] Get Admins for community: ${community_id}`);

    return await selectQuery(dbPool, query, [
      community_id,
      isDemo,
      isDemo
    ]);
  } catch (error) {
    logger.error("Error fetching filtered community admins:", {
      error,
      isDemo,
      community_id,
    });
    throw error;
  }
};

// export const getFilteredCommunityAdmins = async (isDemo: number, community_id?: number) => {
//   try {
//     let query = `
//       SELECT l.fcm_device_token, l.app_language, mp.member_id
//       FROM tbl_member_profile mp
//       JOIN tbl_logins l ON mp.member_id = l.member_id
//       JOIN tbl_community_member_relation cmr ON mp.member_id = cmr.member_id
//       WHERE mp.is_community_admin = 1
//         AND l.fcm_device_token IS NOT NULL
//         AND (mp.is_demo_account = ? OR (mp.is_demo_account IS NULL AND ? = 0))
//     `;
//     const queryParams: any[] = [isDemo, isDemo];

//     if (community_id) {
//       query += ` AND cmr.community_id = ?`;
//       queryParams.push(community_id);
//     }

//     return await selectQuery(dbPool, query, queryParams);
//   } catch (error) {
//     logger.error("Error fetching filtered community admins:", {
//       error,
//       isDemo,
//       community_id,
//     });
//     throw error;
//   }
// };

// export const getAllCommunityAdmins = async () => {
//   const query = `
//   SELECT l.fcm_device_token, l.app_language, mp.member_id
//   FROM tbl_member_profile mp
//   JOIN tbl_logins l ON mp.member_id = l.member_id
//   WHERE mp.is_community_admin = 1
//     AND l.fcm_device_token IS NOT NULL
//     AND (mp.is_demo_account = ? OR (mp.is_demo_account IS NULL AND ? = 0))
// `;
//   return await selectQuery(dbPool, query);
// };


interface FilterOptions {
  standard?: string;
  stream?: string;
  medium?: string;
  marksheet_year?: string;
  is_approved?: number | null;
  rejection_reason?: string;
}

export const getMarksheets = async (
  filters: FilterOptions,
  pageSize: number = 50,
  pageNumber: number = 1,
  community_id?: number
) => {
  const offset = (pageNumber - 1) * pageSize;

  // Build the base query and conditions
  let baseQuery = `FROM tbl_marksheets m`;
  const conditions: string[] = [];
  const params: any[] = [];

  // Existing filters
  if (filters.standard) {
    conditions.push(`m.standard = ?`);
    params.push(filters.standard);
  }

  if (filters.stream) {
    conditions.push(`m.stream = ?`);
    params.push(filters.stream);
  }

  if (filters.medium) {
    conditions.push(`m.medium = ?`);
    params.push(filters.medium);
  }

  if (filters.marksheet_year) {
    conditions.push(`m.marksheet_year = ?`);
    params.push(filters.marksheet_year);
  }

  // Approved Marksheet Filter
  if (filters.is_approved !== undefined && filters.is_approved !== null) {
    conditions.push(`m.is_approved = ?`);
    params.push(filters.is_approved);
  }

  // Rejected Marksheet Filter
  if (
    filters.rejection_reason !== undefined &&
    filters.rejection_reason !== null
  ) {
    conditions.push(`m.rejection_reason IS NOT NULL AND m.rejection_reason != ''`);
    params.push(filters.rejection_reason);
  }

  if (community_id) {
    conditions.push(`m.community_id = ?`);
    params.push(community_id);
  }

  // Default condition (Unapproved/Unrejected Marksheets)
  if (conditions.length === 0) {
    conditions.push(
      `(m.is_approved IS NULL OR m.is_approved = 0) AND (m.rejection_reason IS NULL OR m.rejection_reason = '')`
    );
  }

  const whereClause =
    conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";

  // Get total count first
  const countQuery = `SELECT COUNT(*) as total ${baseQuery}${whereClause}`;
  const countResult = await selectQuery(dbPool, countQuery, params);
  const total = countResult[0].total;

  // Then get paginated data
  const dataQuery = `
    SELECT
      m.*,
      (
        SELECT CONCAT(ap.surname, ' ', ap.first_name, ' ', ap.father_name)
        FROM tbl_logins al
        INNER JOIN tbl_member_profile ap ON al.member_id = ap.member_id
        WHERE al.user_id = m.approved_by_user_id
        LIMIT 1
      ) AS approved_by_name
    ${baseQuery}
    ${whereClause}
    ORDER BY m.added_on DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `;

  // Use only the filter params, not the pagination params
  const marksheets = await selectQuery(dbPool, dataQuery, params);

  return {
    data: marksheets,
    total: total,
  };
};

export const getMarksheetById = async (userId: number) => {
  const [rows]: any = await dbPool.query(
    "SELECT * FROM tbl_marksheets WHERE user_id = ?",
    [userId]
  );
  return rows;
};

export const deleteMarksheetById = async (marksheet_uuid: string, community_id: number) => {
  const [result]: any = await dbPool.query(
    "DELETE FROM tbl_marksheets WHERE marksheet_uuid = ? AND community_id = ?",
    [marksheet_uuid, community_id]
  );
  return result;
};

//approve marksheet
export const approveMarksheetQuery = async (
  marksheetUuid: string,
  adminId: number,
  community_id: number
) => {
  if (!marksheetUuid || typeof marksheetUuid !== "string") {
    throw new Error("Invalid marksheet UUID passed to approveMarksheetQuery");
  }

  if (!Number.isInteger(adminId) || adminId <= 0) {
    throw new Error("Invalid admin ID passed to approveMarksheetQuery");
  }

  if (!Number.isInteger(community_id) || community_id <= 0) {
    throw new Error("Invalid community ID passed to approveMarksheetQuery");
  }

  let connection;
  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    // Check if student_rank column exists
    const [columns]: any = await connection.query(
      "SHOW COLUMNS FROM tbl_marksheets LIKE 'student_rank'"
    );
    if (!columns.length) {
      throw new Error(
        "Column 'student_rank' does not exist in tbl_marksheets. Please add it with: ALTER TABLE tbl_marksheets ADD COLUMN student_rank INT DEFAULT 0;"
      );
    }

    // Check the current status of the marksheet
    const [statusRows]: any = await connection.query(
      "SELECT is_approved, rejection_reason, community_id  FROM tbl_marksheets WHERE marksheet_uuid = ?",
      [marksheetUuid]
    );

    if (!statusRows.length) {
      await connection.rollback();
      return { success: false, message: "Marksheet not found" };
    }

    const { is_approved, rejection_reason, community_id } = statusRows[0];

    // Check if already approved
    if (is_approved === 1) {
      await connection.rollback();
      return { success: false, message: "Marksheet already approved" };
    }

    // Check if already rejected
    if (is_approved === 0 && rejection_reason) {
      await connection.rollback();
      return { success: false, message: "Marksheet already rejected" };
    }

    // Approve the marksheet
    const [result]: any = await connection.query(
      "UPDATE tbl_marksheets SET is_approved = 1, approved_by_user_id = ?, updated_at = NOW() WHERE marksheet_uuid = ?",
      [adminId, marksheetUuid]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return { success: false, message: "Failed to approve marksheet" };
    }

    // Fetch marksheet_year from the approved marksheet
    const [marksheetRows]: any = await connection.query(
      "SELECT marksheet_year, standard, medium, stream FROM tbl_marksheets WHERE marksheet_uuid = ?",
      [marksheetUuid]
    );

    if (!marksheetRows.length) {
      await connection.rollback();
      return {
        success: false,
        message: "Marksheet data not found after approval",
      };
    }

    const { marksheet_year } = marksheetRows[0];

    // Calculate top 5 rankings for all groups in the same marksheet_year
    const standards = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const mediums = ["english", "gujarati"];
    const streams = ["Science", "Commerce", "Arts"];

    for (const standard of standards) {
      for (const medium of mediums) {
        if (["11", "12"].includes(standard)) {
          for (const stream of streams) {
            await assignTop5Ranks(
              connection,
              marksheet_year,
              standard,
              medium,
              stream
            );
          }
        } else {
          await assignTop5Ranks(
            connection,
            marksheet_year,
            standard,
            medium,
            null
          );
        }
      }
    }

    await connection.commit();
    return { success: true, message: "Marksheet approved successfully" };
  } catch (error) {
    if (connection) await connection.rollback();
    // console.error('❌ Transaction failed:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const getMarksheetDetails = async (
  marksheetUuid: string
): Promise<any> => {
  try {
    const [result]: any = await dbPool.query(
      `SELECT m.student_name, m.percentage, m.rejection_reason, l.fcm_device_token, l.member_id, l.app_language
       FROM tbl_marksheets m
       JOIN tbl_logins l ON m.user_id = l.user_id  
       WHERE m.marksheet_uuid = ?`,
      [marksheetUuid]
    );

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    return null;
  }
};

//reject marksheet
export const rejectMarksheetByUuid = async (
  marksheet_uuid: string,
  rejectionReason: string,
  adminId: number,
  community_id: number
) => {
  if (!marksheet_uuid || typeof marksheet_uuid !== "string") {
    throw new Error("Invalid marksheet UUID passed to rejectMarksheetById");
  }

  if (!rejectionReason || typeof rejectionReason !== "string") {
    throw new Error("Rejection reason is required and must be a string");
  }

  if (!Number.isInteger(adminId) || adminId <= 0) {
    throw new Error("Invalid admin ID passed to rejectMarksheetById");
  }

  if (!Number.isInteger(community_id) || community_id <= 0) {
    throw new Error("Invalid community ID passed to rejectMarksheetById");
  }

  let connection;
  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    // Check the current status of the marksheet
    const [statusRows]: any = await connection.query(
      "SELECT is_approved, rejection_reason FROM tbl_marksheets WHERE marksheet_uuid = ?",
      [marksheet_uuid]
    );

    if (!statusRows.length) {
      await connection.rollback();
      return { success: false, message: "Marksheet not found" };
    }

    const { is_approved, rejection_reason } = statusRows[0];

    // Check if already approved
    if (is_approved === 1) {
      await connection.rollback();
      return { success: false, message: "Marksheet already approved" };
    }

    // Check if already rejected
    if (is_approved === 0 && rejection_reason) {
      await connection.rollback();
      return { success: false, message: "Marksheet already rejected" };
    }

    // Proceed with rejection
    const [result]: any = await connection.query(
      "UPDATE tbl_marksheets SET is_approved = 0, rejection_reason = ?, approved_by_user_id = ?, updated_at = NOW() WHERE marksheet_uuid = ?",
      [rejectionReason, adminId, marksheet_uuid]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return { success: false, message: "Failed to reject marksheet" };
    }

    await connection.commit();
    return { success: true, message: "Marksheet rejected successfully" };
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error in rejectMarksheetById:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

async function assignTop5Ranks(
  connection: any,
  marksheetYear: string,
  standard: string,
  medium: string,
  stream: string | null
) {
  try {
    // Reset student_rank to 0 for this group
    let resetQuery = `
      UPDATE tbl_marksheets
      SET student_rank = 0
      WHERE marksheet_year = ? AND standard = ? AND medium = ? AND is_approved = 1
    `;
    const resetParams = [marksheetYear, standard, medium];
    if (stream) {
      resetQuery += ` AND stream = ?`;
      resetParams.push(stream);
    } else {
      resetQuery += ` AND stream IS NULL`;
    }
    const [resetResult]: any = await connection.query(resetQuery, resetParams);
    // console.log(`Reset student_rank for Std ${standard}, ${medium}${stream ? `, ${stream}` : ''}: ${resetResult.affectedRows} rows affected`);

    // Fetch all students with percentage as VARCHAR (no casting in SQL)
    let selectQuery = `
      SELECT student_name, percentage
      FROM tbl_marksheets
      WHERE marksheet_year = ? AND standard = ? AND medium = ? AND is_approved = 1
    `;
    const selectParams = [marksheetYear, standard, medium];
    if (stream) {
      selectQuery += ` AND stream = ?`;
      selectParams.push(stream);
    } else {
      selectQuery += ` AND stream IS NULL`;
    }

    const [rows]: any = await connection.query(selectQuery, selectParams);

    if (rows.length === 0) {
      // console.log(`No students found for Std ${standard}, ${medium}${stream ? `, ${stream}` : ''}`);
      return;
    }

    // Sort rows by percentage numerically in descending order
    const sortedRows = rows.sort((a: any, b: any) => {
      const aPercentage = parseFloat(a.percentage);
      const bPercentage = parseFloat(b.percentage);
      return bPercentage - aPercentage; // Descending order
    });

    // Assign ranks based on unique percentages, capping at 5
    let currentRank = 1;
    let previousPercentage: number | null = null;
    let uniqueRankCount = 0;

    for (let i = 0; i < sortedRows.length; i++) {
      const student = sortedRows[i];
      const currentPercentage = parseFloat(student.percentage); // Convert VARCHAR to number

      // Determine the rank to assign
      let rankToAssign = 0; // Default to 0 for students beyond top 5 ranks

      if (
        previousPercentage === null ||
        Math.abs(previousPercentage - currentPercentage) > 0.001
      ) {
        // Handle float comparison
        uniqueRankCount++;
        if (uniqueRankCount <= 5) {
          currentRank = uniqueRankCount; // Assign ranks 1-5 for top 5 unique percentages
          rankToAssign = currentRank;
        } // Else, rankToAssign remains 0
        previousPercentage = currentPercentage;
      } else if (uniqueRankCount <= 5) {
        rankToAssign = currentRank; // Tie with previous student, use same rank if within top 5
      }

      // Update the student's rank using the original VARCHAR percentage
      const updateQuery = `
        UPDATE tbl_marksheets
        SET student_rank = ?
        WHERE marksheet_year = ? AND standard = ? AND medium = ? 
          ${stream ? "AND stream = ?" : "AND stream IS NULL"} 
          AND student_name = ? AND percentage = ?
      `;
      const updateParams = stream
        ? [
            rankToAssign,
            marksheetYear,
            standard,
            medium,
            stream,
            student.student_name,
            student.percentage,
          ]
        : [
            rankToAssign,
            marksheetYear,
            standard,
            medium,
            student.student_name,
            student.percentage,
          ];
      const [updateResult]: any = await connection.query(
        updateQuery,
        updateParams
      );

      if (updateResult.affectedRows === 0) {
        console.warn(
          `No rows updated for student_rank ${rankToAssign} for ${
            student.student_name
          } in Std ${standard}, ${medium}${stream ? `, ${stream}` : ""}`
        );
      }
    }

    // console.log(`✅ Assigned student_rank for Std ${standard}, ${medium}${stream ? `, ${stream}` : ''} - Total students ranked: ${sortedRows.length}`);
  } catch (error) {
    // console.error(`❌ Error assigning student_rank for Std ${standard}, ${medium}${stream ? `, ${stream}` : ''}:`, error);
    throw error;
  }
}

//edit marksheet
export const editMarksheetById = async (
  marksheet_uuid: string,
  updateData: any,
  community_id: number
) => {
  try {
    const allowedFields = [
      "marksheet_year",
      "student_name",
      "standard",
      "medium",
      "percentage",
      "stream",
      "father_full_name",
      "father_phone_number",
    ];

    const validUpdateData: Record<string, any> = {};
    for (const key of Object.keys(updateData)) {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        validUpdateData[key] = updateData[key];
      }
    }

    if (Object.keys(validUpdateData).length === 0) {
      return { error: "no_valid_fields" };
    }

    // Add updated_at timestamp
    validUpdateData.updated_at = new Date();

    // Build the query components
    const placeholders = Object.keys(validUpdateData)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = [...Object.values(validUpdateData), marksheet_uuid, community_id];

    // Get a connection from the pool
    const connection = await dbPool.getConnection();
    try {
      await connection.beginTransaction();

      const [result]: any = await connection.query(
        `UPDATE tbl_marksheets SET ${placeholders} WHERE marksheet_uuid = ? AND community_id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        connection.release();
        return { error: "marksheet_not_found" };
      }

      // Fetch the updated marksheet data
      const [updatedMarksheet]: any = await connection.query(
        "SELECT * FROM tbl_marksheets WHERE marksheet_uuid = ? AND community_id = ?",
        [marksheet_uuid, community_id]
      );

      await connection.commit();
      connection.release();

      return { success: true, data: updatedMarksheet[0] };
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error in editMarksheetById:", error);
    throw error;
  }
};

//delete marksheet
export const getUserIdByUuid = async (user_uuid: string) => {
  const connection = await dbPool.getConnection();
  try {
    const [rows]: any = await connection.query(
      "SELECT user_id FROM tbl_logins WHERE user_uuid = ?",
      [user_uuid]
    );
    return rows.length > 0 ? rows[0].user_id : null;
  } finally {
    connection.release();
  }
};

export const getMarksheetOwnerId = async (marksheet_uuid: string) => {
  const connection = await dbPool.getConnection();
  try {
    const [rows]: any = await connection.query(
      "SELECT user_id FROM tbl_marksheets WHERE marksheet_uuid = ?",
      [marksheet_uuid]
    );
    return rows.length > 0 ? rows[0].user_id : null;
  } finally {
    connection.release();
  }
};
