import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Sidebar/Sidebar";
import Header from "../../../component/Common/Header";
import { useTranslation } from "react-i18next";
import { GetSingleUser } from "../../../Api/user";
import CircularArcLoader from "../../../component/CustomCircularLoader";
import { useLocalStorage } from "../../../Context/LocalStorageContext";
const DashboardLayout = ({
  children,
  countsData,
  onRefreshDashboard,
  isLoading,
}: {
  children: any;
  countsData: any;
  onRefreshDashboard?: () => void;
  isLoading?: boolean;
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bellAnimating, setBellAnimating] = useState(false);

  const [villageList, setVillageList] = useState(() => {
    const cached = localStorage.getItem("villageListCache");
    return cached ? JSON.parse(cached) : [];
  });
  const [selectedVillage, setSelectedVillage] = useState(() => {
    return localStorage.getItem("currentCommunityUUID") || "";
  });

  const prevUnreadCountRef = useRef(countsData?.unreadNotifications || 0);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { refreshUserData, setUserData } = useLocalStorage();
  const fetchVillageList = async () => {
    try {
      const response = await GetSingleUser();
      if (response?.data) {
        const freshUser = response.data;
        const freshAdmin = String(freshUser.is_community_admin ?? "");
        const storedAdmin = String(localStorage.getItem("isAdmin") ?? "");

        if (freshAdmin !== storedAdmin) {
          localStorage.setItem("isAdmin", freshAdmin);
          localStorage.setItem("userData", JSON.stringify(freshUser));
          setUserData(freshUser);
        }
      }

      const communityList = response?.data?.community_list || [];
      const userCommunityUUID = response?.data?.community_uuid || "";
      setVillageList(communityList);
      const savedCommunity = localStorage.getItem("currentCommunityUUID");
      const isValidSaved = communityList.some(
        (c: any) => c.community_uuid === savedCommunity
      );

      if (savedCommunity && isValidSaved) {
        setSelectedVillage(savedCommunity);
      } else {
        setSelectedVillage(userCommunityUUID);
        localStorage.setItem("currentCommunityUUID", userCommunityUUID);
      }
    } catch (error) {
      console.error("Village List Error:", error);
    }
  };

  useEffect(() => {
    fetchVillageList();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navigateToHome = () => {
    navigate("/family-members");
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("mobileNumber");
    localStorage.removeItem("userPhoneNumber");
  };
  const handleVillageChange = async (uuid: string) => {
    setSelectedVillage(uuid);
    localStorage.setItem("currentCommunityUUID", uuid);
    await refreshUserData();
    fetchVillageList();
    if (onRefreshDashboard) {
      onRefreshDashboard();
    }
  };

  useEffect(() => {
    if (countsData) {
      const unreadCount = countsData.unreadNotifications || 0;

      if (unreadCount > prevUnreadCountRef.current) {
        setBellAnimating(true);

        const timer = setTimeout(() => {
          setBellAnimating(false);
        }, 1000);

        return () => clearTimeout(timer);
      }

      prevUnreadCountRef.current = unreadCount;
    }
  }, [countsData]);

  useEffect(() => {
    clearLocalStorage();
  }, []);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "scroll";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSidebarOpen]);

  return (
    <>
      <Header
        toggleSidebar={toggleSidebar}
        showBackArrow={false}
        showhomeIcon={true}
        onHomeClick={navigateToHome}
        title={
          countsData?.communityDescription
            ? countsData.communityDescription
            : t("title.village_Name")
        }
        classNameTitle="pl-7"
        notificationComponent={true}
        unreadNotifications={countsData?.unreadNotifications || 0}
        bellAnimating={bellAnimating}
        familyMembersStatus={countsData?.familyMembersStatus || ""}
        villageList={villageList}
        selectedVillage={selectedVillage}
        onVillageChange={handleVillageChange}
      />

      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center">
          <CircularArcLoader size={80} color="orange" />
        </div>
      )}
      <div
        className={`${isSidebarOpen ? "overflow-hidden" : "overflow-scroll"}`}
      >
        {isSidebarOpen && (
          <div
            className="fixed left-0 w-full h-full bg-black opacity-50 z-[1]"
            onClick={toggleSidebar}
          ></div>
        )}

        {children}
      </div>
    </>
  );
};

export default DashboardLayout;
