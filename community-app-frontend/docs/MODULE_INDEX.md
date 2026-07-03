# Community App Module Index

This index maps business modules to backend and frontend code locations.

## Notice Board
- Frontend:
  - `src/Pages/News/News.tsx`
  - `src/Pages/News/AddNews.tsx`
  - `src/Api/News.ts`
- Backend:
  - `src/routes/newsRoutes.ts`
  - `src/controllers/newsController.ts`

## Member List
- Frontend:
  - `src/Pages/Member-list/Member_list.tsx`
  - `src/Pages/Member-list/FamilyMemberDetails.tsx`
  - `src/Api/memberLlist.ts`
  - `src/Api/family-members.ts`
- Backend:
  - `src/routes/familyRoutes.ts`
  - `src/routes/memberlistRoutes.ts`
  - `src/controllers/familyController.ts`
  - `src/controllers/memberlistController.ts`

## Committee Members
- Frontend:
  - `src/Pages/CommitteeMembers/Committee.tsx`
  - `src/Pages/CommitteeMembers/CommitteeSearchMember.tsx`
  - `src/Api/committee-members.ts`
- Backend:
  - `src/routes/committeeMemberRoutes.ts`
  - `src/controllers/committeeMemberController.ts`

## Gallery
- Frontend:
  - `src/Pages/Gallery/SnehmilanAlbum.tsx`
  - `src/Pages/Gallery/SnehmilanPhoto.tsx`
  - `src/Pages/Gallery/AlbumPhotos.tsx`
  - `src/Api/Album.ts`
  - `src/Api/MyPhoto.ts`
- Backend:
  - `src/routes/albumGalleryRoutes.ts`
  - `src/routes/photoGalleryRoutes.ts`
  - `src/routes/faceRoutes.ts`
  - `src/controllers/albumGalleryController.ts`
  - `src/controllers/photoGalleryController.ts`
  - `src/controllers/faceController.ts`

## Upload Marksheet
- Frontend:
  - `src/Pages/MarksheetUpload/MarksheetUpload.tsx`
  - `src/Pages/MarksheetUpload/MarksheetDeatils.tsx`
  - `src/Api/Marksheet.ts`
- Backend:
  - `src/routes/marksheetRoutes.ts`
  - `src/controllers/marksheetController.ts`

## Donors
- Frontend:
  - `src/Pages/Donors/FamilySupport.tsx`
  - `src/Pages/Donors/New-Donor.tsx`
  - `src/Pages/Donors/Donor-SearchMember.tsx`
  - `src/Api/Donor.ts`
- Backend:
  - `src/routes/donorsRoutes.ts`
  - `src/controllers/donorsController.ts`

## Award-eligible Students
- Frontend:
  - `src/Pages/AwardStudents.tsx`
  - `src/Api/AwardStudents.ts`
- Backend:
  - `src/routes/awardEligibleRoutes.ts`
  - `src/controllers/awardEligibleController.ts`

## Abroad Members
- Frontend:
  - `src/Pages/AbroadMembers/AbroadMembers.tsx`
  - `src/Pages/AbroadMembers/AbroadMembersform.tsx`
  - `src/Api/abroadmember.ts`
- Backend:
  - `src/routes/abroadMemberRoutes.ts`
  - `src/controllers/abroadMemberController.ts`

## Received Marksheets
- Frontend:
  - `src/Pages/AllMarkSheet/AllMarksheets.tsx`
  - `src/Pages/AllMarkSheet/UpdateAllMarkSheet.tsx`
  - `src/Api/allMarkSheet.ts`
- Backend:
  - `src/routes/marksheetRoutes.ts` (admin endpoints)
  - `src/controllers/marksheetController.ts`

## New Members
- Frontend:
  - `src/Pages/Users/NewMemberList.tsx`
  - `src/Api/user.ts`
- Backend:
  - `src/routes/userVerificationRoutes.ts`
  - `src/controllers/userVerificationController.ts`

## Business
- Frontend:
  - `src/Pages/Business/Business.tsx`
  - `src/Pages/Business/AddBusiness.tsx`
  - `src/Pages/Business/BusinessDetails.tsx`
  - `src/Api/Business.ts`
- Backend:
  - `src/routes/businessRoutes.ts`
  - `src/controllers/businessController.ts`

## Adding Family Member
- Frontend:
  - `src/Pages/Registration/Registration.tsx`
  - `src/Pages/Registration/PersonalDetails.tsx`
  - `src/Pages/Registration/OccupationDetails.tsx`
  - `src/Pages/Registration/AdditionalDetails.tsx`
  - `src/Api/memberLlist.ts`
- Backend:
  - `src/routes/familyMemberRoutes.ts`
  - `src/controllers/familyMemberController.ts`

## Notifications
- Frontend:
  - `src/Pages/NotificationPage.tsx`
  - `src/Api/notification.ts`
- Backend:
  - `src/routes/appNotificationRoutes.ts`
  - `src/controllers/appNotificationController.ts`

## Switching Community
- Frontend:
  - `src/Pages/Community/Community.tsx`
  - `src/Api/Community.ts`
- Backend:
  - `src/routes/communityNumberRoutes.ts`
  - `src/controllers/communityNumberController.ts`

## Related Cross-cutting Files
- Frontend API client and language header:
  - `src/Api/api.ts`
- Backend language middleware and translation keys:
  - `src/middleware/languageMiddleware.ts`
  - `src/utils/translation.ts`
