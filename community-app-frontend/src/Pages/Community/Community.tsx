import { useState } from "react";
import { submitCommunityNumber } from "../../Api/Community";
import { Notify } from "../../component/Common/Notify";
import { useTranslation } from "react-i18next";
import Header from "../../component/Common/Header";
import { useNavigate } from "react-router-dom";
import communityImage from "../../assets/img/community.png";
import SubmitButton from "../auth/Common/SubmitButton";
import {
  COMMUNITY_THEMES,
  DEFAULT_THEME_COLOR,
} from "../../utils/Constant/communityThemes";

const Community = () => {
  const [communityNumber, setCommunityNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ community_number: "" });
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleChange = (e: any) => {
    const input = e.target.value.replace(/[^0-9]/g, "");
    setCommunityNumber(input);

    if (!input.trim()) {
      setErrors({ community_number: t("Please enter community number") });
    } else {
      setErrors({ community_number: "" });
    }
  };
  const handleSubmit = async () => {
    if (!communityNumber.trim()) {
      setErrors({ community_number: t("Please enter community number") });
      return;
    }

    setLoading(true);
    try {
      const response = await submitCommunityNumber(communityNumber, null);

      // Community.tsx ke success block mein
      if (response?.data?.data?.length > 0) {
        const communityData = response.data.data[0];

        // Save full community data
        localStorage.setItem("communityData", JSON.stringify(communityData));

        // --- New Code ---
        const uuid = communityData.community_uuid;
        console.log("shfuhduh", uuid);
        const themeColor = COMMUNITY_THEMES[uuid] || DEFAULT_THEME_COLOR;

        // Save & apply theme
        localStorage.setItem("themeColor", themeColor);
        localStorage.setItem("communityUUID", uuid); // optional, for future use

        // Apply CSS variable immediately
        document.documentElement.style.setProperty("--theme-color", themeColor);
        document.documentElement.style.setProperty(
          "--theme-color-light",
          themeColor + "20"
        );

        Notify(response.data.message || "સફળતાપૂર્વક જોડાયા!", "success");
        navigate("/register");
      } else {
        const errorMsg =
          response?.data?.message ||
          response?.data?.error ||
          (response?.status === 404
            ? "Community not found"
            : t("Failed to find community number"));

        Notify(errorMsg, "error");
      }
    } catch (error: any) {
      // If backend returns a 404 or any other error with a message
      let errorMessage = "Failed to find community number";

      if (error?.response?.status === 404) {
        errorMessage = error.response.data?.message || "Community not found";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Notify(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] bg-gradient-to-b from-gray-50 to-gray-100">
      <Header title="મારુ ઉમરાળા" className="bg-theme" showBackArrow={true} />

      <div className="flex-1 flex flex-col items-center px-4 py-4">
        <div className="relative w-full max-w-md mb-10">
          <div className="absolute inset-0 bg-gradient-to-b from-theme/10 to-theme/5 rounded-xl"></div>
          <div className="flex justify-center py-6">
            <img
              src={communityImage}
              alt="Community"
              className="h-32 object-contain z-10 drop-shadow-lg"
            />
          </div>
        </div>
        <div className="w-full max-w-md">
          <div className="mb-2">
            <h2 className="text-xl font-bold text-gray-800">
              Join Our Community
            </h2>
            <p className="text-sm text-gray-600">
              Enter your community number to connect
            </p>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Community Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={communityNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 text-gray-800 text-base shadow-sm focus:ring-2 focus:ring-theme focus:border-theme transition-all duration-200 outline-none"
                placeholder="Enter your community number"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                }}
              />
            </div>
            {errors.community_number && (
              <p className="mt-2 text-sm text-red-600 font-medium">
                {errors.community_number}
              </p>
            )}
          </div>

          <SubmitButton
            onClick={handleSubmit}
            isDisabled={!communityNumber.trim() || loading}
            isLoading={loading}
          >
            {t("submit")}
          </SubmitButton>
          <div className="mt-8 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-theme"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">
                  Don't have a community number? Contact support or check your
                  welcome email for details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
