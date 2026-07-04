import { dbPool } from "../config/db";
import { v4 as uuidv4 } from "uuid";
import { getInverseLabel } from "../helpers/relationshipHelper";

export class FamilyGraphModel {
  
  async addRelationship(data: {
    from_member_id: number;
    to_member_id: number;
    relationship_label: string;
    community_id: number;
    added_by_member_id: number;
    is_verified?: number;
  }) {
    const conn = await dbPool.getConnection();
    try {
      await conn.beginTransaction();

      const { from_member_id, to_member_id, relationship_label, community_id, added_by_member_id, is_verified } = data;
      const isVerified = is_verified ?? 0;
      
      // Fetch genders
      const [membersRows]: any = await conn.query(
        `SELECT member_id, gender FROM tbl_member_profile 
         WHERE member_id IN (?, ?)`,
        [from_member_id, to_member_id]
      );
      
      const fromMember = membersRows.find((m: any) => m.member_id === from_member_id);
      const toMember = membersRows.find((m: any) => m.member_id === to_member_id);
      
      const fromGender = fromMember?.gender || 'Male';
      const toGender = toMember?.gender || 'Male';
      
      const forwardLabel = relationship_label.toLowerCase();
      const inverseLabel = getInverseLabel(forwardLabel, fromGender, toGender);
      const uuidForward = uuidv4();
      const uuidInverse = uuidv4();
      
      // Insert forward
      await conn.query(
        `INSERT INTO tbl_family_relationships 
         (relationship_uuid, from_member_id, to_member_id, relationship_label, inverse_label, community_id, added_by_member_id, is_verified, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [uuidForward, from_member_id, to_member_id, forwardLabel, inverseLabel, community_id, added_by_member_id, isVerified]
      );

      // Insert inverse
      await conn.query(
        `INSERT INTO tbl_family_relationships 
         (relationship_uuid, from_member_id, to_member_id, relationship_label, inverse_label, community_id, added_by_member_id, is_verified, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [uuidInverse, to_member_id, from_member_id, inverseLabel, forwardLabel, community_id, added_by_member_id, isVerified]
      );

      await conn.commit();
      return { uuidForward, uuidInverse, forward: { from: from_member_id, to: to_member_id, label: forwardLabel }, reverse: { from: to_member_id, to: from_member_id, label: inverseLabel } };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  async getRelationshipsByMember(memberId: number, communityId: number) {
    const [rows] = await dbPool.query(
      `SELECT 
        fr.relationship_id,
        fr.relationship_uuid,
        fr.relationship_label,
        fr.inverse_label,
        fr.is_verified,
        fr.source,
        fr.added_on,
        mp1.member_id as from_member_id,
        mp1.member_uuid as from_member_uuid,
        mp1.first_name as from_first_name,
        mp1.surname as from_surname,
        mp1.profile_photo as from_photo,
        mp2.member_id as to_member_id,
        mp2.member_uuid as to_member_uuid,
        mp2.first_name as to_first_name,
        mp2.surname as to_surname,
        mp2.profile_photo as to_photo
      FROM tbl_family_relationships fr
      JOIN tbl_member_profile mp1 ON fr.from_member_id = mp1.member_id
      JOIN tbl_member_profile mp2 ON fr.to_member_id = mp2.member_id
      WHERE (fr.from_member_id = ?) 
        AND fr.community_id = ? 
        AND fr.is_active = 1`,
      [memberId, communityId]
    );
    return rows;
  }

  // A basic breadth-first search implementation in code since raw SQL recursion can be complex across dialects
  async getFamilyGraph(memberId: number, communityId: number, maxDepth: number = 2) {
    const nodes = new Map();
    const edges = new Set();
    const queue = [{ id: memberId, depth: 0 }];
    const visited = new Set([memberId]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      // Fetch edges for current node
      const [rows]: any = await dbPool.query(
        `SELECT 
          fr.relationship_uuid,
          fr.relationship_label,
          mp1.member_id as from_id, mp1.member_uuid as from_uuid, mp1.first_name as from_name, mp1.profile_photo as from_photo, mp1.gender as from_gender,
          mp2.member_id as to_id, mp2.member_uuid as to_uuid, mp2.first_name as to_name, mp2.profile_photo as to_photo, mp2.gender as to_gender
        FROM tbl_family_relationships fr
        JOIN tbl_member_profile mp1 ON fr.from_member_id = mp1.member_id
        JOIN tbl_member_profile mp2 ON fr.to_member_id = mp2.member_id
        WHERE fr.from_member_id = ? AND fr.community_id = ? AND fr.is_active = 1`,
        [current.id, communityId]
      );

      for (const row of rows) {
        if (!nodes.has(row.from_id)) {
          nodes.set(row.from_id, { id: row.from_id, member_uuid: row.from_uuid, name: row.from_name, photo: row.from_photo, gender: row.from_gender });
        }
        if (!nodes.has(row.to_id)) {
          nodes.set(row.to_id, { id: row.to_id, member_uuid: row.to_uuid, name: row.to_name, photo: row.to_photo, gender: row.to_gender });
        }
        
        edges.add({
          from: row.from_id,
          to: row.to_id,
          label: row.relationship_label
        });

        if (current.depth < maxDepth && !visited.has(row.to_id)) {
          visited.add(row.to_id);
          queue.push({ id: row.to_id, depth: current.depth + 1 });
        }
      }
    }

    return {
      nodes: Array.from(nodes.values()),
      edges: Array.from(edges)
    };
  }

  async getPendingRelationships(communityId: number) {
    const [rows] = await dbPool.query(
      `SELECT * FROM tbl_family_relationships 
       WHERE is_verified = 0 AND is_active = 1 AND community_id = ?`,
      [communityId]
    );
    return rows;
  }

  async approveRelationship(relationshipUuid: string, verifiedByMemberId: number) {
    const [rows]: any = await dbPool.query(
      `SELECT from_member_id, to_member_id FROM tbl_family_relationships WHERE relationship_uuid = ?`, 
      [relationshipUuid]
    );
    if (rows.length === 0) return false;
    
    const { from_member_id, to_member_id } = rows[0];

    // Approve both forward and inverse
    const [result]: any = await dbPool.query(
      `UPDATE tbl_family_relationships 
       SET is_verified = 1, updated_on = CURRENT_TIMESTAMP 
       WHERE (from_member_id = ? AND to_member_id = ?) OR (from_member_id = ? AND to_member_id = ?)`,
      [from_member_id, to_member_id, to_member_id, from_member_id]
    );
    return result.affectedRows > 0;
  }

  async rejectRelationship(relationshipUuid: string) {
    const [rows]: any = await dbPool.query(
      `SELECT from_member_id, to_member_id FROM tbl_family_relationships WHERE relationship_uuid = ?`, 
      [relationshipUuid]
    );
    if (rows.length === 0) return false;
    
    const { from_member_id, to_member_id } = rows[0];

    const [result]: any = await dbPool.query(
      `UPDATE tbl_family_relationships 
       SET is_active = 0, updated_on = CURRENT_TIMESTAMP 
       WHERE (from_member_id = ? AND to_member_id = ?) OR (from_member_id = ? AND to_member_id = ?)`,
      [from_member_id, to_member_id, to_member_id, from_member_id]
    );
    return result.affectedRows > 0;
  }

  async deleteRelationship(relationshipUuid: string) {
    return this.rejectRelationship(relationshipUuid); // Soft delete acts same as reject
  }

  async getRelationshipByUuid(uuid: string) {
    const [rows]: any = await dbPool.query(
      `SELECT * FROM tbl_family_relationships WHERE relationship_uuid = ? AND is_active = 1`,
      [uuid]
    );
    return rows[0] || null;
  }

  async checkExistingRelationship(fromMemberId: number, toMemberId: number, communityId: number) {
    const [rows]: any = await dbPool.query(
      `SELECT relationship_id FROM tbl_family_relationships 
       WHERE from_member_id = ? AND to_member_id = ? AND community_id = ? AND is_active = 1`,
      [fromMemberId, toMemberId, communityId]
    );
    return rows.length > 0;
  }
}
