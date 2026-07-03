import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaUser } from "react-icons/fa6";
import Header from "../../component/Common/Header";
import { Getmembers } from "../../Api/Donor";
import { Notify } from "../../component/Common/Notify";
import CircularArcLoader from "../../component/CustomCircularLoader";
import { Updatecomitteemember } from "../../Api/committee-members";
import { useNavigate } from "react-router-dom";

const CommitteeSearchMember = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [members, setMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const listRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const searchTimeoutRef = useRef<any | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const designationOptions = [
    { label: t("committee.president"), value: "pramukh" },
    { label: t("committee.vice_president"), value: "up pramukh" },
    { label: t("committee.secretary"), value: "mantri" },
    { label: t("committee.joint_secretary"), value: "sah mantri" },
    { label: t("committee.committee_member"), value: "committee member" },
  ];

  const getDesignationLabel = (value: string) => {
    const option = designationOptions.find((opt) => opt.value === value);
    return option ? option.label : value;
  };  

  useEffect(() => {
    fetchMembers(1, "");
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (initialLoading) return;

    searchTimeoutRef.current = setTimeout(() => {
      setMembers([]);
      setCurrentPage(1);
      setHasMore(true);
      fetchMembers(1, searchTerm);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const fetchMembers = async (page: number, search: string) => {
    setLoading(true);

    try {
      const res = await Getmembers(page, pageSize, search);

      if (res.success && res.data?.length > 0) {
        const formattedData = res.data.map((member: any) => ({
          name: `${member.first_name} ${member.father_name} ${member.surname}`,
          idProof: member.profile_photo || "",
          phone_number: member.phone_number,
          member_uuid: member.member_uuid,
          page: page,
          designation: member.designation || "",
        }));

        setMembers((prev) => {
          if (page === 1) {
            return formattedData;
          }

          const uniqueMembers = new Map(prev.map((m) => [m.member_uuid, m]));
          formattedData.forEach((m: any) =>
            uniqueMembers.set(m.member_uuid, m)
          );
          return Array.from(uniqueMembers.values());
        });

        setHasMore(res.data.length === pageSize);
      } else {
        setHasMore(false);
        if (page === 1) {
          setMembers([]);
        }
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      Notify("Failed to load members", "error");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          fetchMembers(nextPage, searchTerm);
        }
      },
      { threshold: 0.1 }
    );

    const currentLoadingRef = loadingRef.current;
    if (currentLoadingRef) {
      observer.observe(currentLoadingRef);
    }

    observerRef.current = observer;

    return () => {
      if (currentLoadingRef && observer) {
        observer.unobserve(currentLoadingRef);
      }
    };
  }, [loading, hasMore, currentPage, searchTerm]);

  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  const handleMemberClick = (member: any) => {
    setSelectedMember(member);
    setSelectedDesignation(member.designation || "");
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
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
      const response = await Updatecomitteemember(
        selectedMember.member_uuid,
        data
      );

      if (response && response.success) {
        navigate("/committee-members");
        Notify("Committee member updated successfully", "success");

        setMembers((prevMembers) =>
          prevMembers.map((member) =>
            member.member_uuid === selectedMember.member_uuid
              ? { ...member, designation: selectedDesignation }
              : member
          )
        );

        handleClosePopup();
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

      // Improved error handling with detailed logging
      const errorResponse = error.response?.data;
      console.error("Error response data:", errorResponse);

      const errorMessage =
        errorResponse?.message || "Failed to update committee member";
      Notify(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <>
        <Header
          title={t("committee.members_list")}
          showBackArrow={true}
          showSearchIcon={true}
          onSearch={handleSearch}
        />
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <CircularArcLoader size={60} color="brown" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={t("committee.members_list")}
        showBackArrow={true}
        showSearchIcon={true}
        onSearch={handleSearch}
        backUrl={"/committee-members"}
      />

      <div className="bg-gray-100 w-full">
        <div ref={listRef} className="p-4 overflow-y-auto h-[90vh]">
          {members.length > 0 ? (
            members.map((member) => (
              <div
                key={member.member_uuid}
                className="bg-white rounded-lg shadow-md p-4 mb-4 flex items-center cursor-pointer"
                onClick={() => handleMemberClick(member)}
              >
                <div className="flex flex-col items-center justify-center w-1/10">
                  {member?.idProof ? (
                    <img
                      src={member?.idProof}
                      alt="profile"
                      className="rounded-full h-12 w-12 object-cover"
                      onError={(e: any) => (e.target.src = "/marksheet.jpg")}
                    />
                  ) : (
                    <div className="bg-orange-100 rounded-full p-3 border border-theme">
                      <FaUser className="text-theme" size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-grow ml-4">
                  <h2 className="text-lg font-bold text-theme">
                    {member?.name}
                  </h2>
                  <p className="text-sm text-theme">{member?.phone_number}</p>
                  {member.designation && (
                    <p className="text-sm font-medium text-gray-600 mt-1">
                      {getDesignationLabel(member.designation)}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">
                {loading
                  ? t("loading...")
                  : searchTerm
                  ? t("No SearchResults")
                  : t("common.noMembers")}
              </p>
            </div>
          )}

          {(hasMore || loading) && (
            <div
              ref={loadingRef}
              className="flex justify-center items-center py-4"
            >
              {loading && <CircularArcLoader size={30} color="brown" />}
            </div>
          )}

          {showPopup && selectedMember && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg transform transition-all scale-95 animate-fadeIn">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                  {t("committee.assign_designation")}
                </h2>

                <p className="text-lg font-medium text-gray-700 text-center mb-4">
                  {selectedMember.name}
                </p>
                <label className="block text-gray-600 text-sm font-medium mb-2">
                  {t("committee.designation")}
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-theme focus:outline-none bg-gray-100"
                  value={selectedDesignation}
                  onChange={handleDesignationChange}
                >
                  <option value="">Select Designation</option>
                  {designationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-theme transition"
                    onClick={handleClosePopup}
                  >
                    {t("committee.cancel")}
                  </button>
                  <button
                    className="px-4 py-2 bg-theme text-white rounded-lg hover:bg-theme-dark transition flex items-center justify-center"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <CircularArcLoader size={20} color="white" />
                    ) : (
                      t("committee.submit")
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CommitteeSearchMember;
