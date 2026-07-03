import { InputFieldType } from "../../helper/Types/types";

const InputField = (props: InputFieldType) => {
  const {
    className,
    value,
    onChange,
    isRequired = false,
    readOnly = false,
    placeholder,
    name,
    label,
    icon,
    type = "text",
    labelClassName,
    errorMsg,
    disabled,
    EgClassName = false,
    min,
    max,
    onKeyDown,
  } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "number") {
      const inputValue = e.target.value;
      if (inputValue === "") {
        onChange(e);
        return;
      }
      const numValue = parseFloat(inputValue);
      if (
        !isNaN(numValue) &&
        (min === undefined || numValue >= min) &&
        (max === undefined || numValue <= max)
      ) {
        if (Number.isInteger(numValue)) {
          onChange(e);
        }
      } else {
        e.preventDefault();
        return;
      }
    } else {
      onChange(e);
    }
  };
  const handleKeyDown = (e: any) => {
    if (type === "number") {
      if (["e", "E", "+", "-", "."].includes(e.key)) {
        e.preventDefault();
      }
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div>
      <label className={`block text-theme font-bold mb-1 ${labelClassName}`}>
        {label}
        <span className={`block text-theme mb-1 font-light ${EgClassName}`}>
          {" "}
          {EgClassName}
        </span>
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          required={isRequired}
          disabled={disabled}
          min={min}
          max={max}
          className={`w-full p-2.5 border-[1.5px] rounded-md text-sm shadow-md outline-none placeholder-[#788288] text-black md:text-base ${!errorMsg ? "border-black" : "border-red-500"
            } ${className}`}
        />
        {!!icon && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme cursor-pointer">
            {icon}
          </span>
        )}
      </div>
      {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
    </div>
  );
};

export default InputField;