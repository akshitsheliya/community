# Community App — Database Schema Analysis

> **Generated:** 2026-07-03  
> **Method:** Reverse-engineered from TypeScript model files in `src/models/` and `src/controllers/`  
> **Source Files Scanned:** 15 model files, 3 controller files, 1 middleware file

---

## 1. Tables Found (Base Schema — 21 Tables)

| # | Table Name | Purpose | ~Columns |
|---|-----------|---------|---------|
| 1 | `tbl_community` | Community/sabha groups on the platform | 7 |
| 2 | `tbl_families` | Family units; each has one main representative | 6 |
| 3 | `tbl_member_profile` | **Core table.** Personal, professional, role data per member | 27 |
| 4 | `tbl_logins` | Authentication: OTP, JWT UUID, FCM token, SMS tracking | 14 |
| 5 | `tbl_community_member_relation` | Pivot: member ↔ community with approval + family info | 10 |
| 6 | `tbl_business_category` | 53 pre-defined business/service category types | 3 |
| 7 | `tbl_business` | Member business directory listings | 15 |
| 8 | `tbl_feeds` | Notice board: news, events, death notices, meetings | 14 |
| 9 | `tbl_donors` | Donation records (member + anonymous donors) | 12 |
| 10 | `tbl_abroad_member` | Members living/working abroad; professional listings | 16 |
| 11 | `tbl_marksheet_configuration` | Admin config for marksheet submission windows | 8 |
| 12 | `tbl_marksheets` | Student marksheet uploads; auto-ranked on approval | 19 |
| 13 | `tbl_notifications` | In-app push notification history | 8 |
| 14 | `tbl_photo_albums` | Gallery album containers (folder = album_uuid) | 7 |
| 15 | `tbl_photos` | Individual gallery photos; processed by face AI | 8 |
| 16 | `tbl_face_clusters` | AI face identity clusters (embedding vectors) | 3 |
| 17 | `tbl_selfie_photos` | Junction: face clusters ↔ gallery photos with distance | 5 |
| 18 | `tbl_facedata` | User selfie uploads for "Find My Photos" feature | 9 |
| 19 | `tbl_app_version` | iOS/Android version for force-update enforcement | 4 |
| 20 | `tbl_sms_logs` | Audit log for outgoing OTP SMS via MADZ API | 5 |
| 21 | `tbl_delete_account_requests` | User-submitted account deletion requests | 5 |

---

## 2. New Family Graph Tables (6 Additive Tables)

| # | Table Name | Purpose |
|---|-----------|---------|
| FG-1 | `tbl_family_relationships` | Graph edge table: directed member-to-member relationships |
| FG-2 | `tbl_family_match_suggestions` | AI engine suggestions for possible family connections |
| FG-3 | `tbl_family_join_requests` | New member requests to join an existing family group |
| FG-4 | `tbl_family_merge_history` | Audit trail for family group merge operations |
| FG-5 | `tbl_duplicate_detection` | Possible duplicate member profiles for admin review |
| FG-6 | `tbl_job_runs` | Background job tracking (AI scans, batch operations) |

---

## 3. Foreign Key Relationship Diagram

```
tbl_community
  └── tbl_community_member_relation (community_id)
  └── tbl_business (community_id)
  └── tbl_feeds (community_id)
  └── tbl_donors (community_id)
  └── tbl_abroad_member (community_id)
  └── tbl_marksheet_configuration (community_id)
  └── tbl_marksheets (community_id)
  └── tbl_notifications (community_id)
  └── [FG] tbl_family_relationships (community_id)
  └── [FG] tbl_family_match_suggestions (community_id)
  └── [FG] tbl_family_join_requests (community_id)
  └── [FG] tbl_family_merge_history (community_id)
  └── [FG] tbl_duplicate_detection (community_id)

tbl_families
  └── tbl_member_profile (family_sr_id)   ← many members per family
  └── tbl_community_member_relation (family_sr_id)
  └── tbl_families.family_main_member_id → tbl_member_profile  [deferred FK]
  └── [FG] tbl_family_relationships (family_sr_id)
  └── [FG] tbl_family_join_requests (target_family_sr_id)
  └── [FG] tbl_family_merge_history (target_family_sr_id)

tbl_member_profile
  └── tbl_logins (member_id)
  └── tbl_community_member_relation (member_id)
  └── tbl_donors (member_id)
  └── tbl_abroad_member (member_id)
  └── tbl_notifications (member_id)
  └── tbl_business (added_by)
  └── [FG] tbl_family_relationships (from_member_id, to_member_id)
  └── [FG] tbl_family_match_suggestions (member_id_a, member_id_b)
  └── [FG] tbl_duplicate_detection (member_id_primary, member_id_duplicate)

tbl_logins
  └── tbl_marksheets (user_id)
  └── tbl_facedata (upload_by_user_id)

tbl_photo_albums
  └── tbl_photos (photo_album_id)
  └── tbl_selfie_photos (album_uuid)  ← denormalized

tbl_photos
  └── tbl_selfie_photos (photo_id)

tbl_face_clusters
  └── tbl_selfie_photos (cluster_id)
  └── tbl_facedata (cluster_id)
```

---

## 4. Circular / Deferred Foreign Keys

> [!WARNING]
> The `tbl_families` ↔ `tbl_member_profile` relationship is **circular**:
> - `tbl_member_profile.family_sr_id` → `tbl_families.family_sr_id`
> - `tbl_families.family_main_member_id` → `tbl_member_profile.member_id`
>
> **Resolution in schema:** `tbl_families` is created first **without** the FK on `family_main_member_id`. After `tbl_member_profile` is created, an `ALTER TABLE` adds the deferred FK. This is correct and standard practice.

---

## 5. Inconsistencies & Issues Found

> [!NOTE]
> These are observations from the code scan — not blocking issues, but worth knowing.

| Issue | Detail | Recommendation |
|-------|--------|---------------|
| **`tbl_donors.member_id` is INT but donor_id is UUID string** | `donor_id` uses MySQL `UUID()` → VARCHAR(45); `member_id` references INT profile. Different type pattern than other tables. | Consistent, but note: no FK from `tbl_donors.added_by` to `tbl_member_profile` is enforced — added in schema. |
| **`tbl_photo_albums.added_by` is VARCHAR(50)** | All other `added_by` columns are INT (member_id). This one stores a UUID string. | Either normalise to INT or document the inconsistency clearly. |
| **`tbl_community_member_relation` has no `updated_on` trigger in production queries** | Code inserts `added_on` but some older inserts skip `updated_on`. | The schema adds `ON UPDATE CURRENT_TIMESTAMP` — will self-heal going forward. |
| **`tbl_logins.member_id` can be NULL** | A phone number can be registered (for OTP) before a profile is created. member_id is populated after profile setup. | This is intentional design. Document it. |
| **`tbl_marksheets` has `id` as PK but uses `marksheet_uuid` for API** | Consistent with other tables but slightly mixed — some code queries by `user_id` via JOIN. | The current design is fine. Add index on `user_id` (done in schema). |
| **`tbl_facedata` has no FK on `upload_by_user_id`** | `upload_by_user_id` references `tbl_logins.user_id` but no FK is defined in the model. | Added FK constraint in schema. Ensure `DELETE FROM tbl_facedata WHERE upload_by_user_id = ?` is always run before deleting a login row (already done in `deleteMemberModel.ts`). |
| **`tbl_business.category` is VARCHAR(45)** | Stores a category name string. `tbl_member_profile.business_category_id` references `tbl_business_category.id` (INT). Dual system. | Recommend migrating `tbl_business.category` to use `business_category_id` INT FK for data integrity. |
| **`tbl_community_member_relation.verified_by` stores member_id not user_id** | Approval query: `SET cmr.verified_by = ?` where the value passed is `admin_user_id` from JWT — which is `user_id` from `tbl_logins`. | Clarify: is `verified_by` a `user_id` or `member_id`? The query in `profileModel.ts` suggests it's `member_id` but the naming is ambiguous. |

---

## 6. Tables That Might Be Missing (Referenced but Not Found)

| Referenced As | Status | Notes |
|--------------|--------|-------|
| `tbl_committee_members` | ⚠️ **Not found in any query** | Was in the original known-tables list. Committee management is handled via `is_committee_member` column in `tbl_member_profile`. No separate junction table found. |
| Business category for `tbl_business.category` | ✅ Found as `tbl_business_category` | But linkage is string-based, not FK-based in `tbl_business`. |
| `tbl_channels` (for `channel_id` in `tbl_feeds`) | ⚠️ **Not found** | `tbl_feeds.channel_id` is used but no `tbl_channels` table was found. Either not implemented or planned feature. |

---

## 7. Migration Alterations Merged Into Base Schema

The following `ALTER TABLE` statements from `script.sql` are already **merged into** the `CREATE TABLE` statements in `complete_base_schema.sql`:

| Migration | Merged Into |
|-----------|------------|
| `ALTER TABLE tbl_logins ADD batchid, msgid` | `tbl_logins` base definition |
| `ALTER TABLE tbl_marksheets ADD student_rank` | `tbl_marksheets` base definition |
| `ALTER TABLE tbl_business ADD category, services_products` | `tbl_business` base definition |
| `CREATE TABLE tbl_business_category` (53 rows INSERT) | Table 6 with full INSERT |
| `CREATE TABLE tbl_sms_logs` | Table 20 |

---

## 8. Recommendations

> [!TIP]
> Quick wins to improve data quality and maintainability.

1. **Add `tbl_channels` table** if `channel_id` in `tbl_feeds` is to be used — or remove the column if the feature is abandoned.

2. **Normalise `tbl_business.category`** — replace the VARCHAR category string with an INT FK to `tbl_business_category.id` for data integrity.

3. **Add `tbl_photo_albums.community_id`** — currently albums are global (not community-scoped). This may become a problem when multiple communities share one server instance.

4. **Add composite index** on `tbl_community_member_relation (community_id, is_approved, is_login_active)` — this triple combination is queried in nearly every member listing and approval check.

5. **Add `tbl_member_profile.is_abroad`** flag — or use `tbl_abroad_member` as the source of truth. Currently there's no easy way to tell from the profile alone if a member is abroad.

6. **Audit the `verified_by` column type** in `tbl_community_member_relation` — confirm if it stores `user_id` or `member_id` to avoid confusion.

7. **Add soft-delete support** (`is_deleted TINYINT(1) DEFAULT 0`) to `tbl_member_profile` — currently members are hard-deleted, which cascades to many tables. Soft-delete would allow data recovery.

---

## 9. Files Created

| File | Purpose |
|------|---------|
| [`docs/complete_base_schema.sql`](complete_base_schema.sql) | Full base schema — 21 tables + business category seeds |
| [`docs/family_graph_schema.sql`](family_graph_schema.sql) | 6 new family graph tables (additive only) |
| [`docs/SCHEMA_ANALYSIS.md`](SCHEMA_ANALYSIS.md) | This document |

---

*End of Schema Analysis*
