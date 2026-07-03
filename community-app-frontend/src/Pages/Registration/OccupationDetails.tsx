import { useState } from "react";
import DropDown from "../../component/Common/DropDown";
import { BusinessOptions, Education } from "../../utils/Constant/constants";
import { useTranslation } from "react-i18next";
import InputField from "../../component/Common/InputField";

const OccupationDetails = ({
  formData,
  onChange,
  disabled,
}: {
  formData: any;
  onChange: any;
  disabled?: any;
}) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateField = (name: string, value: string) => {
    let errorMsg = "";
    if (!value) {
      errorMsg = t("requiredField");
    }
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    onChange(name, value);
    validateField(name, value);
  };

  const handleDropdownChange = (selectedOption: any, fieldName: string) => {
    const value = selectedOption?.value || "";
    onChange(fieldName, value);
    validateField(fieldName, value);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-theme font-bold mb-1">
          {t("occupation")}
        </label>
        <div className="p-2 flex flex-row justify-center items-center gap-3 border-[1.5px] rounded border-black ">
          {[t("Student"), t("job"), t("business"), t("other")].map(
            (option: any) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="occupation"
                  value={option}
                  checked={formData.occupation === option}
                  className="mr-2 accent-theme"
                  onChange={handleChange}
                  disabled={disabled}
                />
                {t(`${option}`)}
              </label>
            )
          )}
        </div>
        {errors.occupation && (
          <p className="text-red-500">{errors.occupation}</p>
        )}
      </div>

      {formData.occupation === t("job") ? (
        <>
          <DropDown
            label={t("jobField")}
            placeholder={t("placeholders.job")}
            options={BusinessOptions}
            value={
              formData.business_details &&
              BusinessOptions.find(
                (opt) => opt.value === formData.business_details
              )
            }
            onChange={(option: any) =>
              handleDropdownChange(option, "business_details")
            }
            isClearable={true}
            disabled={disabled}
          />
          {errors.job_details && (
            <p className="text-red-500">{errors.job_details}</p>
          )}
        </>
      ) : (
        formData.occupation && (
          <>
            <DropDown
              label={t("business")}
              placeholder={t("placeholders.businessField")}
              options={BusinessOptions}
              value={
                formData.business_details &&
                BusinessOptions.find(
                  (opt) => opt.value === formData.business_details
                )
              }
              onChange={(option: any) =>
                handleDropdownChange(option, "business_details")
              }
              isClearable={true}
              disabled={disabled}
            />
            {errors.business_details && (
              <p className="text-red-500">{errors.business_details}</p>
            )}
          </>
        )
      )}

      {formData.occupation === "other" && (
        <InputField
          label={t("other")}
          name="other"
          placeholder={t("placeholders.other")}
          onChange={handleChange}
          value={formData.other || ""}
          disabled={disabled}
        />
      )}

      <DropDown
        label={t("education")}
        placeholder={t("placeholders.education")}
        options={Education}
        value={
          formData.education &&
          Education.find((opt) => opt.value === formData.education)
        }
        onChange={(option) => handleDropdownChange(option, "education")}
        isClearable={true}
        disabled={disabled}
      />
      {errors.education && <p className="text-red-500">{errors.education}</p>}
    </div>
  );
};

export default OccupationDetails;
