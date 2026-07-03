import Header from "../component/Common/Header";
import { useTranslation } from "react-i18next";
import "../index.css";

const FamilyAds = () => {
  const { t } = useTranslation();
  return (
    <>
      <Header title={t("title.Family_Ads")} showBackArrow />
      <div className="bg-white min-h-screen p-4 pt-4">
        <div className="mt-16 space-y-4">
          <div className="border-b border-b-theme pb-2">
            <h2 className="text-sl font-bold"> Weengs (સોફ્ટવેર કંપની)</h2>
            <p className="text-sm text-gray-600">નોકરી માટે</p>
          </div>
          <div className="border-b  border-b-theme pb-2">
            <h2 className="text-sl font-bold">જાહિરાત આપવા માટે</h2>
            <p className="text-sm text-gray-600">નાવડીયા પરિવાર ની એપ માં</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default FamilyAds;
