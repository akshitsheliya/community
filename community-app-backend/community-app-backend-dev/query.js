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

  const [rows] = await conn.query(`
    SELECT 
      fr.relationship_id,
      fr.relationship_uuid,
      mp1.first_name as from_name,
      mp1.gender as from_gender,
      fr.relationship_label,
      mp2.first_name as to_name,
      mp2.gender as to_gender,
      fr.is_active,
      fr.added_on
    FROM tbl_family_relationships fr
    JOIN tbl_member_profile mp1 ON fr.from_member_id = mp1.member_id
    JOIN tbl_member_profile mp2 ON fr.to_member_id = mp2.member_id
    WHERE fr.is_active = 1
    ORDER BY fr.added_on DESC
  `);
  
  console.table(rows);
  conn.end();
}
run();
