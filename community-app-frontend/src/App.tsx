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
