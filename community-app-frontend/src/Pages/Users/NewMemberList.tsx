import { useEffect, useState } from "react";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import { FaEye, FaUser } from "react-icons/fa6";
import { BsPersonFillCheck, BsPersonFillX } from "react-icons/bs";
import Header from "../../component/Common/Header";
import { GetApproveUser, GetRejectUser, GetUnVerifyUser } from "../../Api/user";
import { Notify } from "../../component/Common/Notify";
import Card from "../../component/Common/CardData";
import { useNavigate } from "react-router-dom";

const NewMemberList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [member, setMember] = useState<any>(null);
  const [singleView, setSingleView] = useState<any>(null);
  const [approveView, setApproveView] = useState<any>(null);
  const [rejectView, setRejectView] = useState<any>(null);
  const [reason, setReason] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [showApproveModal, setShowApproveModal] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await GetUnVerifyUser();
        setMember(response.data);
      } catch (error) {
        console.error("Error fetching donors:", error);
      }
    })();
  }, []);

  // View Modal
  const viewModal = (data: any) => {
    setSingleView(data);
    setShowViewModal(true);
  };

  const closeDeleteModal = () => {
    setShowViewModal(false);
    setSingleView(null);
  };

  // Approve Modal
  const approveModal = (data: any) => {
    setApproveView(data);
    setShowApproveModal(true);
    setShowViewModal(false);
  };

  const closeApproveModal = () => {
    setShowApproveModal(false);
    setApproveView(null);
    
  };

  const submitApprove = async (id: any) => {
    const res = await GetApproveUser(id);
    try {
      if (res.success) {
        Notify(res.message, "success");
        setShowApproveModal(false);
        setApproveView(null);

        const filterDeleteData = member?.filter(
          (obj: any) => obj?.member_uuid != id
        );
        setMember(filterDeleteData);
      }
    } catch (error: any) {
      console.log(error);
      Notify("User approve error", "error");
      setShowApproveModal(false);
      setApproveView(null);
    }
  };

  // Reject modal
  const rejectModal = async (data: any) => {
    setRejectView(data);
    setShowRejectModal(true);
    setReason("");
    setShowViewModal(false);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectView(null);
    setReason(""); 
  };

  const submitReject = async (id: any) => {
    const data = {
      reject_reason: reason,
    };

    const res = await GetRejectUser(id, data);
    try {
      if (res.success) {
        Notify(res.message, "success");
        setShowRejectModal(false);
        setRejectView(null);

        const filterDeleteData = member?.filter(
          (obj: any) => obj?.member_uuid != id
        );
        setMember(filterDeleteData);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <>
      <Header title={t("NewMembers")} showBackArrow />
      <div className="w-full mx-auto p-4 bg-gray-100 shadow-lg rounded-lg flex flex-col gap-4">
        <div className="h-[calc(100vh-90px)] w-full">
          {member?.length > 0 &&
            member?.map((data: any, index: number) => (
              <Card
                key={index}
                image={data?.profile_photo}
                userName={`${data?.first_name} ${data?.father_name} ${data?.surname}`}
                phoneNumber={data?.phone_number}
                email={data?.email_id}
                additionalbuttons={
                  <div className="flex justify-end space-x-2">
                    <button
                      className="text-theme p-2 transition-colors duration-300 bg-transparent border-0"
                      onClick={() => viewModal(data)}
                      aria-label="view"
                    >
                      <FaEye size={16} />
                    </button>
                    <button
                      className="text-green-500 p-2 transition-colors duration-300 bg-transparent border-0"
                      onClick={() => approveModal(data)}
                      aria-label="approve"
                    >
                      <BsPersonFillCheck size={16} />
                    </button>
                    <button
                      className="text-red-500 p-2 transition-colors duration-300 bg-transparent border-0"
                      onClick={() => rejectModal(data)}
                      aria-label="reject"
                    >
                      <BsPersonFillX size={16} />
                    </button>
                  </div>
                }
                details={() => {
                  navigate("/details", {
                    state: { data: data, isDetails: true },
                  });
                }}
              />
            ))}

          {member?.length <= 0 && (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-gray-400 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <p className="text-center text-gray-500 font-medium">
                No List found.
              </p>
            </div>
          )}
        </div>

        <Modal
          
          title={
            <>
              <div className="flex flex-col gap-1">
                <div className="ml-3 mt-4 text-md font-semibold tracking-wide">
                  {singleView?.first_name +
                    " " +
                    singleView?.father_name +
                    " " +
                    singleView?.surname}
                </div>
              </div>
              <hr className="mt-3" />
            </>
          }
          open={showViewModal}
          onCancel={closeDeleteModal}
          centered
          footer={false}
          closable={false}
        >
          <div className="w-full">
            <div className="flex flex-col items-center justify-center">
              {singleView?.profile_photo ? (
                <img
                  className="max-h-32 max-w-32 object-cover border border-theme"
                  src={singleView.profile_photo}
                  alt="Profile"
                />
              ) : (
                  <div className="bg-orange-100  p-3 border border-theme">
                    <FaUser className="text-theme" size={40} />
                  </div>
              )}
            </div>

            <div className="grid grid-cols-3 items-center justify-center mt-3 gap-3">
              <p className="text-sm flex items-center whitespace-nowrap text-ellipsis overflow-hidden col-span-2">
                {"Mo. Number"} :{" "}
                <span className="font-semibold flex items-center ml-1 ">
                  {singleView?.phone_number}
                </span>
              </p>
              <p className="text-sm col-span-1 felx items-center whitespace-nowrap text-ellipsis overflow-hidden">
                {"Gender"} :{" "}
                <span className="font-semibold">{singleView?.gender}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 items-center justify-center mt-3 gap-3">
              <button
                className="text-green-500 flex justify-center gap-4 hover:text-green-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-300 items-center"
                onClick={() => approveModal(singleView)}
                aria-label="approve"
              >
                <BsPersonFillCheck size={16} />
                <span className="text-sm">Approve</span>
              </button>
              <button
                className="text-red-500 flex justify-center gap-4 hover:text-red-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-300"
                onClick={() => rejectModal(singleView)}
                aria-label="reject"
              >   <BsPersonFillX size={16} />
                <span className="text-sm">Reject</span>
             
              </button>
            </div>
          </div>
        </Modal>

        {/* Approve Modal */}
        <Modal
          title={
            <>
              <div className="flex flex-col gap-1">
                <div className="text-lg font-semibold tracking-wide">
                  {"Approve User"}
                </div>
              </div>
              <hr className="mt-3" />
            </>
          }
          open={showApproveModal}
          onCancel={closeApproveModal}
          centered
          footer={false}
          closable={false}
        >
          <p className="text-gray-600 mb-4">Are you sure approve that user?</p>

          <div className="grid grid-cols-2 mt-4 gap-3">
            <button
              onClick={() => closeApproveModal()}
              className="py-2 font-bold text-base rounded drop-shadow-sm hover:bg-gray-400 text-white bg-gray-300 border-0"
            >
              {"No"}
            </button>
            <button
              onClick={() => {
                submitApprove(approveView?.member_uuid);
              }}
            >
              <div className="flex justify-center text-white font-bold text-base rounded-lg">
                {"Yes"}
              </div>
            </button>
          </div>
        </Modal>

        {/* Reject Modal */}
        <Modal
          title={
            <>
              <div className="flex flex-col gap-1">
                <div className="text-lg font-semibold tracking-wide">
                  {"Reject User"}
                </div>
              </div>
              <hr className="mt-3" />
            </>
          }
          open={showRejectModal}
          onCancel={closeRejectModal}
          centered
          footer={false}
          closable={false}
        >
          <div className="bg-white rounded-xl">
            <label className="font-medium tracking-wide text-md">
              {"Reject Reason"}
            </label>
            <textarea
              id="simple-search"
              rows={2}
              className="flex items-center border border-[#D9D9D9] w-full justify-between rounded-lg p-3 my-3"
              placeholder={"Reject Reason"}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 mt-4 gap-3">
            <button
              onClick={() => closeRejectModal()}
              className="py-2 font-bold text-base rounded drop-shadow-sm hover:bg-gray-400 text-white bg-gray-300 border-0"
            >
              {"No"}
            </button>
            <button
              onClick={() => {
                submitReject(rejectView?.member_uuid);
              }}
            >
              <div className="flex justify-center text-white font-bold text-base rounded-lg">
                {"Yes"}
              </div>
            </button>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default NewMemberList;
