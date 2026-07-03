import { useEffect, useRef, useState } from "react";
import { PostDonors, UpdateDonors } from "../../Api/Donor";
import Header from "../../component/Common/Header";
import { Notify } from "../../component/Common/Notify";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { MdCameraAlt, MdOutlineImage } from "react-icons/md";
import CircularArcLoader from "../../component/CustomCircularLoader";

const DonorForm = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const fileInputRef = useRef<any>(null);
  const [formData, setFormData] = useState({
    donor_name: "",
    donor_mobile_no: "",
    donation_category: "life time donor",
    donor_type: "",
    donation_year: "",
    donor_photo: null,
    donor_photo_preview: "",
  });
  const [updateId, setUpdateId] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (location?.state?.data) {
      setFormData({
        donor_name: location?.state?.data?.donor_name,
        donor_mobile_no: location?.state?.data?.donor_mobile_no,
        donation_category: location?.state?.data?.donation_category,
        donor_type: location?.state?.data?.donor_type || "Bhojan samarambh",
        donation_year: location?.state?.data?.donation_year,
        donor_photo: null,
        donor_photo_preview: location?.state?.data?.donor_photo,
      });
      setUpdateId(location?.state?.data?.donor_id);
    }
  }, [location?.state?.data]);

  const capitalizeFirstLetter = (text: any) => {
    if (!text) return text;
    return text
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "donor_mobile_no" && !/^\d{0,10}$/.test(value)) {
      return;
    }

    if (name === "donation_year" && !/^\d{0,4}$/.test(value)) {
      return;
    }

    if (name === "donation_category" && value === "life time donor") {
      setFormData({ ...formData, donation_category: value, donation_year: "" });
    } else if (name === "donor_name") {
      setFormData({ ...formData, [name]: capitalizeFirstLetter(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCameraOpen = () => {
    // @ts-ignore
    window?.flutter_inappwebview?.callHandler("openCamera");
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        donor_photo: file,
        donor_photo_preview: URL.createObjectURL(file),
      });
    }
  };

  const convertBase64ToFile = (base64String: any, fileName: any) => {
    const base64 = base64String.split(",").pop();

    const sanitizedBase64 = base64.replace(/[^A-Za-z0-9+/=]/g, "");

    const byteString = atob(sanitizedBase64);

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    // Convert binary data to array buffer
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // Create a Blob object from the array buffer
    const blob = new Blob([ab], { type: "image/*" });

    // Optionally convert Blob to File
    const file = new File([blob], fileName, { type: "image/*" });

    return file;
  };

  useEffect(() => {
    const handleImageData = async (event: any) => {
      const data: any = event.detail;

      if (data?.name && data?.bytes) {
        const file: any = convertBase64ToFile(data?.bytes, data?.name);

        if (file) {
          setFormData({
            ...formData,
            donor_photo: file,
            donor_photo_preview: URL.createObjectURL(file),
          });
        }
      }
    };

    window.addEventListener("getImage", handleImageData);

    return () => {
      window.removeEventListener("getImage", handleImageData);
    };
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log("Form data being submitted:", formData);
    if (
      !formData.donor_name ||
      !formData.donor_mobile_no ||
      !formData.donor_type ||
      !formData.donation_category ||
      (formData.donation_category == "one time donor" &&
        !formData.donation_year)
    ) {
      Notify("All fields are required", "error");
      return;
    }

    if (
      location?.state?.isEdit &&
      !formData.donor_photo_preview &&
      !formData.donation_year
    ) {
      Notify("Upload donor photo is required", "error");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("donor_name", formData.donor_name);
    formDataToSend.append("donor_mobile_no", formData.donor_mobile_no);
    formDataToSend.append("donor_type", formData.donor_type);
    formDataToSend.append("donation_category", formData.donation_category);
    if (formData.donation_category == "one time donor") {
      formDataToSend.append("donation_year", formData.donation_year);
    }
    if (formData.donor_photo) {
      formDataToSend.append("donor_photo", formData.donor_photo);
    }

    setLoading(true);
    try {
      let response;
      if (location?.state?.isEdit) {
        response = await UpdateDonors(updateId, formDataToSend);
      } else {
        response = await PostDonors(formDataToSend);
      }
      if (response?.success) {
        Notify(response?.message, "success");
        setFormData({
          donor_name: "",
          donor_mobile_no: "",
          donation_category: "life time donor",
          donor_type: "",
          donation_year: "",
          donor_photo: null,
          donor_photo_preview: "",
        });
        if (location?.state?.isEdit) {
          navigate("/donors");
        }
      } else {
        Notify(response.message || "Failed to submit form.", "error");
      }
    } catch (error) {
      Notify("Photo is required", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        title={
          location?.state?.isDetails
            ? "Details"
            : location?.state?.isEdit
            ? "Edit Donor"
            : t("donors.add_new")
        }
        backUrl={"/donors"}
        showBackArrow={true}
      />
      <div className="flex items-start justify-center h-[calc(100vh-60px)] bg-gray-100 p-4">
        <div className="w-full max-w-lg p-6 bg-white shadow-lg rounded-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-theme font-medium mb-1">
                {t("donors.name")} :
              </label>
              <input
                type="text"
                name="donor_name"
                value={formData.donor_name}
                onChange={handleChange}
                placeholder={t("donors.enter_name")}
                className="w-full p-3 border border-theme rounded-lg focus:outline-none focus:ring-2 focus:ring-theme capitalize"
                required
                disabled={location?.state?.isDetails}
              />
            </div>

            <div>
              <label className="block text-theme font-medium mb-1">
                {t("donors.mobile_no")} *:
              </label>
              <input
                type="text"
                name="donor_mobile_no"
                value={formData.donor_mobile_no}
                onChange={handleChange}
                placeholder={t("donors.enter_mobile")}
                className="w-full p-3 border border-theme rounded-lg focus:outline-none focus:ring-2 focus:ring-theme"
                required
                pattern="\d{10}"
                disabled={location?.state?.isDetails}
              />
            </div>
            <div>
              <label className="block text-theme font-medium mb-1">
                {t("donors.donor_type")} *:
              </label>
              <select
                name="donor_type"
                value={formData.donor_type}
                onChange={handleChange}
                className="w-full p-3 border border-theme rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-theme"
                required
                disabled={location?.state?.isDetails}
              >
                <option value="" disabled>
                  Select an option
                </option>
                <option value="Bhojan samarambh">
                  {t("donors.BhojanSamarambh")}
                </option>
                <option value="Inam vitran">{t("donors.InamVitran")}</option>
              </select>
            </div>

            <div>
              <label className="block text-theme font-medium mb-1">
                {t("donors.donation_category")} *:
              </label>
              <select
                name="donation_category"
                value={formData.donation_category}
                onChange={handleChange}
                className="w-full p-3 border border-theme rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-theme"
                required
                disabled={location?.state?.isDetails}
              >
                <option value="life time donor">
                  {t("donors.life_time_donor")}
                </option>
                <option value="one time donor">
                  {t("donors.one_time_donor")}
                </option>
              </select>
            </div>

            {formData.donation_category == "one time donor" && (
              <div>
                <label className="block text-theme font-medium mb-1">
                  {t("donors.donation_year")} *:
                </label>
                <input
                  type="text"
                  name="donation_year"
                  value={formData.donation_year}
                  onChange={handleChange}
                  placeholder={t("donors.enter_year")}
                  className="w-full p-3 border border-theme rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-theme"
                  required
                  pattern="\d{4}"
                  disabled={location?.state?.isDetails}
                />
              </div>
            )}
            <div>
              <label className="block text-theme font-bold mb-1">
                {t("donors.Profile_photo")}
              </label>

              {!location?.state?.isDetails && (
                <div className="p-4 border-2 border-theme rounded-lg flex items-center justify-between">
                  <div
                    className="flex cursor-pointer"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <p className="text-black font-semibold">
                      {t("donors.addyourprofile")}
                      <br />
                      {t("donors.uploadimage")}{" "}
                    </p>
                  </div>
                  <span className="flex items-center gap-1">
                    <div
                      onClick={() => fileInputRef.current.click()}
                      className="cursor-pointer"
                    >
                      <MdOutlineImage className="text-theme text-4xl" />
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageUpload}
                    />

                    <div className="" onClick={handleCameraOpen}>
                      <MdCameraAlt className="text-theme text-4xl" />
                    </div>
                  </span>
                </div>
              )}

              {formData.donor_photo_preview && (
                <div className="mt-2">
                  <img
                    src={formData.donor_photo_preview}
                    alt="Passport Preview"
                    className="w-24 h-24 object-cover rounded-md border"
                  />
                  {!location?.state?.isDetails && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          donor_photo: null,
                          donor_photo_preview: "",
                        });
                      }}
                      className="mt-2 text-white text-sm hover:bg-admin"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>

            {!location?.state?.isDetails && (
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
                  t("donors.submit")
                )}
              </button>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default DonorForm;
