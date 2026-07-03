import React from "react";
import { useTranslation } from "react-i18next";

interface OtpTimerProps {
  timer: number;
  onResendOtp: () => Promise<void>;
  formatTimer?: (timer: number) => string;
}

const OtpTimer: React.FC<OtpTimerProps> = ({
  timer,
  onResendOtp,
  formatTimer,
}) => {
  const { t } = useTranslation();

  const displayTime = formatTimer ? formatTimer(timer) : timer.toString();

  return timer > 0 ? (
    <p className="text-right text-[#9ea3ae] text-sm mb-2 font-semibold">
      {t("didnt_receive")}{" "}
      <span className="font-bold text-black">{displayTime}</span>
    </p>
  ) : (
    <p
      className="text-right text-theme text-lg mb-2 cursor-pointer font-bold"
      onClick={onResendOtp}
    >
      {t("resend_otp")}
    </p>
  );
};

export default OtpTimer;
