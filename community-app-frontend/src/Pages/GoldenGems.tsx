import { useState, useEffect } from "react";
import Header from "../component/Common/Header"; // Assuming Header component is in the same directory
import communityImage from "../assets/img/community.png"; // Adjust path accordingly
import { useTranslation } from "react-i18next";

const GoldenGems = () => {
  const { t } = useTranslation();
  const [slideIn, setSlideIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSlideIn(true);
    }, 1000); // Adjust the timeout value as needed

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className=" flex flex-col items-center justify-center mt-16 overflow-hidden">
      <Header title={t("title.GoldenGems")} showBackArrow={true} />
      <div
        className={`transition-all duration-1000 ${
          slideIn ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-3/4 border  border-theme mt-7 m-5 pt-8 pb-10  max-h-screen overflow-hidden">
          <div className="flex justify-center items-center ">
            <img
              src={communityImage}
              alt="Shri Navdiya Chiragkumar Bhurrabhai"
              className="border  border-theme w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72"
            />
          </div>

          <div className="text-center pt-6">
            <p className="text-lg font-semibold text-theme">
              શ્રી નાવડીયા ચિરાગકુમાર ભુરાભાઇ
            </p>
            <p className="text-sm font-semibold pt-3">ગામ પાલીતાણા</p>
            <p className="text-center font-semibold pt-3 p-4">
              શ્રી નાવડીયા ચિરાગકુમાર ભુરાભાઇ એ આપડા પરિવારને વિના મુલ્યે
              એન્ડ્રોઇડ એપ્લિકેશન બનાવી આપી છે તો તેને સમસ્ત નાવડીયા પરિવાર ખુબ
              ખુબ અભિનંદન પાઠવે છે.
            </p>
            <p className="text-lg font-semibold pt-3">
              "સૌનો સાથ પરિવાર નો વિકાસ"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldenGems;
