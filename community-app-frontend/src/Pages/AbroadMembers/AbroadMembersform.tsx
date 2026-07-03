import React, { useState, useEffect, useRef } from "react";
import Header from "../../component/Common/Header";
import { useNavigate, useParams } from "react-router-dom";
import {
  createAbroadMember,
  getAbroadMemberByUuid,
  updateAbroadMember,
} from "../../Api/abroadmember";
import { Notify } from "../../component/Common/Notify";
import CircularArcLoader from "../../component/CustomCircularLoader";
import InputField from "../../component/Common/InputField";
import ValidationError from "./AbroadmembersValidation";
import { validateForm } from "./validateForm";
import { MdCameraAlt, MdOutlineImage } from "react-icons/md";
import { useTranslation } from "react-i18next";

// Modified InputField component with capitalization
const CapitalizedInputField = (props:any) => {
  const { name, value, onChange, ...otherProps } = props;

  const handleChange = (e:any) => {
    const originalValue = e.target.value;
    // Capitalize first letter of each word directly in the input event
    const words = originalValue.split(' ');
    const capitalizedValue = words.map((word: string) =>
      word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : ''
    ).join(' ');

    // Create a new synthetic event with capitalized value
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: capitalizedValue,
        name: e.target.name
      }
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

// Modified TextArea component with sentence capitalization
const SentenceCapitalizedTextArea = (props:any) => {
  const { name, value, onChange, ...otherProps } = props;

  const handleChange = (e: any) => {
    const originalValue = e.target.value;

    // Capitalize first letter of each sentence
    // Split by period followed by space to identify sentences
    const sentences = originalValue.split(/\.\s+/);
    const capitalizedValue = sentences.map((sentence: any, index: any) => {
      // Capitalize the first letter of each sentence
      if (sentence.length > 0) {
        const capitalizedSentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
        // Add period back except for the last sentence
        return index < sentences.length - 1 ? capitalizedSentence + ". " : capitalizedSentence;
      }
      return sentence;
    }).join('');

    // Create a new synthetic event with capitalized value
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: capitalizedValue,
        name: e.target.name
      }
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

// Number-only input field component
const NumberOnlyInputField = (props: any) => {
  const { name, value, onChange, ...otherProps } = props;

  const handleChange = (e: any) => {
    const inputValue = e.target.value;
    // Only allow digits and plus sign (for international numbers)
    if (/^[0-9+]*$/.test(inputValue)) {
      onChange(e);
    }
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

const AbroadMembersForm: React.FC = () => {
  const navigate = useNavigate();
  const { abroad_uuid } = useParams<{ abroad_uuid: any }>();
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(abroad_uuid);
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    full_name: "", // Full Name
    passport_photo: null as File | null, // Passport Photo
    photoPreview: "",
    govt_private: "private", // Work Sector (Government/Private)
    designation: "", // Designation/Position
    career: "", // Career
    experience_year: "", // Years of Experience
    success_mantra: "", // Success Mantra
    contact_number: "", // Mobile Number
    country: "", // Country
    city: "", // City
    thoughts_on_committee: "", // Thoughts on Committee Work
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const fileInputRef = useRef<any>(null);

  useEffect(() => {
    if (abroad_uuid) {
      loadExistingData();
    }
  }, [abroad_uuid]);

  useEffect(() => {
    if (formSubmitted) {
      setErrors(validateForm(formData, isEditing, t));
    }
  }, [formData, formSubmitted, isEditing]);

  const loadExistingData = async () => {
    try {
      setLoading(true);
      const response = await getAbroadMemberByUuid(abroad_uuid);
      const memberData = response;

      setFormData({
        ...formData,
        full_name: memberData.full_name || "",
        passport_photo: null,
        photoPreview: memberData.passport_photo || "",
        govt_private: memberData.govt_private || "private",
        designation: memberData.designation || "",
        career: memberData.career || "",
        experience_year: memberData.experience_year?.toString() || "",
        success_mantra: memberData.success_mantra || "",
        contact_number: memberData.contact_number || "",
        country: memberData.country || "",
        city: memberData.city || "",
        thoughts_on_committee: memberData.thoughts_on_committee || "",
      });

      setLoading(false);
    } catch (error) {
      console.error("Error loading member data:", error);
      Notify("Error loading member data", "error");
      setLoading(false);
      navigate("/abroadmembers");
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        passport_photo: file,
        photoPreview: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setFormSubmitted(true);

    const validationErrors = validateForm(formData, isEditing, t);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);
      const submissionData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (
          key !== "photoPreview" &&
          value !== null &&
          key !== "passport_photo"
        ) {
          submissionData.append(key, value as string);
        }
      });

      if (formData.passport_photo) {
        submissionData.append("passport_photo", formData.passport_photo);
      }

      if (isEditing && abroad_uuid) {
        await updateAbroadMember(abroad_uuid, submissionData);
        Notify(t("abroadMembers.memberUpdatedSuccess"), "success");
      } else {
        await createAbroadMember(submissionData);
        Notify(t("abroadMembers.memberAddedSuccess"), "success");
      }

      navigate("/abroadmembers");
    } catch (error) {
      console.error("Form submission error:", error);
      Notify(t("abroadMembers.formSubmissionError"), "error");
      setLoading(false);
    }
  };

  const handleCameraOpen = () => {
    // @ts-ignore
    window?.flutter_inappwebview?.callHandler("openCamera");
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
        const file = convertBase64ToFile(data?.bytes, data?.name);

        if (file) {
          setFormData({
            ...formData,
            passport_photo: file,
          });
        }
      }
    };

    window.addEventListener("getImage", handleImageData);

    return () => {
      window.removeEventListener("getImage", handleImageData);
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-75">
        <CircularArcLoader size={60} color="brown" />
      </div>
    );
  }

  return (
    <>
      <Header
        title={
          isEditing ? t("abroadMembers.editTitle") : t("abroadMembers.addTitle")
        }
        showBackArrow={true}
      />

      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <CapitalizedInputField
            name="full_name"
            label={t("abroadMembers.fullName")}
            EgClassName={t("abroadMembers.enterfirstName")}
            value={formData.full_name}
            onChange={handleInputChange}
            errorMsg={errors.full_name}
            type="text"
          />

          {/* Passport Photo */}
          <div>
            <label className="block text-theme font-bold mb-1">
              {t("abroadMembers.passportPhoto")}
            </label>
            <div className="p-4 border-2 border-theme rounded-lg flex items-center justify-between">
              <div
                className="flex cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                <p className="text-black font-semibold">
                  {t("abroadMembers.uploadPhoto")}
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
                  onChange={handleFileChange}
                />

                <div className="" onClick={handleCameraOpen}>
                  <MdCameraAlt className="text-theme text-4xl" />
                </div>
              </span>
            </div>

            {errors.passport_photo && (
              <ValidationError message={errors.passport_photo} />
            )}

            {formData.photoPreview && (
              <div className="mt-2">
                <img
                  src={formData.photoPreview}
                  alt="Passport Preview"
                  className="w-24 h-24 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      passport_photo: null,
                      photoPreview: "",
                    });
                  }}
                  className="mt-2 text-white text-sm"
                >
                  {t("abroadMembers.remove")}
                </button>
              </div>
            )}
          </div>

          {/* Govt/Private - Work Sector */}
          <div>
            <label className="block text-theme font-bold mb-1">
              {t("abroadMembers.workSector")}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="govt_private"
                  value="govt"
                  checked={formData.govt_private === "govt"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                {t("abroadMembers.government")}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="govt_private"
                  value="private"
                  checked={formData.govt_private === "private"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                {t("abroadMembers.private")}
              </label>
            </div>
            {errors.govt_private && (
              <ValidationError message={errors.govt_private} />
            )}
          </div>

          {/* Designation/Position */}
          <CapitalizedInputField
            name="designation"
            label={t("abroadMembers.designation")}
            value={formData.designation}
            onChange={handleInputChange}
            errorMsg={errors.designation}
            EgClassName={t("abroadMembers.designationeg")}
            type="text"
          />

          {/* Career */}
          <CapitalizedInputField
            name="career"
            label={t("abroadMembers.career")}
            EgClassName={t("abroadMembers.careereg")}
            value={formData.career}
            onChange={handleInputChange}
            errorMsg={errors.career}
            type="text"
          />

          {/* Years of Experience */}
          <InputField
            name="experience_year"
            label={t("abroadMembers.experience")}
            value={formData.experience_year}
            onChange={handleInputChange}
            type="number"
            errorMsg={errors.experience_year}
          />

          {/* Contact Number - Now with number-only restriction */}
          <NumberOnlyInputField
            name="contact_number"
            label={t("abroadMembers.contactNumber")}
            EgClassName={t("abroadMembers.internationalCode")}
            value={formData.contact_number}
            onChange={handleInputChange}
            type="tel"
            errorMsg={errors.contact_number}
          />

          {/* Country */}
          <CapitalizedInputField
            name="country"
            label={t("abroadMembers.country")}
            value={formData.country}
            onChange={handleInputChange}
            errorMsg={errors.country}
            EgClassName={t("abroadMembers.countryeg")}
            type="text"
          />

          {/* City */}
          <CapitalizedInputField
            name="city"
            label={t("abroadMembers.city")}
            value={formData.city}
            onChange={handleInputChange}
            errorMsg={errors.city}
            EgClassName={t("abroadMembers.cityeg")}
            type="text"
          />

          {/* Success Mantra */}
          <CapitalizedInputField
            name="success_mantra"
            label={t("abroadMembers.successMantra")}
            EgClassName={t("abroadMembers.successMantraDescription")}
            value={formData.success_mantra}
            onChange={handleInputChange}
            errorMsg={errors.success_mantra}
            type="text"
          />

          {/* Thoughts on Committee - Now using the sentence capitalization component */}
          <div>
            <label className="block text-theme font-bold mb-1">
              {t("abroadMembers.thoughtsOnCommittee")}
              <span className="block text-theme mb-1 font-light">
                {t("abroadMembers.thoughtsOnCommitteeDescription")}
              </span>
            </label>
            <SentenceCapitalizedTextArea
              name="thoughts_on_committee"
              value={formData.thoughts_on_committee}
              onChange={handleInputChange}
              className={`w-full p-2.5 border-[1.5px] rounded-md text-black focus:border-theme text-sm shadow-md outline-none ${errors.thoughts_on_committee ? "border-red-500" : "border-black"
                }`}
              rows={3}
            />
            {errors.thoughts_on_committee && (
              <ValidationError message={errors.thoughts_on_committee} />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-theme text-white font-bold py-2.5 rounded-md shadow-md hover:bg-opacity-90 transition"
          >
            {isEditing
              ? t("abroadMembers.updateButton")
              : t("abroadMembers.submitButton")}
          </button>
        </form>
      </div>
    </>
  );
};

export default AbroadMembersForm;