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
    const [rows] = await conn.query('SHOW TABLES LIKE "tbl_family_match_suggestions"');
    if (rows.length === 0) {
      console.log("Table does not exist. Creating it...");
      await conn.query(`
        CREATE TABLE tbl_family_match_suggestions (
          suggestion_id INT AUTO_INCREMENT PRIMARY KEY,
          suggestion_uuid VARCHAR(36) NOT NULL UNIQUE,
          member_id_a INT NOT NULL,
          member_id_b INT NOT NULL,
          community_id INT NOT NULL,
          suggestion_type ENUM('same_person', 'related', 'same_family') NOT NULL,
          suggested_label VARCHAR(50) NOT NULL,
          match_score DECIMAL(4,3) NOT NULL,
          match_reason TEXT NOT NULL,
          status ENUM('pending', 'confirmed', 'rejected', 'ignored') NOT NULL DEFAULT 'pending',
          reviewed_by INT DEFAULT NULL,
          reviewed_at DATETIME DEFAULT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log("Table created.");
    } else {
      console.log("Table already exists.");
    }
  } catch (error) {
    console.error("Error checking/creating table:", error.message);
  } finally {
    conn.end();
  }
}
run();
