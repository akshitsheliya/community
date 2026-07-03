import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CircularArcLoader from "../../component/CustomCircularLoader";
import Header from "../../component/Common/Header";
import Card from "../../component/Common/CardData";
import { Modal } from "antd";
import { getAbroadMembers, deleteAbroadMember } from "../../Api/abroadmember";
import { Notify } from "../../component/Common/Notify";

const AbroadMember = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [abroadMembers, setAbroadMembers] = useState<any>([]);
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentmemberUuid, setCurrentmemberUuid] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchAbroadMembers = async () => {
      try {
        setLoading(true);
        const response = await getAbroadMembers();

        if (Array.isArray(response)) {
          setAbroadMembers(response);
        } else if (response && typeof response === "object") {
          if (Array.isArray(response.data)) {
            setAbroadMembers(response.data);
          } else {
            console.warn("API response format is unexpected:", response);
            setAbroadMembers([]);
          }
        } else {
          setAbroadMembers([]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching abroad members:", error);
        Notify(t("abroadMembers.abroad_members"), "error");
        setAbroadMembers([]);
        setLoading(false);
      }
    };

    fetchAbroadMembers();

    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setIsAdmin(parsedData.is_community_admin === 1);
        setCurrentmemberUuid(parsedData.member_uuid || null);
      } catch (error) {
        Notify(t("abroadMembers.loading_admin"), "error");
      }
    }
  }, [t]);

  const openDeleteModal = (abroadUuid: string) => {
    setDeleteUuid(abroadUuid);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteUuid(null);
  };

  const confirmDelete = async () => {
    if (!deleteUuid) return;

    try {
      await deleteAbroadMember(deleteUuid);
      setAbroadMembers((prevMembers: any) =>
        prevMembers.filter((member: any) => member.abroad_uuid !== deleteUuid)
      );
      Notify(t("abroadMembers.Member_deleted_successfully"), "success");
    } catch (error) {
      Notify(t("abroadMembers.deleting_member"), "error");
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <>
      <Header
        title={t("abroadMembers.Abroad_Members")}
        showBackArrow={true}
        showPlusIcon={true}
        onPlusClick={() => navigate("/abroadmembersform")}
      />

      <div className="bg-gray-100 h-[calc(100vh-70px)] overflow-auto pb-8">
        <div className="p-4 pt-4">
          {loading ? (
            <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-75">
              <CircularArcLoader size={60} color="brown" />
            </div>
          ) : abroadMembers && abroadMembers.length > 0 ? (
            abroadMembers.map((member: any) => (
              <div key={member.abroad_uuid}>
                <Card
                  image={member.passport_photo}
                  userName={member.full_name}
                  additionalInfo={
                    <div className="text-xs flex flex-col gap-[2px]">
                      <p>
                        <span className="font-medium">
                          {t("abroadMembers.Designation")}:
                        </span>{" "}
                        {member.designation}
                      </p>
                      <p >
                        <span className="font-medium">
                          {t("abroadMembers.Experience")}:
                        </span>{" "}
                        {member.experience_year} {t("abroadMembers.years")}

                      </p>
                      <p>
                        <span className="font-medium">
                          {t("city1")}:
                        </span>{" "}
                        {member.city}
                      </p>
                      <p>
                        <span className="font-medium">
                          {t("country")}:
                        </span>{" "}
                        {member.country}
                      </p>

                    </div>
                  }
                  onClick={() => openDeleteModal(member.abroad_uuid)}
                  deleteButton={
                    isAdmin || currentmemberUuid === member.member_uuid
                  }
                  details={() => {
                    navigate("/professionaldetails", {
                      state: { data: member, isDetails: true },
                    });
                  }}
                  edit={currentmemberUuid === member.member_uuid}
                  onClickEdit={() => {
                    navigate(`/abroadmembersform/${member?.abroad_uuid}`, {
                      state: { data: member, isFromProfile: true },
                    });
                  }}
                />
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">
                {t("abroadMembers.No_abroad_members_found")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title={t("abroadMembers.Confirm_Delete")}
        open={showDeleteModal}
        onOk={confirmDelete}
        onCancel={closeDeleteModal}
        okText={t("abroadMembers.Delete")}
        cancelText={t("abroadMembers.Cancel")}
        okButtonProps={{ danger: true }}
      >
        <p>{t("abroadMembers.delete_member")}</p>
      </Modal>
    </>
  );
};

export default AbroadMember;
