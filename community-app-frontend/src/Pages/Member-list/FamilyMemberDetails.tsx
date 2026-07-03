import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../component/Common/Header";
import { useTranslation } from "react-i18next";
import CircularArcLoader from "../../component/CustomCircularLoader";
import Card from "../../component/Common/CardData";
import { Modal } from "antd";
import { Notify } from "../../component/Common/Notify";
import {
  DeleteFamilyMembers,
  GetFamilyMembers,
} from "../../Api/family-members";

const FamilyMemberDetails = () => {
  const { family_uuid } = useParams<{ family_uuid: string }>();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteModalData, setShowDeleteModalData] = useState<any>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const loggedInUserUUID = userData?.family_uuid;

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        if (family_uuid) {
          const response = await GetFamilyMembers(family_uuid);
          if (response.success && Array.isArray(response.data)) {
            setMembers(response.data);
          } else {
            setError("Invalid data format from API");
          }
        } else {
          setError("Family UUID is undefined");
        }
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyMembers();
  }, [family_uuid]);

  const openDeleteModal = (member: any, index: number) => {
    // Only show delete modal if index is not 1
    if (index !== 0) {
      setShowDeleteModalData(member);
      setShowDeleteModal(true);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setShowDeleteModalData(null);
  };

  const confirmDelete = async () => {
    if (!showDeleteModalData) return;
    try {
      await DeleteFamilyMembers(showDeleteModalData?.member_uuid);
      setMembers((prevDonors: any) =>
        prevDonors.filter(
          (member: any) =>
            member.member_uuid != showDeleteModalData?.member_uuid
        )
      );
      Notify("Member deleted successfully!", "success");
    } catch (error) {
      Notify("Error deleting member", "error");
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <>
      <Header
        title={t("title.Family_Members")}
        showBackArrow={true}
        backUrl={"/member-list"}
      />
      <div className="min-h-screen bg-gray-100 p-4 h-[calc(100vh-60px)] w-full">
        {loading ? (
          <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-75">
            <CircularArcLoader size={60} color="brown" />
          </div>
        ) : error ? (
          <p className="text-center text-red-500 text-lg font-semibold">
            {error}
          </p>
        ) : members?.length == 0 ? (
          <p className="text-center text-theme text-lg">No members found.</p>
        ) : (
          <div className="w-full">
            {members?.map((member: any, index: number) => (
              <>
                <div key={index}>
                  <Card
                    details={() => {
                      navigate("/details", {
                        state: { data: member, isDetails: true },
                      });
                    }}
                    image={member?.profile_photo}
                    userName={`${member?.surname} ${member?.first_name} ${member?.father_name} `}
                    phoneNumber={member?.phone_number}
                    address={member?.address}
                    email={member?.email_id}
                    onClick={() => openDeleteModal(member, index)}
                    deleteButton={
                      member.family_uuid == loggedInUserUUID && index !== 0
                    }
                    edit={member.family_uuid == loggedInUserUUID}
                    onClickEdit={() => {
                      navigate("/registration-details", {
                        state: { data: member, isFromProfile: true },
                      });
                    }}
                  />
                </div>
              </>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        title={
          <>
            <div className="flex flex-col gap-1">
              <div className="ml-3 mt-4 text-md font-semibold tracking-wide">
                {`${showDeleteModalData?.first_name} ${showDeleteModalData?.father_name} ${showDeleteModalData?.surname}`}
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
        <p className="text-gray-600 mb-4">Are you sure delete that member?</p>

        <div className="grid grid-cols-2 mt-4 gap-3">
          <button
            onClick={() => closeDeleteModal()}
            className="py-2 font-bold text-base rounded drop-shadow-sm hover:bg-gray-400 text-white bg-gray-300 border-0"
          >
            {"No"}
          </button>
          <button onClick={confirmDelete}>
            <div className="flex justify-center text-white font-bold text-base rounded-lg">
              {"Yes"}
            </div>
          </button>
        </div>
      </Modal>
    </>
  );
};

export default FamilyMemberDetails;
