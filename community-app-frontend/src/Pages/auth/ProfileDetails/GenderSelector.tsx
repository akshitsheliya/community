import { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

interface GenderSelectorProps {
  gender: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}

const GenderSelector: React.FC<GenderSelectorProps> = ({
  gender,
  onChange,
  error,
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-theme font-bold mb-1">
        {t("profileDetails.gender")}
      </label>
      <div className="p-3 flex flex-row justify-around items-center gap-10 border-[1.5px] rounded-md border-gray-300 shadow-sm">
        <label className="flex items-center gap-3">
          <input
            type="radio"
            name="gender"
            value="male"
            checked={gender === "male"}
            onChange={onChange}
            className="accent-theme"
            disabled={disabled}
          />
          {t("profileDetails.male")}
        </label>
        <label className="flex items-center gap-3">
          <input
            type="radio"
            name="gender"
            value="female"
            checked={gender === "female"}
            onChange={onChange}
            className="accent-theme"
            disabled={disabled}
          />
          {t("profileDetails.female")}
        </label>
      </div>
      {error && <span className="text-theme text-sm">{error}</span>}
    </div>
  );
};

export default GenderSelector;
