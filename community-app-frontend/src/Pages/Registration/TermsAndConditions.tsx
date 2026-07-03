import React from "react";
import { useTranslation } from "react-i18next";

const TermsAndConditions: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id="terms"
        className="w-4 h-4 border-gray-300 rounded accent-theme focus:ring-theme"
      />
      <label htmlFor="terms" className="text-sm text-black">
        {t("termsAndConditions")}
      </label>
    </div>
  );
};

export default TermsAndConditions;
