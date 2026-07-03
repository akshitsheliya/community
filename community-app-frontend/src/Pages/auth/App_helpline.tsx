import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "../../component/Common/Header";
import logo from "../../assets/img/logo.png";
import { Getcounts } from "../../Api/counts";
const AppHelpline: React.FC = () => {
  const { t } = useTranslation();
  const [communityDescription, setCommunityDescription] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await Getcounts();
        setCommunityDescription(res?.data?.communityDescription || "");
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchData();
  }, []);
  return (
    <>
      <Header title={t("footer.helpline")} showBackArrow />
      <div className="flex flex-col items-center justify-center mt-2 w-full bg-trans">
        <div className="bg-white shadow-2xl rounded-lg w-11/12 max-w-md h-[calc(91%-4rem)] px-4 py-6 text-center border-spacing-1">
          <div className="flex flex-col justify-between h-full">
            <h2 className="text-lg font-bold text-black m-4">
              {communityDescription || t("village_Name")}
            </h2>


            <p className="text-gray-700 leading-6 text-[19px]">
              {t("helpline_description")}
              <span className="font-semibold"> +91 99040 76120</span>
            </p>

            <hr className="border-t-1  border-theme my-4" />

            <div>
              <p className="text-gray-700 text-2xl">{t("developed_by")}</p>
              <img
                src={logo}
                alt="Weengs Technology Logo"
                className="h-12 w-auto my-5 mx-auto"
              />
              <p className="text-gray-600 text-sm tracking-wider mb-10">
                We Listen, We Think, We Deliver
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppHelpline;
