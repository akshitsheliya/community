import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBriefcase,
  FaBuilding,
  FaGraduationCap,
  FaCalendarAlt,
} from "react-icons/fa";
import Header from "./Header";

interface MemberData {
  career: string;
  city: string;
  contact_number: string;
  country: string;
  created_at: string;
  designation: string;
  experience_year: number | null;
  full_name: string;
  govt_private: string;
  id: number;
  member_id: number;
  member_uuid: string;
  passport_photo: string;
  success_mantra: string;
  thoughts_on_committee: string;
}

const ProfessionalDetails = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [member, setMember] = useState<any>(null);

  useEffect(() => {
    if (location?.state?.data) {
      const data = location.state.data as MemberData;
      setMember({
        profile_photo: data.passport_photo || "",
        full_name: data.full_name || "",
        contact_number: data.contact_number || "",
        address: `${data.city}, ${data.country}` || "",
        occupation: data.designation || "",
        business_field: data.career || "",
        employment_type: data.govt_private || "",
        experience: data.experience_year || "",
        member_id: data.member_id || "",
        member_uuid: data.member_uuid || "",
        success_mantra: data.success_mantra || "",
        thoughts_on_committee: data.thoughts_on_committee || "",
      });
    }
  }, [location?.state?.data]);

  return (
    <>
      <Header title={t("professionaldetails.title")} showBackArrow={true} />
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-3">
        <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-2">
          <div className="flex items-center space-x-6 border-b pb-6 mb-6">
            {member?.profile_photo ? (
              <img
                src={member?.profile_photo}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-theme object-cover shadow-md"
              />
            ) : (
              <div className="bg-orange-100 rounded-full p-5 border-4 border-theme shadow-md">
                <FaUser className="text-theme" size={40} />
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold text-theme">
                {member?.full_name}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5 md:col-span-2 mb-4 whitespace-nowrap text-ellipsis overflow-hidden">
            {[
              {
                icon: <FaBuilding />,
                label: t("professionaldetails.employment_type"),
                value: member?.employment_type,
              },
              {
                icon: <FaCalendarAlt />,
                label: t("professionaldetails.experience_years"),
                value: member?.experience,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg shadow-sm overflow-hidden"
              >
                <div className="text-theme text-xl">{item?.icon}</div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">
                    {item?.label}
                  </p>
                  <p className="text-sm text-gray-900">{item?.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-gray-800">
            {[
              {
                icon: <FaMapMarkerAlt />,
                label: t("professionaldetails.location"),
                value: member?.address,
              },
              {
                icon: <FaBriefcase />,
                label: t("professionaldetails.designation"),
                value: member?.occupation,
              },
              {
                icon: <FaPhone />,
                label: t("professionaldetails.phone"),
                value: member?.contact_number,
              },
              {
                icon: <FaGraduationCap />,
                label: t("professionaldetails.career"),
                value: member?.business_field,
              },
              {
                icon: <FaEnvelope />,
                label: t("professionaldetails.success_mantra"),
                value: member?.success_mantra,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 overflow-hidden whitespace-pre-wrap break-words max-w-full bg-gray-50 rounded-lg shadow-sm md:col-span-1 col-span-2"
              >
                <div className="text-theme text-xl">{item?.icon}</div>
                <div className="max-w-full">
                  <p className="text-xs font-semibold text-gray-500">
                    {item?.label}
                  </p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap break-words max-w-full pr-6">
                    {item?.value}
                  </p>
                </div>
              </div>
            ))}

            {member?.thoughts_on_committee && (
              <div className="flex items-start space-x-4 p-4 bg-gray-50 overflow-hidden rounded-lg shadow-sm md:col-span-2 col-span-2">
                <div className="text-theme text-xl pt-1">
                  <FaUser />
                </div>
                <div className="max-w-full">
                  <p className="text-xs font-semibold text-gray-500">
                    {t("professionaldetails.thoughts_on_committee")}
                  </p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap break-words max-w-full">
                    {member?.thoughts_on_committee}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfessionalDetails;
