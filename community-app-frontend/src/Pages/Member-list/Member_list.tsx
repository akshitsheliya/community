import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Header from "../../component/Common/Header";
import { GetFamily } from "../../Api/memberLlist";
import CircularArcLoader from "../../component/CustomCircularLoader";
import Card from "../../component/Common/CardData";

const Member_list = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [familyData, setFamilyData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalFamilies, setTotalFamilies] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const observer = useRef<any | null>(null);
  const lastElementRef = useRef<any | null>(null);

  const fetchFamilies = async (pageNum = 1, search = "") => {
    try {
      setLoading(pageNum === 1);
      setLoadingMore(pageNum > 1);
      const searchParam = search || "";
      const res = await GetFamily(pageNum, searchParam);

      if (Array.isArray(res.data)) {
        const lastItem = res.data[res.data.length - 1];
        let dataArray = [...res.data];
        let total = totalFamilies;

        if (lastItem && "total" in lastItem) {
          total = lastItem.total;
          setTotalFamilies(total);

          if ("totalMembers" in lastItem) {
            setTotalMembers(parseInt(lastItem.totalMembers, 10) || 0);
          }

          dataArray = res.data.slice(0, -1);
        }

        if (pageNum === 1) {
          setFamilyData(dataArray);
        } else {
          setFamilyData((prevData) => [...prevData, ...dataArray]);
        }

        setHasMore(familyData.length + dataArray.length < total);
        setPage(pageNum);
      } else {
        console.error("Unexpected API response format:", res);
        setError("Invalid data format from API");
      }
    } catch (error) {
      console.error(`Error fetching families (page ${pageNum}):`, error);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchFamilies(1, "");
  }, []);

  const lastElementCallback = useCallback(
    (node: any) => {
      if (loading || loadingMore) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreData();
        }
      });

      if (node) {
        lastElementRef.current = node;
        observer.current.observe(node);
      }
    },
    [loading, loadingMore, hasMore]
  );

  const loadMoreData = async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    fetchFamilies(nextPage, searchTerm);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
    fetchFamilies(1, term);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(1);
    fetchFamilies(1, "");
  };

  const visibleMembers = familyData.reduce(
    (total, item) => total + (item.number_of_family_members || 0),
    0
  );

  return (
    <>
      <Header
        title={t("title.Member_list")}
        showBackArrow
        showSearchIcon={true}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        backUrl={"/dashboard"}
      />

      <div className="flex flex-col items-center overflow-auto h-[calc(100vh-70px)] w-full">
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <CircularArcLoader size={60} color="brown" />
          </div>
        ) : error ? (
          <p className="text-center text-lg text-red-500">{error}</p>
        ) : (
          <>
            <div className="text-theme mt-4 text-center w-full">
              <div className="text-lg font-bold">
                {t("MemberList.totalFamilymember")}{" "}
                {totalFamilies || familyData.length}
              </div>
              <div className="text-md">
                {t("MemberList.totalMembers")} {totalMembers || visibleMembers}
              </div>
            </div>

            {familyData.length > 0 ? (
              <div className="p-4 gap-4 w-full">
                {familyData.map((item: any, index: number) => (
                  <div
                    key={item.family_uuid || index}
                    ref={
                      index === familyData.length - 1
                        ? lastElementCallback
                        : null
                    }
                    onClick={() => navigate(`/member-list/${item.family_uuid}`)}
                    className="cursor-pointer"
                  >
                    <Card
                      image={item?.profile_photo}
                      userName={item?.main_member_name}
                      deleteButton={false}
                      additionalInfo={
                        <>
                          <div className="text-theme">
                            <span className="font-bold">
                              {t("MemberList.FamilyNo")}:
                            </span>{" "}
                            {item?.family_number}
                          </div>
                          <div className="text-theme">
                            <span className="font-bold">
                              {t("MemberList.Relation")}:
                            </span>{" "}
                            {item?.number_of_family_members}
                          </div>
                        </>
                      }
                    />
                  </div>
                ))}

                {loadingMore && (
                  <div className="flex justify-center items-center p-4">
                    <CircularArcLoader size={40} color="brown" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[200px]">
                <p className="text-center text-lg text-gray-600">
                  {searchTerm
                    ? t(
                        "MemberList.noMatchingFamilies",
                        "No matching families found."
                      )
                    : t("MemberList.noFamilyData", "No family data available.")}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Member_list;
