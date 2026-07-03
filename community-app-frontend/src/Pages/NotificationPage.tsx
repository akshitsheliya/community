import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  markNotificationAsRead,
  readallNotifications,
} from "../Api/notification";
import Header from "../component/Common/Header";
import { format } from "date-fns";
// import { motion, AnimatePresence } from "framer-motion";
import {
  FaBuilding,
  FaExchangeAlt,
  FaCalendarAlt,
  FaNewspaper,
  FaRegFileAlt,
  FaBell,
  FaRegCircle,
  FaUserPlus,
} from "react-icons/fa";
import { BsFillPatchCheckFill } from "react-icons/bs";
import { IoMdNotificationsOutline } from "react-icons/io";
import CircularArcLoader from "../component/CustomCircularLoader";

interface Notification {
  notification_id: number;
  notification_uuid: string;
  member_id: number;
  notification_type: string;
  notification_message: string;
  created_at: string;
  notification_is_read: number;
}

const NotificationPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = () => {
    try {
      const adminValue = localStorage.getItem("isAdmin");
      setIsAdmin(adminValue === "1");
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications();
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy • h:mm a");
    } catch (error) {
      return dateString;
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case "committee_added":
        return <FaBuilding className="text-theme" />;
      case "committee_update":
        return <FaExchangeAlt className="text-theme" />;
      case "event":
        return <FaCalendarAlt className="text-theme" />;
      case "news":
        return <FaNewspaper className="text-theme" />;
      case "new_marksheet":
        return <FaRegFileAlt className="text-theme" />;
      case "new_member":
      case "approve_user":
      case "reject_user":
        return <FaUserPlus className="text-theme" />;
      default:
        return <FaBell className="text-theme" />;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (
        notification.notification_is_read === 0 &&
        notification.notification_uuid
      ) {
        const result = await markNotificationAsRead(
          notification.notification_uuid
        );

        if (result.success) {
          setNotifications((prev) =>
            prev.map((n) =>
              n.notification_id === notification.notification_id
                ? { ...n, notification_is_read: 1 }
                : n
            )
          );
        }
      }
      switch (notification.notification_type) {
        case "new_marksheet":
          navigate("/marksheet");
          break;
        case "event":
          navigate("/Events");
          break;
        case "new_news":
          navigate("/news");
          break;
        case "committee_added":
          navigate("/committee-members");
          break;
        case "committee_update":
          navigate("/committee-members");
          break;
        case "marksheet_approve":
        case "marksheet_reject":
          navigate("/marksheet");
          break;
        case "new_member":
        case "approve_user":
        case "reject_user":
          if (isAdmin) {
            navigate("/new-member");
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    } else {
      return formatDate(dateString);
    }
  };
  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => n.notification_is_read === 0)
      : notifications;
  const unreadCount = notifications.filter(
    (n) => n.notification_is_read === 0
  ).length;

  const markAllAsRead = async () => {
    try {
      const response = await readallNotifications();

      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, notification_is_read: 1 }))
        );
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleTabChange = (tab: "all" | "unread") => {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header
        showBackArrow={true}
        title={t("notifications.title") || "Notifications"}
        className="mb-0"
      />
      <div className="bg-white shadow-sm border-b sticky top-[-100px] z-10 py-3">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2 mt-2">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === "all"
                    ? "bg-theme text-white shadow"
                    : "hover:bg-theme hover:text-white transition duration-200 text-gray-700 bg-gray-100"
                }`}
                onClick={() => handleTabChange("all")}
              >
                {t("notifications.all")}
              </button>

              <button
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 transition-all duration-300 ${
                  activeTab === "unread"
                    ? "bg-theme text-white shadow"
                    : "hover:bg-theme hover:text-white transition duration-200 text-gray-700 bg-gray-100"
                }`}
                onClick={() => handleTabChange("unread")}
              >
                {t("notifications.unread")}
                {unreadCount > 0 && (
                  <span className="bg-white text-theme text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                className="text-sm font-medium text-gray-700 bg-white px-4 py-2 rounded-full hover:bg-theme hover:text-white transition-colors duration-200"
                onClick={markAllAsRead}
              >
                {t("notifications.markallasread")}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20 pt-2">
        {loading ? (
          <div className="fixed inset-0 flex justify-center items-center">
            <CircularArcLoader size={40} color="brown" />
          </div>
        ) : (
          <>
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 bg-white rounded-xl shadow-sm p-8 mt-6">
                <div className="text-6xl mb-6 text-gray-300">
                  <IoMdNotificationsOutline />
                </div>
                <p className="text-gray-600 text-center font-medium text-lg">
                  {activeTab === "unread"
                    ? t("notifications.empty")
                    : t("notifications.empty") || "No notifications yet"}
                </p>
                <p className="text-gray-400 text-center mt-2">
                  {activeTab === "unread"
                    ? t("notifications.emptyniche")
                    : "You'll see your notifications here when there's activity"}
                </p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {/* <AnimatePresence> */}
                {filteredNotifications.map((notification, index) => (
                  <div
                    key={index}
                    // initial={{ opacity: 0, y: 10 }}
                    // animate={{ opacity: 1, y: 0 }}
                    // exit={{ opacity: 0, x: -10 }}
                    // transition={{ delay: index * 0.05 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer bg-white rounded-xl shadow-sm mb-3 ${
                      notification.notification_is_read === 0
                        ? "border-l-4 border-theme"
                        : ""
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="mr-4 mt-1 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-theme bg-opacity-10 text-lg">
                        {getNotificationTypeIcon(
                          notification.notification_type
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p
                              className={`text-gray-800 mb-1 ${
                                notification.notification_is_read === 0
                                  ? "font-semibold"
                                  : "font-medium"
                              }`}
                            >
                              {notification.notification_message}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center">
                              {getTimeAgo(notification.created_at)}
                              <span className="mx-1.5">•</span>
                              {notification.notification_is_read === 0 ? (
                                <span className="text-theme flex items-center text-xs">
                                  <FaRegCircle className="mr-1 text-xs" />
                                  {t("notifications.unread")}
                                </span>
                              ) : (
                                <span className="text-gray-400 flex items-center text-xs">
                                  <BsFillPatchCheckFill className="mr-1" />
                                  {t("notifications.read")}
                                </span>
                              )}
                            </p>
                          </div>

                          {notification.notification_is_read === 0 && (
                            <span className="flex-shrink-0 w-2.5 h-2.5 bg-theme rounded-full mt-1.5 ml-2"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {/* </AnimatePresence> */}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
