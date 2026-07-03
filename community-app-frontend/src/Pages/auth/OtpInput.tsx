import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiResponse, ApiError } from "../../helper/Types/types";
import { useTranslation } from "react-i18next";
import { authAPI } from "../../Api/api";
import OtpLayout from "../../Pages/auth/Common/OtpLayout";
import OtpVerificationForm from "../../Pages/auth/Common/OtpVerificationForm";
import useOtpTimer from "../../Pages/auth/Common/useOtpTimer";
import { toast } from "react-toastify";
import { GetSingleUser } from "../../Api/user";
import { Notify } from "../../component/Common/Notify";

const OtpInput: React.FC = () => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [errors, setErrors] = useState<{ otp: string }>({ otp: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const { timer, resetTimer, formatTimer } = useOtpTimer(180);
  const navigate = useNavigate();
  const [communityData, setCommunityData] = useState<CommunityData | null>(
    null
  );

  interface CommunityData {
    community_uuid: string;
  }

  useEffect(() => {
    const storedCommunityData = localStorage.getItem("communityData");
    if (storedCommunityData) {
      try {
        const parsedData = JSON.parse(storedCommunityData);
        setCommunityData(parsedData);
      } catch (error) {
        console.error("Error parsing community data:", error);
      }
    }
  }, []);

  const storeToken = (responseData: any) => {
    const token = responseData?.data?.token;

    if (token) {
      localStorage.setItem("authToken", token);
      console.log("dshbf");
      return true;
    } else {
      console.warn("Token not found in response:", responseData);
      return false;
    }
  };

  
  const handleSubmit = async () => {
    const enteredOtp = otp.join("");
    setErrors({ otp: "" });

    if (enteredOtp.length !== 6) {
      setErrors({ otp: t("please_enter_complete_otp") });
      return;
    }

    setLoading(true);

    try {
      const phoneNumber = localStorage.getItem("mobileNumber");
      const requestPayload: {
        phone_number: string;
        otp: string;
        community_uuid?: string;
      } = {
        phone_number: phoneNumber || "",
        otp: enteredOtp,
      };

      if (communityData && communityData.community_uuid) {
        requestPayload.community_uuid = communityData.community_uuid;
      }

      const response = await authAPI.post<ApiResponse>(
        "/login/verify-otp",
        requestPayload
      );

      if (response.status === 200 && response.data.success) {
        const tokenStored = storeToken(response.data);

        if (tokenStored) {
          const users: any = await GetSingleUser();
          localStorage.setItem("isAdmin", users?.data?.is_community_admin);
          localStorage.setItem("userData", JSON.stringify(users?.data));
          navigate("/dashboard");
        } else {
          setErrors({ otp: t("Login successful but token missing") });
        }
      } else {
        const errorMessage =
          response.data.error || response.data.message || t("Invalid otp");
        setErrors({ otp: errorMessage });
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);
      const error = err as ApiError;
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        t("Error otp verification");

      setErrors({ otp: t(errorMessage) || errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (): Promise<void> => {
    resetTimer();
    setErrors({ otp: "" });
    setOtp(Array(6).fill(""));

    try {
      const phoneNumber = localStorage.getItem("mobileNumber");
      const requestPayload: { phone_number: string; community_uuid?: string } =
        {
          phone_number: phoneNumber || "",
        };

      if (communityData && communityData.community_uuid) {
        requestPayload.community_uuid = communityData.community_uuid;
      }

      const response = await authAPI.post("/login/mobile", requestPayload);

      if (response.status === 200) {
        Notify(response?.data?.message, "success");
      } else {
        const errorMessage =
          response.data.error ||
          response.data.message ||
          t("Error sending otp");
        setErrors({ otp: errorMessage });
        toast.error(errorMessage);
      }
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        t("Error sending otp");

      setErrors({ otp: t(errorMessage) || errorMessage });
      toast.error(t(errorMessage) || errorMessage);
    }
  };

  return (
    <OtpLayout>
      <OtpVerificationForm
        onSubmit={handleSubmit}
        onResendOtp={handleResendOtp}
        otp={otp}
        setOtp={setOtp}
        errors={errors}
        setErrors={setErrors}
        timer={timer}
        loading={loading}
        formatTimer={formatTimer}
      />
    </OtpLayout>
  );
};

export default OtpInput;
