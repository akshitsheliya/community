import React from "react";
import { useTranslation } from "react-i18next";
import logo from "../../../../src/assets/img/community.png";

const LogoHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center mb-2">
      <h1 className="text-3xl text-theme font-bold mt-4">
        {t("title.village_Name")}
      </h1>
      <div className="w-48 h-48 rounded-full flex items-center justify-center">
        <img src={logo} alt="logo" className="w-30 h-30" />
      </div>
    </div>
  );
};

export default LogoHeader;
