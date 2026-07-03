// import React from "react";
import Select, { components } from "react-select";
import { Dropdowndata } from "../../helper/Types/types";

const DropDown = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  isRequired = false,
  className,
  fontSize,
  icon,
  isClearable = true, // Default to true
  disabled,
}: Dropdowndata) => {
  const customStyles = {
    control: (base: any) => ({
      ...base,
      border: "1px solid #A32328",
      boxShadow: "none",
      "&:hover": { borderColor: "#A32328" },
      padding: "4px",
    }),
    option: (base: any, state: { isFocused: any }) => ({
      ...base,
      fontSize: fontSize ?? "inherit",
      backgroundColor: state.isFocused ? "#e06f74" : "white",
      color: state.isFocused ? "#000000" : "black",
      cursor: "pointer",
    }),
  };

  // Custom Placeholder with Icon
  const CustomPlaceholder = (props: any) => (
    <components.Placeholder {...props}>
      <div className="flex items-center gap-2 whitespace-nowrap text-ellipsis overflow-hidden">
        {icon && <span className="text-theme text-2xl">{icon}</span>}
        {placeholder}
      </div>
    </components.Placeholder>
  );

  return (
    <div className={`w-full ${className || ""}`}>
      {/* Dynamic Label */}
      {!!label && (
        <label className="block text-theme font-bold mb-1">{label}</label>
      )}
      {/* Dropdown */}
      <Select
        options={options || []} // Default to empty array if no options are passed
        placeholder={placeholder || "Select an option"}
        styles={customStyles}
        components={{ Placeholder: CustomPlaceholder }} // Use the custom placeholder
        classNamePrefix="custom-dropdown"
        isSearchable={false}
        value={value} // Ensure this matches the structure of options
        onChange={onChange}
        isClearable={isClearable} // Enable the clear button
        required={isRequired}
        isDisabled={disabled}
      />
    </div>
  );
};

export default DropDown;
