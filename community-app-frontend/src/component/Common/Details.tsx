import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUsers,
  FaBriefcase,
  FaBuilding,
  FaGraduationCap,
  FaTint,
  FaCalendarAlt,
  FaHeart,
  // FaIdCard,
  // FaUserShield,
} from "react-icons/fa";
import Header from "./Header";
// import ImagePreview from "../Common/ImagePreview";
import { useTranslation } from "react-i18next";

const Details = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [member, setMember] = useState<any>(null);

  useEffect(() => {
    if (location?.state?.data) {
      setMember({
        profile_photo:
          location?.state?.data?.profile_photo ||
          location?.state?.data?.passport_photo ||
          "",
        first_name:
          location?.state?.data?.first_name ||
          location?.state?.data?.full_name ||
          "",
        father_name: location?.state?.data?.father_name || "",
        surname: location?.state?.data?.surname || "",
        gender: location?.state?.data?.gender || "",
        email: location?.state?.data?.email_id || "",
        phone_number:
          location?.state?.data?.phone_number ||
          location?.state?.data?.contact_number ||
          "",
        address:
          location?.state?.data?.address ||
          location?.state?.data?.country ||
          "",
        family_members: location?.state?.data?.number_of_family_members || "",
        occupation: location?.state?.data?.business_or_job_or_any || "",
        business_field:
          location?.state?.data?.business_details ||
          location?.state?.data?.career ||
          "",
        education: location?.state?.data?.education || "",
        blood_group: location?.state?.data?.blood_group || "",
        date_of_birth: location?.state?.data?.date_of_birth || "",
        marital_status: location?.state?.data?.marital_status || "",
        // id_proof: location?.state?.data?.id_proof || "",
        // relationship: location?.state?.data?.relationship || "",
        is_family_representative:
          location?.state?.data?.is_family_representative || false,
        // is_community_admin: location?.state?.data?.is_community_admin || false,
        family_uuid: location?.state?.data?.family_uuid || "",
        family_main_member_id:
          location?.state?.data?.family_main_member_id || "",
        user_uuid: location?.state?.data?.user_uuid || "",
        isMainMember: location?.state?.data?.isMainMember || false,
      });
    }
  }, [location?.state?.data]);

  return (
    <>
      <Header title={t("details.title")} showBackArrow={true} />
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
                {member?.surname} {member?.first_name} {member?.father_name}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5 md:col-span-2 whitespace-nowrap text-ellipsis overflow-hidden mb-4">
            {[
              {
                icon: <FaUser />,
                label: t("details.gender"),
                value: member?.gender,
              },
              {
                icon: <FaTint />,
                label: t("details.blood_group"),
                value: member?.blood_group,
              },
              {
                icon: <FaHeart />,
                label: t("details.marital_status"),
                value: member?.marital_status,
              },
              {
                icon: <FaUsers />,
                label: t("details.family_members"),
                value: member?.family_members,
              },

              // {
              //   icon: <FaUsers />,
              //   label: t("details.relationship"),
              //   value: member?.relationship,
              // },
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
                icon: <FaBriefcase />,
                label: t("details.occupation"),
                value: member?.occupation,
              },
              {
                icon: <FaMapMarkerAlt />,
                label: t("details.address"),
                value: member?.address,
              },
              {
                icon: <FaPhone />,
                label: t("details.phone"),
                value: member?.phone_number,
              },
              {
                icon: <FaGraduationCap />,
                label: t("details.education"),
                value: member?.education,
              },
              {
                icon: <FaEnvelope />,
                label: t("details.email"),
                value: member?.email,
              },
              {
                icon: <FaBuilding />,
                label: t("details.business_field"),
                value: member?.business_field,
              },
              {
                icon: <FaCalendarAlt />,
                label: t("details.date_of_birth"),
                value: member?.date_of_birth,
              },
              // {
              //   icon: <FaUserShield />,
              //   label: t("details.community_admin"),
              //   value: member?.is_community_admin ? "Yes" : "No",
              // },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg shadow-sm md:col-span-1 col-span-2"
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
            {/* <div className="flex items-center p-4 w-full justify-between bg-gray-50 rounded-lg shadow-sm md:col-span-1 col-span-2">
              <span className="flex items-center gap-4">
                <div className="text-theme text-xl">
                  <FaIdCard />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 text-center">
                    {t("details.id_proof")}
                  </p>
                </div>
              </span>
              <div className="flex justify-end overflow-hidden">
                {member?.id_proof ? (
                  <ImagePreview
                    src={member.id_proof}
                    alt="ID Proof"
                    width={96}
                    height={64}
                    className="rounded-md border border-gray-300 object-cover overflow-hidden"
                  />
                ) : (
                  <span className="text-sm text-gray-900">
                    {t("details.no_id_proof")}
                  </span>
                )}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Details;
