import { dbPool } from './src/config/db';

async function testNoticeBoard() {
  try {
    // Check if table exists
    const [tables]: any = await dbPool.query("SHOW TABLES LIKE 'tbl_feeds'");
    if (tables.length === 0) {
      console.log("Table tbl_feeds does not exist.");
      // Create table if not exists
      await dbPool.query(`
        CREATE TABLE tbl_feeds (
          feed_id INT AUTO_INCREMENT PRIMARY KEY,
          feed_uuid VARCHAR(36) NOT NULL,
          channel_id INT DEFAULT NULL,
          feed_title VARCHAR(500) NOT NULL,
          feed_description TEXT,
          feed_type ENUM('news', 'maran_nondh', 'event', 'meeting') NOT NULL,
          feed_photo_video VARCHAR(1000) DEFAULT NULL,
          event_date_time DATETIME DEFAULT NULL,
          event_address TEXT DEFAULT NULL,
          event_latitude DECIMAL(10,8) DEFAULT NULL,
          event_longitude DECIMAL(11,8) DEFAULT NULL,
          added_by INT NOT NULL,
          community_id INT NOT NULL,
          added_on DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_on DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log("Table tbl_feeds created.");
    }

    const [rows]: any = await dbPool.query('SELECT * FROM tbl_feeds');
    console.log(`Found ${rows.length} notices.`);
    
    if (rows.length === 0) {
      console.log("Inserting test data...");
      await dbPool.query(`
        INSERT INTO tbl_feeds 
        (feed_uuid, feed_title, feed_description, feed_type, added_by, community_id) 
        VALUES
        (UUID(), 'Community Meeting Announcement', 
         'Dear members, we are having a community meeting on 15th July at 5 PM at community hall. Please attend and participate in discussion about upcoming events.',
         'meeting', 1, 1),

        (UUID(), 'Diwali Celebration 2026', 
         'Join us for the grand Diwali celebration on 12th November. There will be cultural programs, dinner, and prize distribution for children.',
         'event', 1, 1),

        (UUID(), 'Blood Donation Camp', 
         'A blood donation camp will be organized on 20th July from 9 AM to 2 PM at community center. All eligible members are requested to donate blood.',
         'news', 1, 1),

        (UUID(), 'Late Shri Ramesh Patel', 
         'With deep sorrow, we inform the sad demise of Shri Ramesh Patel, father of Rajesh Patel. Prarthana sabha will be held at their residence on 8th July at 4 PM.',
         'maran_nondh', 1, 1)
      `);
      console.log("Test data inserted.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

testNoticeBoard();
