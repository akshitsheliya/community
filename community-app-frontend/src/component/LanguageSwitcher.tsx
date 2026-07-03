import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
 
    <div className="absolute top-3 right-5 z-50 flex space-x-2">
      {["en_US", "gu_IN"].map((lang) => (
        <button
          key={lang}
          onClick={() => changeLanguage(lang)}
          className={`px-3 py-1 rounded ${
            i18n.language === lang ? "bg-gray-200 text-black": " text-white" 
          }`}
        >
          {lang === "en_US" ? "English" : "ગુજરાતી"}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
