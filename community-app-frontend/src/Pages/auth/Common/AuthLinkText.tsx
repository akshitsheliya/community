import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface AuthLinkTextProps {
  translationKey: string;
  linkText: string;
  linkPath: string;
}

const AuthLinkText: React.FC<AuthLinkTextProps> = ({
  translationKey,
  linkText,
  linkPath,
}) => {
  const { t } = useTranslation();

  return (
    <div className="text-right text-[#9ea3ae] text-sm mb-2 font-semibold flex justify-center mt-1">
      {t(translationKey)}
      <span className="font-bold text-theme ml-1">
        <Link to={linkPath}>{t(linkText)}</Link>
      </span>
    </div>
  );
};

export default AuthLinkText;
