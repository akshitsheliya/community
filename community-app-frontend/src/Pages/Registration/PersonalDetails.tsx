import InputField from "../../component/Common/InputField";
import { useTranslation } from "react-i18next";
import { DatePicker, AutoComplete } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState, useCallback } from "react";
import { Getsurname } from "../../Api/surname";
import DropDown from "../../component/Common/DropDown";
import { Address, Blood } from "../../utils/Constant/constants";
import { useLocation } from "react-router-dom";
import { PersonalDetailsProps } from "../../helper/Types/types";

const PersonalDetails: React.FC<PersonalDetailsProps> = ({
  formData,
  onChange,
  errors,
  setErrors,
  disabled,
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const defaultSurname = location.state?.defaultSurname;
  const [surnameList, setSurnameList] = useState<string[]>([]);
  const [surnameOptions, setSurnameOptions] = useState<{ value: string }[]>([]);
  const [showAddressInput, setShowAddressInput] = useState<boolean>(false);
  const [selectedAddressOption, setSelectedAddressOption] = useState<any>(null);

  const fetchSurname = useCallback(async () => {
    if (surnameList.length > 0) return;
    try {
      const data = await Getsurname();
      if (data && data.data && Array.isArray(data.data)) {
        const surnames = data.data.map((item: any) => item.surname);
        setSurnameList(surnames);
      }
    } catch (error) {
      console.error("Error fetching surname:", error);
    }
  }, [surnameList.length]);

  useEffect(() => {
    if (defaultSurname && !formData.surname) {
      onChange("surname", defaultSurname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSurname, formData.surname]);

  useEffect(() => {
    fetchSurname();
  }, [fetchSurname]);

  useEffect(() => {
    checkResidenceType();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.current_resident]);

  const checkResidenceType = () => {
    if (formData.current_resident) {
      const predefinedAddress = Address.find(
        (addr) => addr.value === formData.current_resident
      );
      if (!predefinedAddress && formData.current_resident) {
        setShowAddressInput(true);
        setSelectedAddressOption(
          Address.find((option) => option.value === "Othor")
        );
      } else if (predefinedAddress) {
        setSelectedAddressOption(predefinedAddress);
        setShowAddressInput(false);
      }
    }
  };

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

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;

      if (value.length < 10) {
        setErrors((prev: any) => ({
          ...prev,
          phone: t("phoneMustBe10Digits"),
        }));
      } else {
        setErrors((prev: any) => ({ ...prev, phone: "" }));
      }
    }

    const words = value.split(" ");
    const capitalizedWords = words.map((word: string) =>
      word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : ""
    );
    const capitalizedValue = capitalizedWords.join(" ");

    onChange(name, capitalizedValue);
  };

  const handleResidenceChange = (selectedOption: any) => {
    if (selectedOption?.value === "Othor") {
      setShowAddressInput(true);
      setSelectedAddressOption(selectedOption);
      onChange("current_resident", "");
    } else {
      setShowAddressInput(false);
      setSelectedAddressOption(selectedOption);
      onChange("current_resident", selectedOption?.value || "");
    }
  };

  const handleCustomResidenceChange = (e: any) => {
    const { value } = e.target;
    const words = value.split(" ");
    const capitalizedWords = words.map((word: string) =>
      word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : ""
    );
    const capitalizedValue = capitalizedWords.join(" ");
    onChange("current_resident", capitalizedValue);
  };

  const handleSurnameChange = (value: string) => {
    const words = value.split(" ");
    const capitalizedWords = words.map((word: string) =>
      word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : ""
    );
    const capitalizedValue = capitalizedWords.join(" ");
    onChange("surname", capitalizedValue);
  };

  const handleDateChange = (date: Dayjs | null) => {
    onChange("dob", date);
  };

  useEffect(() => {
    if (typeof formData.isMainMember === "string") {
      onChange("isMainMember", formData.isMainMember === "true");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.isMainMember]);

  // ------------- Recursive finder for any key containing "relation" -------------
  const findRelationRecursive = (obj: any, path = ""): any => {
    if (obj === null || obj === undefined) return null;

    if (typeof obj === "string" || typeof obj === "number") {
      // simple value (not the keyed case) — not useful unless we know key
      return null;
    }

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const found = findRelationRecursive(obj[i], `${path}[${i}]`);
        if (found !== null) return found;
      }
      return null;
    }

    if (typeof obj === "object") {
      for (const key of Object.keys(obj)) {
        try {
          if (key.toLowerCase().includes("relation") && obj[key]) {
            return { raw: obj[key], path: path ? `${path}.${key}` : key };
          }
          // also check common alternatives
          if (
            ["guardian", "relative", "relation_type"].includes(
              key.toLowerCase()
            ) &&
            obj[key]
          ) {
            return { raw: obj[key], path: path ? `${path}.${key}` : key };
          }
          // recurse
          const nested = findRelationRecursive(
            obj[key],
            path ? `${path}.${key}` : key
          );
          if (nested !== null) return nested;
        } catch (e) {
          // continue on error
        }
      }
    }
    return null;
  };

  const formatRelationRawToString = (raw: any): string => {
    if (raw === null || raw === undefined) return "";
    if (typeof raw === "string") return raw;
    if (typeof raw === "number") return String(raw);
    if (Array.isArray(raw) && raw.length > 0) {
      // try first element
      return formatRelationRawToString(raw[0]);
    }
    if (typeof raw === "object") {
      // common object shapes
      if (raw.label) return raw.label;
      if (raw.value) return raw.value;
      if (raw.name) return raw.name;
      // if it's an object with localized label fields, try to find short string
      for (const k of Object.keys(raw)) {
        if (typeof raw[k] === "string" && raw[k].length <= 30) return raw[k];
      }
      try {
        return JSON.stringify(raw);
      } catch {
        return "";
      }
    }
    return String(raw);
  };

  const detected = findRelationRecursive(formData);
  const detectedRelationRaw = detected ? detected.raw : null;
  const detectedRelationPath = detected ? detected.path : "";
  const detectedRelationDisplay =
    formatRelationRawToString(detectedRelationRaw);
  const relationLower = detectedRelationDisplay
    ? String(detectedRelationDisplay).toLowerCase()
    : "";

  useEffect(() => {
    // debug: open console and check these values after selecting relation in parent
    console.log("PersonalDetails formData (debug):", formData);
    console.log(
      "detectedRelationRaw:",
      detectedRelationRaw,
      "path:",
      detectedRelationPath
    );
    console.log(
      "detectedRelationDisplay:",
      detectedRelationDisplay,
      "relationLower:",
      relationLower
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, detectedRelationDisplay, detectedRelationRaw, relationLower]);

  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* SURNAME */}
      <div>
        <label className="block text-theme font-bold mb-1">
          {t("surname")}
        </label>
        <div className="relative">
          <AutoComplete
            value={formData.surname}
            options={surnameOptions}
            onSearch={onSurnameSearch}
            onChange={handleSurnameChange}
            disabled={disabled}
            style={{ width: "100%" }}
            dropdownMatchSelectWidth={true}
            className="w-full surname-autocomplete"
          >
            <input
              className={`w-full p-2.5 border-[1.5px] rounded-md text-sm shadow-md outline-none placeholder-[#788288] text-black md:text-base ${
                !errors.surname ? "border-black" : "border-theme"
              }`}
              placeholder={t("placeholders.surname")}
              disabled={disabled}
            />
          </AutoComplete>
        </div>
        {errors.surname && (
          <p className="text-red-500 text-sm">{errors.surname}</p>
        )}
      </div>

      {/* NAME */}
      <InputField
        label={t("name")}
        name="first_name"
        placeholder={t("placeholders.name")}
        onChange={handleChange}
        value={formData.first_name}
        errorMsg={errors.first_name}
        disabled={disabled}
      />

      {/* FATHER/HUSBAND NAME */}
      <InputField
        label={t("fatherName")}
        name="father_name"
        placeholder={t("placeholders.fatherHusbandName")}
        onChange={handleChange}
        value={formData.father_name}
        errorMsg={errors.father_name}
        disabled={disabled}
      />

      {/* CURRENT RESIDENT */}
      <div>
        <DropDown
          label={t("details.CurrentResident")}
          placeholder={t("details.EnterCity")}
          options={Address}
          value={selectedAddressOption}
          onChange={handleResidenceChange}
          isClearable={true}
          disabled={disabled}
        />
        {showAddressInput && (
          <div className="mt-2">
            <InputField
              label=""
              type="text"
              name="current_resident"
              placeholder={t("enter address")}
              onChange={handleCustomResidenceChange}
              value={formData.current_resident}
              errorMsg={errors.current_resident}
              disabled={disabled}
            />
          </div>
        )}
        {errors.current_resident && !showAddressInput && (
          <p className="text-red-500 text-sm mt-1">{errors.current_resident}</p>
        )}
      </div>

      {/* DOB */}
      <div>
        <label className="block text-theme font-bold mb-1">{t("dob")}</label>
        <DatePicker
          onChange={handleDateChange}
          inputReadOnly
          value={formData.dob && dayjs(formData.dob)}
          format={"DD MMM YYYY"}
          className="w-full border border-gray-300 rounded p-2"
          maxDate={dayjs()}
          disabled={disabled}
        />
      </div>

      {/* ADDRESS */}
      <InputField
        label={t("address")}
        type="text"
        name="address"
        placeholder={t("placeholders.address")}
        onChange={handleChange}
        value={formData.address}
        errorMsg={errors.address}
        disabled={disabled}
      />

      {/* EMAIL */}
      <InputField
        label={t("email")}
        type="email"
        name="email"
        placeholder={t("placeholders.email")}
        onChange={handleChange}
        value={formData.email}
        errorMsg={errors.email}
        disabled={disabled}
      />

      {/* PHONE */}
      <InputField
        label={t("phone")}
        type="tel"
        name="phone"
        placeholder={t("placeholders.phone")}
        value={formData.phone}
        onChange={handleChange}
        errorMsg={errors.phone}
        disabled={disabled}
      />

      {/* DYNAMIC RELATION MESSAGE */}
      <label className="text-gray-500 text-sm font-normal block mb-2 !mt-0 first:!mt-0">
        {relationLower
          ? `Your ${relationLower} can also login using this phone number.`
          : `Your can do login using this phone number.`}
      </label>

      {/* BLOOD GROUP */}
      <DropDown
        label={t("bloodGroup")}
        placeholder={t("placeholders.bloodGroup")}
        options={Blood}
        onChange={(option: any) => onChange("blood_group", option?.value || "")}
        isClearable={true}
        value={
          formData.blood_group &&
          Blood.find((opt) => opt.value === formData.blood_group)
        }
        disabled={disabled}
      />
      {errors.blood_group && (
        <p className="text-red-500">{errors.blood_group}</p>
      )}

      {/* FAMILY MEMBERS */}
      {formData.isMainMember && (
        <InputField
          label={t("placeholders.NoOfFamilyMembers")}
          type="number"
          name="NoOfFamilyMembers"
          placeholder={t("placeholders.numberOfFamilyMembers")}
          value={formData.NoOfFamilyMembers?.toString() || ""}
          onChange={(e) => {
            const value = e.target.value;
            if (
              value === "" ||
              (parseInt(value) >= 1 && parseInt(value) <= 99)
            ) {
              handleChange(e);
            }
          }}
          min={1}
          max={99}
          errorMsg={errors.NoOfFamilyMembers}
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default PersonalDetails;
