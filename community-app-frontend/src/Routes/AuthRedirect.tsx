import { Navigate, Outlet } from "react-router-dom";

const AuthRedirect = () => {
  const token = localStorage.getItem("authToken");
  // const profileCompleted = localStorage.getItem("profileCompleted");
  if (token) {
    return <Outlet />;
  }

  return token ? (
    <Navigate to="/" replace />
  ) : (
    <Outlet />
  );
};

export default AuthRedirect;
