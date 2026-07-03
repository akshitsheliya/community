import { FC } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./Sidebar";
import AdminHeader from "./Admin-Header";

const AdminLayout: FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100 ">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col fixed top-0 left-0 right-0">
        {/* Header */}
        <AdminHeader />

        {/* Main Section */}
        <main className="flex-1 p-5 overflow-y-auto md:ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;