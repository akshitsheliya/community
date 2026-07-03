import { lazy } from "react";
const Dashboard = lazy(() => import("../Pages/Dashboard/Dashboard.tsx"));
const AwardStudents = lazy(() => import("../Pages/AwardStudents.tsx"));
const AwardPdfViewer = lazy(() => import("../Pages/AwardPdfViewer.tsx"));
const GoldenGems = lazy(() => import("../Pages/GoldenGems.tsx"));
const SnehmmilanPhoto = lazy(
  () => import("../Pages/Gallery/SnehmilanPhoto.tsx")
);
const News = lazy(() => import("../Pages/News/News.tsx"));
const AddNews = lazy(() => import("../Pages/News/AddNews.tsx"));
const Events = lazy(() => import("../Pages/Events/Events.tsx"));
const AddEvents = lazy(() => import("../Pages/Events/AddEvents.tsx"));
const ProfileDetails = lazy(
  () => import("../Pages/auth/ProfileDetails/ProfileDetails.tsx")
);
const MarksheetUpload = lazy(
  () => import("../Pages/MarksheetUpload/MarksheetUpload.tsx")
);
const MarksheetDetails = lazy(
  () => import("../Pages/MarksheetUpload/MarksheetDeatils.tsx")
);
const FamilyAds = lazy(() => import("../Pages/Family-Ads.tsx"));
const FamilyRepresentative = lazy(
  () => import("../Pages/Family-representative.tsx")
);
const FamilyCommittee = lazy(
  () => import("../Pages/CommitteeMembers/Committee.tsx")
);
const Member_list = lazy(() => import("../Pages/Member-list/Member_list.tsx"));
const FamilyMemberDetails = lazy(
  () => import("../Pages/Member-list/FamilyMemberDetails.tsx")
);
const FamilySupport = lazy(() => import("../Pages/Donors/FamilySupport.tsx"));
const DonorSearchMember = lazy(
  () => import("../Pages/Donors/Donor-SearchMember.tsx")
);
const AddNewDonor = lazy(() => import("../Pages/Donors/New-Donor.tsx"));
// const AddNewCommitteeMember = lazy(
//   () => import("../Pages/CommitteeMembers/")
// );

const SnehmilanAlbum = lazy(
  () => import("../Pages/Gallery/SnehmilanAlbum.tsx")
);
const AlbumPhotos = lazy(() => import("../Pages/Gallery/AlbumPhotos.tsx"));
const SearchMember = lazy(() => import("../Pages/SearchMember.tsx"));
const BusinessDetails = lazy(
  () => import("../Pages/Business/BusinessDetails.tsx")
);
const AllMarksheet = lazy(
  () => import("../Pages/AllMarkSheet/AllMarksheets.tsx")
);

const Registration = lazy(
  () => import("../Pages/Registration/Registration.tsx")
);
const UpdateAllMarkSheet = lazy(
  () => import("../Pages/AllMarkSheet/UpdateAllMarkSheet.tsx")
);
const NewMemberList = lazy(() => import("../Pages/Users/NewMemberList.tsx"));
const PrivacyPolicy = lazy(
  () => import("../Pages/PrivacyPolicy/PrivacyPolicy.tsx")
);
const AbroadMembers = lazy(
  () => import("../Pages/AbroadMembers/AbroadMembers.tsx")
);
const Abroadmembersform = lazy(
  () => import("../Pages/AbroadMembers/AbroadMembersform.tsx")
);
const Details = lazy(() => import("../component/Common/Details.tsx"));
const Business = lazy(() => import("../Pages/Business/Business.tsx"));
const AddBusiness = lazy(() => import("../Pages/Business/AddBusiness.tsx"));
const ProfessionalDetails = lazy(
  () => import("../component/Common/ProfessionalDetails.tsx")
);
const CommitteeSearchMember = lazy(
  () => import("../Pages/CommitteeMembers/CommitteeSearchMember.tsx")
);
const notificationpage = lazy(() => import("../Pages/NotificationPage.tsx"));
const Community = lazy(() => import("../Pages/Community/Community.tsx"));
const Home = lazy(() => import("../Pages/Home.tsx"));

export const ProtectedRoute = [
  {
    path: "/",
    element: Dashboard,
  },
  {
    path: "/dashboard",
    element: Dashboard,
  },
  {
    path: "/community",
    element: Community,
  },
  {
    path: "/family-members",
    element: Home,
  },
  {
    path: "/registration-details",
    element: Registration,
  },
  {
    path: "/award-eligible-students",
    element: AwardStudents,
  },
  {
    path: "/award-eligible-students/pdf",
    element: AwardPdfViewer,
  },
  {
    path: "/search-member",
    element: SearchMember,
  },
  {
    path: "/family-ads",
    element: FamilyAds,
  },
  {
    path: "/family-representative",
    element: FamilyRepresentative,
  },
  {
    path: "/committee-members",
    element: FamilyCommittee,
  },
  // {
  //   path: "/add-committee-members",
  //   element: AddNewCommitteeMember,
  // },
  {
    path: "/Member-list",
    element: Member_list,
  },
  {
    path: "/notification-page",
    element: notificationpage,
  },
  {
    path: "/member-list/:family_uuid",
    element: FamilyMemberDetails,
  },
  {
    path: "/donors",
    element: FamilySupport,
  },
  {
    path: "/abroadmembers",
    element: AbroadMembers,
  },
  {
    path: "/abroadmembersform/:abroad_uuid",
    element: Abroadmembersform,
  },
  {
    path: "/abroadmembersform",
    element: Abroadmembersform,
  },
  {
    path: "/DonorSearchMember",
    element: DonorSearchMember,
  },
  {
    path: "/add-new-donor",
    element: AddNewDonor,
  },
  {
    path: "/golden-gems",
    element: GoldenGems,
  },
  {
    path: "/photos",
    element: SnehmmilanPhoto,
  },
  {
    path: "/Create-album",
    element: SnehmilanAlbum,
  },
  {
    path: "/album-photos/:album_uuid",
    element: AlbumPhotos,
  },
  {
    path: "/news",
    element: News,
  },
  {
    path: "/news/add-news",
    element: AddNews,
  },
  {
    path: "/news/edit-news/:newsId",
    element: AddNews,
  },

  {
    path: "/events",
    element: Events,
  },
  {
    path: "/events/add-events",
    element: AddEvents,
  },
  {
    path: "/upload-marksheet",
    element: MarksheetUpload,
  },
  {
    path: "/marksheet-details",
    element: MarksheetDetails,
  },
  {
    path: "/profile-details",
    element: ProfileDetails,
  },
  {
    path: "/marksheet",
    element: AllMarksheet,
  },
  {
    path: "/update-all-marksheet/:uuid",
    element: UpdateAllMarkSheet,
  },
  {
    path: "/new-member",
    element: NewMemberList,
  },
  {
    path: "/tems-condition",
    element: PrivacyPolicy,
  },
  {
    path: "/details",
    element: Details,
  },
  {
    path: "/professionaldetails",
    element: ProfessionalDetails,
  },
  {
    path: "/committee-search-member",
    element: CommitteeSearchMember,
  },
  {
    path: "/Business",
    element: Business,
  },
  {
    path: "/add-business",
    element: AddBusiness,
  },
  {
    path: "/edit-business/:business_uuid",
    element: AddBusiness,
  },
  {
    path: "/business-details/:business_uuid",
    element: BusinessDetails,
  },
];

export default ProtectedRoute;
