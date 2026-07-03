import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ImagePreview from "../../component/Common/ImagePreview";
import { SidebarProps, SidebarItemProps } from "../../helper/Types/types";
import {
  // FaHome,
  //FaClock,
  // FaUsers,
  //FaSearch,
  // FaImage,
  FaPhoneAlt,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaClipboardList,
  FaEdit,
} from "react-icons/fa";
import { MdDelete, MdOutlineSecurity } from "react-icons/md";
import LanguagePopup from "./LanguagePopup";
import LogoutPopup from "./Logoutpopup";
import DeleteAccountPopup from "./DeleteAccountPopup";
import { GetSingleUser } from "../../Api/user";

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen = false,
  toggleSidebar,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [first_name, setFirstName] = useState<string | null>(null);
  const [surname, setSurname] = useState<string | null>(null);
  const [image, setImage] = useState<any>(null);
  const [showLanguagePopup, setShowLanguagePopup] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const fetchUser = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        console.log("Token not found, skipping user data fetch.");
        return;
      }

      const response = await GetSingleUser();
      if (response?.data) {
        const apiData = response.data;
        localStorage.setItem("userData", JSON.stringify(apiData));
        setFirstName(apiData.first_name || "");
        setImage(apiData?.profile_photo);
        // setFatherName(apiData.father_name || null);
        setSurname(apiData.surname || null);
        // setMemberId(apiData.member_id || null);
      } else {
        console.error("Invalid API response:", response);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const storedData = localStorage.getItem("userData");

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);

        setFirstName(parsedData.first_name || "");
        setImage(parsedData?.profile_photo);
        // setFatherName(parsedData.father_name || null);
        setSurname(parsedData.surname || null);
        // setMemberId(parsedData.member_id || "");
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
      }
    } else {
      fetchUser();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !showLanguagePopup &&
        !showLogoutPopup
      ) {
        toggleSidebar(false);
      }
    };

    if (isSidebarOpen && !showLanguagePopup && !showLogoutPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen, showLanguagePopup, showLogoutPopup, toggleSidebar]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-theme text-white w-72 transform z-[999] ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-all duration-300`}
      >
        <div className="p-4 flex flex-col w-full items-center overflow-hidden">
          <div className="flex w-full items-center gap-2 text-sm">
            <div className="w-14 h-14 border-[1px] border-white bg-theme rounded-full overflow-hidden flex items-center justify-center text-theme">
              {image ? (
                <ImagePreview
                  src={image}
                  alt="profile image"
                  width={56}
                  height={56}
                  className="rounded-full object-cover object-center "
                />
              ) : (
                <span className="text-xl">
                  <FaUser />
                </span>
              )}
            </div>
            <div>
              <div className="flex gap-1 text-[16px]  whitespace-nowrap text-ellipsis ">
                {first_name && <h1>{first_name}</h1>}
                {/* {father_name && (
                  <h1 className="text-lg font-bold">{father_name}</h1>
                )} */}
                {surname && <h1>{surname}</h1>}
              </div>
              {/* {member_id && (
                <p className="text-[13px] font-semibold">
                  Member Id:- {member_id}
                </p>
              )} */}
            </div>

            <div
              className="flex items-center gap-1 cursor-pointer ml-1 text-lg"
              onClick={() => {
                const storedUserData = localStorage.getItem("userData");
                const userData = storedUserData
                  ? JSON.parse(storedUserData)
                  : {};

                navigate("/registration-details", {
                  state: { data: userData, isFromProfile: true },
                });
              }}
            >
              <FaEdit />
            </div>
          </div>
        </div>

        {/* Sidebar Menu */}
        <div
          className="bg-white flex-1 text-black rounded-t-lg p-4 space-y-4 overflow-y-auto min-h-full"
          style={{
            height: "calc(100vh - 120px)",
          }}
        >
          {/* <SidebarItem
            icon={<FaHome />}
            text={t("Member_list")}
            onClick={() => navigate("/member-list")}
          /> */}
          {/* <SidebarItem icon={<FaClock />} text={t("Family_Office")} /> */}
          {/* <SidebarItem
            icon={<FaUsers />}
            text={t("title.Committee")}
            onClick={() => navigate("/committee-members")}
          /> */}
          {/* <SidebarItem
            icon={<FaSearch />}
            text={t("Find_Member")}
            onClick={() => navigate("/search-member")}
          /> */}
          {/* <SidebarItem
            icon={<FaImage />}
            text={t("title.snehmilan_photo")}
            onClick={() => navigate("/photos")}
          /> */}
          <SidebarItem
            icon={<FaCog />}
            text={t("setting")}
            onClick={() => setShowLanguagePopup(true)}
          />
          <SidebarItem
            icon={<MdOutlineSecurity />}
            text={t("privacy")}
            onClick={() => navigate("/privacy-policy")}
          />
          <SidebarItem
            icon={<FaClipboardList />}
            text={t("term_Condition")}
            onClick={() => navigate("/tems-condition")}
          />
          <SidebarItem
            icon={<FaPhoneAlt />}
            text={t("Helpline_call")}
            onClick={() => navigate("/app-helpline")}
          />

          <SidebarItem
            icon={<MdDelete />}
            text={t("delete_my_Account")}
            onClick={() => setShowDeletePopup(true)}
          />
          <SidebarItem
            icon={<FaSignOutAlt />}
            text={t("Log_out")}
            onClick={() => setShowLogoutPopup(true)}
          />
        </div>
      </div>

      {/* Language Popup */}
      {showLanguagePopup && (
        <LanguagePopup onClose={() => setShowLanguagePopup(false)} />
      )}

      {/* Logout Popup */}
      {showLogoutPopup && (
        <LogoutPopup
          onClose={() => setShowLogoutPopup(false)}
          onConfirm={handleLogout}
        />
      )}

      {/* Language Popup */}
      {showLanguagePopup && (
        <LanguagePopup onClose={() => setShowLanguagePopup(false)} />
      )}
      {showDeletePopup && (
        <DeleteAccountPopup
          onClose={() => setShowDeletePopup(false)}
          onConfirm={() => {
            localStorage.clear();
            sessionStorage.clear();
            navigate("/login"); // Redirect user after deleting the account
          }}
        />
      )}
    </>
  );
};

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, text, onClick }) => {
  return (
    <div
      className="flex items-center space-x-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md"
      onClick={onClick}
    >
      <div className="text-theme text-lg">{icon}</div>
      <p className="text-gray-700 font-medium">{text}</p>
    </div>
  );
};

export default Sidebar;
