import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Header from "../../component/Common/Header";
import NewsCard from "../../component/Common/NewsCard";
import { useNavigate } from "react-router-dom";
import { Getnews, deletenews } from "../../Api/News";
import Modal from "antd/lib/modal";
import CircularArcLoader from "../../component/CustomCircularLoader";
import { Notify } from "../../component/Common/Notify";

const News = () => {
  const { t } = useTranslation();
  const [displayedNews, setDisplayedNews] = useState<any[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showDeleteModalData, setShowDeleteModalData] = useState<any>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalItems, setTotalItems] = useState<number>(0);
  const PAGE_SIZE = 25;
  const isLoadingRef = useRef(false);
  const observer = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setIsAdmin(parsedData.is_community_admin === 1);
      } catch (error: any) {
        console.error("Error loading admin data", error);
      }
    }
    fetchNews(1);
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  const lastNewsRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore || !hasMore) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoadingRef.current) {
        loadMoreNews();
      }
    }, { threshold: 0.1, rootMargin: "100px" });

    if (node) {
      observer.current.observe(node);
    }
  }, [loading, loadingMore, hasMore]);

  const fetchNews = async (pageNum: number) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      isLoadingRef.current = true;
      const response = await Getnews(pageNum, PAGE_SIZE);

      if (response?.data || response) {
        const newsData = response?.data || response;
        const newsArray = Array.isArray(newsData) ? newsData : [];
        if (response.total) {
          setTotalItems(response.total);
        }

        if (pageNum === 1) {
          setDisplayedNews(newsArray);
        } else {
          setDisplayedNews(prev => [...prev, ...newsArray]);
        }

        if (newsArray.length < PAGE_SIZE || (response.total && displayedNews.length + newsArray.length >= response.total)) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Failed to load news. Please try again later.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  };

  const loadMoreNews = () => {
    if (!hasMore || loadingMore || isLoadingRef.current) return;

    const nextPage = page + 1;
    setPage(nextPage);
    fetchNews(nextPage);
  };

  const findNewsIdentifier = (newsItem: any) => {
    const possibleFields = [
      "uuid",
      "news_uuid",
      "newsUuid",
      "feedUuid",
      "id",
      "_id",
      "feed_id",
      "newsId",
      "feed_uuid",
    ];
    for (const field of possibleFields) {
      if (newsItem[field] && typeof newsItem[field] === "string") {
        return { field, value: newsItem[field] };
      }
    }
    for (const field of possibleFields) {
      if (newsItem[field]) {
        return { field, value: String(newsItem[field]) };
      }
    }

    return null;
  };

  const openDeleteModal = (newsItem: any) => {
    setShowDeleteModalData(newsItem);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setShowDeleteModalData(null);
  };

  const confirmDelete = async () => {
    if (!showDeleteModalData) return;

    setDeleteLoading(true);
    setDeleteError(null);
    const identifier = findNewsIdentifier(showDeleteModalData);

    if (!identifier) {
      setDeleteError(
        "Cannot delete news: No suitable identifier found. Please refresh and try again."
      );
      closeDeleteModal();
      setDeleteLoading(false);
      return;
    }

    try {
      const response = await deletenews(identifier.value);
      if (response?.success === false) {
        throw new Error(response?.message || "Failed to delete news");
      }
      setDisplayedNews(prev =>
        prev.filter(n => {
          const newsIdentifier = findNewsIdentifier(n);
          return newsIdentifier?.value !== identifier.value;
        })
      );

      if (totalItems > 0) {
        setTotalItems(totalItems - 1);
      }

      Notify("News deleted successfully", "success");
      closeDeleteModal();
    } catch (err: any) {
      console.error("Error deleting news:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete news";
      const fullMessage = `Error: ${errorMessage} (Using ${identifier.field}: ${identifier.value})`;
      setDeleteError(fullMessage);
      Notify(fullMessage, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    const options: any = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (err) {
      return dateString;
    }
  };

  const handleViewNewsDetails = (newsItem: any) => {
    console.log("View details for:", newsItem);
  };

  const handleEditNews = (newsItem: any) => {
    const identifier = findNewsIdentifier(newsItem);
    if (identifier) {
      navigate(`/news/edit-news/${identifier.value}`, { state: { newsItem } });
    } else {
      Notify("Cannot edit news: No identifier found", "error");
    }
  };

  return (
    <>
      <Header
        title={t("news.title")}
        showBackArrow={true}
        showPlusIcon={isAdmin}
        onPlusClick={() => navigate("/news/add-news")}
      />

      <div className="h-[calc-(100vh-60px)]">
        <div className="sm:p-6 p-3">
          {deleteError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4">
              {deleteError}
              <button
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                onClick={() => setDeleteError(null)}
              >
                <span className="text-red-500">×</span>
              </button>
            </div>
          )}

          {loading ? (
            <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-75">
              <CircularArcLoader size={60} color="brown" />
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4">
              {error}
            </div>
          ) : (
            <>
              {displayedNews.length === 0 ? (
                <div className="text-center text-gray-500 text-lg mt-10">
                  {t("news.noNews") || "No news found"}
                </div>
              ) : (
                <div className="flex flex-col space-y-4">
                  {displayedNews.map((newsItem, index) => {
                    const isLastItem = index === displayedNews.length - 1;
                    return (
                      <div
                        key={newsItem.id || newsItem._id || newsItem.uuid || newsItem.feed_id || index}
                        ref={isLastItem && hasMore ? lastNewsRef : null}
                      >
                        <NewsCard
                          image={newsItem.feed_photo_video || newsItem.image_url || newsItem.photo_url}
                          title={newsItem.feed_title}
                          description={newsItem.feed_description}
                          date={newsItem.created_at && formatDate(newsItem.created_at)}
                          newsType={newsItem.feed_type || "news"}
                          onDeleteClick={() => openDeleteModal(newsItem)}
                          onEditClick={() => handleEditNews(newsItem)}
                          onCardClick={() => handleViewNewsDetails(newsItem)}
                          showDelete={isAdmin}
                          showEdit={isAdmin}
                        />
                      </div>
                    );
                  })}
                  {loadingMore && (
                    <div className="flex justify-center items-center py-4">
                      <CircularArcLoader size={40} color="brown" />
                    </div>
                  )}
                  {!hasMore && displayedNews.length > 0 && (
                    <div className="text-center text-gray-500 py-4">
                      {t("news.noMoreNews") || "No more news to load"}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Modal
        title={
          <>
            <div className="flex flex-col gap-1">
              <div className="ml-3 mt-4 text-md font-semibold tracking-wide">
                {showDeleteModalData && showDeleteModalData.feed_title}
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
          {t("news.deletewarning")}
        </p>

        <div className="grid grid-cols-2 mt-4 gap-3">
          <button
            onClick={() => closeDeleteModal()}
            className="py-2 font-bold text-base rounded drop-shadow-sm hover:bg-gray-400 text-white bg-gray-300 border-0"
          >
            {t("no")}
          </button>
          <button
            onClick={confirmDelete}
            className="py-2 font-bold text-base rounded drop-shadow-sm hover:bg-theme-dark text-white bg-theme border-0"
            disabled={deleteLoading}
          >
            <div className="flex justify-center text-white font-bold text-base rounded-lg">
              {deleteLoading ? (
                <>
                  <CircularArcLoader size={20} color="white" />
                </>
              ) : (
                t("yes")
              )}
            </div>
          </button>
        </div>
      </Modal>
    </>
  );
};

export default News;