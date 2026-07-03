import { dbPool } from "../config/db";
import { selectQuery, updateQuery, insertQuery } from "../helpers/queryHelper";

// Fetch user login data from tbl_logins
export const getLoginData = async (user_uuid: string) => {
  const getLoginQuery = `
        SELECT member_id, phone_number
        FROM tbl_logins
        WHERE user_uuid = ?
    `;
  return await selectQuery(dbPool, getLoginQuery, [user_uuid]);
};

// Fetch user profile data from tbl_member_profile
export const getProfileData = async (member_id: number) => {
  const getProfileQuery = `
    SELECT
        mp.member_id,
        mp.first_name,
        mp.father_name,
        mp.surname,
        mp.profile_photo,
        mp.gender,
        mp.date_of_birth,
        mp.phone_number,
        mp.address,
        mp.business_or_job_or_any,
        mp.business_details,
        mp.education,
        mp.member_uuid,
        mp.blood_group,
        mp.marital_status,
        mp.id_proof,
        mp.email_id,
        mp.relationship,
        mp.is_community_admin,
        mp.current_resident,
        tf.number_of_family_members,
        tf.family_uuid,
        tf.family_main_member_id,  -- Include this
        tl.user_uuid
    FROM
        tbl_member_profile mp
    LEFT JOIN
        tbl_families tf
    ON
        mp.family_sr_id = tf.family_sr_id
    LEFT JOIN
        tbl_logins tl
    ON
        mp.member_id = tl.member_id
    WHERE
        mp.member_id = ?;
    `;
  return await selectQuery(dbPool, getProfileQuery, [member_id]);
};

// Fetch all communities - SIMPLE FIXED: Use SELECT * FROM community.tbl_community to show ALL communities
export const getUserCommunities = async (member_id: number) => {
  const query = `
    SELECT
      c.community_uuid,
      c.community_name
    FROM tbl_community_member_relation cmr
    INNER JOIN tbl_community c
      ON c.community_id = cmr.community_id
    WHERE cmr.member_id = ?
      AND cmr.is_approved = 1
  `;

  return await selectQuery(dbPool, query, [member_id]);
};


// Update user profile data in tbl_member_profile
export const updateProfileData = async (member_id: number, data: any) => {
  const updateProfileQuery = `
    UPDATE tbl_member_profile
    SET
      first_name = ?, father_name = ?, surname = ?, gender = ?,
      date_of_birth = ?, phone_number = ?, address = ?,
      business_or_job_or_any = ?, business_details = ?, education = ?,
      blood_group = ?, marital_status = ?, email_id = ?, relationship = ?, current_resident = ?,
      id_proof = COALESCE(?, id_proof),  /* Only update if new value provided, expects relative path */
      profile_photo = COALESCE(?, profile_photo) /* Expects relative path */
    WHERE member_id = ?`;

  const values = [
    data.first_name,
    data.father_name,
    data.surname,
    data.gender,
    data.date_of_birth,
    data.phone_number,
    data.address,
    data.business_or_job_or_any,
    data.business_details,
    data.education,
    data.blood_group,
    data.marital_status,
    data.email_id,
    data.relationship,
    data.current_resident,
    data.id_proof,
    data.profile_photo,
    member_id,
  ];

  return await updateQuery(dbPool, updateProfileQuery, values);
};

export const checkPhoneNumberExists = async (phone_number: string) => {
  const query = `
    SELECT COUNT(*) AS count
    FROM tbl_logins
    WHERE phone_number = ?
  `;
  const result = await selectQuery(dbPool, query, [phone_number]);
  return result[0].count > 0;
};

export const updatePhoneNumberInLogins = async (member_id: number, phone_number: string) => {
  const query = `
    UPDATE tbl_logins
    SET phone_number = ?, updated_on = NOW()
    WHERE member_id = ?
  `;
  return await updateQuery(dbPool, query, [phone_number, member_id]);
};

// Create login entry for member when phone number is added for the first time
export const createLoginEntry = async (
  user_uuid: string,
  phone_number: string,
  member_id: number,
  added_on: string
) => {
  const query = `
    INSERT INTO tbl_logins (user_uuid, phone_number, member_id, added_on)
    VALUES (?, ?, ?, ?)
  `;
  return await insertQuery(dbPool, query, [user_uuid, phone_number, member_id, added_on]);
};

export const getLoginDataByMemberUUID = async (member_uuid: string) => {
  const query = `
    SELECT member_id, phone_number, member_uuid
    FROM tbl_member_profile
    WHERE member_uuid = ?`;
  return await selectQuery(dbPool, query, [member_uuid]);
};

// Fetch family_sr_id using member_id
export const getFamilySRID = async (member_id: number) => {
  const query = `
    SELECT family_sr_id
    FROM tbl_member_profile
    WHERE member_id = ?`;
  return await selectQuery(dbPool, query, [member_id]);
};

// Update number_of_family_members in tbl_families
export const updateFamilyMemberCount = async (
  family_sr_id: number,
  count: number
) => {
  const query = `
    UPDATE tbl_families
    SET number_of_family_members = ?
    WHERE family_sr_id = ?`;
  return await updateQuery(dbPool, query, [count, family_sr_id]);
};

export const getUpdatedUserData = async (member_id: number): Promise<any[]> => {
  const query = `
    SELECT
      mp.member_id,
      mp.first_name,
      mp.father_name,
      mp.surname,
      mp.gender,
      mp.date_of_birth,
      mp.phone_number,
      mp.address,
      mp.business_or_job_or_any,
      mp.business_details,
      mp.education,
      mp.blood_group,
      mp.marital_status,
      mp.id_proof, -- Returns relative path
      mp.profile_photo, -- Returns relative path
      mp.email_id,
      mp.current_resident,
      mp.relationship,
      mp.is_community_admin,
      mp.member_uuid,
      f.number_of_family_members,
      f.family_uuid,
      f.family_main_member_id,  -- Include this
      tl.user_uuid
    FROM tbl_member_profile AS mp
    LEFT JOIN tbl_families AS f ON mp.family_sr_id = f.family_sr_id
    LEFT JOIN tbl_logins AS tl ON mp.member_id = tl.member_id
    WHERE mp.member_id = ?`;

  return await selectQuery(dbPool, query, [member_id]); // ✅ Return array directly
};
export const getMemberIdByUserUUID = async (
  user_uuid: string
): Promise<number | null> => {
  const [rows]: any = await dbPool.query(
    `
    SELECT member_id
    FROM tbl_logins
    WHERE user_uuid = ?
    LIMIT 1
    `,
    [user_uuid]
  );

  return rows.length ? rows[0].member_id : null;
};


export const isUserRegisteredInCommunity = async (
  member_id: number,
  community_uuid: string
): Promise<boolean> => {
  const [rows]: any = await dbPool.query(
    `
    SELECT 1
    FROM tbl_community_member_relation cmr
    INNER JOIN tbl_community c ON c.community_id = cmr.community_id
    WHERE cmr.member_id = ?
      AND c.community_uuid = ?
      AND cmr.is_approved = 1
    LIMIT 1
    `,
    [member_id, community_uuid]
  );

  return rows.length > 0;
};

// export const isApprovedMemberInCommunity = async (
//   member_id: number,
//   community_uuid: string
// ): Promise<boolean> => {

  // const [rows]: any = await dbPool.query(
  //   `
  //   SELECT 1
  //   FROM tbl_community_member_relation cmr
  //   INNER JOIN tbl_community c ON c.community_id = cmr.community_id
  //   WHERE cmr.member_id = ?
  //     AND c.community_uuid = ?
  //     AND cmr.is_approved = 1
  //   LIMIT 1
  //   `,
  //   [member_id, community_uuid]
  // );

  
//   export const isApprovedMemberInCommunity = 
//   const add = {
//     member_id: number,
//     community_uuid: string
//   }

//   `
//    SELECT 1
//    FROM tbl_community_member_relation cmr
//    INNER JOIN tbl_community c ON c.community_id = cmr.community_id
//     WHERE cmr.member_id = ?
//    AND c.community_uuid = ?
//       AND cmr.is_approved = 1
//     LIMIT 1
//     `

//     return selectQuery(dbPool.query, query, [member_id: number,
//   community_uuid: string]);

// //   return rows.length > 0;
// // };


export const switchUserCommunity = async (
  member_id: number,
  community_uuid: string
): Promise<boolean> => {
  const [result]: any = await dbPool.query(
    `
    select 1 from tbl_community_member_relation cmr
    INNER JOIN tbl_community c ON c.community_id = cmr.community_id
    WHERE cmr.member_id = ?
      AND cmr.is_approved = 1
      AND cmr.is_login_Active = 1
      
    `,
    [community_uuid, member_id]
  );

  return result.affectedRows > 0;
};



export const getActiveCommunityUUIDForUser = async (
  member_id: number
): Promise<string | null> => {
  const [rows]: any = await dbPool.query(
    `
    SELECT c.community_uuid
    FROM tbl_community_member_relation cmr
    INNER JOIN tbl_community c ON c.community_id = cmr.community_id
    WHERE cmr.member_id = ?
      AND cmr.is_login_active = 1
      AND cmr.is_approved = 1
    LIMIT 1
    `,
    [member_id]
  );

  return rows.length ? rows[0].community_uuid : null;
};


export const activateUserCommunity = async (
  user_uuid: string,
  phone_number: string,
  community_uuid: string
): Promise<boolean> => {
  const [result]: any = await dbPool.query(
    `UPDATE tbl_community_member_relation cmr
     INNER JOIN tbl_community c ON cmr.community_id = c.community_id
     INNER JOIN tbl_logins l ON l.member_id = cmr.member_id
     SET cmr.is_login_active = 1
     WHERE l.user_uuid = ?
       AND c.community_uuid = ?
       AND cmr.is_approved = 1`,
    [phone_number, user_uuid, community_uuid]
  );

  return result.affectedRows > 0;
};