import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../../../component/Common/Header";
import logo from "../../../../src/assets/img/community.png";

interface OtpLayoutProps {
  children: ReactNode;
  showBackArrow?: boolean;
}

const OtpLayout: React.FC<OtpLayoutProps> = ({
  children,
  showBackArrow = true,
}) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-between font-bold overflow-y-hidden">
      <Header showBackArrow={showBackArrow} />
      <div className="flex flex-col items-center mt-20">
        <h1 className="text-3xl text-theme font-bold mt-4">
          {t("title.village_Name")}
        </h1>

        <div className="flex flex-col items-center mb-2">
          <div className="w-48 h-48 rounded-full flex items-center justify-center">
            <img src={logo} alt="logo" className="w-30 h-30" />
          </div>
        </div>
        {children}
      </div>
      <footer className="w-full text-center text-white bg-theme font-extrabold py-1.5 cursor-pointer text-lg">
        <Link to="/app-helpline">{t("app_helpline")}</Link>
      </footer>
    </div>
  );
};

export default OtpLayout;
