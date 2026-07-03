// AppFooter.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AppFooter: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full text-center text-white bg-theme font-extrabold py-1.5 cursor-pointer text-lg">
      <Link to="/app-helpline">{t("app_helpline")}</Link>
    </footer>
  );
};

export default AppFooter;
