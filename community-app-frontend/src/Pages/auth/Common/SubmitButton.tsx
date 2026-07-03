import React, { ReactNode } from "react";
import CircularArcLoader from "../../../component//CustomCircularLoader";

interface SubmitButtonProps {
  isDisabled?: boolean;
  isLoading?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void; // Added onClick support
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isDisabled = false,
  isLoading = false,
  children,
  className,
  onClick,
}) => {
  return (
    <button
      type="submit"
      className={`w-full bg-theme text-white py-2.5 rounded-lg text-xl hover:bg-theme transition duration-200 font-bold flex items-center justify-center relative ${
        className || ""
      } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
      disabled={isDisabled}
      onClick={onClick}
    >
      {/* Normal Text */}
      <span
        className={`transition-opacity ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        {children}
      </span>

      {/* Loader Show When isLoading is True */}
      {isLoading && (
        <span className="absolute">
          <CircularArcLoader size={30} />
        </span>
      )}
    </button>
  );
};

export default SubmitButton;
