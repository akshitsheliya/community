import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authAPI } from "../../Api/api";
import { ApiError, ErrorState } from "../../helper/Types/types";
import LanguageSwitcher from "../../component/LanguageSwitcher";
import AuthLayout from "../../Pages/auth/Common/AuthLayout";
import LogoHeader from "../../Pages/auth/Common/LogoHeader";
import MobileInputField from "../../Pages/auth/Common/MobileInputField";
import SubmitButton from "../../Pages/auth/Common/SubmitButton";
import AuthLinkText from "../../Pages/auth/Common/AuthLinkText";
import { Notify } from "../../component/Common/Notify";


const LoginPage2 = () => {
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [errors, setErrors] = useState<ErrorState>({ mobile_no: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [communityData, setCommunityData] = useState<CommunityData | null>(null); 
  interface CommunityData {
    community_uuid: string;
  }
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedCommunityData = localStorage.getItem("communityData");
    if (storedCommunityData) {
      try {
        const parsedData = JSON.parse(storedCommunityData);
        setCommunityData(parsedData);
      } catch (error) {
        console.error("Error parsing community data:", error);
      }
    }
    if (!token) {
      navigate("/login");
    } else {
      navigate("/login");
    }
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    if (!mobileNumber.trim()) {
      setErrors({ mobile_no: t("email_placeholder_mobile_number") });
      setLoading(false);
      return;
    } else if (mobileNumber.length !== 10) {
      setErrors({ mobile_no: t("Valid_Mobile_no") });
      setLoading(false);
      return;
    }

    try {
      const requestPayload: { phone_number: string; community_uuid?: string } = {
        phone_number: mobileNumber,
      };
      if (communityData && communityData.community_uuid) {
        requestPayload.community_uuid = communityData.community_uuid;
      }

      const response: any = await authAPI.post("/login/mobile", requestPayload);

      if (response?.status == 200) {
        localStorage.setItem("mobileNumber", mobileNumber);
        navigate("/otp-input");
        Notify(response?.data?.message, "success");
      } else {
        setErrors({
          mobile_no:
            response.data.error || response.data.message || t("Login failed"),
        });
        Notify(
          response.data.error || response.data.message || t("Login failed"),
          "error"
        );
      }
    } catch (err: any) {
      const error = err as ApiError;
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        (error instanceof Error ? error.message : "Network error");

      Notify(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/[^0-9]/g, "");
    setMobileNumber(input);

    if (!input.trim()) {
      setErrors({ mobile_no: t("email_placeholder_mobile_number") });
      Notify(t("email_placeholder_mobile_number"), "error");
    } else {
      setErrors({ mobile_no: "" });
    }
  };

  return (
    <AuthLayout title={t("")} className="h-[60px]">
      <LanguageSwitcher />
      <LogoHeader />

      <form className="w-full max-w-md px-4" onSubmit={handleSubmit}>
        <MobileInputField
          mobileNumber={mobileNumber}
          handleChange={handleChange}
          errors={errors}
        />
        <SubmitButton
          isDisabled={mobileNumber.length !== 10 || loading}
          isLoading={loading}
        >
          {t("submit")}
        </SubmitButton>

        <AuthLinkText
          translationKey="New_User"
          linkText="Register"
          linkPath="/community"
        />
        <div className="text-right text-[#9ea3ae] text-sm mb-2 font-semibold flex justify-center">
          <a href="https://snehmilan.weenggs.in/privacy-policy" target="_blank">
            Privacy Policy & Terms and Conditions
          </a>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage2;
