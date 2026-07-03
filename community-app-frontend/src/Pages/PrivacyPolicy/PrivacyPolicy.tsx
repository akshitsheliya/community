import { useTranslation } from "react-i18next";
import Header from "../../component/Common/Header";

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const url = window.location?.pathname;

  return (
    <>
      {localStorage.getItem("authToken") && (
        <Header
          title={
            url == "/privacy-policy" ? t("privacy") : t("Terms & Conditions")
          }
          showBackArrow
        />
      )}
      <div
        className={`w-full ${
          localStorage.getItem("authToken")
            ? "h-[calc(100vh-65px)]"
            : "h-screen"
        }`}
      >
        <iframe className={`w-full h-full`} src={"/PrivacyPolicy.html"} />
      </div>
    </>
  );
};

export default PrivacyPolicy;
