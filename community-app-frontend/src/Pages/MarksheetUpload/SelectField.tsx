import React from "react";
import Select from "react-select";
import ErrorMessage from "./ErrorMessage";
import { OptionType } from "../../helper/Types/types";

interface SelectFieldProps {
  label: string;
  options: OptionType[];
  value: OptionType | null;
  onChange: (option: OptionType | null) => void;
  placeholder: string;
  error?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
}) => {
  const customStyles = {
    control: (base: any) => ({
      ...base,
      borderColor: "#A32328",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#A32328",
      },
    }),
  };
  return (
    <div className="mb-4">
      <label className="block text-gray-700">{label}:</label>
      <div className="mt-2">
        <Select
          options={options}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={error ? "border-theme" : ""}
          isSearchable={false}
          styles={customStyles}
        />
        <ErrorMessage message={error} />
      </div>
    </div>
  );
};

export default SelectField;
