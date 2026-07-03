import i18n from "i18next";

const Header = () => {
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="bg-themew-full sm:h-12 h-[50px] flex items-center justify-center">
      <div className="flex space-x-2 items-center w-full justify-end p-4">
        <button
          onClick={() => changeLanguage("en")}
          className="bg-gray-200 text-black px-2 py-1 rounded"
        >
          English
        </button>
        <button
          onClick={() => changeLanguage("gu")}
          className="bg-gray-200 text-black px-2 py-1  rounded"
        >
          ગુજરાતી
        </button>
      </div>
    </div>
  );
};

export default Header;
