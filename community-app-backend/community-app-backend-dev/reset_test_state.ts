import { dbPool } from './src/config/db';

async function resetDB() {
  try {
    const vijayId = 10;
    
    // Remove from family
    await dbPool.query("UPDATE tbl_member_profile SET family_sr_id = NULL WHERE member_id = ?", [vijayId]);
    await dbPool.query("UPDATE tbl_community_member_relation SET family_sr_id = NULL WHERE member_id = ?", [vijayId]);
    
    // Delete join requests
    await dbPool.query("DELETE FROM tbl_family_join_requests WHERE requester_member_id = ?", [vijayId]);
    
    // Delete relationships
    await dbPool.query("DELETE FROM tbl_family_relationships WHERE from_member_id = ? OR to_member_id = ?", [vijayId, vijayId]);
    
    // Set matching criteria so Vijay matches Rajesh. Rajesh has father 'Ramesh'. Let's set Vijay's father to 'Ramesh' too, or just first name 'Rajesh' as father.
    // In searchMatchingFamilies: "head.first_name = father_name" 
    // Let's set Vijay's father_name to 'Rajesh' and surname to 'Patel'
    await dbPool.query("UPDATE tbl_member_profile SET father_name = 'Rajesh', surname = 'Patel', first_name = 'Vijay' WHERE member_id = ?", [vijayId]);
    
    console.log("DB Reset successful");
    
  } catch (error) {
    console.error("DB Reset failed", error);
  } finally {
    process.exit(0);
  }
}
resetDB();
