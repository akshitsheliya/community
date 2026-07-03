import { useTranslation } from "react-i18next";
import OtpInputField from "./OtpInputField";
import OtpTimer from "./OtpTimer";
// import CustomLoader from "../../../component/CustomLoader";
import SubmitButton from "./SubmitButton";

interface OtpVerificationFormProps {
  onSubmit: () => Promise<void>;
  onResendOtp: () => Promise<void>;
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
  errors: { otp: string };
  setErrors: React.Dispatch<React.SetStateAction<{ otp: string }>>;
  timer: number;
  loading?: boolean;
  formatTimer?: (timer: number) => string;
}

const OtpVerificationForm: React.FC<OtpVerificationFormProps> = ({
  onSubmit,
  onResendOtp,
  otp,
  setOtp,
  errors,
  setErrors,
  timer,
  loading = false,
  formatTimer,
}) => {
  const { t } = useTranslation();

  return (
    <form className="w-full max-w-md px-4" onSubmit={(e) => e.preventDefault()}>
      <OtpInputField
        otp={otp}
        setOtp={setOtp}
        errors={errors}
        setErrors={setErrors}
      />
      <OtpTimer
        timer={timer}
        onResendOtp={onResendOtp}
        formatTimer={formatTimer}
      />
      <SubmitButton isDisabled={loading} isLoading={loading} onClick={onSubmit}>
        {t("submit")}
      </SubmitButton>
    </form>
  );
};

export default OtpVerificationForm;
