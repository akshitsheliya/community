USE community_app;

-- Family 1: Rajesh -> Amit (Father-Son), Amit -> Priya (Husband-Wife)
-- (Auto-inverse rows will be created by API, but we insert manually for testing)

INSERT INTO tbl_family_relationships 
(relationship_uuid, from_member_id, to_member_id, relationship_label, inverse_label, community_id, added_by_member_id, is_verified) 
VALUES
-- Rajesh (1) is Father of Amit (2)
(UUID(), 1, 2, 'father', 'son', 1, 1, 1),
(UUID(), 2, 1, 'son', 'father', 1, 1, 1),

-- Amit (2) is Husband of Priya (3)
(UUID(), 2, 3, 'husband', 'wife', 1, 1, 1),
(UUID(), 3, 2, 'wife', 'husband', 1, 1, 1),

-- Family 2: Suresh (4) is Father of Karan (5)
(UUID(), 4, 5, 'father', 'son', 1, 1, 1),
(UUID(), 5, 4, 'son', 'father', 1, 1, 1),

-- Family 3: Mahesh (6) is Husband of Meera (7)
(UUID(), 6, 7, 'husband', 'wife', 1, 1, 1),
(UUID(), 7, 6, 'wife', 'husband', 1, 1, 1),

-- Mahesh (6) is Father of Rohan (8) and Riya (9)
(UUID(), 6, 8, 'father', 'son', 1, 1, 1),
(UUID(), 8, 6, 'son', 'father', 1, 1, 1),
(UUID(), 6, 9, 'father', 'daughter', 1, 1, 1),
(UUID(), 9, 6, 'daughter', 'father', 1, 1, 1),

-- Meera (7) is Mother of Rohan (8) and Riya (9)
(UUID(), 7, 8, 'mother', 'son', 1, 1, 1),
(UUID(), 8, 7, 'son', 'mother', 1, 1, 1),
(UUID(), 7, 9, 'mother', 'daughter', 1, 1, 1),
(UUID(), 9, 7, 'daughter', 'mother', 1, 1, 1),

-- CROSS FAMILY: Rajesh (1) and Mahesh (6) are Brothers
(UUID(), 1, 6, 'brother', 'brother', 1, 1, 1),
(UUID(), 6, 1, 'brother', 'brother', 1, 1, 1);

-- Verify
SELECT 
  fr.relationship_uuid,
  mp1.first_name AS from_name,
  fr.relationship_label,
  mp2.first_name AS to_name,
  fr.is_verified
FROM tbl_family_relationships fr
JOIN tbl_member_profile mp1 ON fr.from_member_id = mp1.member_id
JOIN tbl_member_profile mp2 ON fr.to_member_id = mp2.member_id
WHERE fr.is_active = 1;
