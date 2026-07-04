const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await conn.query('DELETE FROM tbl_family_relationships');
    await conn.query('ALTER TABLE tbl_family_relationships AUTO_INCREMENT = 1');

    await conn.query(`
      INSERT INTO tbl_family_relationships 
      (relationship_uuid, from_member_id, to_member_id, relationship_label, inverse_label, community_id, added_by_member_id, is_verified, is_active) 
      VALUES
      (UUID(), 1, 2, 'son', 'father', 1, 1, 1, 1),
      (UUID(), 2, 1, 'father', 'son', 1, 1, 1, 1),
      (UUID(), 2, 3, 'wife', 'husband', 1, 1, 1, 1),
      (UUID(), 3, 2, 'husband', 'wife', 1, 1, 1, 1),
      (UUID(), 4, 5, 'son', 'father', 1, 1, 1, 1),
      (UUID(), 5, 4, 'father', 'son', 1, 1, 1, 1),
      (UUID(), 6, 7, 'wife', 'husband', 1, 1, 1, 1),
      (UUID(), 7, 6, 'husband', 'wife', 1, 1, 1, 1),
      (UUID(), 6, 8, 'son', 'father', 1, 1, 1, 1),
      (UUID(), 8, 6, 'father', 'son', 1, 1, 1, 1),
      (UUID(), 7, 8, 'son', 'mother', 1, 1, 1, 1),
      (UUID(), 8, 7, 'mother', 'son', 1, 1, 1, 1),
      (UUID(), 6, 9, 'daughter', 'father', 1, 1, 1, 1),
      (UUID(), 9, 6, 'father', 'daughter', 1, 1, 1, 1),
      (UUID(), 7, 9, 'daughter', 'mother', 1, 1, 1, 1),
      (UUID(), 9, 7, 'mother', 'daughter', 1, 1, 1, 1),
      (UUID(), 1, 6, 'brother', 'brother', 1, 1, 1, 1),
      (UUID(), 6, 1, 'brother', 'brother', 1, 1, 1, 1)
    `);

    const [rows] = await conn.query(`
      SELECT 
        mp1.first_name as from_name,
        mp2.first_name as to_name,
        fr.relationship_label,
        CONCAT(mp2.first_name, ' is ', fr.relationship_label, ' of ', mp1.first_name) as reads_as
      FROM tbl_family_relationships fr
      JOIN tbl_member_profile mp1 ON fr.from_member_id = mp1.member_id
      JOIN tbl_member_profile mp2 ON fr.to_member_id = mp2.member_id
      WHERE fr.is_active = 1
      ORDER BY fr.from_member_id
    `);

    console.table(rows);
  } catch(e) {
    console.error(e);
  } finally {
    conn.end();
  }
}
run();
