import { useEffect, useRef, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaAnglesRight, FaArrowLeft, FaBars, FaPlus } from "react-icons/fa6";
import { SearchOutlined } from "@ant-design/icons";
import { Badge } from "antd";
import { MdAddHome, MdNotifications } from "react-icons/md";
import { IoChevronDown } from "react-icons/io5";
import { HeaderProps } from "../../helper/Types/types";
import { changeCommunity } from "../../Api/change-community";
import {
  COMMUNITY_THEMES,
  DEFAULT_THEME_COLOR,
} from "../../utils/Constant/communityThemes";

const Header = ({
  showBackArrow = false,
  showProfileIcon = false,
  showskipoption = false,
  showPlusIcon = false,
  showhomeIcon = false,
  title,
  className,
  showSearchIcon = false,
  toggleSidebar,
  onSearch,
  onClearSearch,
  onPlusClick,
  onHomeClick,
  backUrl,
  classNameTitle,
  notificationComponent,
  unreadNotifications,
  bellAnimating,
  plusIconClass = "pl-3",
  plusIconLink,
  familyMembersStatus = "",
  villageList = [],
  selectedVillage = "",
  onVillageChange,
}: HeaderProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [vOpen, setVOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const isDashboard =
    location.pathname == "/dashboard" || location.pathname == "/";
  const searchTimeoutRef = useRef<any | null>(null);

  const handleSearchChange = (e: any) => {
    const value = e.target.value;
    setSearchValue(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      onSearch?.(value);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const onDocClick = (ev: MouseEvent) => {
      if (!vOpen) return;
      if (!dropdownRef.current) return;
      if (!(ev.target instanceof Node)) return;
      if (!dropdownRef.current.contains(ev.target)) {
        setVOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [vOpen]);

  const handleCancelSearch = () => {
    setIsSearching(false);
    setSearchValue("");

    onSearch?.("");
    onClearSearch?.();
  };

  const handleSearchClick = () => {
    setIsSearching(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const handleVillageSelect = async (communityUUID: string) => {
    try {
      await changeCommunity(communityUUID);

      const themeColor = COMMUNITY_THEMES[communityUUID] || DEFAULT_THEME_COLOR;
      localStorage.setItem("themeColor", themeColor);
      localStorage.setItem("communityUUID", communityUUID);
      localStorage.setItem("currentCommunityUUID", communityUUID);
      document.documentElement.style.setProperty("--theme-color", themeColor);
      document.documentElement.style.setProperty(
        "--theme-color-light",
        themeColor + "20"
      );

      onVillageChange?.(communityUUID);
      setVOpen(false);
    } catch (error) {
      console.error("Change community failed", error);
    }
  };
  const twoLineClampStyle: React.CSSProperties = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    whiteSpace: "normal",
  };

  return (
    <div
      className={`bg-theme w-full text-white top-0 left-0 px-4 py-4 ${className} z-50 sticky`}
    >
      <div className="flex items-center relative">
        {!isSearching && toggleSidebar ? (
          <button
            className="text-white font-black mr-2 p-0"
            onClick={toggleSidebar}
            title="Toggle Sidebar"
          >
            <FaBars />
          </button>
        ) : showBackArrow && !isSearching ? (
          <div className="left-4 cursor-pointer">
            <FaArrowLeft
              size={18}
              onClick={() => {
                const currentPath = window.location.pathname;
                if (
                  [
                    "/Events",
                    "/news",
                    "/photos",
                    "/marksheet",
                    "/abroadmembers",
                  ].includes(currentPath)
                ) {
                  navigate("/dashboard");
                } else if (backUrl) {
                  navigate(backUrl);
                } else {
                  navigate(-1);
                }
              }}
            />
          </div>
        ) : null}

        {isSearching ? (
          <div className="flex items-center justify-center w-full">
            <input
              ref={searchInputRef}
              type="text"
              className="w-full p-2 text-[14px] rounded-lg text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme focus:border-transparent shadow-sm"
              placeholder="Search here..."
              value={searchValue}
              onChange={handleSearchChange}
            />
          </div>
        ) : title ? (
          isDashboard ? (
            <div className="flex gap-2 w-full relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setVOpen((s) => !s);
                }}
                className="inline-flex items-center gap-2 hover:bg-white/5 backdrop-blur-sm  rounded-lg px-2 py-2 outline-none cursor-pointer transition-all duration-300 max-w-[70vw] md:max-w-[400px]"
                aria-haspopup="listbox"
                aria-expanded={vOpen}
              >
                <div
                  style={twoLineClampStyle}
                  className="text-white font-semibold text-sm md:text-lg text-left"
                >
                  {(() => {
                    const selected = villageList.find(
                      (v: any) => v.community_uuid === selectedVillage
                    );
                    return selected
                      ? selected.community_name
                      : villageList[0]?.community_name ?? title;
                  })()}
                </div>

                <IoChevronDown
                  size={18}
                  className={`text-white transition-transform duration-300 ease-in-out flex-shrink-0 ${
                    vOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              <div
                className={`absolute left-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden transition-all duration-300 ease-in-out origin-top  w-max max-w-[80vw] md:max-w-[400px] ${
                  vOpen
                    ? "opacity-100 scale-y-100 translate-y-0"
                    : "opacity-0 scale-y-0 -translate-y-2 pointer-events-none"
                }`}
                role="listbox"
              >
                <div className="max-h-60 overflow-y-auto">
                  {villageList.length > 0 ? (
                    villageList.map((v: any, index: number) => (
                      <div
                        key={v.community_uuid}
                        role="option"
                        aria-selected={v.community_uuid === selectedVillage}
                        onClick={() => handleVillageSelect(v.community_uuid)}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 ${
                          v.community_uuid === selectedVillage
                            ? "bg-theme/10 border-l-4 border-theme"
                            : "hover:bg-gray-50 border-l-4 border-transparent"
                        } ${
                          index !== villageList.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${
                            v.community_uuid === selectedVillage
                              ? "bg-theme"
                              : "bg-gray-400"
                          }`}
                        >
                          {v.community_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium whitespace-nowrap ${
                              v.community_uuid === selectedVillage
                                ? "text-theme"
                                : "text-gray-700"
                            }`}
                          >
                            {v.community_name}
                          </p>
                        </div>
                        {v.community_uuid === selectedVillage && (
                          <div className="w-5 h-5 rounded-full bg-theme flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                        <svg
                          className="w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">
                        No communities available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <h1
              className={`flex items-center gap-3 w-full pl-7 font-bold text-md md:text-2xl whitespace-nowrap overflow-hidden text-ellipsis ${classNameTitle}`}
            >
              {title}
            </h1>
          )
        ) : (
          <div> </div>
        )}

        <div className="gap-4 flex items-center">
          {showhomeIcon && (
            <div className="relative cursor-pointer" onClick={onHomeClick}>
              <MdAddHome size={23} />
              {familyMembersStatus && (
                <div className="absolute -bottom-4 text-[10px] ml-[2px] text-white animate-blink">
                  {familyMembersStatus}
                </div>
              )}
            </div>
          )}

          {isDashboard && notificationComponent && (
            <div className="relative">
              <Link to="/notification-page" className="text-white block">
                <Badge
                  count={unreadNotifications}
                  style={{ backgroundColor: "#a32328" }}
                >
                  <div className="relative">
                    {bellAnimating && (
                      <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"></span>
                    )}

                    <MdNotifications size={23} className="!text-white" />
                  </div>
                </Badge>
              </Link>
            </div>
          )}

          {showProfileIcon && !isSearching ? (
            <Link
              to="/registration-details"
              className="right-4 flex justify-end h-full cursor-pointer"
            >
              <FaPlus size={20} />
            </Link>
          ) : null}
        </div>

        {showskipoption && !isSearching ? (
          <Link to="/dashboard">
            <div className="right-4 flex items-center justify-end h-full cursor-pointer text-ellipsis whitespace-nowrap">
              <h1 className="font-bold">{t("buttons.skip")}</h1>
              <FaAnglesRight />
            </div>
          </Link>
        ) : (
          <div></div>
        )}

        {showSearchIcon &&
          (isSearching ? (
            <button className="text-sm ml-2" onClick={handleCancelSearch}>
              Cancel
            </button>
          ) : (
            <button className="text-xl" onClick={handleSearchClick}>
              <SearchOutlined />
            </button>
          ))}

        {showPlusIcon &&
          !isSearching &&
          (plusIconLink ? (
            <Link
              to={plusIconLink}
              className={`right-4 m-0 p-0 flex justify-end h-full cursor-pointer ${plusIconClass}`}
              title="Add New"
            >
              <FaPlus size={23} />
            </Link>
          ) : (
            <button
              className={`right-4 m-0 p-0 flex justify-end h-full cursor-pointer ${plusIconClass}`}
              onClick={onPlusClick}
              title="Add New"
            >
              <FaPlus size={23} />
            </button>
          ))}
      </div>
    </div>
  );
};

export default Header;
