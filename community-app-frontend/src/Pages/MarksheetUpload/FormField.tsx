import React from "react";
import ErrorMessage from "./ErrorMessage";

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  maxLength?: number;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  maxLength,
  error,
}) => {
  // Prevent numbers from being typed in specific fields
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      ["father_full_name", "student_name"].includes(name) &&
      /\d/.test(e.key)
    ) {
      e.preventDefault(); // Block number input
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-700">{label}:</label>
      <input
        type="text"
        name={name}
        className={`w-full px-3 py-2 border rounded-md mt-2 focus:outline-none placeholder-gray-500 ${
          error ? "border-theme" : ""
        } `}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      <ErrorMessage message={error} />
    </div>
  );
};

export default FormField;
