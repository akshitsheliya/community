-- ============================================================
-- FILE: family_graph_schema.sql
-- PURPOSE: NEW tables for the Family Graph / Relationship system.
--          These are ADDITIVE ONLY - zero modifications to existing tables.
--          Run AFTER complete_base_schema.sql on the same database.
-- GENERATED: 2026-07-03
-- ============================================================

USE community_app;

-- ============================================================
-- TABLE FG-1: tbl_family_relationships
-- PURPOSE: Stores directed relationship edges between two members.
--          e.g., member A is "Father" of member B.
--          This is the core graph edge table for the family tree feature.
--
-- DESIGN:
--   - Each row = one relationship (e.g., from_member is "Father" of to_member)
--   - Inverse relationship is stored as a separate row for easy querying
--   - Both members can be in the same family_sr_id or different families
--     (cross-family linking is supported for future merged-family detection)
--   - is_verified: Admin or AI can verify/flag a relationship
--   - community_id: Each community has its own graph (isolation)
-- ============================================================
CREATE TABLE `tbl_family_relationships` (
  `relationship_id`       BIGINT        NOT NULL AUTO_INCREMENT,
  `relationship_uuid`     VARCHAR(45)   NOT NULL,
  `from_member_id`        INT           NOT NULL COMMENT 'FK to tbl_member_profile',
  `to_member_id`          INT           NOT NULL COMMENT 'FK to tbl_member_profile',
  `relationship_label`    VARCHAR(50)   NOT NULL COMMENT 'e.g. Father, Mother, Son, Daughter, Husband, Wife, Brother, Sister, Uncle, Aunt',
  `inverse_label`         VARCHAR(50)   DEFAULT NULL COMMENT 'Auto-computed inverse e.g. if label=Father inverse=Son',
  `family_sr_id`          INT           DEFAULT NULL COMMENT 'FK to tbl_families; the shared family unit',
  `community_id`          INT           NOT NULL COMMENT 'FK to tbl_community',
  `added_by_member_id`    INT           DEFAULT NULL COMMENT 'Who created this relationship edge',
  `is_verified`           TINYINT(1)    DEFAULT 0 COMMENT '0=unverified, 1=verified by admin or AI',
  `is_active`             TINYINT(1)    DEFAULT 1 COMMENT '0=soft-deleted',
  `source`                VARCHAR(20)   DEFAULT 'manual' COMMENT 'manual / ai_suggested / import',
  `added_on`              DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_on`            DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`relationship_id`),
  UNIQUE KEY `uq_relationship_uuid` (`relationship_uuid`),
  UNIQUE KEY `uq_member_pair_label` (`from_member_id`, `to_member_id`, `community_id`) COMMENT 'Only one relationship per pair per community',
  KEY `idx_fr_from_member` (`from_member_id`),
  KEY `idx_fr_to_member` (`to_member_id`),
  KEY `idx_fr_family` (`family_sr_id`),
  KEY `idx_fr_community` (`community_id`),
  CONSTRAINT `fk_fr_from_member` FOREIGN KEY (`from_member_id`)
    REFERENCES `tbl_member_profile` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_fr_to_member` FOREIGN KEY (`to_member_id`)
    REFERENCES `tbl_member_profile` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_fr_community` FOREIGN KEY (`community_id`)
    REFERENCES `tbl_community` (`community_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_fr_family` FOREIGN KEY (`family_sr_id`)
    REFERENCES `tbl_families` (`family_sr_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='Family relationship graph edges: member-to-member directed relationship links';


-- ============================================================
-- TABLE FG-2: tbl_family_match_suggestions
-- PURPOSE: AI Matcher Engine suggestions.
--          When the system detects two members that MIGHT be related
--          (e.g., same surname + father name pattern), it stores a suggestion here.
--          Admin or member can confirm/reject.
--
-- DESIGN:
--   - match_score: 0.0-1.0 confidence from the AI/matching logic
--   - suggestion_type: 'same_person' | 'related' | 'same_family'
--   - status: pending -> confirmed/rejected
-- ============================================================
CREATE TABLE `tbl_family_match_suggestions` (
  `suggestion_id`       BIGINT        NOT NULL AUTO_INCREMENT,
  `suggestion_uuid`     VARCHAR(45)   NOT NULL,
  `member_id_a`         INT           NOT NULL COMMENT 'First candidate member',
  `member_id_b`         INT           NOT NULL COMMENT 'Second candidate member',
  `community_id`        INT           NOT NULL,
  `suggestion_type`     VARCHAR(30)   NOT NULL DEFAULT 'related' COMMENT 'same_person / related / same_family',
  `suggested_label`     VARCHAR(50)   DEFAULT NULL COMMENT 'AI-suggested relationship label e.g. Brother',
  `match_score`         DECIMAL(4,3)  DEFAULT NULL COMMENT 'Confidence 0.000 to 1.000',
  `match_reason`        TEXT          DEFAULT NULL COMMENT 'Human-readable explanation of why match was suggested',
  `status`              VARCHAR(20)   NOT NULL DEFAULT 'pending' COMMENT 'pending / confirmed / rejected / ignored',
  `reviewed_by`         INT           DEFAULT NULL COMMENT 'FK to tbl_member_profile (admin who reviewed)',
  `reviewed_at`         DATETIME      DEFAULT NULL,
  `created_at`          DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`suggestion_id`),
  UNIQUE KEY `uq_suggestion_uuid` (`suggestion_uuid`),
  UNIQUE KEY `uq_member_pair_community` (`member_id_a`, `member_id_b`, `community_id`),
  KEY `idx_fms_member_a` (`member_id_a`),
  KEY `idx_fms_member_b` (`member_id_b`),
  KEY `idx_fms_community` (`community_id`),
  KEY `idx_fms_status` (`status`),
  CONSTRAINT `fk_fms_member_a` FOREIGN KEY (`member_id_a`)
    REFERENCES `tbl_member_profile` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_fms_member_b` FOREIGN KEY (`member_id_b`)
    REFERENCES `tbl_member_profile` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_fms_community` FOREIGN KEY (`community_id`)
    REFERENCES `tbl_community` (`community_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='AI-generated family match suggestions for admin review';


-- ============================================================
-- TABLE FG-3: tbl_family_join_requests
-- PURPOSE: When a new user registers and wants to join an EXISTING family
--          (not create a new one), they submit a request here.
--          The family head or admin approves/rejects.
--
-- DESIGN:
--   - requester_member_id: the new member requesting to join
--   - target_family_sr_id: the family they want to join
--   - claimed_relationship: what they claim to be (e.g., "Son of Ramesh Patel")
--   - status: pending -> approved/rejected
-- ============================================================
CREATE TABLE `tbl_family_join_requests` (
  `request_id`              BIGINT        NOT NULL AUTO_INCREMENT,
  `request_uuid`            VARCHAR(45)   NOT NULL,
  `requester_member_id`     INT           NOT NULL COMMENT 'New member requesting to join',
  `target_family_sr_id`     INT           NOT NULL COMMENT 'Family they want to join',
  `target_member_id`        INT           DEFAULT NULL COMMENT 'Specific family member they claim relation with',
  `claimed_relationship`    VARCHAR(100)  DEFAULT NULL COMMENT 'e.g. Son, Daughter-in-law',
  `community_id`            INT           NOT NULL,
  `status`                  VARCHAR(20)   NOT NULL DEFAULT 'pending' COMMENT 'pending / approved / rejected',
  `reviewed_by`             INT           DEFAULT NULL COMMENT 'FK to tbl_member_profile (admin/family head)',
  `review_note`             TEXT          DEFAULT NULL,
  `reviewed_at`             DATETIME      DEFAULT NULL,
  `created_at`              DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_at`              DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  UNIQUE KEY `uq_request_uuid` (`request_uuid`),
  KEY `idx_fjr_requester` (`requester_member_id`),
  KEY `idx_fjr_family` (`target_family_sr_id`),
  KEY `idx_fjr_status` (`status`),
  KEY `idx_fjr_community` (`community_id`),
  CONSTRAINT `fk_fjr_requester` FOREIGN KEY (`requester_member_id`)
    REFERENCES `tbl_member_profile` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_fjr_family` FOREIGN KEY (`target_family_sr_id`)
    REFERENCES `tbl_families` (`family_sr_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_fjr_community` FOREIGN KEY (`community_id`)
    REFERENCES `tbl_community` (`community_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='Requests from new members to join an existing family group';


-- ============================================================
-- TABLE FG-4: tbl_family_merge_history
-- PURPOSE: Audit trail when two family groups are merged into one.
--          Preserves the history of what was merged and who initiated it.
--
-- DESIGN:
--   - source_family_sr_id: family that was absorbed
--   - target_family_sr_id: family that survived / became the merged family
--   - members_moved: JSON array of member_ids that were migrated
--   - merged_by: the admin who initiated the merge
-- ============================================================
CREATE TABLE `tbl_family_merge_history` (
  `merge_id`              BIGINT        NOT NULL AUTO_INCREMENT,
  `merge_uuid`            VARCHAR(45)   NOT NULL,
  `source_family_sr_id`   INT           DEFAULT NULL COMMENT 'Family that was absorbed (may be deleted after merge)',
  `target_family_sr_id`   INT           NOT NULL COMMENT 'Family that survives',
  `source_family_uuid`    VARCHAR(45)   DEFAULT NULL COMMENT 'Snapshot of source family UUID before deletion',
  `community_id`          INT           NOT NULL,
  `members_moved`         JSON          DEFAULT NULL COMMENT 'JSON array of member_ids that were moved',
  `members_count`         INT           DEFAULT 0,
  `merged_by`             INT           DEFAULT NULL COMMENT 'FK to tbl_member_profile (admin)',
  `merge_reason`          TEXT          DEFAULT NULL,
  `merged_at`             DATETIME      DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`merge_id`),
  UNIQUE KEY `uq_merge_uuid` (`merge_uuid`),
  KEY `idx_fmh_target_family` (`target_family_sr_id`),
  KEY `idx_fmh_community` (`community_id`),
  KEY `idx_fmh_merged_by` (`merged_by`),
  CONSTRAINT `fk_fmh_target_family` FOREIGN KEY (`target_family_sr_id`)
    REFERENCES `tbl_families` (`family_sr_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_fmh_community` FOREIGN KEY (`community_id`)
    REFERENCES `tbl_community` (`community_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='Audit history of family group merge operations';


-- ============================================================
-- TABLE FG-5: tbl_duplicate_detection
-- PURPOSE: Records of possible duplicate member profiles detected by the system.
--          Two members may be the same person registered twice.
--          Admin reviews and merges or dismisses.
--
-- DESIGN:
--   - confidence_score: 0.0-1.0 from matching algorithm
--   - detection_method: rule_based | name_match | phone_match | face_match
--   - status: pending -> merged / dismissed
-- ============================================================
CREATE TABLE `tbl_duplicate_detection` (
  `detection_id`        BIGINT        NOT NULL AUTO_INCREMENT,
  `detection_uuid`      VARCHAR(45)   NOT NULL,
  `member_id_primary`   INT           NOT NULL COMMENT 'The member to keep (if merged)',
  `member_id_duplicate` INT           NOT NULL COMMENT 'The suspected duplicate',
  `community_id`        INT           NOT NULL,
  `confidence_score`    DECIMAL(4,3)  DEFAULT NULL COMMENT '0.000 to 1.000',
  `detection_method`    VARCHAR(50)   DEFAULT NULL COMMENT 'rule_based / name_match / phone_match / face_match',
  `match_details`       JSON          DEFAULT NULL COMMENT 'JSON object with field-level match breakdown',
  `status`              VARCHAR(20)   NOT NULL DEFAULT 'pending' COMMENT 'pending / merged / dismissed',
  `reviewed_by`         INT           DEFAULT NULL,
  `reviewed_at`         DATETIME      DEFAULT NULL,
  `created_at`          DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`detection_id`),
  UNIQUE KEY `uq_detection_uuid` (`detection_uuid`),
  UNIQUE KEY `uq_member_pair_dup` (`member_id_primary`, `member_id_duplicate`, `community_id`),
  KEY `idx_dd_primary` (`member_id_primary`),
  KEY `idx_dd_duplicate` (`member_id_duplicate`),
  KEY `idx_dd_status` (`status`),
  KEY `idx_dd_community` (`community_id`),
  CONSTRAINT `fk_dd_primary` FOREIGN KEY (`member_id_primary`)
    REFERENCES `tbl_member_profile` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_dd_duplicate` FOREIGN KEY (`member_id_duplicate`)
    REFERENCES `tbl_member_profile` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_dd_community` FOREIGN KEY (`community_id`)
    REFERENCES `tbl_community` (`community_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='Possible duplicate member profiles detected for admin review';


-- ============================================================
-- TABLE FG-6: tbl_job_runs
-- PURPOSE: Background job tracking for async operations like:
--          - AI match suggestion engine runs
--          - Duplicate detection scans
--          - Family graph rebuild jobs
--          - Face recognition batch processing
--
-- DESIGN:
--   - job_type: identifier for what kind of job ran
--   - status: queued -> running -> completed / failed
--   - result_summary: JSON with counts/stats from the job
-- ============================================================
CREATE TABLE `tbl_job_runs` (
  `job_id`            BIGINT        NOT NULL AUTO_INCREMENT,
  `job_uuid`          VARCHAR(45)   NOT NULL,
  `job_type`          VARCHAR(100)  NOT NULL COMMENT 'e.g. ai_match_scan / duplicate_scan / face_batch / graph_rebuild',
  `community_id`      INT           DEFAULT NULL COMMENT 'NULL = platform-wide job',
  `status`            VARCHAR(20)   NOT NULL DEFAULT 'queued' COMMENT 'queued / running / completed / failed',
  `triggered_by`      INT           DEFAULT NULL COMMENT 'FK to tbl_member_profile (admin who triggered)',
  `trigger_type`      VARCHAR(20)   DEFAULT 'manual' COMMENT 'manual / scheduled / event',
  `started_at`        DATETIME      DEFAULT NULL,
  `completed_at`      DATETIME      DEFAULT NULL,
  `duration_seconds`  INT           DEFAULT NULL COMMENT 'Total run time in seconds',
  `records_processed` INT           DEFAULT 0,
  `records_affected`  INT           DEFAULT 0,
  `result_summary`    JSON          DEFAULT NULL COMMENT 'JSON stats from job output',
  `error_message`     TEXT          DEFAULT NULL COMMENT 'Error details if status=failed',
  `created_at`        DATETIME      DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`job_id`),
  UNIQUE KEY `uq_job_uuid` (`job_uuid`),
  KEY `idx_jr_status` (`status`),
  KEY `idx_jr_type` (`job_type`),
  KEY `idx_jr_community` (`community_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  COMMENT='Background job run tracking for AI matching, duplicate scans, and batch operations';


-- ============================================================
-- END OF FAMILY GRAPH SCHEMA
-- New Tables: 6
-- tbl_family_relationships, tbl_family_match_suggestions,
-- tbl_family_join_requests, tbl_family_merge_history,
-- tbl_duplicate_detection, tbl_job_runs
-- ============================================================
