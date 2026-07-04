import { dbPool } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

interface Member {
  member_id: number;
  first_name: string;
  father_name: string | null;
  surname: string | null;
  gender: string | null;
  date_of_birth: string | null;
  current_resident: string | null;
  phone_number: string | null;
}

interface MatchResult {
  score_total: number;
  score_breakdown: {
    surname: number;
    father_name: number;
    village: number;
    age: number;
    gender: number;
  };
  suggested_label: string | null;
  suggestion_type: 'same_person' | 'related' | 'same_family';
  match_reason: string;
}

/**
 * Main function: Scan all members in community and generate suggestions
 */
export async function scanCommunityForMatches(communityId: number): Promise<{
  totalScanned: number;
  suggestionsCreated: number;
}> {
  console.log(`[Matcher] Starting scan for community ${communityId}`);
  
  // Get all approved members
  const [members]: any = await dbPool.query(
    `SELECT 
      mp.member_id,
      mp.first_name,
      mp.father_name,
      mp.surname,
      mp.gender,
      mp.date_of_birth,
      mp.current_resident,
      mp.phone_number
     FROM tbl_member_profile mp
     JOIN tbl_community_member_relation cmr 
       ON mp.member_id = cmr.member_id
     WHERE cmr.community_id = ? 
       AND cmr.is_approved = 1`,
    [communityId]
  );
  
  console.log(`[Matcher] Found ${members.length} members`);
  
  let suggestionsCreated = 0;
  
  // Compare each pair of members (O(n²))
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const memberA = members[i];
      const memberB = members[j];
      
      // Skip if already related (relationship exists)
      const alreadyRelated = await checkIfAlreadyRelated(
        memberA.member_id, 
        memberB.member_id
      );
      if (alreadyRelated) continue;
      
      // Skip if suggestion already exists
      const suggestionExists = await checkSuggestionExists(
        memberA.member_id,
        memberB.member_id,
        communityId
      );
      if (suggestionExists) continue;
      
      // Calculate match score
      const result = calculateMatchScore(memberA, memberB);
      
      // Only save if score >= 60
      if (result.score_total >= 60) {
        await saveSuggestion(memberA, memberB, communityId, result);
        suggestionsCreated++;
      }
    }
  }
  
  console.log(`[Matcher] Created ${suggestionsCreated} suggestions`);
  
  return {
    totalScanned: members.length,
    suggestionsCreated
  };
}

/**
 * Calculate match score between two members
 */
function calculateMatchScore(memberA: Member, memberB: Member): MatchResult {
  const breakdown = {
    surname: 0,
    father_name: 0,
    village: 0,
    age: 0,
    gender: 0
  };
  
  const reasons: string[] = [];
  let suggestedLabel: string | null = null;
  let suggestionType: 'same_person' | 'related' | 'same_family' = 'related';
  
  // 1. SURNAME MATCH (max 20)
  if (memberA.surname && memberB.surname) {
    const surnameA = normalizeString(memberA.surname);
    const surnameB = normalizeString(memberB.surname);
    
    if (surnameA === surnameB) {
      breakdown.surname = 20;
      reasons.push(`Same surname: ${memberA.surname}`);
    } else if (isPhoneticallySimilar(surnameA, surnameB)) {
      breakdown.surname = 10;
      reasons.push(`Similar surname: ${memberA.surname} ~ ${memberB.surname}`);
    }
  }
  
  // 2. FATHER NAME LOGIC (max 40) - Most Important
  const firstNameA = normalizeString(memberA.first_name || '');
  const firstNameB = normalizeString(memberB.first_name || '');
  const fatherNameA = normalizeString(memberA.father_name || '');
  const fatherNameB = normalizeString(memberB.father_name || '');
  
  // Case 1: A's father is B (A's father_name matches B's first_name)
  if (fatherNameA && firstNameB && fatherNameA === firstNameB) {
    breakdown.father_name = 40;
    reasons.push(`${memberA.first_name}'s father is "${memberA.father_name}" (matches ${memberB.first_name})`);
    suggestedLabel = memberB.gender === 'Female' ? 'mother' : 'father';
    // "B is father of A" from A's perspective
    // In our storage: from=A, to=B, label='father'
  }
  // Case 2: B's father is A
  else if (fatherNameB && firstNameA && fatherNameB === firstNameA) {
    breakdown.father_name = 40;
    reasons.push(`${memberB.first_name}'s father is "${memberB.father_name}" (matches ${memberA.first_name})`);
    // From A's perspective, B is A's child
    suggestedLabel = memberB.gender === 'Female' ? 'daughter' : 'son';
  }
  // Case 3: Both have same father → siblings
  else if (fatherNameA && fatherNameB && fatherNameA === fatherNameB) {
    breakdown.father_name = 30;
    reasons.push(`Same father: ${memberA.father_name}`);
    suggestedLabel = memberB.gender === 'Female' ? 'sister' : 'brother';
  }
  
  // 3. VILLAGE MATCH (max 20)
  if (memberA.current_resident && memberB.current_resident) {
    const placeA = normalizeString(memberA.current_resident);
    const placeB = normalizeString(memberB.current_resident);
    
    if (placeA === placeB) {
      breakdown.village = 20;
      reasons.push(`Same location: ${memberA.current_resident}`);
    }
  }
  
  // 4. AGE LOGIC (max 10)
  const ageA = calculateAge(memberA.date_of_birth);
  const ageB = calculateAge(memberB.date_of_birth);
  
  if (ageA !== null && ageB !== null) {
    const ageDiff = Math.abs(ageA - ageB);
    
    if (suggestedLabel === 'father' || suggestedLabel === 'mother' || 
        suggestedLabel === 'son' || suggestedLabel === 'daughter') {
      if (ageDiff >= 20 && ageDiff <= 50) {
        breakdown.age = 10;
        reasons.push(`Age difference ${ageDiff} years (parent-child range)`);
      }
    } else if (suggestedLabel === 'brother' || suggestedLabel === 'sister') {
      if (ageDiff < 15) {
        breakdown.age = 10;
        reasons.push(`Age difference ${ageDiff} years (sibling range)`);
      }
    }
  }
  
  // 5. GENDER VALIDATION (max 10, or penalty)
  if (suggestedLabel && memberB.gender) {
    const gender = memberB.gender.toLowerCase();
    const expectedMale = ['father', 'brother', 'son', 'grandfather', 'uncle', 'husband'];
    const expectedFemale = ['mother', 'sister', 'daughter', 'grandmother', 'aunt', 'wife'];
    
    if (expectedMale.includes(suggestedLabel) && gender === 'male') {
      breakdown.gender = 10;
    } else if (expectedFemale.includes(suggestedLabel) && gender === 'female') {
      breakdown.gender = 10;
    } else if (expectedMale.includes(suggestedLabel) && gender !== 'male') {
      breakdown.gender = -20;  // penalty
      reasons.push(`⚠️ Gender mismatch for ${suggestedLabel}`);
    } else if (expectedFemale.includes(suggestedLabel) && gender !== 'female') {
      breakdown.gender = -20;
      reasons.push(`⚠️ Gender mismatch for ${suggestedLabel}`);
    }
  }
  
  const total = breakdown.surname + breakdown.father_name + 
                breakdown.village + breakdown.age + breakdown.gender;
  
  return {
    score_total: Math.max(0, Math.min(100, total)),  // clamp 0-100
    score_breakdown: breakdown,
    suggested_label: suggestedLabel,
    suggestion_type: suggestionType,
    match_reason: reasons.join(' • ')
  };
}

// Helper functions

function normalizeString(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

function isPhoneticallySimilar(a: string, b: string): boolean {
  // Simple check: first 3 chars match
  if (a.length < 3 || b.length < 3) return false;
  return a.substring(0, 3) === b.substring(0, 3);
}

function calculateAge(dob: string | null): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;
  const ageDiffMs = Date.now() - birthDate.getTime();
  return Math.floor(ageDiffMs / (1000 * 60 * 60 * 24 * 365.25));
}

async function checkIfAlreadyRelated(memberIdA: number, memberIdB: number): Promise<boolean> {
  const [rows]: any = await dbPool.query(
    `SELECT 1 FROM tbl_family_relationships 
     WHERE ((from_member_id = ? AND to_member_id = ?) 
        OR (from_member_id = ? AND to_member_id = ?))
       AND is_active = 1
     LIMIT 1`,
    [memberIdA, memberIdB, memberIdB, memberIdA]
  );
  return rows.length > 0;
}

async function checkSuggestionExists(
  memberIdA: number, 
  memberIdB: number, 
  communityId: number
): Promise<boolean> {
  const [rows]: any = await dbPool.query(
    `SELECT 1 FROM tbl_family_match_suggestions 
     WHERE ((member_id_a = ? AND member_id_b = ?) 
        OR (member_id_a = ? AND member_id_b = ?))
       AND community_id = ?
     LIMIT 1`,
    [memberIdA, memberIdB, memberIdB, memberIdA, communityId]
  );
  return rows.length > 0;
}

async function saveSuggestion(
  memberA: Member,
  memberB: Member,
  communityId: number,
  result: MatchResult
): Promise<void> {
  const uuid = uuidv4();
  const scoreDecimal = result.score_total / 100;
  
  await dbPool.query(
    `INSERT INTO tbl_family_match_suggestions 
     (suggestion_uuid, member_id_a, member_id_b, community_id,
      suggestion_type, suggested_label, match_score, match_reason, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      uuid, 
      memberA.member_id, 
      memberB.member_id, 
      communityId,
      result.suggestion_type,
      result.suggested_label,
      scoreDecimal,
      result.match_reason
    ]
  );
}
