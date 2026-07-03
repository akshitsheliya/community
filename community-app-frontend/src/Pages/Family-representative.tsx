import { useEffect, useState } from "react";
import { t } from "i18next";
import Header from "../component/Common/Header";
import { FaPhoneAlt } from "react-icons/fa";
import { GetFamilyRep } from "../Api/familyRepresentative";

const FamilyRepresentative = () => {
  const [representatives, setRepresentatives] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GetFamilyRep();
        console.log("API Response:", data);
        setRepresentatives(data);
      } catch (error: any) {
        console.error("Error fetching family representatives:", error);
        if (error.response) {
          console.error("Response Data:", error.response.data);
          console.error("Status Code:", error.response.status);
        }
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header
        title={t("Family_Representative")}
        showBackArrow={true}
        showSearchIcon={true}
      />

      <div className="p-4 w-full">
        {representatives.length > 0 ? (
          representatives.map((rep: any, index: number) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-4 mb-4 flex items-center"
            >
              <div className="flex flex-col items-center justify-center w-1/4">
                {/* Image */}
                <img
                  className="h-20 max-w-20 object-cover border border-theme"
                  src="https://www.tirumalesa.com/wp-content/uploads/2015/06/Lord-Sri-Ram-And-Lord-Hanuman.jpg"
                  alt=""
                />
                {/* Village Name */}
                <p className="text-sm text-theme mt-2">{rep.village}</p>
              </div>
              <div className="flex-grow ml-4 mb-8 space-y-1 overflow-hidden">
                {/* Representative Details */}
                <h2 className="text-[16px] font-bold text-theme text-ellipsis whitespace-nowrap overflow-x-hidden">
                  {rep.name}
                </h2>
                <p className="text-sm">મોબાઇલ નંબર: {rep.mobile}</p>
                <p className="text-sm">હોદ્દો: {rep.role}</p>
              </div>
              <span className="bg-green-500 text-white p-1 mb-8 rounded-md">
                <FaPhoneAlt />
              </span>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">Loading...</p>
        )}
      </div>
    </div>
  );
};

export default FamilyRepresentative;
