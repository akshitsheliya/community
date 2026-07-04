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
    const [rows] = await conn.query('SHOW TABLES LIKE "tbl_family_join_requests"');
    if (rows.length === 0) {
      console.log("Table does not exist. Creating it...");
      await conn.query(`
        CREATE TABLE tbl_family_join_requests (
          request_id INT AUTO_INCREMENT PRIMARY KEY,
          request_uuid VARCHAR(36) NOT NULL UNIQUE,
          requester_member_id INT NOT NULL,
          target_family_sr_id INT NOT NULL,
          target_member_id INT DEFAULT NULL,
          claimed_relationship VARCHAR(50) NOT NULL,
          community_id INT NOT NULL,
          status ENUM('pending','approved_by_family','rejected_by_family','approved_by_leader','rejected_by_leader','cancelled') NOT NULL DEFAULT 'pending',
          review_note TEXT,
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
    
    // Check if Vijay exists, otherwise insert (should be there from previous step)
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    conn.end();
  }
}
run();
