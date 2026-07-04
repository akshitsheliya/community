import jwt from 'jsonwebtoken';
// @ts-ignore
import fetch from 'node-fetch';
import { dbPool } from './src/config/db';

const SECRET_KEY = process.env.JWT_SECRET || 'secret';

async function generateToken(memberId: number, communityId: number) {
  return jwt.sign({ member_id: memberId, community_id: communityId, type: 'member' }, SECRET_KEY, { expiresIn: '1h' });
}

async function runTests() {
  try {
    // Need to get IDs for Vijay (10) and Rajesh (1)
    const vijayToken = await generateToken(10, 1);
    const rajeshToken = await generateToken(1, 1);
    
    console.log("=== Test 1: Search Matching Families ===");
    const res1 = await fetch('http://localhost:4002/api/family-join/search', {
      headers: { 'Authorization': `Bearer ${vijayToken}` }
    });
    const data1 = await res1.json();
    console.log("Status:", res1.status, JSON.stringify(data1, null, 2));

    let targetFamilyUuid = 'fam-001-rajesh-family';
    // Actually, we can get Rajesh's family_uuid from DB
    const [famRows]: any = await dbPool.query("SELECT family_uuid FROM tbl_families WHERE family_sr_id = 1");
    if (famRows.length > 0) {
      targetFamilyUuid = famRows[0].family_uuid;
    }
    
    console.log("\n=== Test 2: Create Join Request ===");
    const reqBody = {
      target_family_uuid: targetFamilyUuid,
      target_member_uuid: 'mem-001-rajesh',
      claimed_relationship: 'father'
    };
    const res2 = await fetch('http://localhost:4002/api/family-join/request', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${vijayToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(reqBody)
    });
    const data2 = await res2.json();
    console.log("Status:", res2.status, JSON.stringify(data2, null, 2));
    
    const requestUuid = data2.data?.request_uuid;

    console.log("\n=== Test 3: Incoming Requests (Rajesh) ===");
    const res3 = await fetch('http://localhost:4002/api/family-join/incoming', {
      headers: { 'Authorization': `Bearer ${rajeshToken}` }
    });
    const data3 = await res3.json();
    console.log("Status:", res3.status, JSON.stringify(data3, null, 2));

    if (requestUuid) {
      console.log("\n=== Test 4: Approve Request ===");
      const res4 = await fetch(`http://localhost:4002/api/family-join/request/${requestUuid}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${rajeshToken}` }
      });
      const data4 = await res4.json();
      console.log("Status:", res4.status, JSON.stringify(data4, null, 2));
      
      console.log("\n=== Test 5: Verify in DB ===");
      const [vRows]: any = await dbPool.query("SELECT member_id, first_name, family_sr_id FROM tbl_member_profile WHERE member_id = 10");
      console.log("Vijay DB Record:", vRows[0]);
      
      const [rRows]: any = await dbPool.query("SELECT * FROM tbl_family_relationships WHERE from_member_id = 10 OR to_member_id = 10");
      console.log("Vijay Relationships:", rRows.map((r: any) => ({ from: r.from_member_id, to: r.to_member_id, label: r.relationship_label })));
    } else {
      console.log("Skipping Test 4 & 5 because request creation failed (likely duplicate).");
    }

  } catch (error) {
    console.error("Test Error:", error);
  } finally {
    process.exit(0);
  }
}

runTests();
