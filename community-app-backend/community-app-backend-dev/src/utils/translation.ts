export type Language = "en_US" | "gu_IN";
type MessageKey =
  | "phone_invalid"
  | "user_registered"
  | "otp_sent"
  | "invalid_otp"
  | "register_first"
  | "login_successful"
  | "otp_verified"
  | "profile_created"
  | "server_error"
  | "fml_details_done"
  | "fml_details_err"
  | "inv_req_data"
  | "fml_mem_suc"
  | "fml_mem_err"
  | "proffe_err"
  | "mem_upd_suc"
  | "int_server_err"
  | "news_feed_fsuc"
  | "news_feed_err"
  | "news_uuid_req"
  | "news_notf"
  | "news_suc"
  | "news_err"
  | "news_create_err"
  | "news_create_suc"
  | "event_fields_req"
  | "news_del_suc"
  | "news_del_err"
  | "user_not_auth"
  | "family_sr_id_not_found"
  | "family_detail_ntf"
  | "max_fml_mem"
  | "reach"
  | "failed_2_add_new_mem"
  | "new_fml_mem_add_suc"
  | "create_profile_first"
  | "news_feed_nf"
  | "invalid_phone_number"
  | "all_fields_req"
  | "marksheet_data_stored"
  | "User_not_auth"
  | "Marksheet_data_ret_suc"
  | "No_marksheet_data_fnd"
  | "User_not_fnd_in_logins_tbl"
  | "user_UUID_not_found"
  | "User_not_fnd_in_mem_prof_tbl"
  | "user_data_ret_suc"
  | "No_change_made_to_user_prof"
  | "User_prof_update_suc"
  | "admin_authority"
  | "members_not_found"
  | "family_not_found"
  | "no_students_found"
  | "no_representatives_found"
  | "representatives_retrieved_successfully"
  | "family_member_details_retrieved"
  | "Invalid_album_ID"
  | "photo_upload_required"
  | "photo_uploaded_success"
  | "photo_upload_failed"
  | "album_not_found"
  | "album_folder_not_found"
  | "album_create_success"
  | "album_create_error"
  | "no_records_of_album"
  | "album_fetch_success"
  | "album_fetch_error"
  | "unauthorized"
  | "album_no_records"
  | "marksheet_nf"
  | "failed_fetch_marksheet"
  | "invalid_stream"
  | "marksheet_approved"
  | "marksheet_rejected"
  | "rejection_reason_required"
  | "marksheet_updated"
  | "marksheet_deleted"
  | "marksheet_not_found"
  | "access_denied"
  | "admin_access_denied"
  | "admin_check_success"
  | "invalid_request_data"
  | "no_valid_fields"
  | "Invalid_marksheet_ID"
  | "user_not_found"
  | "donor_added_successfully"
  | "member_already_donor"
  | "donation_year_required"
  | "invalid_donation_category"
  | "no_members_found"
  | "donors_retrieved"
  | "donors_not_found"
  | "folder_not_found"
  | "album_delete_success"
  | "album_delete_error"
  | "donor_deleted_successfully"
  | "donor_updated"
  | "no_families_found"
  | "Auth_token_err"
  | "Invalid_or_expired_token"
  | "Invalid_token_structure"
  | "user_does_not_exist"
  | "account_del_request_success"
  | "user_fetch_success"
  | "admin_ID_is_required"
  | "member_UUID_is_required"
  | "user_not_found_or_already_ver"
  | "user_approved_success"
  | "failed_to_approve_user"
  | "reject_reason_is_req"
  | "user_not_found_or_already_rejected"
  | "user_rejected_success"
  | "failed_to_reject_user"
  | "no_photos_found"
  | "photos_fetched_success"
  | "acc_in_review"
  | "acc_lock"
  | "no_unverified_users_found"
  | "unverified_user_fetch_success"
  | "counts_fetch_success"
  | "failed_to_reject_marksheet"
  | "already_committee_member"
  | "committee_member_updated"
  | "invalid_member_uuid"
  | "no_results_from_python"
  | "no_matching_faces"
  | "faces_recognized_success"
  | "committee_member_removed"
  | "not_committee_member"
  | "album_update_success"
  | "album_update_error"
  | "donor_updated_successfully"
  | "donor_not_updated"
  | "donor_id_required"
  | "donor_not_found"
  | "invalid_request"
  | "selfie_uploaded_success"
  | "unauthorized_access"
  | "selfies_retrieved_success"
  | "missing_params"
  | "selfie_not_found"
  | "no_script_results"
  | "invalid_script_output"
  | "no_similar_faces"
  | "face_recognition_failed"
  | "unknown_error"
  | "member_deleted"
  | "abroad_members_retrieved"
  | "you_cannot_update"
  | "member_updated"
  | "member_added_success"
  | "abroad_members_retrived"
  | "marksheet_year_require"
  | "student_retrieve"
  | "family_count_success"
  | "invalid_designation"
  | "designation_limit_exceeded"
  | "designation_already_assigned_to_member"
  | "selfie_deleted_success"
  | "phone_already_in_family"
  | "surnames_retrieved"
  | "surnames_not_found"
  | "status_check_failed"
  | "surnames_not_found"
  | "no_abroad_member_found"
  | "committee_retrived"
  | "marksheet_success"
  | "already_approved"
  | "already_rejected"
  | "delete_failed"
  | "already_rejected"
  | "language_update_success"
  | "language_update_error"
  | "notifications_fetched_successfully"
  | "error_fetching_notifications"
  | "invalid_notification_uuid"
  | "notification_not_found_or_already_read"
  | "notification_marked_as_read"
  | "error_updating_notification"
  | "phone_already_used_in_other_family"
  |"categories_fetched_success"
  | "number_of_family_members"
  | "news_update_suc"
  | "news_update_err"
  | "notifications_marked_as_read"
  | "notifications_already_read_or_not_found"
  |"app_version_retrieved"
  |"record_not_found"
  | "invalid_community_number"
  | "community_not_found"
  | "community_found"
  | "family_info_not_found"
  | "community_id_not_found"
  | "business_deleted_success"
  | "business_not_found"
  | "business_updated_success"
  | "business_added_success"
  | "businesses_fetched_success"
  |"business_fetched_success";

export const messages: Record<Language, Record<MessageKey, string>> = {
  en_US: {
    phone_invalid: "Phone number must be 10 digits",
    user_registered: "User already registered",
    otp_sent: "OTP sent successfully.",
    invalid_otp: "Invalid OTP",
    register_first: "Please register first",
    login_successful: "Login successful",
    otp_verified: "OTP verified",
    profile_created: "Profile created successfully",
    server_error: "Server error",
    fml_details_done: "Family details fetched successfully",
    fml_details_err: "Error fetching family details",
    inv_req_data: "Invalid request data",
    fml_mem_suc: "Family members fetched successfully",
    fml_mem_err: "Error fetching family members",
    proffe_err: "Invalid profession_sector. Allowed values: 'gov', 'private'.",
    mem_upd_suc: "Member profile updated successfully",
    int_server_err: "Internal Server Error",
    news_feed_fsuc: "News fetched successfully",
    news_feed_err: "Error fetching news",
    news_uuid_req: "News UUID is required",
    news_notf: "News not found",
    news_suc: "News fetched successfully",
    news_err: "Error fetching news",
    news_create_err: "Error creating news ",
    news_create_suc: "News created successfully",
    event_fields_req: "Event-specific fields are required",
    news_del_suc: "News deleted successfully",
    news_del_err: "Error deleting news",
    user_not_auth: "User not authenticated",
    family_sr_id_not_found: "family_sr_id not found",
    family_detail_ntf: "Family details not found.",
    max_fml_mem: "Maximum family members",
    record_not_found: "No record found",
    app_version_retrieved: "App version retrieved successfully",
    reach: "reached.",
    failed_2_add_new_mem: "Failed to add new family member.",
    new_fml_mem_add_suc: "New family member added successfully",
    create_profile_first: "Create your profile first",
    news_feed_nf: "News not found",
    invalid_phone_number: "Invalid phone number",
    all_fields_req: "All fields are required",
    marksheet_data_stored: "Marksheet data stored successfully",
    User_not_auth: "User not authenticated",
    Marksheet_data_ret_suc: "Marksheet data retrieved successfully",
    No_marksheet_data_fnd: "No marksheet data found",
    failed_to_reject_marksheet: "failed_to_reject_marksheet",
    user_UUID_not_found: "User UUID not found in token",
    User_not_fnd_in_logins_tbl: "User not found in logins table",
    User_not_fnd_in_mem_prof_tbl: "User not found in member profile table",
    user_data_ret_suc: "User data retrieved successfully",
    No_change_made_to_user_prof: "No changes made to user profile",
    User_prof_update_suc: "User profile updated successfully",
    admin_authority: "You don't have authority to perform this action.",
    members_not_found: "No family members found",
    family_not_found: "Family not found",
    no_students_found: "No students found",
    no_representatives_found: "No representatives found",
    representatives_retrieved_successfully:
      "Representatives retrieved successfully",
    family_member_details_retrieved: "Member details retrieved successfully",
    Invalid_album_ID: "Invalid album ID",
    photo_upload_required: "Photo upload required",
    photo_uploaded_success: "Photo uploaded successfully",
    photo_upload_failed: "Photo upload failed",
    album_not_found: "Album not found",
    album_folder_not_found: "Album folder not found",
    album_create_success: "album create success",
    album_create_error: "album create error",
    no_records_of_album: "no records of album",
    album_fetch_success: "album fetch success",
    album_fetch_error: "album fetch error",
    unauthorized: "Unauthorized",
    album_no_records: "album no records",
    marksheet_nf: "Marksheet not found",
    failed_fetch_marksheet: "Failed to fetch marksheet",
    invalid_stream: "Invalid stream! Stream must be Science, Commerce, or Arts",
    marksheet_approved: "Marksheet approved successfully.",
    marksheet_rejected: "Marksheet rejected successfully.",
    rejection_reason_required: "Rejection reason is required.",
    already_approved: "Marksheet already approved.",
    already_rejected: "Marksheet already rejected.",
    marksheet_updated: "Marksheet updated successfully.",
    marksheet_deleted: "Marksheet deleted successfully.",
    marksheet_not_found: "Marksheet not found.",
    access_denied: "Access denied. You can only delete your own marksheet.",
    admin_access_denied: "Access denied. Admins only.",
    admin_check_success: "Welcome Admin!",
    invalid_request_data: "Invalid request data.",
    no_valid_fields: "No valid fields provided for update.",
    Invalid_marksheet_ID: "Invalid marksheet ID",
    user_not_found: "User not found",
    donor_added_successfully: "Donor added successfully",
    member_already_donor: "Member is already a donor",
    donation_year_required: "Donation year is required",
    invalid_donation_category: "Invalid donation category",
    no_members_found: "Members not found",
    donors_retrieved: "Donors retrieved successfully",
    donors_not_found: "Donors not found",
    folder_not_found: "Folder not found",
    album_delete_success: "Album deleted successfully",
    album_delete_error: "Album delete error",
    donor_deleted_successfully: "Donor deleted successfully",
    donor_updated: "Donor updated successfully",
    no_families_found: "No families found",
    Auth_token_err: "Authorization token missing or malformed.",
    Invalid_or_expired_token: "Invalid or expired token.",
    Invalid_token_structure: "Invalid token structure.",
    user_does_not_exist: "User does not exist",
    account_del_request_success:
      "Account deletion request submitted successfully",
    unverified_user_fetch_success: "Unverified users fetched successfully",
    admin_ID_is_required: "Unauthorized. Admin ID is required.",
    member_UUID_is_required: "Member UUID is required.",
    user_not_found_or_already_ver: "User not found or already verified.",
    user_approved_success: "User approved successfully.",
    failed_to_approve_user: "Failed to approve user.",
    reject_reason_is_req: "Reject reason is required.",
    user_not_found_or_already_rejected: "User not found or already rejected.",
    user_rejected_success: "User rejected successfully.",
    failed_to_reject_user: "Failed to reject user.",
    no_photos_found: "No photos found",
    business_fetched_success:"business_fetched_success",
    photos_fetched_success: "Photos fetched successfully",
    acc_in_review:
      "Your account is in review. Please wait for sometime or contact committee member.",
    acc_lock: "Your account is locked, please contact committee member.",
    no_unverified_users_found: "No unverified users found",
    user_fetch_success: "Unverified users fetch successfully",
    counts_fetch_success: "Count fetch successfully",
    already_committee_member: "Member is already a committee member",
    committee_member_updated: "Designation updated successfully",
    invalid_member_uuid: "Invalid member UUID",
    faces_recognized_success: "Faces recognized successfully.",
    no_results_from_python: "No results returned from Python script.",
    no_matching_faces: "No matching faces found.",
    committee_member_removed: "Committee member removed successfully",
    not_committee_member: "Not Committee Member ",
    album_update_success: "Album updated successfully",
    album_update_error: "Album update error",
    donor_updated_successfully: "Donor updated successfully",
    donor_not_updated: "Donor not updated",
    donor_id_required: "Donor id required",
    donor_not_found: "Donor not found",
    invalid_request: "Invalid request. Selfie file is required.",
    selfie_uploaded_success: "Selfie uploaded successfully",
    unauthorized_access: "Unauthorized access.",
    selfies_retrieved_success: "Selfies retrieved successfully",
    missing_params: "Missing album UUID, selfie UUID, or user ID",
    selfie_not_found: "Selfie not found",
    no_script_results: "No results returned from Python script",
    invalid_script_output: "Invalid JSON output from Python script",
    no_similar_faces: "No similar faces found",
    face_recognition_failed: "Failed to process face recognition",
    unknown_error: "Unknown error",
    member_deleted: "Member deleted successfully",
    abroad_members_retrieved: "Abroad members retrieved successfully",
    you_cannot_update: "You are not allowed to update this member",
    member_updated: "Member updated successfully",
    member_added_success: "Member added successfully",
    abroad_members_retrived: "Abroad members retrieved",
    marksheet_year_require: "Marksheet year is required",
    student_retrieve: "Student retrieved successfully",
    family_count_success: "family count successfully",
    invalid_designation: "Invalid designation",
    designation_limit_exceeded: "Designation limit exceeded",
    designation_already_assigned_to_member:
      "Designation already assigned to member",
    selfie_deleted_success: "Selfie deleted successfully",
    phone_already_in_family:
      "You are not able to register because you are already part of a family.",
    surnames_retrieved: "Surnames retrieved successfully",
    surnames_not_found: "No surnames found",
    status_check_failed: "Status check failed",
    no_abroad_member_found: "No abroad members found",
    committee_retrived: "Committee members retrieved successfully",
    marksheet_success: "Marksheet retrieved successfully",
    delete_failed: "Failed to delete selfie",
    language_update_success: "Language updated successfully",
    language_update_error: "Language update error",
    notifications_fetched_successfully: " Notifications fetched successfully",
    error_fetching_notifications: "Error fetching notifications",
    invalid_notification_uuid: " Invalid notification UUID",
    categories_fetched_success:"categories_fetched_success",
    notification_not_found_or_already_read:
      " Notification not found or already read",
    notification_marked_as_read: "Notification marked as read",
    error_updating_notification: "Error updating notification",
    phone_already_used_in_other_family:
      "This number is already in use and linked with another family.",
    number_of_family_members: "Number of family members must be less then 20. (Number of family members માં તમારા ઘર માં કેટલા સભ્યો છે તે અંક નાખો)",
    news_update_suc: "News updated successfully",
    news_update_err: "Error updating news",
    notifications_marked_as_read: "Notifications marked as read",
    notifications_already_read_or_not_found: "Notifications already read or not found",
    invalid_community_number: "Invalid community number",
    community_not_found: "Community not found",
    community_found: "Community found successfully",
    family_info_not_found: "Family information not found",
    community_id_not_found: "Community ID not found",
    business_deleted_success:"Business deleted successfully",
    business_not_found: "Business not found",
    business_updated_success: "Business updated successfully",
    business_added_success: "Business added successfully",
    businesses_fetched_success: "Businesses fetched successfully",
  },
  gu_IN: {
    phone_invalid: "ફોન નંબર 10 અંકોનો હોવો આવશ્યક છે",
    user_registered: "વપરાશકર્તા પહેલેથી જ નોંધાયેલ છે",
    otp_sent: "OTP સફળતાપૂર્વક મોકલવામાં આવ્યો",
    invalid_otp: "આપેલો OTP અમાન્ય છે",
    register_first: "કૃપા કરીને પહેલા નોંધણી કરો",
    login_successful: "તમે સફળતાપૂર્વક લૉગિન કરી ચૂક્યા છો",
    otp_verified: "OTP ચકાસણી સફળ રહી",
    profile_created: "પ્રોફાઇલ સફળતાપૂર્વક બનાવાઈ",
    server_error: "સર્વરમાં કોઈ સમસ્યા આવી, કૃપા કરીને ફરી પ્રયાસ કરો",
    already_approved: "માર્કશીટ પહેલાથી જ મંજૂર થઈ ગઈ છે.",
    already_rejected: "માર્કશીટ પહેલાથી જ અસ્વીકૃત થઈ ગઈ છે.",
    fml_details_done: "ફેમિલી વિગતો સફળતાપૂર્વક પ્રાપ્ત થઈ",
    fml_details_err: "ફેમિલી વિગતો મેળવવામાં ભૂલ થઈ",
    inv_req_data: "આપવામાં આવેલ ડેટા અમાન્ય છે",
    fml_mem_suc: "ફેમિલી સભ્યોની વિગતો સફળતાપૂર્વક પ્રાપ્ત થઈ",
    fml_mem_err: "ફેમિલી સભ્યો મેળવવામાં ભૂલ",
    proffe_err:
      "પસંદ કરેલ વ્યવસાય અમાન્ય છે, કૃપા કરીને 'સરકારી' અથવા 'પ્રાઇવેટ' પસંદ કરો",
    mem_upd_suc: "મેમ્બર પ્રોફાઇલ સફળતાપૂર્વક અપડેટ થઈ",
    int_server_err: "આંતરિક સર્વર ભૂલ, કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો",
    news_feed_fsuc: "ન્યૂઝ ફીડ સફળતાપૂર્વક પ્રાપ્ત થઈ",
    news_feed_err: "ન્યૂઝ ફીડ મેળવવામાં ભૂલ",
    news_uuid_req: "કૃપા કરીને ન્યૂઝ UUID દાખલ કરો",
    news_notf: "કોઈ ન્યૂઝ મળ્યું નહીં",
    news_suc: "ન્યૂઝ સફળતાપૂર્વક પ્રાપ્ત થઈ",
    news_err: "ન્યૂઝ મેળવવામાં ભૂલ",
    news_create_err: "ન્યૂઝ બનાવવામાં ભૂલ",
    news_create_suc: "ન્યૂઝ સફળતાપૂર્વક બનાવાઈ",
    event_fields_req: "ઈવેન્ટ માટે જરૂરી માહિતી આપવી ફરજિયાત છે",
    news_del_suc: "ન્યૂઝ સફળતાપૂર્વક ડિલીટ થઈ",
    news_del_err: "ન્યૂઝ ડિલીટ કરવામાં સમસ્યા",
    user_not_auth: "વપરાશકર્તા અધિકૃત નથી",
    family_sr_id_not_found: "family_sr_id મળ્યું નથી",
    family_detail_ntf: "કુટુંબની વિગતો મળેલી નથી",
    max_fml_mem: "તમારા પરિવાર માટેની મર્યાદા",
    record_not_found: "કોઈ રેકોર્ડ મળ્યો નથી",
    app_version_retrieved: "એપ્લિકેશન વર્સીઓન સફળતાપૂર્વક પ્રાપ્ત થયું",
    reach: " છે, જે પહોચી ગઈ છે",
    failed_2_add_new_mem: "નવો મેમ્બર ઉમેરવામાં નિષ્ફળ",
    new_fml_mem_add_suc: "નવો પરિવાર સભ્ય સફળતાપૂર્વક ઉમેરાયો",
    create_profile_first: "કૃપા કરીને પહેલા પ્રોફાઇલ બનાવો",
    news_feed_nf: "કોઈ ન્યૂઝ મળી નથી",
    invalid_phone_number: "આપેલ ફોન નંબર અમાન્ય છે",
    all_fields_req: "બધી જરૂરી માહિતી ભરવી ફરજિયાત છે",
    marksheet_data_stored: "માર્કશીટ ડેટા સફળતાપૂર્વક સાચવાઈ",
    User_not_auth: "વપરાશકર્તા માન્ય નથી",
    Marksheet_data_ret_suc: "માર્કશીટ ડેટા સફળતાપૂર્વક મેળવાયો",
    No_marksheet_data_fnd: "કોઈ માર્કશીટ ડેટા મળ્યા નથી",
    user_UUID_not_found: "વપરાશકર્તા UUID મળ્યું નથી",
    User_not_fnd_in_logins_tbl: "વપરાશકર્તા લૉગિન ટેબલમાં મળ્યો નથી",
    User_not_fnd_in_mem_prof_tbl: "વપરાશકર્તા મેમ્બર પ્રોફાઇલમાં મળ્યો નથી",
    user_data_ret_suc: "વપરાશકર્તાની માહિતી સફળતાપૂર્વક પ્રાપ્ત થઈ",
    No_change_made_to_user_prof:
      "વપરાશકર્તાની પ્રોફાઇલમાં કોઈ ફેરફાર કરવામાં આવ્યો નથી",
    User_prof_update_suc: "વપરાશકર્તાની પ્રોફાઇલ સફળતાપૂર્વક અપડેટ થઈ",
    admin_authority: "આ ક્રિયા કરવા માટે તમારી પાસે જરૂરી અધિકાર નથી",
    members_not_found: "કોઈ પરિવાર સભ્યો મળ્યા નથી",
    family_not_found: "પરિવાર મળ્યો નથી",
    no_students_found: "કોઈ વિદ્યાર્થી મળ્યા નથી",
    no_representatives_found: "કોઈ પ્રતિનિધિઓ મળ્યા નથી",
    representatives_retrieved_successfully:
      "પ્રતિનિધિઓની માહિતી સફળતાપૂર્વક પ્રાપ્ત થઈ",
    family_member_details_retrieved:
      "પરિવાર સભ્યોની વિગતો સફળતાપૂર્વક પ્રાપ્ત થઈ",
      business_fetched_success:"વ્યવસાઈ ની માહિતી સફળતાપૂર્વક પ્રાપ્ત થઈ",
    Invalid_album_ID: "આલ્બમ ID અમાન્ય છે",
    photo_upload_required: "કૃપા કરીને ફોટો અપલોડ કરો",
    photo_uploaded_success: "ફોટો સફળતાપૂર્વક અપલોડ થયો",
    photo_upload_failed: "ફોટો અપલોડ કરવામાં નિષ્ફળ",
    album_not_found: "આલ્બમ મળ્યું નથી",
    album_folder_not_found: "આલ્બમ ફોલ્ડર મળ્યું નથી",
    album_create_success: "આલ્બમ સફળતાપૂર્વક બનાવવામાં આવ્યો",
    album_create_error: "આલ્બમ બનાવવામાં ભૂલ",
    no_records_of_album: "આલ્બમના કોઈ રેકોર્ડ મળ્યા નથી",
    album_fetch_success: "આલ્બમ સફળતાપૂર્વક પ્રાપ્ત થયો",
    album_fetch_error: "આલ્બમ મેળવવામાં ભૂલ",
    unauthorized: "તમારી પાસે આ ક્રિયા માટે મંજૂરી નથી",
    album_no_records: "આલ્બમ મળ્યા નથી",
    marksheet_nf: "માર્કશીટ મળી નથી",
    failed_fetch_marksheet: "માર્કશીટ મેળવવામાં નિષ્ફળ",
    invalid_stream:
      "સ્ટ્રીમ અમાન્ય છે! કૃપા કરીને વિજ્ઞાન, વાણિજ્ય, અથવા કલા પસંદ કરો",
    marksheet_approved: "માર્કશીટ સફળતાપૂર્વક મંજૂર કરવામાં આવી",
    marksheet_rejected: "માર્કશીટ નકારવામાં આવી",
    rejection_reason_required: "નકારવાનો કારણ આપવો ફરજિયાત છે",
    marksheet_updated: "માર્કશીટ સફળતાપૂર્વક અપડેટ થઈ",
    marksheet_deleted: "માર્કશીટ સફળતાપૂર્વક ડિલીટ થઈ",
    marksheet_not_found: "માર્કશીટ મળી નથી",
    access_denied:
      "પ્રવેશ નકારવામાં આવ્યો. તમે ફક્ત તમારી પોતાની માર્કશીટ ડિલીટ કરી શકો છો",
    admin_access_denied: "પ્રવેશ નકારવામાં આવ્યો. ફક્ત એડમિન માટે",
    admin_check_success: "સ્વાગત છે એડમિન!",
    invalid_request_data: "આપેલ વિનંતી ડેટા અમાન્ય છે",
    no_valid_fields: "અપડેટ માટે કોઈ માન્ય માહિતી આપવામાં આવી નથી",
    Invalid_marksheet_ID: "અમાન્ય માર્કશીટ ID",
    user_not_found: "વપરાશકર્તા મળ્યો નથી",
    categories_fetched_success:"કેટેગરીઝ સફળતાપૂર્વક પ્રાપ્ત થઈ",
    donor_added_successfully: "દાતા સફળતાપૂર્વક ઉમેરવામાં આવ્યો",
    member_already_donor: "સભ્ય પહેલેથી દાતા છે",
    donation_year_required: "દાન વર્ષ જરૂરી છે",
    invalid_donation_category: "અમાન્ય દાન શ્રેણી",
    no_members_found: "સભ્યો મળ્યા નથી",
    donors_retrieved: "દાતાઓ સફળતાપૂર્વક મેળવાયા",
    donors_not_found: "દાતાઓ મળ્યા નથી",
    folder_not_found: "ફોલ્ડર મળ્યું નથી",
    album_delete_success: "આલ્બમ સફળતાપૂર્વક ડિલીટ થયો",
    album_delete_error: "આલ્બમ ડિલીટ કરવામાં ભૂલ",
    donor_deleted_successfully: "દાતા સફળતાપૂર્વક ડિલીટ થયા",
    donor_updated: "દાતા સફળતાપૂર્વક અપડેટ થયો",
    no_families_found: "કોઈ પરિવારો મળ્યા નથી",
    Auth_token_err: "અધિકૃતતા ટોકન ગુમ થયો છે અથવા અમાન્ય છે",
    Invalid_or_expired_token: "અમાન્ય અથવા સમયસીમા પૂર્ણ થયેલ ટોકન.",
    Invalid_token_structure: "અમાન્ય ટોકન સ્ટ્રક્ચર.",
    user_does_not_exist: "વપરાશકર્તા અસ્તિત્વમાં નથી",
    account_del_request_success:
      "તમારું એકાઉન્ટ ડિલીટ કરવાની વિનંતી સફળતાપૂર્વક નોંધાઈ ગઈ છે",
    unverified_user_fetch_success:
      " વેરીફાય કરવા માં બાકી મેમ્બેર્સ સફળતાપૂર્વક મેળવવામાં આવ્યા છે",
    admin_ID_is_required: "અમાન્ય. એડમિન ID જરૂરી છે",
    member_UUID_is_required: "મેમ્બેર UUID જરૂરી છે",
    user_not_found_or_already_ver:
      "વપરાશકર્તા મળ્યો નથી અથવા પહેલેથી પ્રમાણીકૃત છે",
    user_approved_success: "વપરાશકર્તા સફળતાપૂર્વક મંજૂર થયો છે",
    failed_to_approve_user: "વપરાશકર્તાને મંજૂર કરવામાં નિષ્ફળ",
    reject_reason_is_req: "નકારવા નું કારણ જણાવવુ જરૂરી છે",
    user_not_found_or_already_rejected:
      "વપરાશકર્તા મળ્યો નથી અથવા પહેલેથી નકારી દીધો છે",
    user_rejected_success: "વપરાશકર્તા સફળતાપૂર્વક નકારી દીધો છે",
    failed_to_reject_user: "વપરાશકર્તાને નકારવામાં અસફળતા",
    no_photos_found: "કોઈ ફોટા મળ્યા નથી.",
    photos_fetched_success: "ફોટા સફળતાપૂર્વક મેળવ્યા",
    acc_in_review:
      "તમારું એકાઉન્ટ ચકાસણી માં છે. કૃપા કરીને થોડી વખત રાહ જુઓ અથવા કમિટી ના સભ્ય નો સંપર્ક કરો.",
    acc_lock:
      "તમારું એકાઉન્ટ લૉક થયું છે, કૃપા કરીને કમિટી ના સભ્ય નો સંપર્ક કરો.",
    no_unverified_users_found: "કોઈ વણચકાસાયેલ વપરાશકર્તા મળ્યો નથી.",
    user_fetch_success: "ચકાસાયેલ ન હોય તેવા વપરાશકર્તાઓ સફળતાપૂર્વક મેળવ્યા",
    counts_fetch_success: "ગણતરી સફળતાપૂર્વક મેળવી",
    already_committee_member: "સભ્ય પહેલેથી કમિટી સભ્ય છે",
    committee_member_updated: "હોદ્દો સફ્લતા પૂર્વક આપવમા આવ્યો",
    invalid_member_uuid: "અમાન્ય સભ્ય UUID",
    no_results_from_python: "પાયથન સ્ક્રિપ્ટમાંથી કોઈ પરિણામ મળ્યું નથી.",
    no_matching_faces: "કોઈ મેળ ખાતા ચહેરા મળ્યા નથી.",
    faces_recognized_success: "ચહેરાઓ સફળતાપૂર્વક ઓળખવામાં આવ્યા છે.",
    committee_member_removed: "સમિતિના સભ્ય સફળતાપૂર્વક દૂર થયા",
    not_committee_member: "સમિતિના સભ્ય નહીં",
    album_update_success: "આલ્બમ સફળતાપૂર્વક અપડેટ થયો",
    album_update_error: "આલ્બમ અપડેટ કરવામાં ભૂલ",
    donor_updated_successfully: "દાતા સફળતાપૂર્વક અપડેટ થયા",
    donor_not_updated: "દાતા અપડેટ થયેલ નથી",
    donor_id_required: "દાતા ઓળખપત્ર જરૂરી",
    donor_not_found: "દાતા મળ્યા નથી",
    invalid_request: "અમાન્ય વિનંતી. સેલ્ફી ફાઇલ જરૂરી છે.",
    selfie_uploaded_success: "સેલ્ફી સફળતાપૂર્વક અપલોડ થઈ.",
    unauthorized_access: "અનધિકૃત પ્રવેશ.",
    selfies_retrieved_success: "સેલ્ફીઓ સફળતાપૂર્વક પ્રાપ્ત થઈ.",
    missing_params: "આલ્બમ UUID, સેલ્ફી UUID અથવા યુઝર ID ગુમ છે.",
    selfie_not_found: "સેલ્ફી મળી નથી.",
    no_script_results: "પાયથોન સ્ક્રિપ્ટમાંથી કોઈ પરિણામો પાછા આવ્યા નથી.",
    invalid_script_output: "પાયથોન સ્ક્રિપ્ટમાંથી અમાન્ય JSON આઉટપુટ.",
    no_similar_faces: "કોઈ સમાન ચહેરાઓ મળ્યા નથી.",
    face_recognition_failed: "ચહેરો ઓળખવામાં નિષ્ફળ.",
    unknown_error: "અજ્ઞાત ભૂલ.",
    member_deleted: "સભ્ય સફળતાપૂર્વક કાઢી નાખ્યો.",
    abroad_members_retrieved: "વિદેશી સભ્યો સફળતાપૂર્વક મેળવ્યા.",
    you_cannot_update: "તમે આ સભ્યને અપડેટ કરી શકતા નથી.",
    member_updated: "સભ્ય સફળતાપૂર્વક અપડેટ થયો.",
    failed_to_reject_marksheet: "માર્કશીટને નકારવામાં નિષ્ફળતા",
    member_added_success: "સભ્ય સફળતાપૂર્વક ઉમેરાયો",
    abroad_members_retrived: "વિદેશમાં રહેતા સભ્ય મલ્યા",
    marksheet_year_require: "માર્કશીટ વર્ષ જરૂરી છે.",
    student_retrieve: "વિદ્યાર્થી સફળતાપૂર્વક મેળવ્યા.",
    family_count_success: "પરિવારના સભ્યોની ગણતરી સફળતાપૂર્વક થઈ",
    invalid_designation: "અમાન્ય હોદ્દો",
    designation_limit_exceeded: "હોદ્દાની મર્યાદા ઓળંગાઈ ગઈ",
    designation_already_assigned_to_member:
      "હોદ્દો પહેલેથી જ સભ્યને સોંપવામાં આવ્યો છે",
    selfie_deleted_success: "સેલ્ફી સફળતાપૂર્વક કાઢી નાખી",
    phone_already_in_family:
      "તમે પહેલેથી જ પરિવારનો ભાગ હોવાથી તમે નોંધણી કરાવી શકતા નથી.",
    surnames_retrieved: "અટકો સફળતાપૂર્વક મેળવેલ છે",
    surnames_not_found: "અટકો મળી નથી",
    status_check_failed: "સ્થિતિની તપાસ કરવામાં નિષ્ફળતા",

    no_abroad_member_found: "વિદેશ મા રહેતા સભ્યો મલ્યા નથી",
    committee_retrived: "સમિતિ સભ્ય સફળતાપૂર્વક મેળવાયા",
    marksheet_success: "માર્કશીટ સફળતાપૂર્વક મેળવી",
    delete_failed: "selfie ડિલીટ કરવામાં નિષ્ફળ",
    language_update_success: "ભાષા સફળતાપૂર્વક અપડેટ થઈ",
    language_update_error: "ભાષા અપડેટ કરવામાં ભૂલ",
    notifications_fetched_successfully: "સૂચનાઓ સફળતાપૂર્વક પ્રાપ્ત થઈ",
    error_fetching_notifications: "સૂચનાઓ લાવવામાં ભૂલ",
    invalid_notification_uuid: "અમાન્ય સૂચના uuid",
    notification_not_found_or_already_read:
      " સૂચના મળી નથી અથવા પહેલેથી જ વાંચી છે",
    notification_marked_as_read: " સૂચના સફળતાપૂર્વક વાંચી છે",
    error_updating_notification: "સૂચના અપડેટ કરવામાં ભૂલ",
    phone_already_used_in_other_family:
      "આ નંબર પહેલેથી જ બીજી ફેમિલી સાથે જોડાયેલો છે.",
      news_update_suc:"સમાચાર અપડેટ થયા",
      news_update_err:"સમાચાર અપડેટ કરવામાં ભૂલ",
    number_of_family_members: "Number of family members must be less then 20. (Number of family members માં તમારા ઘર માં કેટલા સભ્યો છે તે અંક નાખો)",
    notifications_marked_as_read: "સૂચનાઓ સફળતાપૂર્વક વાંચી છે",
    notifications_already_read_or_not_found: "સૂચનાઓ પહેલેથી જ વાંચી છે અથવા મળી નથી",
    invalid_community_number: "અમાન્ય સમુદાય નંબર",
    community_not_found: "સમુદાય મળ્યો નથી",
    community_found: "સમુદાય સફળતાપૂર્વક મળ્યો",
    family_info_not_found: "પરિવારની માહિતી મળી નથી",
    community_id_not_found: "સમુદાય ID મળી નથી",
    business_deleted_success: "વ્યાપાર સફળતાપૂર્વક કાઢી નાખ્યો",
    business_not_found: "વ્યાપાર મળ્યો નથી",
    business_updated_success: "વ્યાપાર સફળતાપૂર્વક અપડેટ થયો",
    business_added_success: "વ્યાપાર સફળતાપૂર્વક ઉમેરાયો",
    businesses_fetched_success: "વ્યાપારો સફળતાપૂર્વક પ્રાપ્ત થયા",
  },
};

export const getMessage = (
  key: MessageKey,
  lang: Language = "en_US"
): string => {
  return messages[lang]?.[key] || messages["en_US"][key]; // Default to English if key not found
};
