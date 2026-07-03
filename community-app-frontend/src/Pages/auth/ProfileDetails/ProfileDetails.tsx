import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AutoComplete } from "antd";
import Header from "../../../component/Common/Header";
import { useAuthCheck } from "../../auth/ProfileDetails/useAuthCheck";
import { GetSingleUser } from "../../../Api/user";
import { Notify } from "../../../component/Common/Notify";
import GenderSelector from "./GenderSelector";
import InputField from "../../../component/Common/InputField";
import CircularArcLoader from "../../../component/CustomCircularLoader";
import { IoMdCamera } from "react-icons/io";
import { submitProfileData } from "../../../Api/profileService";
import { Getsurname } from "../../../Api/surname";

const ProfileDetails = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const phoneNumber = localStorage.getItem("phoneNumber") || "";
  const isCheckingAuth = useAuthCheck();
  const imageUploadRef = useRef<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<any>(null);
  const [surnameList, setSurnameList] = useState<string[]>([]);
  const [surnameOptions, setSurnameOptions] = useState<{ value: string }[]>([]);
  const [formData, setFormData] = useState<any>({
    firstName: "",
    lastName: "",
    surname: "",
    gender: "",
    numberOfFamilyMembers: "",
    images: null,
  });

  const [errors, setErrors] = useState<any>({
    firstName: "",
    lastName: "",
    surname: "",
    gender: "",
    numberOfFamilyMembers: "",
  });

  useEffect(() => {
    const fetchSurname = async () => {
      try {
        const data = await Getsurname();
        if (data && data.data && Array.isArray(data.data)) {
          const surnames = data.data.map((item: any) => item.surname);
          setSurnameList(surnames);
        }
      } catch (error) {
        console.error("Error fetching surname:", error);
      }
    };
    fetchSurname();
  }, []);

  const onSurnameSearch = (value: string) => {
    if (!value) {
      setSurnameOptions([]);
      return;
    }

    const filteredOptions = surnameList
      .filter((surname) =>
        surname.toLowerCase().startsWith(value.toLowerCase())
      )
      .map((surname) => ({ value: surname }));

    setSurnameOptions(filteredOptions);
  };

  const handleSurnameChange = (value: string) => {
    const words = value.split(" ");
    const capitalizedWords = words.map((word: string) => {
      return word.length > 0
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : "";
    });
    const capitalizedValue = capitalizedWords.join(" ");

    setFormData((prev: any) => ({ ...prev, surname: capitalizedValue }));
    if (capitalizedValue) {
      setErrors((prev: any) => ({ ...prev, surname: "" }));
    }
  };

  const handleButtonClick = () => {
    if (imageUploadRef.current) {
      imageUploadRef.current.click();
    }
  };

  const handleFileChange = async (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        images: file,
      });
      setImagePreview(file ? file : null);
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;

    let updatedValue = value;

    if (type == "radio") {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    } else if (name == "numberOfFamilyMembers") {
      let numValue = value.replace(/\D/g, "");

      if (numValue.length > 1) {
        numValue = numValue.replace(/^0+/, ""); 
      }

      if (numValue.length > 2) {
        numValue = numValue.slice(0, 2);
      }

      updatedValue = numValue;

      if (numValue && Number(numValue) >= 1 && Number(numValue) <= 99) {
        setErrors((prev: any) => ({ ...prev, numberOfFamilyMembers: "" }));
      }
    } else if (["firstName", "lastName", "surname"].includes(name)) {
      const words = value.split(" ");
      const capitalizedWords = words.map((word: string) => {
        return word.length > 0
          ? word.charAt(0).toUpperCase() + word.slice(1)
          : "";
      });
      updatedValue = capitalizedWords.join(" ");
    }

    setFormData((prev: any) => ({ ...prev, [name]: updatedValue }));
  };

  const validate = (): boolean => {
    let isValid = true;
    const newErrors: any = {};

    ["firstName", "lastName", "surname"].forEach((field) => {
      const value = formData[field as keyof typeof formData];
      if (typeof value == "string" && !value.trim()) {
        newErrors[field] = t(`errors.${field}`);
        isValid = false;
      }
    });

    if (!formData.numberOfFamilyMembers) {
      newErrors.numberOfFamilyMembers = t("errors.numberOfFamilyMembers");
      isValid = false;
    }

    if (!formData.gender) {
      newErrors.gender = t("errors.gender");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const data: any = {
        first_name: formData.firstName.trim(),
        father_name: formData.lastName.trim(),
        surname: formData.surname.trim(),
        gender: formData.gender,
        phone_number: phoneNumber,
        number_of_family_members: formData.numberOfFamilyMembers,
        profile_photo: formData.images,
      };

      const result: any = await submitProfileData(data);

      if (result?.data?.is_verifird == 1) {
        const users: any = await GetSingleUser();
        localStorage.setItem("isAdmin", users?.data?.is_community_admin);
        localStorage.setItem("userData", JSON.stringify(users?.data));
        navigate("/dashboard");
      } else {
        localStorage.clear();
        Notify(
          "Your registration is completed, Committee member will review your profile and will activate your account.",
          "info"
        );
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Profile creation error:", error);
      Notify("Failed to create profile", "error");
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Header showBackArrow={true} />

      <div className="w-full flex justify-center items-center min-h-fit overflow-scroll">
        <div className="w-full max-w-md p-6 bg-white items-center shadow-lg rounded-lg border my-4 mx-4 border-gray-200">
          <h2 className="text-2xl font-bold text-center text-theme mb-6">
            {t("profileDetails.title")}
          </h2>

          <div className="space-y-5">
            <div className="flex items-center justify-center p-1.5 mb-8">
              <div className="relative">
                <div className="w-32 h-32 p-1 mx-3 flex items-center justify-center overflow-hidden rounded-full border-2">
                  <img
                    className="object-cover h-full w-full rounded-full"
                    src={
                      imagePreview
                        ? URL.createObjectURL(imagePreview)
                        : "https://ammachilabs.org/wp-content/uploads/2023/11/male.jpeg"
                    }
                    alt="Profile Image"
                  />
                </div>
                <div onClick={handleButtonClick}>
                  <button className="absolute bottom-[12px] right-2 border-0 rounded-full p-2">
                    <IoMdCamera className="text-white" />
                  </button>
                  <input
                    type="file"
                    accept={"image/*"}
                    ref={imageUploadRef}
                    style={{ display: "none" }}
                    defaultValue={undefined}
                    onChange={(e: any) => handleFileChange(e)}
                  />
                </div>
              </div>
            </div>

            <InputField
              name="firstName"
              label={t("profileDetails.firstName")}
              value={formData.firstName}
              onChange={handleChange}
              placeholder={t("placeholders.firstName")}
              disabled={isSubmitting}
              pattern="[A-Za-z\s]+"
            />
            {errors.firstName && (
              <span className="text-theme text-sm">{errors.firstName}</span>
            )}

            <InputField
              name="lastName"
              label={t("profileDetails.middleName")}
              value={formData.lastName}
              onChange={handleChange}
              placeholder={t("placeholders.middleName")}
              disabled={isSubmitting}
              pattern="[A-Za-z\s]+"
            />
            {errors.lastName && (
              <span className="text-theme text-sm">{errors.lastName}</span>
            )}
            <div>
              <label className="block text-theme font-bold mb-1">
                {t("profileDetails.surname")}
              </label>
              <div className="relative">
                <AutoComplete
                  value={formData.surname}
                  options={surnameOptions}
                  onSearch={onSurnameSearch}
                  onChange={handleSurnameChange}
                  disabled={isSubmitting}
                  style={{ width: "100%" }}
                  dropdownMatchSelectWidth={true}
                  className="w-full surname-autocomplete"
                >
                  <input
                    className={`w-full p-2.5 border-[1.5px]  rounded-md text-sm shadow-md outline-none placeholder-[#788288] text-black md:text-base ${errors.surname ? "border-theme" : "border-black"
                      }`}
                    placeholder={t("placeholders.surname")}
                    disabled={isSubmitting}
                  />
                </AutoComplete>
              </div>
              {errors.surname && (
                <span className="text-theme text-sm">{errors.surname}</span>
              )}
            </div>

            
            <InputField
              name="numberOfFamilyMembers"
              label={t("profileDetails.Nofm")}
              labelClassName="pt-2"
              value={formData.numberOfFamilyMembers?.toString() || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  handleChange(e);
                  return;
                }
                const numValue = parseInt(value);
                if (!isNaN(numValue) && numValue >= 1 && numValue <= 99) {
                  handleChange(e);
                }
              }}
              placeholder={t("placeholders.numberOfFamilyMembers")}
              disabled={isSubmitting}
              type="number"
              min={1}
              max={20}
              onKeyDown={(e: any) => {
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
            {errors.numberOfFamilyMembers && (
              <span className="text-theme text-sm">
                {errors.numberOfFamilyMembers}
              </span>
            )}

            <GenderSelector
              gender={formData.gender}
              onChange={handleChange}
              error={errors.gender}
              disabled={isSubmitting}
            />

            <button
              onClick={handleSubmit}
              className={`w-full bg-theme text-white py-2.5 rounded-lg text-xl hover:bg-theme transition duration-200 font-bold flex items-center justify-center relative ${isSubmitting ? "cursor-not-allowed opacity-50" : ""
                }`}
              disabled={isSubmitting}
            >
              <span
                className={`transition-opacity ${isSubmitting ? "opacity-0" : "opacity-100"
                  }`}
              >
                {t("buttons.submit")}
              </span>

              {isSubmitting && (
                <span className="absolute">
                  <CircularArcLoader size={30} />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileDetails;