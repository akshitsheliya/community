import { useState, useRef, useEffect } from "react";
import Header from "../../component/Common/Header";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Createnews, Updatenews, Getmembernews } from "../../Api/News";
import DropDown from "../../component/Common/DropDown";
import InputField from "../../component/Common/InputField";
import CircularArcLoader from "../../component/CustomCircularLoader";
import { Notify } from "../../component/Common/Notify";
import { MdCameraAlt, MdOutlineImage } from "react-icons/md";

const AddEditNews = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { newsId } = useParams();
  const location = useLocation();
  const newsItemFromState = location.state?.newsItem;
  const isEditMode = !!newsId;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    channel_id: 1,
    feed_title: "",
    feed_description: "",
    feed_type: "news",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    feed_title: "",
    feed_description: "",
    feed_type: "",
    feed_photo_video: ""
  });

  const feedTypeOptions = [
    { value: "news", label: t("news.types.news") },
    { value: "maran_nondh", label: t("news.types.maran_nondh") }
  ];

  useEffect(() => {
    const fetchNewsDetails = async () => {
      if (isEditMode) {
        try {
          if (newsItemFromState) {
            populateFormWithNewsData(newsItemFromState);
          } else if (newsId) {
            const response = await Getmembernews(newsId);
            if (response?.data || response) {
              const newsData = response?.data || response;
              populateFormWithNewsData(newsData);
            }
          }
        } catch (err) {
          console.error("Error fetching news details:", err);
          Notify("Failed to load news details. Please try again.", "error");
        }
      }
    };

    fetchNewsDetails();
  }, [isEditMode, newsId, newsItemFromState]);

  const populateFormWithNewsData = (newsData: any) => {
    setFormData({
      channel_id: newsData.channel_id || 1,
      feed_title: newsData.feed_title || "",
      feed_description: newsData.feed_description || "",
      feed_type: newsData.feed_type || "news",
    });

    const imageUrl = newsData.feed_photo_video || newsData.image_url || newsData.photo_url;
    if (imageUrl) {
      setPhotoPreview(imageUrl);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
    setValidationErrors({
      ...validationErrors,
      [name]: value.trim() ? "" : validationErrors[name as keyof typeof validationErrors]
    });

    setError("");
    setSuccess("");
  };

  const handleDropdownChange = (selectedOption: any) => {
    const value = selectedOption ? selectedOption.value : "";

    setFormData({
      ...formData,
      feed_type: value
    });
    setValidationErrors({
      ...validationErrors,
      feed_type: value ? "" : t("Please select a news type")
    });

    setError("");
    setSuccess("");
  };

  const handlePhotoChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match('image.*')) {
        setValidationErrors({
          ...validationErrors,
          feed_photo_video: t("Please select an image file")
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors({
          ...validationErrors,
          feed_photo_video: t("Image size should be less than 5MB")
        });
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setValidationErrors({
        ...validationErrors,
        feed_photo_video: ""
      });

      setError("");
    }
  };

  const validateForm = () => {
    const newErrors = {
      feed_title: formData.feed_title.trim() ? "" : t("Title is required"),
      feed_description: formData.feed_description.trim() ? "" : t("Description is required"),
      feed_type: formData.feed_type ? "" : t("Please select a news type"),
      feed_photo_video: (photoFile || (isEditMode && photoPreview)) ? "" : t("Please select an image")
    };
    setValidationErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
  };

  const handleCameraOpen = () => {
    // @ts-ignore
    window?.flutter_inappwebview?.callHandler("openCamera");
  };

  useEffect(() => {
    const handleImageData = async (event: any) => {
      const data: any = event.detail;

      if (data?.name && data?.bytes) {
        const file: any = convertBase64ToFile(data?.bytes, data?.name);

        if (file) {
          setPhotoFile(file);
          setPhotoPreview(URL.createObjectURL(file));
          setValidationErrors({
            ...validationErrors,
            feed_photo_video: ""
          });
        }
      }
    };

    window.addEventListener("getImage", handleImageData);

    return () => {
      window.removeEventListener("getImage", handleImageData);
    };
  }, [validationErrors]);

  const convertBase64ToFile = (base64String: any, fileName: any) => {
    const base64 = base64String.split(",").pop();
    const sanitizedBase64 = base64.replace(/[^A-Za-z0-9+/=]/g, "");
    const byteString = atob(sanitizedBase64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: "image/*" });
    const file = new File([blob], fileName, { type: "image/*" });
    return file;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) {
      Notify(t("Please fill all required fields"), "error");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const newsFormData = new FormData();

      Object.keys(formData).forEach(key => {
        newsFormData.append(key, String(formData[key as keyof typeof formData]));
      });
      if (photoFile) {
        newsFormData.append('feed_photo_video', photoFile as File);
      }

      let response;
      if (isEditMode && newsId) {
        response = await Updatenews(newsId, newsFormData);
        if (response?.success === true) {
          Notify(t("News updated successfully"), "success");
          setTimeout(() => {
            navigate("/news");
          }, 0);
        } else {
          Notify(response?.message || t("Failed to update news"), "error");
        }
      } else {
        response = await Createnews(newsFormData);
        if (response?.success === true) {
          Notify(t("News added successfully"), "success");
          setTimeout(() => {
            navigate("/news");
          }, 0);
        } else {
          Notify(response?.message || t("Failed to add news"), "error");
        }
      }
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'submitting'} news:`, error);
      if (error.response) {
        Notify(
          error.response.data?.message || `${t("Server error")}: ${error.response.status}`,
          "error"
        );
      } else {
        Notify(t("An error occurred. Please try again."), "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header showBackArrow={true} title={isEditMode ? t("news.editNews") : t("news.addNews")} />
      <div className="bg-white h-[calc(100vh-80px)] mt-3 flex justify-center max-w-full text-black items-start sm:mx-10 mx-4">
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
            <DropDown
              label={t("news.type")}
              placeholder={t("Select News Type")}
              options={feedTypeOptions}
              value={feedTypeOptions.find(option => option.value === formData.feed_type)}
              onChange={handleDropdownChange}
              isRequired={true}
            />
            {validationErrors.feed_type && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.feed_type}</p>
            )}
          </div>
          <div className="mb-4">
            <InputField
              label={t("news.newstitle")}
              name="feed_title"
              value={formData.feed_title}
              onChange={handleChange}
              isRequired={true}
              placeholder={t("news.AddNews_title")}
            />
            {validationErrors.feed_title && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.feed_title}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-theme font-bold mb-1">
              {t("news.description")}
            </label>
            <textarea
              name="feed_description"
              value={formData.feed_description}
              placeholder={t("news.descriptionnote")}
              onChange={handleChange}
              className="w-full max-h-40 min-h-24 p-5 border-[1.5px] border-black rounded-md text-sm shadow-md outline-none placeholder-[#788288] text-black md:text-base"
              required
            ></textarea>
            {validationErrors.feed_description && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.feed_description}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-theme font-bold mb-1">
              {t("news.photo")}
            </label>

            <div className="p-4 border-2 border-theme rounded-lg flex items-center justify-between">
              <div className="flex cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <p className="text-black font-semibold">
                  {isEditMode ? t("news.changeimage") : t("news.uploadimage")}
                </p>
              </div>
              <span className="flex items-center gap-1">
                <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                  <MdOutlineImage className="text-theme text-4xl" />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handlePhotoChange}
                />
                <div className="cursor-pointer" onClick={handleCameraOpen}>
                  <MdCameraAlt className="text-theme text-4xl" />
                </div>
              </span>
            </div>

            {photoPreview && (
              <div className="mt-2">
                <img
                  src={photoPreview}
                  alt="News Image Preview"
                  className="w-24 h-24 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                    if (!isEditMode) {
                      setValidationErrors({
                        ...validationErrors,
                        feed_photo_video: t("Please select an image")
                      });
                    }
                  }}
                  className="mt-2 text-white text-sm hover:bg-admin"
                >
                  {t("abroadMembers.remove")}
                </button>
              </div>
            )}
            {validationErrors.feed_photo_video && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.feed_photo_video}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-theme text-white py-3 rounded-lg font-semibold text-lg hover:bg-admin transition-all duration-200 disabled:bg-white"
            disabled={loading}
          >
            {loading ? (
              <div className="flex justify-center items-center w-full">
                <CircularArcLoader size={30} color="brown" />
              </div>
            ) : (
              isEditMode ? t("Update") : t("Submit")
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default AddEditNews;