import Select, { StylesConfig } from "react-select";
import { OptionType, DropDownProps } from "../helper/Types/types";

const DropDown = ({
  label,
  placeholder,
  options = [],
  value,
  onChange,
  isRequired = false,
}: DropDownProps) => {
  const customStyles: StylesConfig<OptionType, false> = {
    control: (baseStyles) => ({
      ...baseStyles,
      border: "1px solid #e2e8f0",
      boxShadow: "none",
      "&:hover": { borderColor: "#ffa500" },
      padding: "4px",
    }),
    option: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: state.isFocused ? "#fff7ed" : "white",
      color: state.isFocused ? "#ff6600" : "black",
      cursor: "pointer",
    }),
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-theme font-bold mb-1">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Select<OptionType>
        options={options}
        placeholder={placeholder || "Select an option"}
        styles={customStyles}
        isSearchable={false}
        value={value}
        onChange={onChange}
        required={isRequired}
      />
    </div>
  );
};

export default DropDown;
