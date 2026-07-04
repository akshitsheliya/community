import { dbPool } from './src/config/db';
import * as joinModel from './src/models/familyJoinRequestModel';
import { v4 as uuidv4 } from 'uuid';

async function runTests() {
  try {
    const vijayId = 10;
    const rajeshId = 1;
    const communityId = 1;
    
    // Test 1: Search Matching Families
    console.log("=== Test 1: Search Matching Families ===");
    const [rows]: any = await dbPool.query(
      "SELECT first_name, father_name, surname FROM tbl_member_profile WHERE member_id = ?",
      [vijayId]
    );
    const profile = rows[0];
    
    const matches = await joinModel.searchMatchingFamilies({
      communityId,
      firstName: profile.first_name,
      fatherName: profile.father_name,
      surname: profile.surname,
      excludeMemberId: vijayId
    });
    console.log("Matches:", JSON.stringify(matches, null, 2));
    
    let targetFamilyId = 1; // Default
    if (matches.length > 0) {
      targetFamilyId = matches[0].family_sr_id;
    } else {
        const [famRows]: any = await dbPool.query("SELECT family_sr_id FROM tbl_families WHERE family_sr_id = 1");
        if (famRows.length > 0) targetFamilyId = famRows[0].family_sr_id;
    }
    
    // Test 2: Create Join Request
    console.log("\n=== Test 2: Create Join Request ===");
    // Delete existing request to prevent duplicate error
    await dbPool.query("DELETE FROM tbl_family_join_requests WHERE requester_member_id = ?", [vijayId]);
    
    const result = await joinModel.createJoinRequest({
      requester_member_id: vijayId,
      target_family_sr_id: targetFamilyId,
      target_member_id: rajeshId,
      claimed_relationship: 'father',
      community_id: communityId
    });
    console.log("Create Result:", result);
    
    // Test 3: Incoming Requests (Rajesh)
    console.log("\n=== Test 3: Incoming Requests ===");
    const incoming = await joinModel.getJoinRequestsForFamily(targetFamilyId);
    console.log("Incoming Requests:", JSON.stringify(incoming, null, 2));
    
    // Test 4: Approve Request
    console.log("\n=== Test 4: Approve Request ===");
    const approveResult = await joinModel.approveAndLinkMember(result.request_uuid, rajeshId);
    console.log("Approve Result:", approveResult);
    
    // Test 5: Verify DB
    console.log("\n=== Test 5: Verify DB ===");
    const [vRows]: any = await dbPool.query("SELECT member_id, first_name, family_sr_id FROM tbl_member_profile WHERE member_id = ?", [vijayId]);
    console.log("Vijay DB Record:", vRows[0]);
    
    const [rRows]: any = await dbPool.query("SELECT * FROM tbl_family_relationships WHERE from_member_id = ? OR to_member_id = ?", [vijayId, vijayId]);
    console.log("Vijay Relationships:", rRows.map((r: any) => ({ from: r.from_member_id, to: r.to_member_id, label: r.relationship_label })));

  } catch (error) {
    console.error("Test Error:", error);
  } finally {
    process.exit(0);
  }
}

runTests();
