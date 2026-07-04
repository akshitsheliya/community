import { dbPool } from './src/config/db';

async function check() {
  const [nodes] = await dbPool.query('SELECT member_id, first_name, surname, family_sr_id FROM tbl_member_profile WHERE first_name = "Vijay" OR first_name = "Rajesh"');
  console.log("Nodes:");
  console.log(nodes);
  
  const [edges] = await dbPool.query('SELECT * FROM tbl_family_relationships');
  console.log("Edges:");
  console.log(edges);
  
  process.exit(0);
}
check();
