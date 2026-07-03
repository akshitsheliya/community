import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../Api/api";
import { ApiError } from "../../helper/Types/types";
import { useTranslation } from "react-i18next";
import OtpLayout from "../../Pages/auth/Common/OtpLayout";
import OtpVerificationForm from "../../Pages/auth/Common/OtpVerificationForm";
import useOtpTimer from "../../Pages/auth/Common/useOtpTimer";
import { toast } from "react-toastify";

interface CommunityData {
  community_uuid: string;
}

const RegisterOtp = () => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [errors, setErrors] = useState<{ otp: string }>({ otp: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const { timer, resetTimer, formatTimer } = useOtpTimer(180);
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [communityData, setCommunityData] = useState<CommunityData | null>(null);

  useEffect(() => {
    const storedCommunityData = localStorage.getItem("communityData");
    if (storedCommunityData) {
      try {
        const parsedData = JSON.parse(storedCommunityData);
        setCommunityData(parsedData);
      } catch (error) {
        console.error("Error parsing community data:", error);
        navigate("/community");
      }
    } else {
      navigate("/community");
    }
  }, [navigate]);

  useEffect(() => {
    const storedPhone = localStorage.getItem("phoneNumber");
    if (!storedPhone) {
      navigate("/register");
    } else {
      setPhoneNumber(storedPhone);
    }
  }, [navigate]);

  const handleSubmit = async (): Promise<void> => {
    if (otp.some((digit) => !digit)) {
      setErrors({ otp: t("please_enter_complete_otp") });
      return;
    }

    if (!phoneNumber) {
      return;
    }

    if (!communityData || !communityData.community_uuid) {
      toast.error("Community information missing. Please try again.");
      navigate("/community");
      return;
    }

    setErrors({ otp: "" });
    setLoading(true);

    try {
      const response = await authAPI.post("/register/verify-otp", {
        phone_number: phoneNumber,
        otp: otp.join(""),
        community_uuid: communityData.community_uuid,
      });

      if (response.status === 200) {
        const token = response.data.data?.token;

        if (token) {
          localStorage.setItem("authToken", token);
          localStorage.setItem("otpVerified", "true");
          navigate("/profile-details");
        } else {
          setErrors({ otp: t("authentication_failed") });
        }
      } else {
        const errorMessage =
          response.data.error ||
          response.data.message ||
          t("invalid_otp_try_again");
        setErrors({ otp: errorMessage });
      }
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        t("invalid_otp_try_again");

      setErrors({ otp: t(errorMessage) || errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (): Promise<void> => {
    resetTimer();
    setOtp(Array(6).fill(""));
    setErrors({ otp: "" });

    if (!communityData || !communityData.community_uuid) {
      toast.error("Community information missing. Please try again.");
      navigate("/community");
      return;
    }

    try {
      const response = await authAPI.post("/register/mobile", {
        phone_number: phoneNumber,
        community_uuid: communityData.community_uuid,
      });

      if (response.status === 200) {
        if (response.data && response.data.data && response.data.data.otp) {
          const otp = response.data.data.otp;
          toast.success(`Your OTP is: ${otp}`, { autoClose: 5000 });
        } else {
          toast.success(t("Otp sent successfully"), { autoClose: 5000 });
        }
      } else {
        const errorMessage =
          response.data.error ||
          response.data.message ||
          t("failed_to_resend_otp");
        setErrors({ otp: errorMessage });
        toast.error(errorMessage);
      }
    } catch (err: any) {
      const error = err as ApiError;
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        t("failed_to_resend_otp");

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

export default RegisterOtp;
