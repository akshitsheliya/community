import { useTranslation } from "react-i18next";
import Header from "../../component/Common/Header";
import {
  Deletecomitteemember,
  Getcomitteemember,
  EditCommitteeMember,
} from "../../Api/committee-members";
import { useEffect, useState } from "react";
import CircularArcLoader from "../../component/CustomCircularLoader";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Notify } from "../../component/Common/Notify";
import { Modal } from "antd";
import Card from "../../component/Common/CardData";

const FamilyCommittee = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  interface CommitteeMember {
    member_uuid: string;
    first_name: string;
    father_name: string;
    surname: string;
    phone_number: string;
    profile_photo?: string;
    designation?: string;
  }

  const [familyCommitteeData, setFamilyCommitteeData] = useState<
    CommitteeMember[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // States for edit functionality
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CommitteeMember | null>(
    null
  );
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const designationOptions = [
    { label: t("committee.president"), value: "pramukh" },
    { label: t("committee.vice_president"), value: "up pramukh" },
    { label: t("committee.secretary"), value: "mantri" },
    { label: t("committee.joint_secretary"), value: "sah mantri" },
    { label: t("committee.committee_member"), value: "committee member" },
  ];
  const getDesignationLabel = (value: any) => {
    const option = designationOptions.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await Getcomitteemember();

        if (res?.data?.length > 0) {
          setFamilyCommitteeData(res.data);
        }
      } catch (error) {
        console.error("Error fetching committee members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setIsAdmin(parsedData.is_community_admin === 1);
      } catch (error) {
        toast.error("Error loading admin data");
      }
    }
  }, []);

  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteModalData, setShowDeleteModalData] =
    useState<CommitteeMember | null>(null);

  const openDeleteModal = (member: any) => {
    setDeleteId(member?.member_uuid);
    setShowDeleteModalData(member);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
    setShowDeleteModalData(null);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await Deletecomitteemember(deleteId);
      setFamilyCommitteeData((prevMembers) =>
        prevMembers.filter((member) => member.member_uuid !== deleteId)
      );
      Notify("Member deleted successfully!", "success");
    } catch (error) {
      Notify("Error deleting member", "error");
    } finally {
      closeDeleteModal();
    }
  };

  const openEditModal = (member: any) => {
    setSelectedMember(member);
    setSelectedDesignation(member?.designation || "");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedMember(null);
    setSelectedDesignation("");
  };

  const handleDesignationChange = (e: any) => {
    setSelectedDesignation(e.target.value);
  };

  const handleSubmit = async () => {
    if (!selectedMember || !selectedDesignation) {
      Notify("Please select a designation", "error");
      return;
    }

    setSubmitting(true);

    try {
      const data = { designation: selectedDesignation };
      const response = await EditCommitteeMember(
        selectedMember.member_uuid,
        data
      );

      if (response && response.success) {
        Notify("Committee member updated successfully", "success");

        setFamilyCommitteeData((prevMembers) =>
          prevMembers.map((member) =>
            member.member_uuid === selectedMember.member_uuid
              ? { ...member, designation: selectedDesignation }
              : member
          )
        );

        closeEditModal();
      } else {
        const errorMessage =
          response?.message || "Failed to update committee member";
        if (errorMessage.includes("already a committee member")) {
          Notify("This member is already assigned this designation", "error");
        } else {
          Notify(errorMessage, "error");
        }
      }
    } catch (error: any) {
      console.error("Error updating committee member:", error);
      const errorResponse = error.response?.data;
      console.error("Error response data:", errorResponse);
      const errorMessage =
        errorResponse?.message || "Failed to update committee member";
      Notify(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header
        title={t("title.Committee")}
        showBackArrow={true}
        showPlusIcon={isAdmin}
        onPlusClick={() => setIsPopupOpen(true)}
        backUrl={"/dashboard"}
      />
      <div className="bg-gray-100 h-[calc(100vh-80px)]">
        <div className="p-4 pt-4">
          {loading ? (
            <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-75">
              <CircularArcLoader size={60} color="brown" />
            </div>
          ) : familyCommitteeData.length > 0 ? (
            familyCommitteeData.map((rep, index) => (
              <div key={index}>
                <Card
                  image={rep?.profile_photo}
                  userName={`${rep?.surname} ${rep?.first_name} ${rep?.father_name}`}
                  phoneNumber={rep?.phone_number}
                  onClick={() => openDeleteModal(rep)}
                  deleteButton={isAdmin}
                  edit={isAdmin}
                  onClickEdit={() => openEditModal(rep)}
                  additionalInfo={
                    rep.designation && (
                      <p className="text-sm font-medium text-gray-600">
                        {getDesignationLabel(rep.designation)}
                      </p>
                    )
                  }
                  details={() => {
                    navigate("/details", {
                      state: { data: rep, isDetails: true },
                    });
                  }}
                />
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No data available</p>
          )}
        </div>
      </div>

      {isPopupOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setIsPopupOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-80 border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4 text-admin border-b border-gray-200 pb-2">
              {t("donors.Select_Option")}
            </h2>
            <button
              className="w-full bg-admin hover:bg-admin text-white py-3 mb-3 rounded font-medium transition-colors duration-300"
              onClick={() => navigate("/committee-search-member")}
            >
              {t("donors.Search_Member")}
            </button>
            <button
              className="w-full text-white py-2 border hover:bg-admin border-gray-200 pt-2 transition-colors duration-300"
              onClick={() => setIsPopupOpen(false)}
            >
              {t("donors.Close")}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <>
            <div className="flex flex-col gap-1">
              <div className="ml-3 mt-4 text-md font-semibold tracking-wide">
                {showDeleteModalData &&
                  `${showDeleteModalData.surname} ${showDeleteModalData.first_name} ${showDeleteModalData.father_name}`}
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
          Are you sure delete that committee member?
        </p>

        <div className="grid grid-cols-2 mt-4 gap-3">
          <button
            onClick={() => closeDeleteModal()}
            className="py-2 font-bold text-base rounded drop-shadow-sm hover:bg-gray-400 text-white bg-gray-300 border-0"
          >
            {"No"}
          </button>
          <button
            onClick={confirmDelete}
            className="py-2 font-bold text-base rounded drop-shadow-sm hover:bg-theme-dark text-white bg-theme border-0"
          >
            <div className="flex justify-center text-white font-bold text-base rounded-lg">
              {"Yes"}
            </div>
          </button>
        </div>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        title={
          <>
            <div className="flex flex-col gap-1">
              <div className="ml-3 mt-4 text-md font-semibold tracking-wide">
                {selectedMember &&
                  `${selectedMember.first_name} ${selectedMember.father_name} ${selectedMember.surname}`}
              </div>
            </div>
            <hr className="mt-3" />
          </>
        }
        open={showEditModal}
        onCancel={closeEditModal}
        centered
        footer={false}
        closable={false}
      >
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            {t("committee.designation")}
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={selectedDesignation}
            onChange={handleDesignationChange}
          >
            <option value="">{t("committee.SelectDesignation")}</option>
            {designationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 mt-4 gap-3">
          <button
            onClick={closeEditModal}
            className="py-2 font-bold text-base rounded drop-shadow-sm hover:bg-gray-400 text-white bg-gray-300 border-0"
          >
            {t("committee.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="py-2 font-bold text-base rounded drop-shadow-sm hover:bg-theme-dark text-white bg-theme border-0 flex justify-center items-center"
          >
            {submitting ? (
              <CircularArcLoader size={20} color="white" />
            ) : (
              t("committee.update")
            )}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default FamilyCommittee;
