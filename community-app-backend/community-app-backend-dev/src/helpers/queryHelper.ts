import { Pool } from "mysql2/promise";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// Helper function to execute SELECT queries
export const selectQuery = async (
  db: Pool,
  query: string,
  params?: any[]
): Promise<RowDataPacket[]> => {
  const [rows] = await db.execute<RowDataPacket[]>(query, params);
  return rows;
};

// Helper function to execute INSERT queries
export const insertQuery = async (
  db: Pool,
  query: string,
  params: any[]
): Promise<ResultSetHeader> => {
  const [result] = await db.execute<ResultSetHeader>(query, params);
  return result;
};

// Helper function to execute DELETE queries
export const deleteQuery = async (
  db: Pool,
  query: string,
  params: any[]
): Promise<ResultSetHeader> => {
  const [result] = await db.execute<ResultSetHeader>(query, params);
  return result;
};

// Helper function to execute UPDATE queries
export const updateQuery = async (
  db: Pool,
  query: string,
  params: any[]
): Promise<ResultSetHeader> => {
  const [result] = await db.execute<ResultSetHeader>(query, params);
  return result;
};


export const cleanQueryForLog = (query: string) => {
  return query.replace(/\s+/g, " ").trim();
};


