import React from "react";
import Select from "react-select";

interface DropDownProps {
  label: string;
  options: any[];
  placeholder: string;
  isClearable?: boolean;
  onChange: (selectedOption: any) => void;
}

const DropDown: React.FC<DropDownProps> = ({
  label,
  options,
  placeholder,
  onChange,
}) => {
  return (
    <div>
      <label className="block text-theme font-bold mb-1">{label}</label>
      <Select
        options={options}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full"
      />
    </div>
  );
};

export default DropDown;
