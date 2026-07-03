import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaUsers, FaAward, FaUpload, FaImage, FaHome } from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import { BsFillFileEarmarkSpreadsheetFill } from "react-icons/bs";
import { useLocalStorage } from "../../../Context/LocalStorageContext";
import { GiCommercialAirplane } from "react-icons/gi";
import { useEffect, useState } from "react";
import { GetSingleUser } from "../../../Api/user";
import { FaBusinessTime, FaUserClock } from "react-icons/fa6";
import { Badge } from "antd";
import { Notify } from "../../../component/Common/Notify";
import { MdEventAvailable } from "react-icons/md";

const DashboardItems = ({ countsData }: { countsData: any }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userData, setUserData } = useLocalStorage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const lastDate = countsData?.activeStandards?.[0]?.lastDate || "N/A";
  const counts = countsData
    ? {
        ...countsData,
        activeStandards: countsData.activeStandards?.length || 0,
        pendingMarksheetsCount: countsData.marksheetsCount || 0,
        unverifiedUsers: countsData.unverifiedUsers || 0,
        unreadnotice: countsData.unreadnotice || 0,
      }
    : null;

  const getSessionPopupDismissed = () => {
    return sessionStorage.getItem("familyMemberPopupDismissed") === "true";
  };

  const Admin = [
    {
      id: 17,
      label: t("news.title"),
      icon: <MdEventAvailable />,
      slug: "/news",
      hasNotification: counts?.unreadnotice > 0,
    },
    {
      id: 1,
      label: t("Member_list"),
      icon: <FaHome />,
      slug: "/member-list",
    },
    {
      id: 3,
      label: t("title.Committee"),
      icon: <FaUsers />,
      slug: "/committee-members",
    },
    {
      id: 5,
      label: t("title.snehmilan_photo"),
      icon: <FaImage />,
      slug: "/photos",
    },
    {
      id: 6,
      label: t("MarkSheet_Upload"),
      icon: <FaUpload />,
      slug: "/upload-marksheet",
      count: counts?.activeStandards,
    },
    {
      id: 7,
      label: t("Donors"),
      icon: <HiUsers />,
      slug: "/donors",
    },
    {
      id: 9,
      label: t("title.AwardEligiblestudent"),
      icon: <FaAward />,
      slug: "/award-eligible-students",
      count: counts?.activeStandards,
      isAdmin: true,
    },
    {
      id: 8,
      label: t("abroadMembers.Abroad_Members"),
      icon: <GiCommercialAirplane />,
      slug: "/abroadmembers",
    },
    {
      id: 15,
      label: t("title.received_marksheets"),
      icon: <BsFillFileEarmarkSpreadsheetFill />,
      slug: "/marksheet",
      count: counts?.pendingMarksheetsCount || 0,
    },
    {
      id: 16,
      label: t("title.new_members"),
      icon: <FaUserClock />,
      slug: "/new-member",
      count: counts?.unverifiedUsers,
    },
    {
      id: 10,
      label: t("title.Bussiness"),
      icon: <FaBusinessTime />,
      slug: "/business",
    },
  ];

  const User = [
    {
      id: 17,
      label: t("news.title"),
      icon: <MdEventAvailable />,
      slug: "/news",
      hasNotification: counts?.unreadnotice > 0,
    },
    {
      id: 1,
      label: t("Member_list"),
      icon: <FaHome />,
      slug: "/member-list",
    },
    {
      id: 3,
      label: t("title.Committee"),
      icon: <FaUsers />,
      slug: "/committee-members",
    },
    {
      id: 5,
      label: t("title.snehmilan_photo"),
      icon: <FaImage />,
      slug: "/photos",
    },
    {
      id: 6,
      label: t("MarkSheet_Upload"),
      icon: <FaUpload />,
      slug: "/upload-marksheet",
      count: counts?.activeStandards,
    },
    {
      id: 7,
      label: t("Donors"),
      icon: <HiUsers />,
      slug: "/donors",
    },
    {
      id: 8,
      label: t("abroadMembers.Abroad_Members"),
      icon: <GiCommercialAirplane />,
      slug: "/abroadmembers",
    },
    {
      id: 10,
      label: t("title.Bussiness"),
      icon: <FaBusinessTime />,
      slug: "/business",
    },
  ];

  const isAdmin: any =
    userData?.is_community_admin ?? localStorage.getItem("isAdmin");

  useEffect(() => {
    if (
      userData?.is_community_admin === undefined ||
      userData?.is_community_admin === null
    ) {
      return;
    }

    const adminFromUser = String(userData.is_community_admin);
    const adminFromStorage = String(localStorage.getItem("isAdmin") ?? "");

    if (adminFromUser !== adminFromStorage) {
      localStorage.setItem("isAdmin", adminFromUser);
    }
  }, [userData?.is_community_admin]);

  useEffect(() => {
    if (!userData && !localStorage.getItem("userData")) {
      (async () => {
        const users: any = await GetSingleUser();
        localStorage.setItem("isAdmin", users?.data?.is_community_admin);
        localStorage.setItem("userData", JSON.stringify(users?.data));
        setUserData(users?.data);
      })();
    }
  }, [userData]);

  useEffect(() => {
    if (countsData?.remainingFamilyMembers > 0 && !getSessionPopupDismissed()) {
      setIsModalOpen(true);
    }
  }, [countsData]);

  const handleModalOk = () => {
    setIsModalOpen(false);
    navigate("/registration-details");
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    sessionStorage.setItem("familyMemberPopupDismissed", "true");
  };

  let roleRoutes: any = [];
  if (isAdmin == 1 || isAdmin == "1") {
    roleRoutes = [...Admin];
  } else {
    roleRoutes = [...User];
  }

  return (
    <>
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000]"
          onClick={handleModalCancel}
        >
          <div
            className="bg-white w-80 rounded-2xl shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-theme p-4 text-white text-lg font-bold text-center">
              {t("addmember")}
            </div>

            <div className="pt-8 pb-4">
              <span className="mb-4 flex justify-center px-5">
                {t("doyouaddmember")}{" "}
              </span>
              <div className="flex justify-center space-x-10">
                <button
                  className="bg-gray-300 text-gray-700 px-9 py-2 rounded"
                  onClick={handleModalCancel}
                >
                  {t("no")}
                </button>
                <button
                  className="bg-theme text-white px-9 py-2 rounded"
                  onClick={handleModalOk}
                >
                  {t("yes")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 p-4 text-center w-full h-full overflow-y-auto max-h-screen">
        {roleRoutes?.map((item: any, index: number) => (
          <div
            key={index}
            className="bg-[#dadada] box-border sm:h-20 h-10 w-34 shadow-lg rounded-lg flex flex-col items-center justify-center p-4 relative cursor-pointer sm:min-h-36 min-h-28"
            onClick={() => {
              if (
                item.slug == "/upload-marksheet" &&
                (!item.count || item.count <= 0)
              ) {
                Notify(
                  `Award eligible students will be declared after ${lastDate}`,
                  "error"
                );
                return;
              }

              if (item.slug == "/award-eligible-students") {
                const isAdminUser = isAdmin == 1 || isAdmin == "1";
                if (!isAdminUser || !item.count || item.count <= 0) {
                  Notify(
                    `Award eligible students will be declared after ${lastDate}`,
                    "error"
                  );
                  return;
                }
              }

              navigate(item.slug || "");
            }}
          >
            {item.hasNotification ? (
              <Badge
                dot
                style={{
                  backgroundColor: "#a32328",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  transform: "translate(60%, -50%)",
                }}
              >
                <div className="text-theme text-3xl">{item?.icon}</div>
              </Badge>
            ) : item.count != undefined &&
              item.count > 0 &&
              (item?.slug == "/new-member" || item?.slug == "/marksheet") ? (
              <Badge count={item.count} style={{ backgroundColor: "#a32328" }}>
                <div className="text-theme text-3xl">{item?.icon}</div>
              </Badge>
            ) : (
              <div className="text-theme text-3xl">{item?.icon}</div>
            )}
            <h3 className="text-gray-700 text-sm mt-2">{item?.label}</h3>
          </div>
        ))}
      </div>
    </>
  );
};

export default DashboardItems;
