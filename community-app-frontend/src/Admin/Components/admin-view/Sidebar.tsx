import { useState, FC } from "react";
import { useTranslation } from "react-i18next";
import { FaChartLine, FaThLarge, FaBars } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";
import { HiUsers } from "react-icons/hi2";
import { Link } from "react-router-dom";

const AdminSidebar: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const { t } = useTranslation();

  const toggleSidebar = (): void => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* Toggle Button */}
      {!sidebarOpen ? (
        <button
          type="button"
          title="Open Sidebar"
          onClick={toggleSidebar}
          className="md:hidden fixed top-2 left-4 z-50 bg-theme text-white rounded-full p-2 shadow-md"
        >
          <FaBars />
        </button>
      ) : (
        ""
      )}

      {/* Sidebar */}
      <aside
        className={`bg-theme w-64 h-screen fixed top-0 left-0 shadow-xl transition-transform duration-300 ease-in-out z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="px-6 py-3 flex items-center justify-between md:justify-start">
          <div className="flex items-center">
            <FaChartLine className="text-2xl mr-2 text-white" />
            <span className="text-xl font-bold text-white">
              <Link to="/admin/dashboard"> {t("adminPanel")} </Link>
            </span>
          </div>
          {/* Close Button */}
          <button
            type="button"
            title="Close Sidebar"
            onClick={toggleSidebar}
            className="md:hidden text-white text-2xl"
          >
            <IoIosCloseCircle />
          </button>
        </div>

        <nav className="mt-4 mx-5">
          <ul>
            <li className="hover:bg-theme">
              <Link
                to="/admin/dashboard"
                className="flex items-center p-4 text-white"
              >
                <FaThLarge className="text-xl" />
                <span className="ml-4">{t("dashboard")}</span>
              </Link>
            </li>
            <li className="hover:bg-theme">
              <Link
                to="/admin/users"
                className="flex items-center p-4 text-white"
              >
                <HiUsers className="text-2xl" />
                <span className="ml-3">{t("users")}</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Overlay for smaller screens */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default AdminSidebar;
