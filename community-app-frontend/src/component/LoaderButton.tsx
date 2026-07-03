import React from "react";
import CustomCircularLoader from "./CustomCircularLoader";

interface LoaderButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  buttonText: string;
}

const LoaderButton: React.FC<LoaderButtonProps> = ({
  isLoading,
  buttonText,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={isLoading}
      className={`w-[150px] h-[40px] bg-theme text-white font-semibold py-2 px-4 rounded-lg shadow-md transition flex items-center justify-center relative ${
        props.className || ""
      }`}
    >
      <span
        className={`transition-opacity ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        {buttonText}
      </span>
      {isLoading && (
        <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <CustomCircularLoader size={30} />
        </span>
      )}
    </button>
  );
};

export default LoaderButton;
