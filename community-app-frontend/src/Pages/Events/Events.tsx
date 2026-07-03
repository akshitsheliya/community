import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "../../component/Common/Header";
import api from "../../Api/api";

const Events = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/news?feed_type=event");
      if (response.data?.data || response.data) {
        const eventsData = response.data?.data || response.data;
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (err: any) {
      console.log(err);
      return dateString;
    }
  };

  const findEventIdentifier = (event: any) => {
    const possibleFields = [
      "uuid",
      "news_uuid",
      "feedUuid",
      "id",
      "_id",
      "feed_id",
      "newsId",
      "feed_uuid",
    ];

    for (const field of possibleFields) {
      if (event[field] && typeof event[field] === "string") {
        return { field, value: event[field] };
      }
    }

    for (const field of possibleFields) {
      if (event[field]) {
        return { field, value: String(event[field]) };
      }
    }

    return null;
  };

  const openDeleteConfirm = (event: any) => {
    setSelectedEvent(event);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setSelectedEvent(null);
  };

  const handleDelete = async () => {
    // Clear any previous error
    setDeleteError(null);

    if (!selectedEvent) return;

    // Find the best ID to use
    const eventId = selectedEvent.id || selectedEvent._id;
    const identifier = findEventIdentifier(selectedEvent);

    if (!identifier) {
      setDeleteError(t("messages.deleteError"));
      closeDeleteConfirm();
      return;
    }

    console.log(
      `Attempting to delete event with ${identifier.field}: ${identifier.value}`
    );

    try {
      setDeleteLoading(eventId);
      const response = await api.delete(`/news/${identifier.value}`);
      if (response.data?.success === false) {
        throw new Error(response.data?.message || "Failed to delete event");
      }

      setEvents((prevEvents) =>
        prevEvents.filter((e) => {
          const eventIdentifier = findEventIdentifier(e);
          return eventIdentifier?.value !== identifier.value;
        })
      );
      closeDeleteConfirm();
    } catch (err: any) {
      console.error("Error deleting event:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to delete event";
      setDeleteError(
        `Error: ${errorMessage} (Using ${identifier.field}: ${identifier.value})`
      );
    } finally {
      setDeleteLoading(null);
      closeDeleteConfirm();
    }
  };

  const DeleteConfirmPopup = () => {
    if (!showDeleteConfirm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-fadeIn">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {t("news.confirmDelete")}
          </h3>
          <p className="text-gray-600 mb-6">{t("messages.deleteConfirm")}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={closeDeleteConfirm}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={
                deleteLoading === (selectedEvent?.id || selectedEvent?._id)
              }
            >
              {t("buttons.cancel")}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 rounded text-white hover:bg-red-600 transition-colors"
              disabled={
                deleteLoading === (selectedEvent?.id || selectedEvent?._id)
              }
            >
              {deleteLoading === (selectedEvent?.id || selectedEvent?._id) ? (
                <span className="inline-block">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              ) : (
                t("buttons.delete")
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header
        title={t("title.Events")}
        showBackArrow={true}
        showPlusIcon={true}
        plusIconLink="/events/add-events"
      />

      <div className="min-h-screen">
        <div className="min-h-screen bg-gray-50 pt-14">
          <div className="p-6">
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
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2  border-theme"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4">
                {error}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <p>{t("messages.noEvents")}</p>
                <button
                  type="button"
                  onClick={() => (window.location.href = "/events/add-events")}
                  className="mt-4 bg-theme text-white px-4 py-2 rounded hover:bg-theme transition-colors"
                >
                  {t("buttons.addEvent")}
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-6 text-theme">
                  {t("labels.upcomingEvents")}
                </h2>
                {events.map((event) => {
                  // Find the best ID to display for debugging
                  const idInfo = findEventIdentifier(event);
                  const idDisplay = idInfo
                    ? `${idInfo.field}: ${idInfo.value}`
                    : "No ID found";

                  return (
                    <div
                      key={event.id || event._id}
                      className="bg-white rounded-lg shadow-md mb-6 overflow-hidden"
                    >
                      <div className="p-5">
                        <h3 className="text-xl font-bold text-theme mb-2">
                          {event.feed_title}
                        </h3>

                        {event.event_date_time && (
                          <div className="flex items-center text-gray-600 mb-3">
                            <span>
                              {formatEventDate(event.event_date_time)}
                            </span>
                          </div>
                        )}

                        {event.event_address && (
                          <div className="flex items-center text-gray-600 mb-3">
                            <span>{event.event_address}</span>
                          </div>
                        )}

                        <p className="text-gray-700 mb-4">
                          {event.feed_description}
                        </p>

                        <div className="mt-4 flex justify-between">
                          <div className="text-xs text-gray-500 italic">
                            {/* Display ID for debugging */}
                            {idDisplay}
                          </div>
                          <button
                            onClick={() => openDeleteConfirm(event)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                          >
                            {t("buttons.delete")}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <footer className="text-center text-sm text-gray-600 p-4 border-t border-gray-200">
            <p>{t("app.communityApp")}</p>
          </footer>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      <DeleteConfirmPopup />
    </>
  );
};

export default Events;
