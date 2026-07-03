import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authAPI } from "../../Api/api";
import AuthLayout from "../../Pages/auth/Common/AuthLayout";
import LogoHeader from "../../Pages/auth/Common/LogoHeader";
import MobileInputField from "../../Pages/auth/Common/MobileInputField";
import SubmitButton from "../../Pages/auth/Common/SubmitButton";
import AuthLinkText from "../../Pages/auth/Common/AuthLinkText";
import { Notify } from "../../component/Common/Notify";

interface CommunityData {
  community_uuid: string; 
}

const RegisterPage = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [errors, setErrors] = useState({ mobile_no: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const newErrors = { mobile_no: "" };

    if (!mobileNumber.trim()) {
      newErrors.mobile_no = t("email_placeholder_mobile_number");
    } else if (mobileNumber.length !== 10) {
      newErrors.mobile_no = t("Valid_Mobile_no");
    }

    setErrors(newErrors);

    if (newErrors.mobile_no === "") {
      setIsLoading(true);
      try {
        if (!communityData) {
          Notify("Community information missing. Please try again.", "error");
          navigate("/community");
          return;
        }

        const response: any = await authAPI.post("/register/mobile", {
          phone_number: mobileNumber,
          community_uuid: communityData.community_uuid,
        });

        localStorage.setItem("phoneNumber", mobileNumber);
        if (response.status === 200) {
          Notify(response?.data?.message || "Registration successful", "success");
          sessionStorage.setItem("registrationStep", "2");
          navigate("/register/verify-otp");
        } else {
          setErrors({ mobile_no: t("user is already Registered ") });
        }
      } catch (error: any) {
        console.error("Error:", error);
        setErrors({
          mobile_no:
            error.response?.data?.error || t("user is already Registered"),
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e: any) => {
    const input = e.target.value.replace(/[^0-9]/g, "");
    setMobileNumber(input);

    if (input.length === 10) {
      setErrors({ mobile_no: "" });
    }
  };

  return (
    <AuthLayout title={t("title.RegisterPage")} showBackArrow={true}>
      <LogoHeader />
      <form className="w-full max-w-md px-4" onSubmit={handleSubmit}>
        <MobileInputField
          mobileNumber={mobileNumber}
          handleChange={handleChange}
          errors={errors}
        />
        <SubmitButton
          isDisabled={isLoading || mobileNumber.length !== 10 || !communityData?.community_uuid}
          isLoading={isLoading}
        >
          {t("submit")}
        </SubmitButton>
        <AuthLinkText
          translationKey="Already_have_an_account"
          linkText="button.login"
          linkPath="/"
        />
        <div className="text-right text-[#9ea3ae] text-sm mb-2 font-semibold flex justify-center">
          <a href="https://snehmilan.weenggs.in/privacy-policy" target="_blank" rel="noopener noreferrer">
            Privacy Policy & Terms and Conditions
          </a>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;