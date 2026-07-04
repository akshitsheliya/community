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
    // Add Member 10: Vijay
    await conn.query(`
      INSERT INTO tbl_member_profile 
      (member_uuid, family_sr_id, first_name, father_name, surname, gender, date_of_birth, phone_number, email_id, current_resident) 
      VALUES
      ('mem-010-vijay', NULL, 'Vijay', 'Rajesh', 'Patel', 'Male', '1993-06-15', '9999900010', 'vijay@test.com', 'Umarala')
    `);

    // Add Member 11: Neha
    await conn.query(`
      INSERT INTO tbl_member_profile 
      (member_uuid, family_sr_id, first_name, father_name, surname, gender, date_of_birth, phone_number, email_id, current_resident) 
      VALUES
      ('mem-011-neha', NULL, 'Neha', 'Rajesh', 'Patel', 'Female', '1996-09-20', '9999900011', 'neha@test.com', 'Umarala')
    `);

    // Add them to community
    await conn.query(`
      INSERT INTO tbl_community_member_relation 
      (community_member_relation_id, community_id, member_id, family_number, is_approved, is_login_active, verified_by) 
      VALUES
      ('cmr-010', 1, 10, 104, 1, 1, 1),
      ('cmr-011', 1, 11, 105, 1, 1, 1)
    `);

    // Add login records
    await conn.query(`
      INSERT INTO tbl_logins 
      (user_uuid, member_id, phone_number, app_language) 
      VALUES
      ('user-uuid-010', 10, '9999900010', 'en'),
      ('user-uuid-011', 11, '9999900011', 'en')
    `);

    const [rows] = await conn.query('SELECT COUNT(*) as count FROM tbl_member_profile');
    console.log("Total members in DB:", rows[0].count);

  } catch (error) {
    console.error("Error inserting data (might already exist):", error.message);
  } finally {
    conn.end();
  }
}
run();
