import DropDown from "../../component/Common/DropDown";
import { Wedding, relationship } from "../../utils/Constant/constants";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

interface AdditionalDetailsProps {
  formData: any;
  onChange: (name: string, value: string) => void;
  errors: any;
  setErrors: any;
  isClearable?: boolean;
  disabled?: any;
  mainMemberFirstName?: string;
  mainMemberFatherName?: string; // Added
}

const AdditionalDetails: React.FC<AdditionalDetailsProps> = ({
  onChange,
  errors,
  setErrors,
  formData,
  disabled,
  mainMemberFirstName,
  mainMemberFatherName,
}) => {
  const { t } = useTranslation();

  const marriedByDefaultRelationships = [
    "wife",
    "father",
    "mother",
    "husband",
    "grandfather",
    "Grandmother",
    "daughter in law",
  ];

  const maleRelationships = [
    "father",
    "son",
    "Brother",
    "husband",
    "grandfather",
    "grandson",
  ];

  const femaleRelationships = [
    "mother",
    "daughter",
    "sister",
    "wife",
    "Grandmother",
    "granddaughter",
    "daughter in law",
    "foi",
  ];

  const autoFillFirstNameRelationships = ["daughter", "son", "wife"];
  const autoFillFatherNameRelationships = ["Brother", "sister", "mother"];

  useEffect(() => {
    if (formData.relationship) {
      if (
        autoFillFirstNameRelationships.includes(formData.relationship) &&
        mainMemberFirstName &&
        formData.father_name !== mainMemberFirstName
      ) {
        onChange("father_name", mainMemberFirstName);
      } else if (
        autoFillFatherNameRelationships.includes(formData.relationship) &&
        mainMemberFatherName &&
        formData.father_name !== mainMemberFatherName
      ) {
        onChange("father_name", mainMemberFatherName);
      }
    }
  }, [
    formData.relationship,
    formData.father_name,
    mainMemberFirstName,
    mainMemberFatherName,
    onChange,
  ]);

  const validateField = (name: string, value: string) => {
    let errorMsg = "";
    if (!value) {
      errorMsg = t("requiredField");
    }
    setErrors((prev: any) => ({ ...prev, [name]: errorMsg }));
  };

  const handleDropdownChange = (selectedOption: any, fieldName: string) => {
    const value = selectedOption?.value || "";
    onChange(fieldName, value);
    validateField(fieldName, value);

    if (fieldName === "relationship") {
      if (marriedByDefaultRelationships.includes(value)) {
        onChange("marital_status", "Married");
        validateField("marital_status", "Married");
      }

      if (maleRelationships.includes(value)) {
        onChange("gender", "Male");
      } else if (femaleRelationships.includes(value)) {
        onChange("gender", "Female");
      }

      if (
        autoFillFirstNameRelationships.includes(value) &&
        mainMemberFirstName
      ) {
        onChange("father_name", mainMemberFirstName);
      } else if (
        autoFillFatherNameRelationships.includes(value) &&
        mainMemberFatherName
      ) {
        onChange("father_name", mainMemberFatherName);
      } else {
        onChange("father_name", "");
      }
    }
  };

  const isMaritalStatusDisabled = () =>
    disabled || marriedByDefaultRelationships.includes(formData.relationship);

  const relationshipOptions = relationship;

  return (
    <div className="space-y-4">
      <DropDown
        label={t("relation")}
        placeholder={t("placeholders.relationship")}
        options={relationshipOptions}
        onChange={(option) => handleDropdownChange(option, "relationship")}
        isClearable={true}
        value={
          formData.relationship &&
          relationship.find((opt) => opt.value === formData.relationship)
        }
        disabled={disabled}
      />
      {errors.relationship && (
        <p className="text-red-500">{errors.relationship}</p>
      )}
      <DropDown
        label={t("maritalStatus")}
        placeholder={t("placeholders.maritalStatus")}
        options={Wedding}
        onChange={(option) => handleDropdownChange(option, "marital_status")}
        isClearable={true}
        value={
          formData.marital_status &&
          Wedding.find((opt) => opt.value === formData.marital_status)
        }
        disabled={isMaritalStatusDisabled()}
      />
      {errors.marital_status && (
        <p className="text-red-500">{errors.marital_status}</p>
      )}
      <div>
        <label className="block text-theme font-bold mb-1">{t("gender")}</label>
        <div className="p-2 flex flex-row justify-center items-center gap-10 border-[1.5px] rounded border-black">
          <label htmlFor="male" className="flex items-center gap-3">
            <input
              id="male"
              type="radio"
              name="gender"
              value="Male"
              checked={formData.gender === "Male"}
              onChange={(e) => onChange("gender", e.target.value)}
              className="accent-theme"
              disabled={disabled}
            />
            {t("profileDetails.male")}
          </label>
          <label htmlFor="female" className="flex items-center gap-3">
            <input
              id="female"
              type="radio"
              name="gender"
              value="Female"
              checked={formData.gender === "Female"}
              onChange={(e) => onChange("gender", e.target.value)}
              className="accent-theme"
              disabled={disabled}
            />
            {t("profileDetails.female")}
          </label>
        </div>
        {errors.gender && (
          <p className="text-red-500 text-sm mt-2">{errors.gender}</p>
        )}
      </div>
    </div>
  );
};

export default AdditionalDetails;
