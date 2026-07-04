import mysql from 'mysql2/promise';

async function seed() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Weenggs@123',
    database: 'community_app'
  });

  try {
    // Check if user exists
    const [rows] = await connection.execute('SELECT * FROM tbl_logins WHERE phone_number = ?', ['9876543210']);
    if (rows.length === 0) {
      await connection.execute(`
        INSERT INTO tbl_logins (phone_number, user_uuid, added_on) 
        VALUES ('9876543210', UUID(), NOW())
      `);
      console.log('Test user (9876543210) created successfully!');
    } else {
      console.log('Test user (9876543210) already exists.');
    }
    
    // Also we need to make sure the user has a member profile otherwise loginWithMobile fails
    // The query joins with tbl_community_member_relation. We should insert a dummy member.
    const [memberRows] = await connection.execute('SELECT * FROM tbl_member_profile WHERE phone_number = ?', ['9876543210']);
    let member_id;
    if (memberRows.length === 0) {
      const [memberInsert] = await connection.execute(`
        INSERT INTO tbl_member_profile (first_name, surname, phone_number, member_uuid, added_on)
        VALUES ('Test', 'User', '9876543210', UUID(), NOW())
      `);
      member_id = memberInsert.insertId;
      console.log('Test member created with ID:', member_id);
    } else {
      member_id = memberRows[0].member_id;
      console.log('Using existing member ID:', member_id);
    }
      
    // We need a relation in tbl_community_member_relation
    try {
      await connection.execute(`
        INSERT INTO tbl_community_member_relation (community_id, member_id, is_login_active, is_approved)
        VALUES (1, ?, 1, 1)
      `, [member_id]);
      console.log('Test member relation created!');
    } catch (e) {
      console.log('Relation already exists or error:', e.message);
    }
      
    // Link login to member
    await connection.execute('UPDATE tbl_logins SET member_id = ? WHERE phone_number = ?', [member_id, '9876543210']);
    console.log('Linked login to member!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await connection.end();
  }
}

seed();
