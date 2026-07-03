import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../../component/Common/Header";
import { useTranslation } from "react-i18next";
import DropDown from "../../component/Common/DropDown";
import InputField from "../../component/Common/InputField";
import CircularArcLoader from "../../component/CustomCircularLoader";
import { MdCameraAlt, MdOutlineImage } from "react-icons/md";
import {
  businessTypeOptions,
  stateOptions,
} from "../../utils/Constant/constants";
import {
  createBusiness,
  getBusinessById,
  updateBusiness,
  getBusinessCategories,
} from "../../Api/Business";
import { Notify } from "../../component/Common/Notify";
import { BusinessFormData, ValidationErrors } from "../../helper/Types/types";

// Capitalized InputField component for capitalizing first letter of each word
const CapitalizedInputField = (props: any) => {
  const { name, value, onChange, ...otherProps } = props;

  const handleChange = (e: any) => {
    const originalValue = e.target.value;
    // Skip capitalization for email and contact number fields
    if (name === "contact_email" || name === "contact_number") {
      onChange(e);
      return;
    }

    // Capitalize first letter of each word
    const words = originalValue.split(" ");
    const capitalizedValue = words
      .map((word: string) =>
        word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : ""
      )
      .join(" ");

    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: capitalizedValue,
        name: e.target.name,
      },
    };

    onChange(newEvent);
  };

  return (
    <InputField
      name={name}
      value={value}
      onChange={handleChange}
      {...otherProps}
    />
  );
};

// SentenceCapitalizedTextArea for capitalizing first letter of each sentence
const SentenceCapitalizedTextArea = (props: any) => {
  const { name, value, onChange, ...otherProps } = props;

  const handleChange = (e: any) => {
    const originalValue = e.target.value;

    // Split text into sentences - handle period, exclamation mark, question mark followed by space or end of text
    const sentences = originalValue.split(/([.!?]+\s*)/g);

    let result = "";
    for (let i = 0; i < sentences.length; i++) {
      if (sentences[i].trim().length > 0) {
        if (i % 2 === 0) {
          // This is a sentence content
          // Capitalize the first letter of the sentence
          result +=
            sentences[i].charAt(0).toUpperCase() + sentences[i].slice(1);
        } else {
          // This is a punctuation with possible spaces
          result += sentences[i];
        }
      } else {
        result += sentences[i]; // Keep empty parts as they are
      }
    }

    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: result,
        name: e.target.name,
      },
    };

    onChange(newEvent);
  };

  return (
    <textarea
      name={name}
      value={value}
      onChange={handleChange}
      {...otherProps}
    />
  );
};

const AddBusiness = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { business_uuid } = useParams<{ business_uuid: string }>();
  const isEditMode = !!business_uuid;
  const businessDataFromLocation = location.state?.businessData;
  const [loading, setLoading] = useState<boolean>(false);
  const photoFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<BusinessFormData>({
    business_name: "",
    city: "",
    state: "",
    address: "",
    contact_number: "",
    contact_email: "",
    business_type: "",
    category: "",
    business_logo: null,
    business_photo: null,
    services_products: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [initialLoading, setInitialLoading] = useState<boolean>(
    isEditMode && !businessDataFromLocation
  );
  const [categoryOptions, setCategoryOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const currentLanguage = i18n.language || "en";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await getBusinessCategories();
        if (response && response.data) {
          const categories =
            currentLanguage === "gu"
              ? response.data.gujarati
              : response.data.english;

          const options = categories.map((category: string) => ({
            value: category,
            label: category.charAt(0).toUpperCase() + category.slice(1),
          }));

          setCategoryOptions(options);
        }
      } catch (error) {
        console.error("Error fetching business categories:", error);
        Notify(t("errors.failedToFetchCategories"), "error");
        setCategoryOptions([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [currentLanguage, t]);

  useEffect(() => {
    if (isEditMode) {
      if (businessDataFromLocation) {
        populateFormWithBusinessData(businessDataFromLocation);
      } else if (business_uuid) {
        fetchBusinessData(business_uuid);
      }
    }
  }, [business_uuid, isEditMode, businessDataFromLocation]);

  const fetchBusinessData = async (uuid: string) => {
    try {
      setInitialLoading(true);
      const response = await getBusinessById(uuid);

      if (response && response.data) {
        populateFormWithBusinessData(response.data);
      }
    } catch (err) {
      console.error("Error fetching business data:", err);
      Notify(t("errors.failedToFetchData"), "error");
    } finally {
      setInitialLoading(false);
    }
  };

  const populateFormWithBusinessData = (businessData: any) => {
    console.log("Populating form with business data:", businessData);
    setFormData({
      business_name: businessData.business_name || "",
      city: businessData.city || "",
      state: businessData.state || "",
      address: businessData.address || "",
      contact_number: businessData.contact_number || "",
      contact_email: businessData.contact_email || "",
      business_type: businessData.business_type || "",
      category: businessData.category || "",
      business_logo: null,
      business_photo: null,
      services_products: businessData.services_products || "",
    });
    if (businessData.business_photo) {
      setPhotoPreview(businessData.business_photo);
    }

    if (businessData.business_logo) {
      setLogoPreview(businessData.business_logo);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstError = Object.keys(validationErrors)[0];
      const errorElement = document.getElementsByName(firstError)[0];
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setLoading(true);
    try {
      const businessFormData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (
          key !== "business_logo" &&
          key !== "business_photo" &&
          value !== null
        ) {
          businessFormData.append(key, value);
        }
      });
      if (photoFile) {
        businessFormData.append("business_photo", photoFile);
      }

      if (logoFile) {
        businessFormData.append("business_logo", logoFile);
      }

      if (isEditMode && business_uuid) {
        console.log("Updating business with UUID:", business_uuid);
        const response = await updateBusiness(business_uuid, businessFormData);
        Notify(t("Business2.updateSuccess"), "success");
        console.log("Update response:", response);

        navigate("/business");
      } else {
        console.log("Creating new business");
        const response = await createBusiness(businessFormData);
        Notify(t("Business2.addSuccess"), "success");
        console.log("Create response:", response);

        navigate("/business");

        setFormData({
          business_name: "",
          city: "",
          state: "",
          address: "",
          contact_number: "",
          contact_email: "",
          business_type: "",
          category: "",
          business_logo: null,
          business_photo: null,
          services_products: "",
        });
        setPhotoFile(null);
        setLogoFile(null);
        setPhotoPreview(null);
        setLogoPreview(null);
      }
    } catch (err: any) {
      console.error("Error submitting business form:", err);
      Notify(
        err.response?.data?.message || t("errors.somethingWentWrong"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownChange = (
    name: string,
    selectedOption: { value: string; label: string } | null
  ) => {
    setFormData({
      ...formData,
      [name]: selectedOption?.value || "",
    });
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }
  };

  const handleFileChange = (e: any, type: "photo" | "logo") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setValidationErrors({
        ...validationErrors,
        [type === "photo" ? "business_photo" : "business_logo"]: t(
          "errors.invalidImageFormat"
        ),
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setValidationErrors({
        ...validationErrors,
        [type === "photo" ? "business_photo" : "business_logo"]: t(
          "errors.fileTooLarge"
        ),
      });
      return;
    }
    if (type === "photo") {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setFormData({
        ...formData,
        business_photo: file,
      });
      if (validationErrors.business_photo) {
        setValidationErrors({
          ...validationErrors,
          business_photo: "",
        });
      }
    } else {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setFormData({
        ...formData,
        business_logo: file,
      });
      if (validationErrors.business_logo) {
        setValidationErrors({
          ...validationErrors,
          business_logo: "",
        });
      }
    }
  };

  const removeFile = (type: "photo" | "logo") => {
    if (type === "photo") {
      setPhotoFile(null);
      setPhotoPreview(null);
      setFormData({
        ...formData,
        business_photo: null,
      });
    } else {
      setLogoFile(null);
      setLogoPreview(null);
      setFormData({
        ...formData,
        business_logo: null,
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.business_name.trim()) {
      errors.business_name = "Business Name is required";
    }

    if (!formData.city.trim()) {
      errors.city = "City is required";
    }

    if (!formData.state) {
      errors.state = "State is required";
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }

    if (!formData.contact_number.trim()) {
      errors.contact_number = "Contact Number is required";
    } else if (!/^\d{10}$/.test(formData.contact_number.trim())) {
      errors.contact_number = "Enter a valid 10-digit phone number";
    }

    if (!formData.contact_email.trim()) {
      errors.contact_email = "Contact Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
      errors.contact_email = "Enter a valid email address";
    }

    if (!formData.business_type) {
      errors.business_type = "Business Type is required";
    }

    if (!formData.category) {
      errors.category = "Category is required";
    }

    if (!photoFile && !photoPreview && !isEditMode) {
      errors.business_photo = "Business Photo is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  if (initialLoading) {
    return (
      <>
        <Header
          showBackArrow={true}
          title={
            isEditMode
              ? t("Business2.editBusiness")
              : t("Business2.addBusiness")
          }
        />
        <div className="flex justify-center items-center h-screen">
          <CircularArcLoader size={50} color="brown" />
        </div>
      </>
    );
  }

  const selectedStateOption = formData.state
    ? stateOptions.find((option) => option.value === formData.state)
    : null;
  const selectedBusinessTypeOption = formData.business_type
    ? businessTypeOptions.find(
        (option) => option.value === formData.business_type
      )
    : null;
  const selectedCategoryOption = formData.category
    ? categoryOptions.find((option) => option.value === formData.category)
    : null;

  return (
    <>
      <Header
        showBackArrow={true}
        title={
          isEditMode ? t("Business2.editBusiness") : t("Business2.addBusiness")
        }
      />
      <div className="bg-white h-[calc(100vh-80px)] mt-3 flex justify-center max-w-full text-black items-start sm:mx-10 mx-4">
        {loading ? (
          <div className="flex justify-center items-center h-full w-full">
            <CircularArcLoader size={50} color="brown" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-gray-200 p-6 rounded-lg shadow-md w-full overflow-y-auto"
          >
            <div className="mb-4">
              <CapitalizedInputField
                label={t("Business2.name")}
                name="business_name"
                value={formData.business_name}
                onChange={handleInputChange}
                isRequired={true}
                placeholder={t("Business2.enterName")}
                type="text"
              />
              {validationErrors.business_name && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.business_name}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-theme font-bold mb-1">
                {t("Business2.photo")}
              </label>

              <div className="p-4 border-2 border-theme rounded-lg flex items-center justify-between">
                <div
                  className="flex cursor-pointer"
                  onClick={() => photoFileRef.current?.click()}
                >
                  <p className="text-black font-semibold">
                    {isEditMode
                      ? t("Business2.changePhoto")
                      : t("Business2.uploadPhoto")}
                  </p>
                </div>
                <span className="flex items-center gap-1">
                  <div
                    onClick={() => photoFileRef.current?.click()}
                    className="cursor-pointer"
                  >
                    <MdOutlineImage className="text-theme text-4xl" />
                  </div>
                  <input
                    ref={photoFileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e, "photo")}
                  />
                  <div
                    className="cursor-pointer"
                    onClick={() => photoFileRef.current?.click()}
                  >
                    <MdCameraAlt className="text-theme text-4xl" />
                  </div>
                </span>
              </div>

              {photoPreview && (
                <div className="mt-2">
                  <img
                    src={photoPreview}
                    alt="Business Photo Preview"
                    className="w-24 h-24 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile("photo")}
                    className="mt-2 text-white text-sm"
                  >
                    {t("Business2.remove")}
                  </button>
                </div>
              )}
              {validationErrors.business_photo && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.business_photo}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-theme font-bold mb-1">
                {t("Business2.logo")}
              </label>

              <div className="p-4 border-2 border-theme rounded-lg flex items-center justify-between">
                <div
                  className="flex cursor-pointer"
                  onClick={() => logoFileRef.current?.click()}
                >
                  <p className="text-black font-semibold">
                    {isEditMode
                      ? t("Business2.changeLogo")
                      : t("Business2.uploadLogo")}
                  </p>
                </div>
                <span className="flex items-center gap-1">
                  <div
                    onClick={() => logoFileRef.current?.click()}
                    className="cursor-pointer"
                  >
                    <MdOutlineImage className="text-theme text-4xl" />
                  </div>
                  <input
                    ref={logoFileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e, "logo")}
                  />
                  <div
                    className="cursor-pointer"
                    onClick={() => logoFileRef.current?.click()}
                  >
                    <MdCameraAlt className="text-theme text-4xl" />
                  </div>
                </span>
              </div>

              {logoPreview && (
                <div className="mt-2">
                  <img
                    src={logoPreview}
                    alt="Business Logo Preview"
                    className="w-24 h-24 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile("logo")}
                    className="mt-2 text-white text-sm"
                  >
                    {t("Business2.remove")}
                  </button>
                </div>
              )}
              {validationErrors.business_logo && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.business_logo}
                </p>
              )}
            </div>
            <div className="mb-4">
              <CapitalizedInputField
                label={t("Business2.city")}
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                isRequired={true}
                placeholder={t("Business2.enterCity")}
              />
              {validationErrors.city && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.city}
                </p>
              )}
            </div>
            <div className="mb-4">
              <DropDown
                label={t("Business2.state")}
                placeholder={t("Select State")}
                options={stateOptions}
                value={selectedStateOption}
                onChange={(selectedOption) =>
                  handleDropdownChange("state", selectedOption)
                }
                isRequired={true}
              />
              {validationErrors.state && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.state}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-theme font-bold mb-1">
                {t("Business2.address")}
              </label>
              <SentenceCapitalizedTextArea
                name="address"
                value={formData.address}
                placeholder={t("Business2.enterAddress")}
                onChange={handleInputChange}
                className="w-full max-h-40 min-h-24 p-5 border-[1.5px] border-black rounded-md text-sm shadow-md outline-none placeholder-[#788288] text-black md:text-base"
                required
              />
              {validationErrors.address && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.address}
                </p>
              )}
            </div>
            <div className="mb-4">
              <CapitalizedInputField
                label={t("Business2.contact")}
                name="contact_number"
                value={formData.contact_number}
                onChange={(e: any) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData({
                    ...formData,
                    contact_number: value,
                  });
                  if (validationErrors.contact_number) {
                    setValidationErrors({
                      ...validationErrors,
                      contact_number: "",
                    });
                  }
                }}
                isRequired={true}
                placeholder={t("Business2.enterContact")}
                type="tel"
                maxLength={10}
                pattern="[0-9]{10}"
              />
              {validationErrors.contact_number && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.contact_number}
                </p>
              )}
            </div>
            <div className="mb-4">
              <CapitalizedInputField
                label={t("Business2.email")}
                name="contact_email"
                value={formData.contact_email}
                onChange={handleInputChange}
                isRequired={true}
                placeholder={t("Business2.enterEmail")}
                type="email"
              />
              {validationErrors.contact_email && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.contact_email}
                </p>
              )}
            </div>
            <div className="mb-4">
              <DropDown
                label={t("Business2.type")}
                placeholder={t("Select Business Type")}
                options={businessTypeOptions}
                value={selectedBusinessTypeOption}
                onChange={(selectedOption) =>
                  handleDropdownChange("business_type", selectedOption)
                }
                isRequired={true}
              />
              {validationErrors.business_type && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.business_type}
                </p>
              )}
            </div>
            <div className="mb-6">
              <DropDown
                label={t("Business2.category")}
                placeholder={t("Select Business Category")}
                options={categoryOptions}
                value={selectedCategoryOption}
                onChange={(selectedOption) =>
                  handleDropdownChange("category", selectedOption)
                }
                isRequired={true}
                isLoading={categoriesLoading}
              />
              {validationErrors.category && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.category}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-theme font-bold mb-1">
                {t("Business2.services_products")}
              </label>
              <SentenceCapitalizedTextArea
                name="services_products"
                value={formData.services_products}
                onChange={handleInputChange}
                className="w-full max-h-40 min-h-24 p-5 border-[1.5px] border-black rounded-md text-sm shadow-md outline-none placeholder-[#788288] text-black md:text-base"
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-theme text-white py-3 rounded-lg font-semibold text-lg hover:bg-admin transition-all duration-200 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? (
                <div className="flex justify-center items-center w-full">
                  <CircularArcLoader size={30} color="brown" />
                </div>
              ) : isEditMode ? (
                t("Update")
              ) : (
                t("Submit")
              )}
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default AddBusiness;
