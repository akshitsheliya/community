import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCheck } from "react-icons/fa";
import languageApi from "../../Api/Language";

interface LanguagePopupProps {
  onClose: () => any;
}

const LanguagePopup: React.FC<LanguagePopupProps> = ({ onClose }) => {
  const { i18n } = useTranslation();
  const { t } = useTranslation();

  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    localStorage.getItem("language") || "en_US"
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const changeLanguage = async (lang: string) => {
    try {
      setIsLoading(true);
      i18n.changeLanguage(lang);
      localStorage.setItem("language", lang);
      setSelectedLanguage(lang);

      await languageApi({
        app_language: lang
      });

      onClose();
    } catch (error) {
      console.error("Failed to update language in backend:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000]"
      onClick={onClose}
    >
      <div
        className="bg-white w-80 rounded-2xl shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-theme p-4 text-white text-lg font-bold text-center">
          {t("chooseyourlanguage")}
        </div>
        <div className="p-4">
          {["en_US", "gu_IN"].map((lang) => (
            <div
              key={lang}
              className={`flex items-center justify-between px-4 py-3 cursor-pointer border-b ${selectedLanguage === lang ? "text-theme font-bold" : ""
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => !isLoading && changeLanguage(lang)}
            >
              {lang === "en_US" ? "English" : "ગુજરાતી"}
              {selectedLanguage === lang && (
                <span className="text-theme">
                  <FaCheck />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguagePopup;