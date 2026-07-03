import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../Context/LocalStorageContext";
import Header from "../../component/Common/Header";
import { Notify } from "../../component/Common/Notify";
import PersonalDetails from "./PersonalDetails";
import OccupationDetails from "./OccupationDetails";
import AdditionalDetails from "./AdditionalDetails";
// import ImageUpload from "./ImageUpload";
// import TermsAndConditions from "./TermsAndConditions";
import { profileUpdate } from "../../Api/profileService";
import dayjs from "dayjs";
import { IoMdCamera } from "react-icons/io";
import { MdOutlineAttachFile } from "react-icons/md";
import CircularArcLoader from "../../component/CustomCircularLoader";
import { CreateMember } from "../../Api/memberLlist";

declare global {
  interface Window {
    flutter_inappwebview?: {
      callHandler: (handlerName: string, ...args: any[]) => Promise<any>;
    };
  }
}

const Registration = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useLocalStorage();
  // const imageUploadRef = useRef<any>(null);
  const profileImageUploadRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    first_name: "",
    father_name: "",
    surname: "",
    gender: "",
    dob: "",
    address: "",
    current_resident: "",
    email: "",
    phone: "",
    occupation: "",
    business: "",
    business_details: "",
    marital_status: "",
    city: "",
    blood_group: "",
    relationship: "",
    education: "",
    date_of_birth: "",
    isMainMember: false,
    NoOfFamilyMembers: "",
    id_proof: "",
    other: "",
  });

  const [image, setImage] = useState<any>(null);
  const [imageCamera, setImageCamera] = useState<boolean>(false);
  // const [imagePreview, setImagePreview] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<any>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<any>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (location?.state?.isFromProfile || location?.state?.isDetails) {
      setFormData((prev: any) => ({
        ...prev,
        first_name: location?.state?.data?.first_name || "",
        father_name: location?.state?.data?.father_name || "",
        surname: location?.state?.data?.surname || "",
        gender: location?.state?.data?.gender || "",
        dob:
          (location?.state?.data?.date_of_birth &&
            dayjs(location?.state?.data?.date_of_birth)) ||
          "",
        address: location?.state?.data?.address || "",
        current_resident: location?.state?.data?.current_resident || "",
        email: location?.state?.data?.email_id || "",
        phone: location?.state?.data?.phone_number || "",
        occupation: location?.state?.data?.business_or_job_or_any || "",
        business: location?.state?.data?.business || "",
        business_details: location?.state?.data?.business_details || "",
        marital_status: location?.state?.data?.marital_status || "",
        city: location?.state?.data?.city || "",
        blood_group: location?.state?.data?.blood_group || "",
        relationship: location?.state?.data?.relationship?.value || location?.state?.data?.relationship||"",
        education: location?.state?.data?.education || "",
        isMainMember: location?.state?.data?.isMainMember || false,
        NoOfFamilyMembers:
          location?.state?.data?.number_of_family_members || "",
      }));

      // setImagePreview(location?.state?.data?.id_proof);
      setProfileImagePreview(location?.state?.data?.profile_photo);
    }
    if (location?.state?.defaultSurname && !formData.surname) {
      setFormData((prev: any) => ({
        ...prev,
        surname: location.state.defaultSurname,
      }));
    }
  }, [location?.state]);

  // const handleButtonClick = () => {
  //   if (imageUploadRef.current) {
  //     imageUploadRef.current.click();
  //   }
  // };

  // const handleFileChange = async (event: any) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     setImage(file);
  //     setImagePreview(file);
  //   }
  // };

  const handleProfileButtonClick = () => {
    if (profileImageUploadRef.current) {
      profileImageUploadRef.current.click();
    }
  };

  const handleProfileFileChange = async (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(file);
    }
  };

  // const handleCameraOpen = () => {
  //   if (window.flutter_inappwebview) {
  //     window.flutter_inappwebview
  //       .callHandler("openCamera")
  //       .catch((err: any) => {
  //         console.error("Error calling openCamera:", err);
  //         Notify("Unable to access camera", "error");
  //       });
  //   } else {
  //     console.warn("Flutter InAppWebView not available");
  //     Notify("Camera access not supported in this environment", "warning");
  //   }
  //   setImageCamera(true);
  // };

  const handleProfileCameraOpen = () => {
    if (window.flutter_inappwebview) {
      window.flutter_inappwebview
        .callHandler("openCamera")
        .catch((err: any) => {
          console.error("Error calling openCamera:", err);
          Notify("Unable to access camera", "error");
        });
    } else {
      console.warn("Flutter InAppWebView not available");
      Notify("Camera access not supported in this environment", "warning");
    }
    setImageCamera(false);
  };

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

  useEffect(() => {
    const handleImageData = async (event: any) => {
      const data: any = event.detail;
      if (data?.name && data?.bytes) {
        const file = convertBase64ToFile(data?.bytes, data?.name);
        if (imageCamera) {
          setImage(file);
          // setImagePreview(file);
        } else {
          setProfileImage(file);
          setProfileImagePreview(file);
        }
      }
    };

    window.addEventListener("getImage", handleImageData);
    return () => window.removeEventListener("getImage", handleImageData);
  }, [imageCamera]);

  const handleChange = useCallback((name: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }, []);

  // const clearImage = () => {
  //   setImage(null);
  //   setImagePreview(null);
  // };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    let err: any = {};
    if (!formData.first_name) {
      err.first_name = "First name is required.";
    }
    if (!formData.father_name) {
      err.father_name = "Father/Husband name is required.";
    }
    if (!formData.surname) {
      err.surname = "Surname is required.";
    }
    if (!formData.gender) {
      err.gender = "Gender is required.";
    }
    if (!formData.address) {
      err.address = "Address is required.";
    }
    if (!formData.marital_status) {
      err.marital_status = "Marital status is required.";
    }
    if (!formData.relationship) {
      err.relationship = "Relationship is required.";
    }
    if (!formData.current_resident) {
      err.current_resident = "Current Residence is required.";
    }

    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    setIsLoading(true);

    if (location?.state?.isFromProfile) {
      localStorage.removeItem("userData");
    }
    const formattedData = new FormData();
    formattedData.append("first_name", formData.first_name);
    formattedData.append("father_name", formData.father_name);
    formattedData.append("surname", formData.surname);
    formattedData.append("phone_number", formData.phone);
    formattedData.append("gender", formData.gender);
    formattedData.append(
      "date_of_birth",
      formData.dob ? dayjs(formData.dob).format("YYYY-MM-DD") : ""
    );
    formattedData.append("address", formData.address);
    formattedData.append("current_resident", formData.current_resident);
    formattedData.append(
      "business_or_job_or_any",
      formData.occupation !== "other" ? formData.occupation : formData.other
    );
    formattedData.append("business_details", formData.business_details);
    formattedData.append("education", formData.education);
    formattedData.append("blood_group", formData.blood_group);
    formattedData.append("marital_status", formData.marital_status);
    formattedData.append(
      "number_of_family_members",
      formData.NoOfFamilyMembers
    );
    if (image) {
      formattedData.append("id_proof", image);
    }
    formattedData.append("email_id", formData.email);
    formattedData.append("relationship", formData.relationship);
    if (profileImage) {
      formattedData.append("profile_photo", profileImage);
    }
    try {
      const response: any = location?.state?.isFromProfile
        ? await profileUpdate(
            location?.state?.data?.member_uuid || userData?.member_uuid,
            formattedData
          )
        : await CreateMember(formattedData);

      if (response.success) {
        Notify(response?.message, "success");
        navigate("/dashboard");
        setFormData({});
        setErrors({});
      }
    } catch (error: any) {
      Notify(error.response.data.message + ". Please try other number or keep it blank", "error");

      console.error("Error saving member data:", error);
      if (error.response) {
        const { message, errors: fieldErrors } = error.response?.data;
        if (fieldErrors) {
          const formattedErrors: { [key: string]: string } = {};
          Object.keys(fieldErrors).forEach((field) => {
            formattedErrors[field] = fieldErrors[field][0];
          });
          setErrors(formattedErrors);
        } else {
          setErrors({
            global: message || "Failed to register. Please try again.",
          });
        }
      } else {
        setErrors({
          global: "Failed to register due to network error. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header
        showBackArrow={true}
        title={
          location?.state?.isFromProfile
            ? t("editprofile")
            : location?.state?.isDetails
            ? t("details.title")
            : t("addmember")
        }
        className="z-[9999]"
      />
      <div className="min-h-screen bg-gray-100 p-4 flex justify-center items-center w-full">
        <div className="w-full max-w-lg mx-auto">
          <div className="font-bold">
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-1.5">
                <div className="w-32 h-32 p-1 mx-3 flex flex-col items-center justify-center overflow-hidden rounded-full border-2">
                  <img
                    className="object-cover h-full w-full rounded-full"
                    src={
                      profileImagePreview && !profileImage
                        ? profileImagePreview
                        : profileImage
                        ? URL.createObjectURL(profileImage)
                        : "https://ammachilabs.org/wp-content/uploads/2023/11/male.jpeg"
                    }
                    alt="Profile Image"
                  />
                </div>
                {!location?.state?.isDetails && (
                  <div className="mt-2 flex">
                    <button
                      className="rounded-full p-2"
                      onClick={handleProfileCameraOpen}
                    >
                      <IoMdCamera className="text-white" />
                    </button>
                    <button
                      className="rounded-full p-2 ml-3"
                      onClick={handleProfileButtonClick}
                    >
                      <MdOutlineAttachFile className="text-white" />
                    </button>
                    <input
                      type="file"
                      accept={"image/*"}
                      ref={profileImageUploadRef}
                      style={{ display: "none" }}
                      defaultValue={undefined}
                      onChange={(e: any) => handleProfileFileChange(e)}
                    />
                  </div>
                )}
              </div>
              <AdditionalDetails
                formData={formData}
                onChange={handleChange}
                errors={errors}
                setErrors={setErrors}
                disabled={location?.state?.isDetails}
                mainMemberFirstName={location?.state?.mainMemberFirstName}
                mainMemberFatherName={location?.state?.mainMemberFatherName} // Added
              />
              <PersonalDetails
                formData={formData}
                onChange={handleChange}
                errors={errors}
                setErrors={setErrors}
                disabled={location?.state?.isDetails}
              />
              <OccupationDetails
                formData={formData}
                onChange={handleChange}
                disabled={location?.state?.isDetails}
              />
              {/* <div>
                {!location?.state?.isDetails && (
                  <ImageUpload
                    imageUploadRef={imageUploadRef}
                    handleButtonClick={handleButtonClick}
                    onChange={handleFileChange}
                    handleCameraOpen={handleCameraOpen}
                  />
                )}
                {(imagePreview || image) && (
                  <div className="mt-4">
                    <img
                      src={
                        imagePreview && !image
                          ? imagePreview
                          : image && URL.createObjectURL(image)
                      }
                      alt="Preview"
                      className="w-32 h-32 object-cover border rounded-md"
                    />
                    {!location?.state?.isDetails && (
                      <button
                        onClick={clearImage}
                        className="mt-2 text-white text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div> */}
              {/* {!location?.state?.isDetails && <TermsAndConditions />}
              {errors.global && (
                <p className="text-red-500 text-sm mt-2">{errors.global}</p>
              )} */}
              {!location?.state?.isDetails && (
                <div className="pt-4">
                  <button
                    className={`w-full bg-theme text-white p-3 rounded hover:bg-theme transition duration-300 text-sm md:text-base relative ${
                      isLoading ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    disabled={isLoading}
                    onClick={handleSubmit}
                  >
                    <span
                      className={`transition-opacity ${
                        isLoading ? "opacity-0" : "opacity-100"
                      }`}
                    >
                      {location.state?.isFromProfile
                        ? t("committee.update")
                        : t("buttons.submit")}
                    </span>
                    {isLoading && (
                      <span className="flex justify-center items-center absolute inset-0">
                        <CircularArcLoader size={30} />
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Registration;
