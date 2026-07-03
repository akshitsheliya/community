import { useState } from "react";
import api from "../../Api/api";
import Header from "../../component/Common/Header";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const AddEvents = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    channel_id: 1,
    feed_title: "",
    feed_description: "",
    feed_type: "event",
    event_address: "",
    event_date_time: "",
    event_latitude: "",
    event_longitude: "",
    feed_photo_video: "news_image.jpg",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    const newValue = value;

    if (name === "event_latitude" || name === "event_longitude") {
      if (!/^\d{0,2}$/.test(newValue)) {
        return;
      }
    }

    setFormData({
      ...formData,
      [name]: newValue,
    });

    setError("");
    setSuccess("");
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const submissionData = {
      channel_id: Number(formData.channel_id),
      feed_title: formData.feed_title.trim(),
      feed_description: formData.feed_description.trim(),
      feed_type: formData.feed_type,
      event_address: formData.event_address.trim() || null,
      event_date_time: formData.event_date_time
        ? new Date(formData.event_date_time).toISOString()
        : null,
      event_latitude: formData.event_latitude || null,
      event_longitude: formData.event_longitude || null,
      feed_photo_video: formData.feed_photo_video,
    };

    try {
      // Get the token
      const token =
        localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
        "";

      const response = await api.post("/news", submissionData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 201 || response.data?.success) {
        setSuccess(t("eventAddedSuccess"));
        // Reset form
        setFormData({
          channel_id: 1,
          feed_title: "",
          feed_description: "",
          feed_type: "event",
          event_address: "",
          event_date_time: "",
          event_latitude: "",
          event_longitude: "",
          // feed_photo_video: null,
          feed_photo_video: "",
        });
        navigate("/Events");
      } else {
        setError(response.data?.message || t("eventAddFailed"));
      }
    } catch (error) {
      console.error("Error details:", error);

      // Detailed error handling
      if ((error as any).response) {
        console.error("Response data:", (error as any).response.data);
        console.error("Response status:", (error as any).response.status);
        setError(
          (error as any).response.data?.message ||
            `${t("serverError")}: ${(error as any).response.status}`
        );
      } else if ((error as any).request) {
        console.error("Request was made but no response received");
        setError(t("noResponse"));
      } else {
        console.error("Error message:", (error as any).message);
        setError(`Error: ${(error as any).message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header showBackArrow={true} title={t("addEvent")} />
      <div className="bg-white min-h-screen text-black flex justify-center items-center sm:mx-10 mx-4 sm:mt-10 mt-5 ">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-200 p-6 rounded-lg shadow-md w-full"
        >
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-200">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-theme font-bold mb-1">
              {t("Title")}
            </label>
            <input
              type="text"
              name="feed_title"
              value={formData.feed_title}
              onChange={handleChange}
              className="w-full p-2.5 border-[1.5px] border-black rounded-md text-sm shadow-md outline-none placeholder-[#788288] text-black md:text-base"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-theme font-bold mb-1">
              {t("Description")}
            </label>
            <textarea
              name="feed_description"
              value={formData.feed_description}
              onChange={handleChange}
              className="w-full max-h-24 min-h-24 p-5 border-[1.5px] border-black rounded-md text-sm shadow-md outline-none placeholder-[#788288] text-black md:text-base"
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-theme font-bold mb-1">
              {t("eventAddress")}
            </label>
            <input
              type="text"
              name="event_address"
              value={formData.event_address}
              onChange={handleChange}
              className="w-full p-2.5 border-[1.5px] border-black rounded-md text-sm shadow-md outline-none placeholder-[#788288] text-black md:text-base"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-theme font-bold mb-1">
              {t("eventDateTime")}
            </label>
            <input
              type="datetime-local"
              name="event_date_time"
              value={formData.event_date_time}
              onChange={handleChange}
              className="w-full p-2.5 border-[1.5px] border-black rounded-md text-sm shadow-md outline-none placeholder-[#788288] text-black md:text-base"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-theme font-bold mb-1">
                {t("latitude")}
              </label>
              <input
                type="text"
                name="event_latitude"
                value={formData.event_latitude}
                onChange={handleChange}
                className="w-full p-2.5 border-[1.5px] border-black rounded-md text-sm shadow-md outline-none placeholder-[#788288] text-black md:text-base"
                required
              />
            </div>
            <div>
              <label className="block text-theme font-bold mb-1">
                {t("longitude")}
              </label>
              <input
                type="text"
                name="event_longitude"
                value={formData.event_longitude}
                onChange={handleChange}
                className="w-full p-2.5 border-[1.5px] border-black rounded-md text-sm shadow-md outline-none placeholder-[#788288] text-black md:text-base"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-theme font-bold mb-1">
              {t("photoVideoUrl")}
            </label>
            <input
              type="text"
              name="feed_photo_video"
              value={formData.feed_photo_video}
              onChange={handleChange}
              className="w-full p-2.5 border-[1.5px] border-black rounded-md text-sm shadow-md outline-none placeholder-[#788288] text-black md:text-base"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-theme px-4 py-2 rounded font-bold text-white disabled:bg-orange-300"
            disabled={loading}
          >
            {loading ? t("submitting") : t("Submit")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEvents;
