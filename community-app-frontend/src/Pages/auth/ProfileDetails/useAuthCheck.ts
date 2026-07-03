import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const useAuthCheck = (): boolean => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const otpVerified = localStorage.getItem("otpVerified");
    const token = localStorage.getItem("authToken");

    if (!otpVerified || !token) {
      navigate("/register", { replace: true });
      return;
    }

    setIsCheckingAuth(false);
  }, []);

  return isCheckingAuth;
};
