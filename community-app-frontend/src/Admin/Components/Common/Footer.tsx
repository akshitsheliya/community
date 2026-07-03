import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full text-center text-white bg-theme font-extrabold py-1.5 cursor-pointer text-lg">
      {t("footer.helpline")}
    </footer>
  );
};

export default Footer;
