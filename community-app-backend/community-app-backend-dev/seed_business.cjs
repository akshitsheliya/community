const mysql = require('mysql2/promise');

async function seed() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Weenggs@123',
    database: 'community_app'
  });

  const sql = `
  INSERT INTO tbl_business 
  (business_uuid, added_by, community_id, business_name, business_type, category, 
  city, state, address, contact_number, contact_email, services_products)
  VALUES
  (UUID(), 1, 1, 'Patel Textiles', 'Manufacturer', 'Textile', 
  'Surat', 'Gujarat', '123 Textile Market, Ring Road, Surat',
  '9999900001', 'rajesh@pateltextiles.com', 
  'We manufacture and export premium quality sarees, kurtis, and fabrics. Wholesale and retail both available.'),

  (UUID(), 2, 1, 'Amit Digital Solutions', 'Service', 'Software Developer',
  'Ahmedabad', 'Gujarat', 'Tech Park, SG Road, Ahmedabad',
  '9999900002', 'amit@digitalsolutions.com',
  'Custom software development, mobile apps, web applications, and IT consulting services for businesses.'),

  (UUID(), 4, 1, 'Suresh Jewellers', 'Trading', 'Jewellers',
  'Mumbai', 'Maharashtra', 'Jewellery Bazaar, Zaveri Bazaar, Mumbai',
  '9999900004', 'info@sureshjewellers.com',
  'Traditional and modern gold jewellery, diamond ornaments, silver items. Custom design available.'),

  (UUID(), 6, 1, 'Mahesh Sweets & Restaurant', 'Service', 'Food And Sweets',
  'Rajkot', 'Gujarat', 'Main Bazaar, Rajkot',
  '9999900006', NULL,
  'Authentic Gujarati sweets, farsan, and full restaurant service. Catering for events, weddings, and functions.')
  ON DUPLICATE KEY UPDATE business_name=VALUES(business_name);
  `;

  try {
    const [result] = await connection.execute(sql);
    console.log('Test businesses inserted successfully.', result);
  } catch (error) {
    console.error('Error inserting businesses:', error);
  } finally {
    await connection.end();
  }
}

seed();
