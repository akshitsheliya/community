import { dbPool } from './src/config/db';

async function checkDuplicates() {
  try {
    const [rows]: any = await dbPool.query(`
      SELECT from_member_id, to_member_id, COUNT(*) as cnt
      FROM tbl_family_relationships
      WHERE is_active = 1
      GROUP BY from_member_id, to_member_id
      HAVING cnt > 1;
    `);
    console.log("Duplicate rows:", rows);

    if (rows.length > 0) {
      console.log("Deleting duplicates...");
      await dbPool.query(`
        DELETE fr1 FROM tbl_family_relationships fr1
        JOIN tbl_family_relationships fr2 
          ON fr1.from_member_id = fr2.from_member_id
          AND fr1.to_member_id = fr2.to_member_id
          AND fr1.relationship_id > fr2.relationship_id
        WHERE fr1.is_active = 1 AND fr2.is_active = 1;
      `);
      console.log("Duplicates deleted.");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

checkDuplicates();
