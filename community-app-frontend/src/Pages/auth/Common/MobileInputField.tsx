import React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlinePhone } from "react-icons/hi";

interface MobileInputProps {
  mobileNumber: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: { mobile_no: string };
}

const MobileInputField: React.FC<MobileInputProps> = ({
  mobileNumber,
  handleChange,
  errors,
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative mb-4">
      <label className="block text-left text-theme font-bold mb-1">
        {t("mobile")}
      </label>
      <div className="relative">
        <input
          type="tel"
          value={mobileNumber}
          onChange={handleChange}
          placeholder={t("email_placeholder_mobile_number")}
          className={`w-full px-2 pt-3 border-[1.5px] ${
            errors.mobile_no ? "border-red-500" : "border-black"
          } rounded-md text-sm shadow-md outline-none placeholder-[#788288] text-black`}
          style={{ paddingBottom: errors.mobile_no ? "34px" : "10px" }}
          maxLength={10}
        />
        <HiOutlinePhone className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
        {errors.mobile_no && (
          <span className="absolute left-2 bottom-1 text-red-500 text-xs font-extralight">
            {errors.mobile_no}
          </span>
        )}
      </div>
    </div>
  );
};

export default MobileInputField;
