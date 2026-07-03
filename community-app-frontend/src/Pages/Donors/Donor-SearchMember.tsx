import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef, useCallback } from "react";
import Header from "../../component/Common/Header";
import { Getmembers, PostDonormembers } from "../../Api/Donor";
import { Notify } from "../../component/Common/Notify";
import Card from "../../component/Common/CardData";
import CircularArcLoader from "../../component/CustomCircularLoader";

const DonorSearchMember = () => {
  const { t } = useTranslation();
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [donorType, setDonorType] = useState("One time Donor");
  const [donationType, setDonationType] = useState(""); // New dropdown
  const [year, setYear] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const cachedDataRef = useRef<Map<number, any[]>>(new Map());
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMembers = useCallback(
    async (page: number, query = searchQuery) => {
      if (cachedDataRef.current.has(page) && query === searchQuery) {
        const cachedMembers = cachedDataRef.current.get(page);
        if (page === 1) {
          setFilteredMembers(cachedMembers || []);
        } else {
          setFilteredMembers((prev) => [...prev, ...(cachedMembers || [])]);
        }
        return;
      }

      try {
        setIsLoading(true);
        const res = await Getmembers(page, pageSize, query);

        if (res.success && res.data.length > 0) {
          const formattedData = res.data.map((member: any) => ({
            name: `${member.first_name} ${member.father_name} ${member.surname}`,
            idProof: member.id_proof,
            phone_number: member.phone_number,
            member_uuid: member.member_uuid,
            profile_photo: member.profile_photo,
            donor_photo: member.donor_photo,
          }));

          cachedDataRef.current.set(page, formattedData);
          if (page === 1) {
            setFilteredMembers(formattedData);
          } else {
            setFilteredMembers((prev) => [...prev, ...formattedData]);
          }
          setHasMore(formattedData.length === pageSize);
        } else {
          if (page === 1) {
            setFilteredMembers([]);
          }
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
        Notify("Failed to load members", "error");
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize, searchQuery]
  );

  useEffect(() => {
    setFilteredMembers([]);
    setCurrentPage(1);
    setHasMore(true);
    cachedDataRef.current.clear();
    fetchMembers(1);
  }, [searchQuery, fetchMembers]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading]);

  useEffect(() => {
    if (currentPage > 1 && hasMore) {
      fetchMembers(currentPage);
    }
  }, [currentPage, hasMore, fetchMembers]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleMemberClick = (member: any) => {
    setSelectedMember(member);
    setIsModalOpen(true);
    setYear("");
    setDonorType("One time Donor");
    setDonationType(""); // Reset
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  const handleSave = async () => {
    if (!selectedMember) {
      Notify("No member selected!", "error");
      return;
    }

    if (!donationType) {
      Notify("Please select donor type!", "warning");
      return;
    }


    if (donorType === "One time Donor" && !year) {
      Notify("Please enter the year!", "warning");
      return;
    }

    // Standardize the donor_type format to match what's expected in the Card component
    const donorData = {
      donation_category: donorType.toLowerCase(),
      donor_type: donationType,
      ...(donorType === "One time Donor" && { donation_year: year }),
    };

    try {
      await PostDonormembers(selectedMember?.member_uuid, donorData);
      Notify("Donation saved successfully!", "success");
      closeModal();
    } catch (error) {
      Notify("This member is already donor", "error");
    }
  };

  return (
    <>
      <Header
        title={t("donors.members_list")}
        showBackArrow={true}
        showSearchIcon={true}
        onSearch={handleSearch}
      />

      <div className="flex flex-col h-[calc(100vh-75px)]">
        <div className="flex-1 overflow-y-auto p-4">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member, index) => (
              <div key={index} onClick={() => handleMemberClick(member)}>
                <Card
                  image={
                    member?.donor_photo ||
                    member?.profile_photo ||
                    member?.id_proof ||
                    null
                  }
                  userName={member.name}
                  phoneNumber={member.phone_number}
                  details={() => { }}
                />
              </div>
            ))
          ) : !isLoading ? (
            <p className="text-center text-gray-500">No data available</p>
          ) : null}
          {hasMore && (
            <div ref={loadingRef} className="flex justify-center py-4">
              {isLoading && <CircularArcLoader size={30} />}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4 text-center text-admin">
              {selectedMember.name}
            </h2>

            {/* Donor Type Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-admin">
                {t("donors.donor_type")}
              </label>
              <select
                value={donationType}
                onChange={(e) => setDonationType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg mt-1 text-black"
              >
                <option value="">Select Donor Type</option>
                <option value="Bhojan samarambh">{t("donors.BhojanSamarambh")}</option>
                <option value="Inam vitran">{t("donors.InamVitran")}</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-admin">
                {t("donors.select_type")}
              </label>
              <select
                value={donorType}
                onChange={(e) => setDonorType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg mt-1 text-black"
              >
                <option value="One time Donor">
                  {t("donors.one_time_donor")}
                </option>
                <option value="Life time Donor">
                  {t("donors.life_time_donor")}
                </option>
              </select>
            </div>

            {donorType === "One time Donor" && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-admin">
                  {t("donors.enteryear")}:
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder={t("donors.enteryear")}
                  className="w-full p-2 border border-admin text-black rounded-lg mt-1"
                />
              </div>
            )}

            <div className="flex justify-between mt-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                onClick={closeModal}
              >
                {t("donors.close")}
              </button>
              <button
                className="bg-admin text-white px-4 py-2 rounded-lg"
                onClick={handleSave}
              >
                {t("donors.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DonorSearchMember;