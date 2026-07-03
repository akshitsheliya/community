import React, {
  ChangeEvent,
  KeyboardEvent,
  ClipboardEvent,
  useEffect,
} from "react";
import { useTranslation } from "react-i18next";

interface OtpInputFieldProps {
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
  errors: { otp: string };
  setErrors: React.Dispatch<React.SetStateAction<{ otp: string }>>;
}

const OtpInputField: React.FC<OtpInputFieldProps> = ({
  otp,
  setOtp,
  errors,
  setErrors,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    document.getElementById("otp-0")?.focus();
  }, []);

  // Handle OTP change in each input field
  const handleOtpChange = (value: string, index: number): void => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setErrors({ otp: "" }); // Clear errors when user types

      // Focus on next input if the current input is filled
      if (value && index < otp.length - 1) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  // Handle backspace key
  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    index: number
  ): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // Handle paste event
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pastedValue = e.clipboardData.getData("text").trim();
    if (/^\d{1,6}$/.test(pastedValue)) {
      const otpArray = pastedValue.split("");
      const newOtp = [...otp];
      otpArray.forEach((digit, i) => {
        if (i < otp.length) {
          newOtp[i] = digit;
        }
      });
      setOtp(newOtp);
      setErrors({ otp: "" }); // Clear errors when user pastes

      document
        .getElementById(`otp-${Math.min(otpArray.length, otp.length - 1)}`)
        ?.focus();
    }
  };

  return (
    <>
      <label className="block text-left text-theme font-bold mb-1">
        {t("otp_label")}
      </label>
      <div className="flex justify-between mb-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleOtpChange(e.target.value, index)
            }
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
              handleKeyDown(e, index)
            }
            onPaste={(e: ClipboardEvent<HTMLInputElement>) => handlePaste(e)}
            autoComplete="off"
            title={`OTP digit ${index + 1}`}
            className={`w-12 h-12 text-center text-lg border-[1.5px] ${
              errors.otp ? "border-red-500" : "border-black"
            } rounded-md shadow-md outline-none placeholder-[#788288] text-black`}
          />
        ))}
      </div>
      {errors.otp && (
        <span className="text-red-500 text-xs font-extralight block">
          {errors.otp}
        </span>
      )}
    </>
  );
};

export default OtpInputField;
