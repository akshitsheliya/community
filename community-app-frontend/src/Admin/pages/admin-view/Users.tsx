import { useTranslation } from "react-i18next";

const AdminUsers = () => {
  const { t } = useTranslation();

  const users = [
    {
      id: 1,
      firstname: "Chloe",
      middlename: "Elizabeth",
      lastname: "Anderson",
      mobilenumber: "8889990000",
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 bg-white p-4 shadow-md rounded-md">
        <h1 className="text-xl font-bold text-theme">{t("adminprofile")}</h1>
        <button className="bg-theme text-white px-4 py-2 rounded-md hover:bg-theme">
          {t("button.addUser")}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-md overflow-x-auto mb-6">
        <div
          className="overflow-y-scroll"
          style={{
            maxHeight: "550px",
          }}
        >
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-theme text-white z-10 shadow">
              <tr>
                <th className="px-4 py-2 border">{t("table.id")}</th>
                <th className="px-4 py-2 border">{t("table.firstname")}</th>
                <th className="px-4 py-2 border">{t("table.middlename")}</th>
                <th className="px-4 py-2 border">{t("table.lastname")}</th>
                <th className="px-4 py-2 border">{t("table.mobilenumber")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.id}
                  className={`text-gray-800 text-center ${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  } hover:bg-orange-100`}
                >
                  <td className="px-4 py-2 border">{user.id}</td>
                  <td className="px-4 py-2 border">{user.firstname}</td>
                  <td className="px-4 py-2 border">{user.middlename}</td>
                  <td className="px-4 py-2 border">{user.lastname}</td>
                  <td className="px-4 py-2 border">{user.mobilenumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
