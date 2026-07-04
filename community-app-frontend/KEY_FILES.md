# KEY FILES EXPORT

## App.tsx

```tsx
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Suspense, useEffect, useState } from "react";
import i18n from "./component/Language";
import ProtectedRoutes from "./Routes/ProtectedRoute.tsx";
import { ToastContainer } from "react-toastify";
// import AuthRedirect from "./Routes/AuthRedirect.tsx";
// import NotFound from "./Pages/NotFound";

// Auth & Registration Pages
import LoginPage2 from "./Pages/auth/LoginPage2";
import DeleteUser from "./Pages/auth/DeleteUser.tsx";
import OtpInput from "./Pages/auth/OtpInput";
import RegisterPage from "./Pages/auth/RegisterPage";
import RegisterOtp from "./Pages/auth/RegisterOtp";

// protected Routes
import AppHelpline from "./Pages/auth/App_helpline.tsx";
import ProtectedRoute from "./Routes/routes.ts";
import CircularArcLoader from "./component/CustomCircularLoader.tsx";
import logo from "../src/assets/img/community.png";
import Toast from "./component/Common/Notify.tsx";
import PrivacyPolicy from "./Pages/PrivacyPolicy/PrivacyPolicy.tsx";
import Community from "./Pages/Community/Community.tsx";
import "./index.css";

// Admin Routes
// import AdminLogin from "./Admin/pages/auth-admin/Login";
// import AdminOtp from "./Admin/pages/auth-admin/Otp";
// import AdminLayout from "./Admin/Components/admin-view/Layout";
// import AdminDashboard from "./Admin/pages/admin-view/Dashboard";
// import AdminUsers from "./Admin/pages/admin-view/Users";

const App: any = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const defaultLanguage = localStorage.getItem("language") || "en_EN";
    i18n.changeLanguage(defaultLanguage);

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      localStorage.setItem("authtoken", token);
      window.history.replaceState({}, document.title, "/dashboard");
    }

    // === Theme Apply on App Start ===
    const savedTheme = localStorage.getItem("themeColor");
    if (savedTheme) {
      document.documentElement.style.setProperty("--theme-color", savedTheme);
      document.documentElement.style.setProperty(
        "--theme-color-light",
        savedTheme + "20"
      );
    }

    setLoading(false);
  }, []);

  if (loading) return null;

  // const App: any = () => {
  //   useEffect(() => {
  //     const defaultLanguage = localStorage.getItem("language") || "en_EN";
  //     i18n.changeLanguage(defaultLanguage);
  //   }, []);

  return (
    <>
      <ToastContainer position="top-right" />
      <Toast />
      <Router>
        {/* <Suspense
          fallback={
            <div className="m-auto flex justify-center items-center h-[calc(100vh-95px)] flex-col">
              Loading...
            </div>
          }
        > */}
        <Suspense
          fallback={
            <div className="m-auto flex justify-center items-center h-[calc(100vh-95px)] flex-col">
              <img src={logo} alt="Loading" className="w-64 h-4w-64 mb-10" />
              <CircularArcLoader size={40} color="brown" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<LoginPage2 />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            {/* Login Route */}
            <Route
              path="/login"
              element={
                !localStorage.getItem("authtoken") ? (
                  <LoginPage2 />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            <Route
              path="/community"
              element={
                !localStorage.getItem("authtoken") ? (
                  <Community />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            {/* Auth Routes */}
            <Route
              path="/register"
              element={
                !localStorage.getItem("authtoken") ? (
                  <RegisterPage />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            <Route
              path="/register/verify-otp"
              element={
                !localStorage.getItem("authtoken") ? (
                  <RegisterOtp />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            <Route
              path="/otp-input"
              element={
                !localStorage.getItem("authtoken") ? (
                  <OtpInput />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            <Route path="/user" element={<DeleteUser />} />

            {/* App Helpline Route */}
            <Route path="/app-helpline" element={<AppHelpline />} />

            {/* Protected Routes */}
            {ProtectedRoute?.map((route: any, index: number) => (
              <Route
                path={route.path}
                key={index}
                element={
                  <ProtectedRoutes>
                    <route.element />
                  </ProtectedRoutes>
                }
              />
            ))}
            {/* Admin Routes
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/otp" element={<AdminOtp />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Route> */}

            {/* Default Route */}
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </Suspense>
      </Router>
    </>
  );
};

export default App;

```

## Sidebar.tsx

```tsx
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ImagePreview from "../../component/Common/ImagePreview";
import { SidebarProps, SidebarItemProps } from "../../helper/Types/types";
import {
  // FaHome,
  //FaClock,
  // FaUsers,
  //FaSearch,
  // FaImage,
  FaPhoneAlt,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaClipboardList,
  FaEdit,
} from "react-icons/fa";
import { MdDelete, MdOutlineSecurity } from "react-icons/md";
import LanguagePopup from "./LanguagePopup";
import LogoutPopup from "./Logoutpopup";
import DeleteAccountPopup from "./DeleteAccountPopup";
import { GetSingleUser } from "../../Api/user";

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen = false,
  toggleSidebar,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [first_name, setFirstName] = useState<string | null>(null);
  const [surname, setSurname] = useState<string | null>(null);
  const [image, setImage] = useState<any>(null);
  const [showLanguagePopup, setShowLanguagePopup] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const fetchUser = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        console.log("Token not found, skipping user data fetch.");
        return;
      }

      const response = await GetSingleUser();
      if (response?.data) {
        const apiData = response.data;
        localStorage.setItem("userData", JSON.stringify(apiData));
        setFirstName(apiData.first_name || "");
        setImage(apiData?.profile_photo);
        // setFatherName(apiData.father_name || null);
        setSurname(apiData.surname || null);
        // setMemberId(apiData.member_id || null);
      } else {
        console.error("Invalid API response:", response);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const storedData = localStorage.getItem("userData");

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);

        setFirstName(parsedData.first_name || "");
        setImage(parsedData?.profile_photo);
        // setFatherName(parsedData.father_name || null);
        setSurname(parsedData.surname || null);
        // setMemberId(parsedData.member_id || "");
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
      }
    } else {
      fetchUser();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !showLanguagePopup &&
        !showLogoutPopup
      ) {
        toggleSidebar(false);
      }
    };

    if (isSidebarOpen && !showLanguagePopup && !showLogoutPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen, showLanguagePopup, showLogoutPopup, toggleSidebar]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-theme text-white w-72 transform z-[999] ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-all duration-300`}
      >
        <div className="p-4 flex flex-col w-full items-center overflow-hidden">
          <div className="flex w-full items-center gap-2 text-sm">
            <div className="w-14 h-14 border-[1px] border-white bg-theme rounded-full overflow-hidden flex items-center justify-center text-theme">
              {image ? (
                <ImagePreview
                  src={image}
                  alt="profile image"
                  width={56}
                  height={56}
                  className="rounded-full object-cover object-center "
                />
              ) : (
                <span className="text-xl">
                  <FaUser />
                </span>
              )}
            </div>
            <div>
              <div className="flex gap-1 text-[16px]  whitespace-nowrap text-ellipsis ">
                {first_name && <h1>{first_name}</h1>}
                {/* {father_name && (
                  <h1 className="text-lg font-bold">{father_name}</h1>
                )} */}
                {surname && <h1>{surname}</h1>}
              </div>
              {/* {member_id && (
                <p className="text-[13px] font-semibold">
                  Member Id:- {member_id}
                </p>
              )} */}
            </div>

            <div
              className="flex items-center gap-1 cursor-pointer ml-1 text-lg"
              onClick={() => {
                const storedUserData = localStorage.getItem("userData");
                const userData = storedUserData
                  ? JSON.parse(storedUserData)
                  : {};

                navigate("/registration-details", {
                  state: { data: userData, isFromProfile: true },
                });
              }}
            >
              <FaEdit />
            </div>
          </div>
        </div>

        {/* Sidebar Menu */}
        <div
          className="bg-white flex-1 text-black rounded-t-lg p-4 space-y-4 overflow-y-auto min-h-full"
          style={{
            height: "calc(100vh - 120px)",
          }}
        >
          {/* <SidebarItem
            icon={<FaHome />}
            text={t("Member_list")}
            onClick={() => navigate("/member-list")}
          /> */}
          {/* <SidebarItem icon={<FaClock />} text={t("Family_Office")} /> */}
          {/* <SidebarItem
            icon={<FaUsers />}
            text={t("title.Committee")}
            onClick={() => navigate("/committee-members")}
          /> */}
          {/* <SidebarItem
            icon={<FaSearch />}
            text={t("Find_Member")}
            onClick={() => navigate("/search-member")}
          /> */}
          {/* <SidebarItem
            icon={<FaImage />}
            text={t("title.snehmilan_photo")}
            onClick={() => navigate("/photos")}
          /> */}
          <SidebarItem
            icon={<FaCog />}
            text={t("setting")}
            onClick={() => setShowLanguagePopup(true)}
          />
          <SidebarItem
            icon={<MdOutlineSecurity />}
            text={t("privacy")}
            onClick={() => navigate("/privacy-policy")}
          />
          <SidebarItem
            icon={<FaClipboardList />}
            text={t("term_Condition")}
            onClick={() => navigate("/tems-condition")}
          />
          <SidebarItem
            icon={<FaPhoneAlt />}
            text={t("Helpline_call")}
            onClick={() => navigate("/app-helpline")}
          />

          <SidebarItem
            icon={<MdDelete />}
            text={t("delete_my_Account")}
            onClick={() => setShowDeletePopup(true)}
          />
          <SidebarItem
            icon={<FaSignOutAlt />}
            text={t("Log_out")}
            onClick={() => setShowLogoutPopup(true)}
          />
        </div>
      </div>

      {/* Language Popup */}
      {showLanguagePopup && (
        <LanguagePopup onClose={() => setShowLanguagePopup(false)} />
      )}

      {/* Logout Popup */}
      {showLogoutPopup && (
        <LogoutPopup
          onClose={() => setShowLogoutPopup(false)}
          onConfirm={handleLogout}
        />
      )}

      {/* Language Popup */}
      {showLanguagePopup && (
        <LanguagePopup onClose={() => setShowLanguagePopup(false)} />
      )}
      {showDeletePopup && (
        <DeleteAccountPopup
          onClose={() => setShowDeletePopup(false)}
          onConfirm={() => {
            localStorage.clear();
            sessionStorage.clear();
            navigate("/login"); // Redirect user after deleting the account
          }}
        />
      )}
    </>
  );
};

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, text, onClick }) => {
  return (
    <div
      className="flex items-center space-x-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md"
      onClick={onClick}
    >
      <div className="text-theme text-lg">{icon}</div>
      <p className="text-gray-700 font-medium">{text}</p>
    </div>
  );
};

export default Sidebar;

```

## App.css

```css

```

## index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
 
body {
  @apply bg-white text-theme;
}
 
/* .admin-theme {
  @apply bg-admin text-white;
}
 
*/
input {
  @apply border border-theme text-theme focus:ring-theme focus:border-theme;
}
 
/* .admin-theme input {
  @apply border-admin text-admin focus:ring-admin focus:border-admin;
}
 
*/
 
button {
  @apply bg-theme border border-theme px-4 py-2 rounded hover:bg-theme hover:text-white transition;
}
 
/* .admin-theme button {
  @apply text-white border border-admin px-4 py-2 rounded hover:bg-white hover:text-admin transition;
}
 
*/
/* Change Spin Loader Color */
.custom-spin .ant-spin-dot-item {
  background-color: white; /* Replace with your desired color */
}
 
input::placeholder {
  color: #555; /* Dark gray color */
}
 
.css-1dkpsh1-control {
  @apply w-full p-1.5 border-[1.5px] border-black rounded-md text-sm shadow-md outline-none placeholder-[#788288] text-black md:text-base !important;
}
/* In your global styles (e.g., index.css or App.css) */
.no-scroll {
  overflow: hidden; /* Disable body scrolling */
  position: fixed;
  width: 100%;
  height: 100%;
}
 
::-webkit-scrollbar {
  display: none;
}
 
html {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
 
.ant-picker {
  border-color: black;
}
.ant-picker-outlined:hover {
  display: block;
  font-weight: bold;
  margin-bottom: 4px;
  width: 100%;
  /* padding: 10px; */
  border: 1.5px solid;
  border-radius: 6px;
  font-size: 14px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  outline: none;
  color: black;
  color: #788288;
  border-color: black;
  color: black;
}
/* body .ant-modal.css-dev-only-do-not-override-240cud {
  margin: 0px !important;
  margin-left: 8px !important;
} */
/* .ant-modal {
  top: 50% !important;
  transform: translateY(-50%) !important;
  position: fixed !important;
  margin-left: 8px !important;
} */
 
.ant-badge {
  display: flex !important;
}
 
@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
 
.animate-blink {
  animation: blink 1.5s infinite ease-in-out;
}
 
 
```

