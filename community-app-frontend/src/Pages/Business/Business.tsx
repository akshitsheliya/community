import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    getAllBusinesses,
    deleteBusiness,
} from "../../Api/Business";
import Card from "./BusinessCard";
import Header from "../../component/Common/Header";
import { Notify } from "../../component/Common/Notify";
import { Business } from "../../helper/Types/types";
import CircularArcLoader from "../../component/CustomCircularLoader";
import { Modal } from "antd";

const BusinessList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [businessToDelete, setBusinessToDelete] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    useEffect(() => {
        fetchBusinesses();
    }, [searchTerm]);

    useEffect(() => {
        let filtered = businesses;
        setFilteredBusinesses(filtered);
    }, [businesses]);

    const fetchBusinesses = async () => {
        try {
            setLoading(true);
            const response = await getAllBusinesses(searchTerm);
            const businessData = response?.data || [];
            setBusinesses(businessData);
            setFilteredBusinesses(businessData);
        } catch (error) {
            console.error("Error fetching businesses:", error);
            Notify(t("Failed to fetch businesses"), "error");
        } finally {
            setLoading(false);
        }
    };
    const openDeleteModal = (uuid: string) => {
        setBusinessToDelete(uuid);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setBusinessToDelete(null);
    };

    const handleSearch = (term: string) => {

        setSearchTerm(term.trim());
    };

    const handleClearSearch = () => {

        setSearchTerm("");

    };


    const handleDeleteBusiness = async () => {
        if (!businessToDelete) return;

        try {
            const response = await deleteBusiness(businessToDelete);
            if (response.success) {
                Notify(t("Business deleted successfully"), "success");
                fetchBusinesses();
            } else {
                Notify(response.message || t("Failed to delete business"), "error");
            }
        } catch (error: any) {
            console.error("Error deleting business:", error);
            Notify(error.message || t("Failed to delete business"), "error");
        } finally {
            closeDeleteModal();
        }
    };
    const handleEditBusiness = (business: Business) => {
        navigate(`/edit-business/${business.business_uuid}`, {
            state: { businessData: business }
        });
    };

    return (
      <>
        <Header
          showBackArrow={true}
          showPlusIcon={true}
          onPlusClick={() => navigate("/add-business")}
          title={t("business")}
          backUrl="/dashboard"
          showSearchIcon={true}
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
          plusIconClass={"pl-3"}
        />
        <div className="h-[calc(100vh-70px)] p-4 sm:p-6 bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <CircularArcLoader size={50} color="brown" />
            </div>
          ) : (
            <>
              {filteredBusinesses && filteredBusinesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredBusinesses.map((business) => (
                    <Card
                      key={business.business_uuid}
                      image={business.business_photo || business.business_logo}
                      userName={business.business_name || t("Unnamed Business")}
                      phoneNumber={business.contact_number || t("No phone")}
                      address={`${business.city || ""} ${
                        business.state ? ", " + business.state : ""
                      }`}
                      email={business.contact_email || t("No email")}
                      onClick={() => openDeleteModal(business.business_uuid)}
                      onClickEdit={() => handleEditBusiness(business)}
                      details={() =>
                        navigate(
                          `/business-details/${business.business_uuid}`,
                          {
                            state: { data: business },
                          }
                        )
                      }
                      deleteButton={
                        business.can_edit || business.isAdmin_can_edit
                      }
                      edit={business.can_edit}
                      additionalInfo={
                        <div className="text-md font-medium mt-1 flex gap-3">
                          <span className="block">
                            {business.category || t("Uncategorized")}
                          </span>
                          <span className="block text-theme">
                            {business.business_type || t("Unknown")}
                          </span>
                        </div>
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500">
                    {t("Business2.No_business_found")}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        <Modal
          title={
            <>
              <div className="flex flex-col gap-1">
                <div className="text-lg font-semibold tracking-wide">
                  {t("Delete Business")}
                </div>
              </div>
              <hr className="mt-3" />
            </>
          }
          open={showDeleteModal}
          onCancel={closeDeleteModal}
          centered
          footer={false}
          closable={false}
        >
          <p className="text-gray-600 mb-4">
            {t("Are you sure you want to delete this business?")}
          </p>

          <div className="grid grid-cols-2 mt-4 gap-3">
            <button
              onClick={closeDeleteModal}
              className="py-2 font-bold text-base rounded drop-shadow-sm hover:bg-gray-400 text-white bg-gray-300 border-0"
            >
              {t("No")}
            </button>
            <button
              onClick={handleDeleteBusiness}
              className="py-2 font-bold text-base rounded drop-shadow-sm hover:bg-red-600 text-white bg-red-500 border-0"
            >
              <div className="flex justify-center text-white font-bold text-base rounded-lg">
                {t("Yes")}
              </div>
            </button>
          </div>
        </Modal>
      </>
    );
};

export default BusinessList;