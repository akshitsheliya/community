-- community_migration.sql

-- Set safe updates off for updates
SET SQL_SAFE_UPDATES = 0;


-- ================================
-- Add column community_uuid in tbl_community
-- ================================
ALTER TABLE `tbl_community`
ADD COLUMN `community_uuid` varchar(45) DEFAULT NULL AFTER `updated_on`;


-- ================================
-- Add column community_number in tbl_community
-- ================================
ALTER TABLE `tbl_community`
ADD COLUMN `community_number` INT DEFAULT NULL AFTER `community_uuid`;

-- ================================
-- Alter tbl_abroad_member
-- ================================
ALTER TABLE `community`.`tbl_abroad_member` 
ADD COLUMN `added_by` INT NULL AFTER `updated_at`,
ADD COLUMN `community_id` INT NULL AFTER `added_by`,
ADD INDEX `tbl_abroad_member_fk_idx` (`community_id` ASC) VISIBLE;

ALTER TABLE `community`.`tbl_abroad_member` 
ADD CONSTRAINT `tbl_abroad_member_fk`
  FOREIGN KEY (`community_id`)
  REFERENCES `community`.`tbl_community` (`community_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

UPDATE `community`.`tbl_abroad_member` 
SET `community_id` = 1 
WHERE `community_id` IS NULL;

-- ================================
-- Alter tbl_donors
-- ================================
ALTER TABLE `community`.`tbl_donors` 
ADD COLUMN `added_by` INT NULL AFTER `donor_type`,
ADD COLUMN `community_id` INT NULL AFTER `added_by`,
ADD INDEX `tbl_donors_fk_idx` (`community_id` ASC) VISIBLE;

ALTER TABLE `community`.`tbl_donors` 
ADD CONSTRAINT `tbl_donors_fk`
  FOREIGN KEY (`community_id`)
  REFERENCES `community`.`tbl_community` (`community_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

UPDATE `community`.`tbl_donors` 
SET `community_id` = 1 
WHERE `community_id` IS NULL;

-- ================================
-- Alter tbl_feeds
-- ================================
ALTER TABLE `community`.`tbl_feeds` 
ADD COLUMN `added_by` INT NULL AFTER `feed_photo_video`,
ADD COLUMN `community_id` INT NULL AFTER `added_by`,
ADD INDEX `tbl_feeds_fk_idx` (`community_id` ASC) VISIBLE;

ALTER TABLE `community`.`tbl_feeds` 
ADD CONSTRAINT `tbl_feeds_fk`
  FOREIGN KEY (`community_id`)
  REFERENCES `community`.`tbl_community` (`community_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

UPDATE `community`.`tbl_feeds` 
SET `community_id` = 1 
WHERE `community_id` IS NULL;

-- ================================
-- Update tbl_community UUID
-- ================================
UPDATE `community`.`tbl_community`
SET `community_uuid` = 'deb47b71-6670-44c5-9a2c-bf2908dadf97'
WHERE `community_uuid` IS NULL;

-- ================================
-- Alter tbl_marksheets
-- ================================
ALTER TABLE `community`.`tbl_marksheets` 
ADD COLUMN `community_id` INT NULL AFTER `father_phone_number`,
ADD INDEX `tbl_marksheets_fk_idx` (`community_id` ASC) VISIBLE;

ALTER TABLE `community`.`tbl_marksheets` 
ADD CONSTRAINT `tbl_marksheets_fk`
  FOREIGN KEY (`community_id`)
  REFERENCES `community`.`tbl_community` (`community_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

UPDATE `community`.`tbl_marksheets` 
SET `community_id` = 1 
WHERE `community_id` IS NULL;

-- ================================
-- Alter tbl_marksheet_configuration
-- ================================
ALTER TABLE `community`.`tbl_marksheet_configuration` 
ADD COLUMN `community_id` INT NULL AFTER `added_by`,
ADD INDEX `tbl_marksheet_configuration_fk_idx` (`community_id` ASC) VISIBLE;

ALTER TABLE `community`.`tbl_marksheet_configuration` 
ADD CONSTRAINT `tbl_marksheet_configuration_fk`
  FOREIGN KEY (`community_id`)
  REFERENCES `community`.`tbl_community` (`community_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

UPDATE `community`.`tbl_marksheet_configuration` 
SET `community_id` = 1 
WHERE `community_id` IS NULL;

-- ================================
-- Alter tbl_notifications
-- ================================
ALTER TABLE `community`.`tbl_notifications` 
ADD COLUMN `community_id` INT NULL AFTER `notification_uuid`,
ADD INDEX `tbl_notification_fk_idx` (`community_id` ASC) VISIBLE;

ALTER TABLE `community`.`tbl_notifications` 
ADD CONSTRAINT `tbl_notification_fk`
  FOREIGN KEY (`community_id`)
  REFERENCES `community`.`tbl_community` (`community_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

UPDATE `community`.`tbl_notifications` 
SET `community_id` = 1 
WHERE `community_id` IS NULL;

-- ================================
-- Alter tbl_community_member_relation
-- ================================
ALTER TABLE `community`.`tbl_community_member_relation` 
ADD COLUMN `family_sr_id` INT NULL AFTER `updated_on`,
ADD INDEX `tbl_community_member_relation_fk_idx` (`family_sr_id` ASC) VISIBLE;

ALTER TABLE `community`.`tbl_community_member_relation` 
ADD CONSTRAINT `tbl_community_member_relation_fk`
  FOREIGN KEY (`family_sr_id`)
  REFERENCES `community`.`tbl_families` (`family_sr_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `community`.`tbl_community_member_relation` 
ADD COLUMN `family_number` INT NULL AFTER `family_sr_id`,
ADD COLUMN `is_login_active` INT NULL AFTER `family_number`,
ADD COLUMN `is_approved` INT NULL AFTER `is_login_active`,
ADD COLUMN `verified_by` INT NULL AFTER `is_approved`;

UPDATE tbl_community_member_relation cmr
JOIN tbl_member_profile mp ON cmr.member_id = mp.member_id
LEFT JOIN tbl_families f ON mp.family_sr_id = f.family_sr_id
LEFT JOIN tbl_logins l ON cmr.member_id = l.member_id
SET
    cmr.is_login_active = l.is_active,
    cmr.is_approved = l.is_verified,
    cmr.verified_by = l.verified_by,
    cmr.family_sr_id = mp.family_sr_id,
    cmr.family_number = f.family_number
WHERE cmr.member_id = mp.member_id;

-- ================================
-- Drop unused columns
-- ================================
ALTER TABLE `community`.`tbl_logins` 
DROP COLUMN `verified_by`,
DROP COLUMN `is_verified`,
DROP COLUMN `is_active`;

ALTER TABLE `community`.`tbl_families` 
DROP COLUMN `family_number`;

-- ================================
-- Reject reason migration
-- ================================
ALTER TABLE `tbl_community_member_relation`
ADD COLUMN `reject_reason` VARCHAR(255) DEFAULT NULL;

UPDATE `tbl_community_member_relation` cmr
INNER JOIN `tbl_member_profile` mp ON cmr.member_id = mp.member_id
INNER JOIN `tbl_logins` l ON mp.member_id = l.member_id
SET cmr.reject_reason = l.reject_reason
WHERE l.reject_reason IS NOT NULL
  AND cmr.is_approved = 0
  AND cmr.is_login_active = 0;

ALTER TABLE `community`.`tbl_logins` 
DROP COLUMN `reject_reason`;

-- ================================
-- Re-enable safe updates
-- ================================
SET SQL_SAFE_UPDATES = 1;

-- ================================
-- Create tbl_business
-- ================================
CREATE TABLE `tbl_business` (
  `business_id` INT NOT NULL AUTO_INCREMENT,
  `business_uuid` VARCHAR(45) COLLATE utf8mb4_general_ci NOT NULL,
  `added_by` INT DEFAULT NULL,
  `community_id` INT DEFAULT NULL,
  `business_name` VARCHAR(255) COLLATE utf8mb4_general_ci NOT NULL,
  `business_photo` VARCHAR(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `business_logo` VARCHAR(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `city` VARCHAR(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `state` VARCHAR(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `business_type` VARCHAR(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` TEXT COLLATE utf8mb4_general_ci,
  `contact_number` VARCHAR(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contact_email` VARCHAR(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`business_id`),
  UNIQUE KEY `business_uuid` (`business_uuid`),
  UNIQUE KEY `business_uuid_UNIQUE` (`business_uuid`),
  KEY `idx_added_by` (`added_by`),
  KEY `idx_community_id` (`community_id`),
  CONSTRAINT `fk_business_community` FOREIGN KEY (`community_id`) REFERENCES `tbl_community` (`community_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_business_member` FOREIGN KEY (`added_by`) REFERENCES `tbl_member_profile` (`member_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ================================
-- Create tbl_app_version
-- ================================
CREATE TABLE `tbl_app_version` (
  `id` TINYINT(1) NOT NULL,
  `latest_ios_app_version` VARCHAR(50) DEFAULT NULL,
  `latest_android_app_version` VARCHAR(50) DEFAULT NULL,
  `force_update` TINYINT(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ================================
-- Create tbl_business_category
-- ================================
CREATE TABLE `tbl_business_category` (
`id` int NOT NULL,  
`services_guj` varchar(50) DEFAULT NULL,
  `services_eng` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
 


-- ================================
-- insert business info into tbl_business_category
-- ================================
INSERT INTO `tbl_business_category` (`id`, `services_eng`, `services_guj`) VALUES
(1, 'real estate', 'રીયલ એસ્ટેટ'),
(2, 'textile', 'ટેક્સટાઇલ'),
(3, 'garment', 'ગાર્મેન્ટ'),
(4, 'manufacturer', 'ઉત્પાદક'),
(5, 'lawyer', 'વકીલ'),
(6, 'service', 'સેવા'),
(7, 'trading', 'ટ્રેડિંગ'),
(8, 'board banner', 'બોર્ડ બેન્નર'),
(9, 'jewellers', 'જ્વેલર્સ'),
(10, 'chartered accountant', 'ચાર્ટર્ડ અકાઉન્ટન્ટ'),
(11, 'filter', 'ફિલ્ટર'),
(12, 'handloom', 'હેન્ડલૂમ'),
(13, 'event management', 'ઇવેન્ટ મેનેજમેન્ટ'),
(14, 'skin hair specialist', 'સ્કિન હેર સ્પેશિયાલિસ્ટ'),
(15, 'gynecologist', 'ગાયનેકોલોજિસ્ટ'),
(16, 'dentist', 'ડેન્ટિસ્ટ'),
(17, 'printing services', 'પ્રિન્ટિંગ સર્વિસિસ'),
(18, 'art gallery', 'આર્ટ ગેલેરી'),
(19, 'insurance', 'ઈન્સ્યોરન્સ'),
(20, 'electronics', 'ઇલેક્ટ્રોનિક્સ'),
(21, 'laboratory', 'લેબોરેટરી'),
(22, 'medical chemist', 'મેડિકલ કેમિસ્ટ'),
(23, 'insurance consultant', 'ઈન્સ્યોરન્સ કન્સલ્ટન્ટ'),
(24, 'food', 'ફૂડ'),
(25, 'food and sweets', 'ફૂડ એન્ડ સ્વીટ્સ'),
(26, 'service consultant', 'સર્વિસ કન્સલ્ટન્ટ'),
(27, 'mobile shop', 'મોબાઇલ શોપ'),
(28, 'cosmetics', 'કોસ્મેટિક્સ'),
(29, 'beauty parlor', 'બ્યૂટી પાર્લર'),
(30, 'healthcare', 'હેલ્થકેર'),
(31, 'sales and services', 'સેલ્સ એન્ડ સર્વિસિસ'),
(32, 'accounting medical supply', 'એકાઉન્ટિંગ મેડિકલ સપ્લાય'),
(33, 'architect', 'આર્કિટેક્ટ'),
(34, 'real-estate broker', 'રિયલ એસ્ટેટ બ્રોકર'),
(35, 'furniture', 'ફર્નિચર'),
(36, 'cnc cutting', 'CNC કટિંગ'),
(37, 'car dealer', 'કાર ડીલર'),
(38, 'computer and cctv', 'કમ્પ્યુટર એન્ડ CCTV'),
(39, 'fabrication', 'ફેબ્રિકેશન'),
(40, 'auto parts', 'ઓટોપાર્ટ્સ'),
(41, 'travels', 'ટ્રાવેલ્સ'),
(42, 'cloth shop', 'કપડાંની દુકાન'),
(43, 'solar shop', 'સોલાર શોપ'),
(44, 'software developer', 'સોફ્ટવેર ડેવલપર'),
(45, 'plywood and hardware', 'પ્લાયવુડ એન્ડ હાર્ડવેર'),
(46, 'others', 'અન્ય'),
(47, 'saloon', 'સલૂન'),
(48, 'handcrafts', 'હેન્ડક્રાફ્ટ્સ'),
(49, 'lighting', 'લાઇટિંગ'),
(50, 'fiber and aluminium', 'ફાઈબર એન્ડ એલ્યુમિનિયમ'),
(51, 'construction', 'કન્સ્ટ્રક્શન'),
(52, 'construction material supply', 'કન્સ્ટ્રક્શન મટિરિયલ સપ્લાય'),
(53, 'diamonds', 'ડાયમંડ');

-- ================================
-- Add column in tbl_business_category
-- ================================
ALTER TABLE `community`.`tbl_business` 
ADD COLUMN `category` VARCHAR(45) NULL AFTER `updated_at`;
 
 -- ================================
-- Add column in tbl_business
-- ================================
ALTER TABLE `community`.`tbl_business` 
ADD COLUMN `services_products` LONGTEXT NULL DEFAULT NULL AFTER `category`;



 -- ================================
-- Update tbl_business_category (capitalize first letter of each word)
-- ================================
UPDATE tbl_business_category SET services_eng = 'Real Estate' WHERE id = 1;
UPDATE tbl_business_category SET services_eng = 'Textile' WHERE id = 2;
UPDATE tbl_business_category SET services_eng = 'Garment' WHERE id = 3;
UPDATE tbl_business_category SET services_eng = 'Manufacturer' WHERE id = 4;
UPDATE tbl_business_category SET services_eng = 'Lawyer' WHERE id = 5;
UPDATE tbl_business_category SET services_eng = 'Service' WHERE id = 6;
UPDATE tbl_business_category SET services_eng = 'Trading' WHERE id = 7;
UPDATE tbl_business_category SET services_eng = 'Board Banner' WHERE id = 8;
UPDATE tbl_business_category SET services_eng = 'Jewellers' WHERE id = 9;
UPDATE tbl_business_category SET services_eng = 'Chartered Accountant' WHERE id = 10;
UPDATE tbl_business_category SET services_eng = 'Filter' WHERE id = 11;
UPDATE tbl_business_category SET services_eng = 'Handloom' WHERE id = 12;
UPDATE tbl_business_category SET services_eng = 'Event Management' WHERE id = 13;
UPDATE tbl_business_category SET services_eng = 'Skin Hair Specialist' WHERE id = 14;
UPDATE tbl_business_category SET services_eng = 'Gynecologist' WHERE id = 15;
UPDATE tbl_business_category SET services_eng = 'Dentist' WHERE id = 16;
UPDATE tbl_business_category SET services_eng = 'Printing Services' WHERE id = 17;
UPDATE tbl_business_category SET services_eng = 'Art Gallery' WHERE id = 18;
UPDATE tbl_business_category SET services_eng = 'Insurance' WHERE id = 19;
UPDATE tbl_business_category SET services_eng = 'Electronics' WHERE id = 20;
UPDATE tbl_business_category SET services_eng = 'Laboratory' WHERE id = 21;
UPDATE tbl_business_category SET services_eng = 'Medical Chemist' WHERE id = 22;
UPDATE tbl_business_category SET services_eng = 'Insurance Consultant' WHERE id = 23;
UPDATE tbl_business_category SET services_eng = 'Food' WHERE id = 24;
UPDATE tbl_business_category SET services_eng = 'Food And Sweets' WHERE id = 25;
UPDATE tbl_business_category SET services_eng = 'Service Consultant' WHERE id = 26;
UPDATE tbl_business_category SET services_eng = 'Mobile Shop' WHERE id = 27;
UPDATE tbl_business_category SET services_eng = 'Cosmetics' WHERE id = 28;
UPDATE tbl_business_category SET services_eng = 'Beauty Parlor' WHERE id = 29;
UPDATE tbl_business_category SET services_eng = 'Healthcare' WHERE id = 30;
UPDATE tbl_business_category SET services_eng = 'Sales And Services' WHERE id = 31;
UPDATE tbl_business_category SET services_eng = 'Accounting Medical Supply' WHERE id = 32;
UPDATE tbl_business_category SET services_eng = 'Architect' WHERE id = 33;
UPDATE tbl_business_category SET services_eng = 'Real-Estate Broker' WHERE id = 34;
UPDATE tbl_business_category SET services_eng = 'Furniture' WHERE id = 35;
UPDATE tbl_business_category SET services_eng = 'Cnc Cutting' WHERE id = 36;
UPDATE tbl_business_category SET services_eng = 'Car Dealer' WHERE id = 37;
UPDATE tbl_business_category SET services_eng = 'Computer And Cctv' WHERE id = 38;
UPDATE tbl_business_category SET services_eng = 'Fabrication' WHERE id = 39;
UPDATE tbl_business_category SET services_eng = 'Auto Parts' WHERE id = 40;
UPDATE tbl_business_category SET services_eng = 'Travels' WHERE id = 41;
UPDATE tbl_business_category SET services_eng = 'Cloth Shop' WHERE id = 42;
UPDATE tbl_business_category SET services_eng = 'Solar Shop' WHERE id = 43;
UPDATE tbl_business_category SET services_eng = 'Software Developer' WHERE id = 44;
UPDATE tbl_business_category SET services_eng = 'Plywood And Hardware' WHERE id = 45;
UPDATE tbl_business_category SET services_eng = 'Others' WHERE id = 46;
UPDATE tbl_business_category SET services_eng = 'Saloon' WHERE id = 47;
UPDATE tbl_business_category SET services_eng = 'Handcrafts' WHERE id = 48;
UPDATE tbl_business_category SET services_eng = 'Lighting' WHERE id = 49;
UPDATE tbl_business_category SET services_eng = 'Fiber And Aluminium' WHERE id = 50;
UPDATE tbl_business_category SET services_eng = 'Construction' WHERE id = 51;
UPDATE tbl_business_category SET services_eng = 'Construction Material Supply' WHERE id = 52;
UPDATE tbl_business_category SET services_eng = 'Diamonds' WHERE id = 53;




ALTER TABLE tbl_logins
ADD COLUMN batchid varchar(100) DEFAULT NULL;
 
ALTER TABLE tbl_logins
ADD COLUMN msgid varchar(100) DEFAULT NULL;
 
CREATE TABLE `tbl_sms_logs` (
  `sms_logs_id` INT NOT NULL,
  `phone_number` VARCHAR(45) NULL,
  `sms_request_url` VARCHAR(500) NULL,
  `sms_api_response` VARCHAR(300) NULL,
  `added_on` VARCHAR(45) NULL,
  PRIMARY KEY (`sms_logs_id`));
  ALTER TABLE `community`.`tbl_sms_logs` 
CHANGE COLUMN `sms_logs_id` `sms_logs_id` INT NOT NULL AUTO_INCREMENT ;