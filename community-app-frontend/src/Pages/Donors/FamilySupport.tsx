import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../component/Common/Header";
import { useTranslation } from "react-i18next";
import { Getdonors, Deletedonor } from "../../Api/Donor";
import { Notify } from "../../component/Common/Notify";
import Card from "../../component/Common/CardData";
import CircularArcLoader from "../../component/CustomCircularLoader";

const FamilySupport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [donors, setDonors] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("");

  const fetchDonors = async (filter = "") => {
    setIsLoading(true);
    try {
      let params = {};
      if (filter === "life time donor") {
        params = { donation_category: filter };
      } else if (filter === "2025" || filter === "2026") {
        params = { donation_year: filter };
      }

      const response = await Getdonors(params);
      setDonors(response.data);
    } catch (error) {
      Notify("Error fetching donors", "error");
      setDonors([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();

    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setIsAdmin(parsedData.is_community_admin === 1);
      } catch (error) {
        Notify("Error loading admin data", "error");
      }
    }
  }, []);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    fetchDonors(filter);
  };

  const openDeleteModal = (donorId: any) => {
    setDeleteId(donorId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await Deletedonor(deleteId);
      setDonors((prevDonors) =>
        prevDonors
          ? prevDonors.filter((donor) => donor.donor_id !== deleteId)
          : []
      );
      Notify("Donor deleted successfully!", "success");
    } catch (error) {
      Notify("Error deleting donor", "error");
    } finally {
      closeDeleteModal();
    }
  };

  const handleDetails = (data: any) => {
    if (data?.registered == 1) {
      navigate("/details", {
        state: { data: data, isDetails: true },
      });
    } else {
      navigate("/add-new-donor", {
        state: { data: data, isDetails: true },
      });
    }
  };

  return (
    <>
      <div className="flex flex-col h-screen">
        <div className="fixed top-0 left-0 right-0 z-20">
          <Header
            title={t("Donors")}
            showBackArrow={true}
            showPlusIcon={isAdmin}
            onPlusClick={() => setIsPopupOpen(true)}
            backUrl={"/dashboard"}
            className=""
          />
        </div>

        <div className="flex-1 overflow-y-auto pt-[60px]">
          <div className="bg-white shadow-sm border-b sticky top-0 z-10 py-3">
            <div className="container mx-auto px-3">
              <div className="grid grid-cols-4 gap-2">
                <button
                  className={`py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap overflow-hidden ${
                    activeFilter === ""
                      ? "bg-theme text-white shadow"
                      : "hover:bg-theme hover:text-white transition duration-200 text-gray-700 bg-gray-100"
                  }`}
                  onClick={() => handleFilterChange("")}
                >
                  {t("donors.alldonors")}
                </button>
                <button
                  className={`py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap overflow-hidden ${
                    activeFilter === "life time donor"
                      ? "bg-theme text-white shadow"
                      : "hover:bg-theme hover:text-white transition duration-200 text-gray-700 bg-gray-100"
                  }`}
                  onClick={() => handleFilterChange("life time donor")}
                >
                  {t("donors.life_time_donor")}
                </button>
                <button
                  className={`py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap overflow-hidden text-ellipsis ${
                    activeFilter === "2025"
                      ? "bg-theme text-white shadow"
                      : "hover:bg-theme hover:text-white transition duration-200 text-gray-700 bg-gray-100"
                  }`}
                  onClick={() => handleFilterChange("2025")}
                >
                  2025
                </button>
                <button
                  className={`py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap overflow-hidden text-ellipsis ${
                    activeFilter === "2026"
                      ? "bg-theme text-white shadow"
                      : "hover:bg-theme hover:text-white transition duration-200 text-gray-700 bg-gray-100"
                  }`}
                  onClick={() => handleFilterChange("2026")}
                >
                  2026
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-100">
            {isLoading ? (
              <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-75 z-30">
                <CircularArcLoader size={60} color="brown" />
              </div>
            ) : donors && donors.length > 0 ? (
              donors.map((donor, index) => (
                <div key={index}>
                  <Card
                    image={
                      donor?.donor_photo
                        ? donor?.donor_photo
                        : donor?.profile_photo
                        ? donor?.profile_photo
                        : null
                    }
                    userName={donor.donor_name}
                    phoneNumber={donor?.donor_mobile_no}
                    showDonorType={true}
                    donor={donor}
                    onClick={() => openDeleteModal(donor?.donor_id)}
                    deleteButton={isAdmin}
                    details={() => handleDetails(donor)}
                    edit={isAdmin && donor?.registered === 0}
                    onClickEdit={() => {
                      navigate("/add-new-donor", {
                        state: { data: donor, isEdit: true },
                      });
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="flex justify-center items-center p-8">
                <span>No Donor found</span>
              </div>
            )}
          </div>
        </div>

        {showDeleteModal && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={closeDeleteModal}
          >
            <div
              className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-[90%] border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">
                {t("donors.title")}
              </h2>
              <p className="text-gray-600 mb-4">{t("donors.message")}</p>
              <div className="flex justify-end space-x-3">
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded"
                  onClick={closeDeleteModal}
                >
                  {t("donors.cancel")}
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                  onClick={confirmDelete}
                >
                  {t("donors.delete")}
                </button>
              </div>
            </div>
          </div>
        )}

        {isPopupOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={() => setIsPopupOpen(false)}
          >
            <div
              className="bg-white p-6 rounded-lg shadow-lg w-80 max-w-[90%] border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold mb-4 text-admin border-b border-gray-200 pb-2">
                {t("donors.Select_Option")}
              </h2>
              <button
                className="w-full bg-admin hover:bg-admin text-white py-3 mb-3 rounded font-medium transition-colors duration-300"
                onClick={() => navigate("/DonorSearchMember")}
              >
                {t("donors.Search_Member")}
              </button>
              <button
                className="w-full bg-admin hover:bg-admin text-white py-3 rounded font-medium transition-colors duration-300"
                onClick={() => navigate("/add-new-donor")}
              >
                {t("donors.New_Donor")}
              </button>
              <button
                className="w-full mt-4 bg-gray-100 py-2 border hover:bg-gray-200 border-gray-200 rounded transition-colors duration-300"
                onClick={() => setIsPopupOpen(false)}
              >
                {t("donors.Close")}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FamilySupport;
