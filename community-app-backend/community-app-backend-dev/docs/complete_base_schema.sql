-- ============================================================
-- FILE: complete_base_schema.sql
-- PURPOSE: Complete base schema for Community App
--          Reverse-engineered from TypeScript model files in src/models/ and src/controllers/
--          All migration alterations from script.sql are MERGED INTO base tables.
-- GENERATED: 2026-07-03
-- ============================================================

DROP DATABASE IF EXISTS community_app;
CREATE DATABASE community_app CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE community_app;

-- ============================================================
-- TABLE 1: tbl_community
-- PURPOSE: Stores each community (sabha/sangathan) on the platform.
-- SOURCE: loginModel.ts, updateProfileModel.ts, communityNumberModel.ts
-- ============================================================
CREATE TABLE `tbl_community` (
  `community_id`          INT           NOT NULL AUTO_INCREMENT,
  `community_uuid`        VARCHAR(45)   NOT NULL,
  `community_name`        VARCHAR(255)  DEFAULT NULL,
  `community_description` TEXT          DEFAULT NULL,
  `community_number`      INT           DEFAULT NULL,
  `added_on`              DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_on`            DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`community_id`),
  UNIQUE KEY `uq_community_uuid` (`community_uuid`),
  KEY `idx_community_number` (`community_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================
-- TABLE 2: tbl_families
-- PURPOSE: Family groups; each family has one designated main member.
-- SOURCE: profileModel.ts, familiesModel.ts, loginModel.ts
-- ============================================================
CREATE TABLE `tbl_families` (
  `family_sr_id`              INT         NOT NULL AUTO_INCREMENT,
  `family_uuid`               VARCHAR(45) NOT NULL,
  `family_main_member_id`     INT         DEFAULT NULL,
  `number_of_family_members`  INT         DEFAULT 1,
  `added_on`                  DATETIME    DEFAULT CURRENT_TIMESTAMP,
  `updated_on`                DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`family_sr_id`),
  UNIQUE KEY `uq_family_uuid` (`family_uuid`),
  KEY `idx_family_main_member` (`family_main_member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================
-- TABLE 3: tbl_member_profile
-- PURPOSE: Core user profile. Personal, professional, media, and role data per member.
-- SOURCE: familyMemberModel.ts, updateProfileModel.ts, committeeMemberModel.ts
-- ============================================================
CREATE TABLE `tbl_member_profile` (
  `member_id`               INT           NOT NULL AUTO_INCREMENT,
  `member_uuid`             VARCHAR(45)   NOT NULL,
  `family_sr_id`            INT           DEFAULT NULL,
  `first_name`              VARCHAR(100)  DEFAULT NULL,
  `father_name`             VARCHAR(100)  DEFAULT NULL,
  `surname`                 VARCHAR(100)  DEFAULT NULL,
  `gender`                  VARCHAR(20)   DEFAULT NULL,
  `date_of_birth`           DATE          DEFAULT NULL,
  `phone_number`            VARCHAR(20)   DEFAULT NULL,
  `email_id`                VARCHAR(255)  DEFAULT NULL,
  `blood_group`             VARCHAR(10)   DEFAULT NULL,
  `marital_status`          VARCHAR(30)   DEFAULT NULL,
  `relationship`            VARCHAR(100)  DEFAULT NULL,
  `address`                 TEXT          DEFAULT NULL,
  `current_resident`        VARCHAR(255)  DEFAULT NULL,
  `business_or_job_or_any`  VARCHAR(255)  DEFAULT NULL,
  `business_details`        TEXT          DEFAULT NULL,
  `business_category_id`    INT           DEFAULT NULL,
  `profession_sector`       VARCHAR(255)  DEFAULT NULL,
  `education`               VARCHAR(255)  DEFAULT NULL,
  `profile_photo`           VARCHAR(500)  DEFAULT NULL,
  `id_proof`                VARCHAR(500)  DEFAULT NULL,
  `is_committee_member`     TINYINT(1)    DEFAULT 0,
  `is_community_admin`      TINYINT(1)    DEFAULT 0,
  `is_family_representative`TINYINT(1)    DEFAULT 0,
  `is_demo_account`         TINYINT(1)    DEFAULT 0,
  `designation`             VARCHAR(100)  DEFAULT NULL,
  `added_on`                DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_on`              DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`member_id`),
  UNIQUE KEY `uq_member_uuid` (`member_uuid`),
  KEY `idx_family_sr_id` (`family_sr_id`),
  KEY `idx_phone_number` (`phone_number`),
  KEY `idx_is_community_admin` (`is_community_admin`),
  KEY `idx_is_committee_member` (`is_committee_member`),
  CONSTRAINT `fk_member_family` FOREIGN KEY (`family_sr_id`)
    REFERENCES `tbl_families` (`family_sr_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Deferred FK: tbl_families.family_main_member_id -> tbl_member_profile
ALTER TABLE `tbl_families`
  ADD CONSTRAINT `fk_families_main_member`
  FOREIGN KEY (`family_main_member_id`)
  REFERENCES `tbl_member_profile` (`member_id`)
  ON DELETE SET NULL ON UPDATE CASCADE;


-- ============================================================
-- TABLE 4: tbl_logins
-- PURPOSE: Authentication. OTP, JWT UUID, FCM token, SMS tracking per phone number.
-- SOURCE: loginModel.ts, familyMemberModel.ts, newsModel.ts, authController.ts
-- ============================================================
CREATE TABLE `tbl_logins` (
  `user_id`             INT           NOT NULL AUTO_INCREMENT,
  `user_uuid`           VARCHAR(45)   NOT NULL,
  `member_id`           INT           DEFAULT NULL,
  `phone_number`        VARCHAR(20)   DEFAULT NULL,
  `otp`                 VARCHAR(10)   DEFAULT NULL,
  `app_version`         VARCHAR(50)   DEFAULT NULL,
  `fcm_device_token`    VARCHAR(500)  DEFAULT NULL,
  `app_language`        VARCHAR(20)   DEFAULT NULL,
  `feed_read_date_time` DATETIME      DEFAULT NULL,
  `last_login_date`     DATETIME      DEFAULT NULL,
  `batchid`             VARCHAR(100)  DEFAULT NULL,
  `msgid`               VARCHAR(100)  DEFAULT NULL,
  `added_on`            DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_on`          DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_user_uuid` (`user_uuid`),
  KEY `idx_phone_number` (`phone_number`),
  KEY `idx_member_id` (`member_id`),
  CONSTRAINT `fk_logins_member` FOREIGN KEY (`member_id`)
    REFERENCES `tbl_member_profile` (`member_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================
-- TABLE 5: tbl_community_member_relation
-- PURPOSE: Bridge table: member <-> community. Tracks approval, family linkage, status.
-- SOURCE: loginModel.ts, profileModel.ts, familyMemberModel.ts
-- ============================================================
CREATE TABLE `tbl_community_member_relation` (
  `community_member_relation_id` VARCHAR(45) NOT NULL,
  `community_id`      INT           NOT NULL,
  `member_id`         INT           NOT NULL,
  `family_sr_id`      INT           DEFAULT NULL,
  `family_number`     INT           DEFAULT NULL,
  `is_login_active`   TINYINT(1)    DEFAULT 1,
  `is_approved`       TINYINT(1)    DEFAULT 0,
  `verified_by`       INT           DEFAULT NULL,
  `reject_reason`     VARCHAR(255)  DEFAULT NULL,
  `added_on`          DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_on`        DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`community_member_relation_id`),
  UNIQUE KEY `uq_community_member` (`community_id`, `member_id`),
  KEY `idx_cmr_member_id` (`member_id`),
  KEY `idx_cmr_family_sr_id` (`family_sr_id`),
  KEY `idx_cmr_is_approved` (`is_approved`),
  CONSTRAINT `fk_cmr_community` FOREIGN KEY (`community_id`)
    REFERENCES `tbl_community` (`community_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cmr_member` FOREIGN KEY (`member_id`)
    REFERENCES `tbl_member_profile` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cmr_family` FOREIGN KEY (`family_sr_id`)
    REFERENCES `tbl_families` (`family_sr_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================
-- TABLE 6: tbl_business_category
-- PURPOSE: 53 business/service category types (English + Gujarati).
-- SOURCE: script.sql
-- ============================================================
CREATE TABLE `tbl_business_category` (
  `id`            INT           NOT NULL,
  `services_eng`  VARCHAR(100)  DEFAULT NULL,
  `services_guj`  VARCHAR(100)  DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tbl_business_category` VALUES
(1,'Real Estate','Real Estate'),(2,'Textile','Textile'),(3,'Garment','Garment'),
(4,'Manufacturer','Manufacturer'),(5,'Lawyer','Lawyer'),(6,'Service','Service'),
(7,'Trading','Trading'),(8,'Board Banner','Board Banner'),(9,'Jewellers','Jewellers'),
(10,'Chartered Accountant','Chartered Accountant'),(11,'Filter','Filter'),
(12,'Handloom','Handloom'),(13,'Event Management','Event Management'),
(14,'Skin Hair Specialist','Skin Hair Specialist'),(15,'Gynecologist','Gynecologist'),
(16,'Dentist','Dentist'),(17,'Printing Services','Printing Services'),
(18,'Art Gallery','Art Gallery'),(19,'Insurance','Insurance'),
(20,'Electronics','Electronics'),(21,'Laboratory','Laboratory'),
(22,'Medical Chemist','Medical Chemist'),(23,'Insurance Consultant','Insurance Consultant'),
(24,'Food','Food'),(25,'Food And Sweets','Food And Sweets'),
(26,'Service Consultant','Service Consultant'),(27,'Mobile Shop','Mobile Shop'),
(28,'Cosmetics','Cosmetics'),(29,'Beauty Parlor','Beauty Parlor'),
(30,'Healthcare','Healthcare'),(31,'Sales And Services','Sales And Services'),
(32,'Accounting Medical Supply','Accounting Medical Supply'),(33,'Architect','Architect'),
(34,'Real-Estate Broker','Real-Estate Broker'),(35,'Furniture','Furniture'),
(36,'Cnc Cutting','Cnc Cutting'),(37,'Car Dealer','Car Dealer'),
(38,'Computer And Cctv','Computer And Cctv'),(39,'Fabrication','Fabrication'),
(40,'Auto Parts','Auto Parts'),(41,'Travels','Travels'),(42,'Cloth Shop','Cloth Shop'),
(43,'Solar Shop','Solar Shop'),(44,'Software Developer','Software Developer'),
(45,'Plywood And Hardware','Plywood And Hardware'),(46,'Others','Others'),
(47,'Saloon','Saloon'),(48,'Handcrafts','Handcrafts'),(49,'Lighting','Lighting'),
(50,'Fiber And Aluminium','Fiber And Aluminium'),(51,'Construction','Construction'),
(52,'Construction Material Supply','Construction Material Supply'),(53,'Diamonds','Diamonds');


-- ============================================================
-- TABLE 7: tbl_business
-- PURPOSE: Member business directory listings per community.
-- SOURCE: businessModel.ts, script.sql
-- ============================================================
CREATE TABLE `tbl_business` (
  `business_id`       INT           NOT NULL AUTO_INCREMENT,
  `business_uuid`     VARCHAR(45)   NOT NULL,
  `added_by`          INT           DEFAULT NULL,
  `community_id`      INT           DEFAULT NULL,
  `business_name`     VARCHAR(255)  NOT NULL,
  `business_photo`    VARCHAR(500)  DEFAULT NULL,
  `business_logo`     VARCHAR(500)  DEFAULT NULL,
  `city`              VARCHAR(100)  DEFAULT NULL,
  `state`             VARCHAR(100)  DEFAULT NULL,
  `business_type`     VARCHAR(100)  DEFAULT NULL,
  `category`          VARCHAR(45)   DEFAULT NULL,
  `address`           TEXT          DEFAULT NULL,
  `contact_number`    VARCHAR(20)   DEFAULT NULL,
  `contact_email`     VARCHAR(255)  DEFAULT NULL,
  `services_products` LONGTEXT      DEFAULT NULL,
  `created_at`        DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`business_id`),
  UNIQUE KEY `uq_business_uuid` (`business_uuid`),
  KEY `idx_business_community` (`community_id`),
  KEY `idx_business_added_by` (`added_by`),
  CONSTRAINT `fk_business_community` FOREIGN KEY (`community_id`)
    REFERENCES `tbl_community` (`community_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_business_member` FOREIGN KEY (`added_by`)
    REFERENCES `tbl_member_profile` (`member_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================
-- TABLE 8: tbl_feeds
-- PURPOSE: Community notice board: news, events, death notices, meetings.
-- SOURCE: newsModel.ts
-- ============================================================
CREATE TABLE `tbl_feeds` (
  `feed_id`           INT           NOT NULL AUTO_INCREMENT,
  `feed_uuid`         VARCHAR(45)   NOT NULL,
  `channel_id`        INT           DEFAULT NULL,
  `feed_title`        VARCHAR(500)  NOT NULL,
  `feed_description`  TEXT          DEFAULT NULL,
  `feed_type`         ENUM('news','maran_nondh','event','meeting') NOT NULL DEFAULT 'news',
  `feed_photo_video`  VARCHAR(500)  DEFAULT NULL,
  `event_date_time`   DATETIME      DEFAULT NULL,
  `event_address`     TEXT          DEFAULT NULL,
  `event_latitude`    DECIMAL(10,7) DEFAULT NULL,
  `event_longitude`   DECIMAL(10,7) DEFAULT NULL,
  `added_by`          INT           DEFAULT NULL,
  `community_id`      INT           DEFAULT NULL,
  `added_on`          DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_on`        DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`feed_id`),
  UNIQUE KEY `uq_feed_uuid` (`feed_uuid`),
  KEY `idx_feed_community` (`community_id`),
  KEY `idx_feed_added_on` (`added_on`),
  CONSTRAINT `fk_feed_community` FOREIGN KEY (`community_id`)
    REFERENCES `tbl_community` (`community_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================
-- TABLE 9: tbl_donors
-- PURPOSE: Donation records. Donors can be registered members or anonymous.
-- SOURCE: donorsModel.ts
-- ============================================================
CREATE TABLE `tbl_donors` (
  `donor_id`          VARCHAR(45)   NOT NULL,
  `member_id`         INT           DEFAULT NULL,
  `donor_name`        VARCHAR(255)  NOT NULL,
  `donor_mobile_no`   VARCHAR(20)   DEFAULT NULL,
  `is_lifetime_donor` TINYINT(1)    DEFAULT 0,
  `donation_category` VARCHAR(100)  DEFAULT NULL,
  `donation_year`     VARCHAR(10)   DEFAULT NULL,
  `donor_photo`       VARCHAR(500)  DEFAULT NULL,
  `donor_type`        VARCHAR(100)  DEFAULT NULL,
  `added_by`          INT           DEFAULT NULL,
  `community_id`      INT           DEFAULT NULL,
  `added_on`          DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_on`        DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`donor_id`),
  KEY `idx_donor_member` (`member_id`),
  KEY `idx_donor_community` (`community_id`),
  KEY `idx_donation_year` (`donation_year`),
  CONSTRAINT `fk_donor_community` FOREIGN KEY (`community_id`)
    REFERENCES `tbl_community` (`community_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_donor_member` FOREIGN KEY (`member_id`)
    REFERENCES `tbl_member_profile` (`member_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================
-- TABLE 10: tbl_abroad_member
-- PURPOSE: Members residing or working abroad; professional profile listing.
-- SOURCE: abroadMemberModel.ts
-- ============================================================
CREATE TABLE `tbl_abroad_member` (
  `id`                    INT           NOT NULL AUTO_INCREMENT,
  `abroad_uuid`           VARCHAR(45)   NOT NULL,
  `member_id`             INT           DEFAULT NULL,
  `full_name`             VARCHAR(255)  NOT NULL,
  `passport_photo`        VARCHAR(500)  DEFAULT NULL,
  `govt_private`          VARCHAR(50)   DEFAULT NULL,
  `designation`           VARCHAR(255)  DEFAULT NULL,
  `career`                VARCHAR(255)  DEFAULT NULL,
  `experience_year`       INT           DEFAULT NULL,
  `success_mantra`        TEXT          DEFAULT NULL,
  `contact_number`        VARCHAR(20)   DEFAULT NULL,
  `country`               VARCHAR(100)  DEFAULT NULL,
  `city`                  VARCHAR(100)  DEFAULT NULL,
  `thoughts_on_committee` TEXT          DEFAULT NULL,
  `added_by`              INT           DEFAULT NULL,
  `community_id`          INT           DEFAULT NULL,
  `created_at`            DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_at`            DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_abroad_uuid` (`abroad_uuid`),
  KEY `idx_abroad_member` (`member_id`),
  KEY `idx_abroad_community` (`community_id`),
  CONSTRAINT `fk_abroad_community` FOREIGN KEY (`community_id`)
    REFERENCES `tbl_community` (`community_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_abroad_member` FOREIGN KEY (`member_id`)
    REFERENCES `tbl_member_profile` (`member_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================
-- TABLE 11: tbl_marksheet_configuration
-- PURPOSE: Admin-configured rules for marksheet submission per year/community.
-- SOURCE: marksheetModel.ts, countModel.ts, awardEligibleModel.ts
-- ============================================================
CREATE TABLE `tbl_marksheet_configuration` (
  `id`                            INT           NOT NULL AUTO_INCREMENT,
  `marksheet_year`                VARCHAR(10)   NOT NULL,
  `marksheet_std`                 VARCHAR(100)  NOT NULL,
  `marksheet_last_date_to_submit` DATE          DEFAULT NULL,
  `is_active`                     TINYINT(1)    DEFAULT 1,
  `added_by`                      INT           DEFAULT NULL,
  `community_id`                  INT           DEFAULT NULL,
  `added_on`                      DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_on`                    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_msc_community` (`community_id`),
  KEY `idx_msc_year` (`marksheet_year`),
  CONSTRAINT `fk_msc_community` FOREIGN KEY (`community_id`)
    REFERENCES `tbl_community` (`community_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================
-- TABLE 12: tbl_marksheets
-- PURPOSE: Student marksheet submissions. Auto-ranked on admin approval (top 5 per group).
-- SOURCE: marksheetModel.ts, awardEligibleModel.ts
-- ============================================================
CREATE TABLE `tbl_marksheets` (
  `id`                    INT           NOT NULL AUTO_INCREMENT,
  `marksheet_uuid`        VARCHAR(45)   NOT NULL,
  `user_id`               INT           DEFAULT NULL,
  `student_name`          VARCHAR(255)  NOT NULL,
  `standard`              VARCHAR(10)   NOT NULL,
  `medium`                VARCHAR(50)   NOT NULL,
  `stream`                VARCHAR(50)   DEFAULT NULL,
  `percentage`            VARCHAR(10)   NOT NULL,
  `marksheet_year`        VARCHAR(10)   NOT NULL,
  `father_full_name`      VARCHAR(255)  DEFAULT NULL,
  `father_phone_number`   VARCHAR(20)   NOT NULL,
  `marksheet_photo`       VARCHAR(500)  DEFAULT NULL,
  `community_id`          INT           DEFAULT NULL,
  `is_approved`           TINYINT(1)    DEFAULT 0,
  `approved_by_user_id`   INT           DEFAULT NULL,
  `rejection_reason`      TEXT          DEFAULT NULL,
  `student_rank`          INT           DEFAULT 0,
  `added_on`              DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `updated_at`            DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_marksheet_uuid` (`marksheet_uuid`),
  KEY `idx_ms_user` (`user_id`),
  KEY `idx_ms_community` (`community_id`),
  KEY `idx_ms_year_std` (`marksheet_year`, `standard`),
  KEY `idx_ms_approved` (`is_approved`),
  CONSTRAINT `fk_ms_community` FOREIGN KEY (`community_id`)
    REFERENCES `tbl_community` (`community_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================
-- TABLE 13: tbl_notifications
-- PURPOSE: In-app notification history store.
-- SOURCE: storeNotificationsMiddleware.ts, appNotificationModel.ts
-- ============================================================
CREATE TABLE `tbl_notifications` (
  `notification_id`       INT           NOT NULL AUTO_INCREMENT,
  `notification_uuid`     VARCHAR(45)   NOT NULL,
  `member_id`             INT           NOT NULL,
  `community_id`          INT           DEFAULT NULL,
  `notification_type`     VARCHAR(100)  DEFAULT NULL,
  `notification_message`  TEXT          DEFAULT NULL,
  `notification_is_read`  TINYINT(1)    DEFAULT 0,
  `created_at`            DATETIME      DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  UNIQUE KEY `uq_notification_uuid` (`notification_uuid`),
  KEY `idx_notif_member` (`member_id`),
  KEY `idx_notif_community` (`community_id`),
  KEY `idx_notif_is_read` (`notification_is_read`),
  CONSTRAINT `fk_notif_community` FOREIGN KEY (`community_id`)
    REFERENCES `tbl_community` (`community_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_notif_member` FOREIGN KEY (`member_id`)
    REFERENCES `tbl_member_profile` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================
-- TABLE 14: tbl_photo_albums
-- PURPOSE: Gallery album containers. folder_name = album_uuid for disk storage.
-- SOURCE: albumGalleryModel.ts, photoGalleryModel.ts
-- ============================================================
CREATE TABLE `tbl_photo_albums` (
  `photo_album_id`    INT           NOT NULL AUTO_INCREMENT,
  `album_uuid`        VARCHAR(45)   NOT NULL,
  `folder_name`       VARCHAR(100)  DEFAULT NULL,
  `photo_album_year`  VARCHAR(10)   DEFAULT NULL,
  `photo_album_name`  VARCHAR(255)  DEFAULT NULL,
  `added_by`          VARCHAR(50)   DEFAULT NULL,
  `added_on`          DATETIME      DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`photo_album_id`),
  UNIQUE KEY `uq_album_uuid` (`album_uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================
-- TABLE 15: tbl_photos
-- PURPOSE: Individual photos within an album. Processed by face recognition pipeline.
-- SOURCE: photoGalleryModel.ts, faceModel.ts
-- ============================================================
CREATE TABLE `tbl_photos` (
  `photo_id`        INT           NOT NULL AUTO_INCREMENT,
  `photo_uuid`      VARCHAR(45)   DEFAULT NULL,
  `photo_album_id`  INT           NOT NULL,
  `photo_url`       VARCHAR(500)  NOT NULL,
  `thumb_url`       VARCHAR(500)  DEFAULT NULL,
  `added_by`        VARCHAR(50)   DEFAULT NULL,
  `is_processed`    TINYINT(1)    DEFAULT 0,
  `added_on`        DATETIME      DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`photo_id`),
  KEY `idx_photos_album` (`photo_album_id`),
  KEY `idx_photos_processed` (`is_processed`),
  CONSTRAINT `fk_photos_album` FOREIGN KEY (`photo_album_id`)
    REFERENCES `tbl_photo_albums` (`photo_album_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================
-- TABLE 16: tbl_face_clusters
-- PURPOSE: AI face identity clusters. Each cluster = one unique face from gallery photos.
-- SOURCE: faceModel.ts, albumGalleryModel.ts
-- ============================================================
CREATE TABLE `tbl_face_clusters` (
  `cluster_id`  INT         NOT NULL AUTO_INCREMENT,
  `embedding`   MEDIUMTEXT  NOT NULL,
  `created_at`  DATETIME    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cluster_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================
-- TABLE 17: tbl_selfie_photos
-- PURPOSE: Junction: face clusters <-> album photos with AI similarity score.
-- SOURCE: faceModel.ts, albumGalleryModel.ts
-- ============================================================
CREATE TABLE `tbl_selfie_photos` (
  `id`          INT           NOT NULL AUTO_INCREMENT,
  `photo_id`    INT           NOT NULL,
  `cluster_id`  INT           NOT NULL,
  `album_uuid`  VARCHAR(45)   DEFAULT NULL,
  `distance`    FLOAT         DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sp_photo` (`photo_id`),
  KEY `idx_sp_cluster` (`cluster_id`),
  KEY `idx_sp_album_uuid` (`album_uuid`),
  CONSTRAINT `fk_sp_photo` FOREIGN KEY (`photo_id`)
    REFERENCES `tbl_photos` (`photo_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sp_cluster` FOREIGN KEY (`cluster_id`)
    REFERENCES `tbl_face_clusters` (`cluster_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================
-- TABLE 18: tbl_facedata
-- PURPOSE: User selfie uploads for face recognition / photo finder feature.
-- SOURCE: faceModel.ts, deleteMemberModel.ts
-- ============================================================
CREATE TABLE `tbl_facedata` (
  `id`                  INT           NOT NULL AUTO_INCREMENT,
  `selfie_uuid`         VARCHAR(45)   NOT NULL,
  `upload_by_user_id`   INT           NOT NULL,
  `img_selfie`          VARCHAR(500)  NOT NULL,
  `embedding`           MEDIUMTEXT    DEFAULT NULL,
  `cluster_id`          INT           DEFAULT NULL,
  `processing_status`   VARCHAR(50)   DEFAULT 'pending',
  `is_processed`        TINYINT(1)    DEFAULT 0,
  `added_on`            DATETIME      DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_selfie_uuid` (`selfie_uuid`),
  KEY `idx_fd_user` (`upload_by_user_id`),
  KEY `idx_fd_cluster` (`cluster_id`),
  KEY `idx_fd_processed` (`is_processed`),
  CONSTRAINT `fk_fd_cluster` FOREIGN KEY (`cluster_id`)
    REFERENCES `tbl_face_clusters` (`cluster_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================
-- TABLE 19: tbl_app_version
-- PURPOSE: Latest iOS/Android app versions for force-update enforcement.
-- SOURCE: countModel.ts
-- ============================================================
CREATE TABLE `tbl_app_version` (
  `id`                          TINYINT(1)  NOT NULL,
  `latest_ios_app_version`      VARCHAR(50) DEFAULT NULL,
  `latest_android_app_version`  VARCHAR(50) DEFAULT NULL,
  `force_update`                TINYINT(1)  DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tbl_app_version` VALUES (1, '1.0.0', '1.0.0', 0);


-- ============================================================
-- TABLE 20: tbl_sms_logs
-- PURPOSE: Audit log for outgoing OTP SMS via MADZ API.
-- SOURCE: script.sql
-- ============================================================
CREATE TABLE `tbl_sms_logs` (
  `sms_logs_id`       INT           NOT NULL AUTO_INCREMENT,
  `phone_number`      VARCHAR(20)   DEFAULT NULL,
  `sms_request_url`   VARCHAR(500)  DEFAULT NULL,
  `sms_api_response`  VARCHAR(300)  DEFAULT NULL,
  `added_on`          DATETIME      DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`sms_logs_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================
-- TABLE 21: tbl_delete_account_requests
-- PURPOSE: Account deletion requests submitted by users.
-- SOURCE: authController.ts
-- ============================================================
CREATE TABLE `tbl_delete_account_requests` (
  `id`                        INT           NOT NULL AUTO_INCREMENT,
  `user_id`                   INT           NOT NULL,
  `phone_number`              VARCHAR(20)   DEFAULT NULL,
  `reason_for_delete_account` TEXT          DEFAULT NULL,
  `requested_at`              DATETIME      DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_dar_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ============================================================
-- END OF BASE SCHEMA | Total Tables: 21
-- ============================================================
