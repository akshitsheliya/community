import { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import logo from "../../../assets/img/community.png";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../../Components/Common/Header";
import Footer from "../../Components/Common/Footer";

const AdminOtp: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [errors, setErrors] = useState<{ otp: string }>({ otp: "" });
  const [timer, setTimer] = useState<number>(60);

  const correctOtp = "123456";

  useEffect(() => {
    let countdown: ReturnType<typeof setTimeout> | undefined;
    if (timer > 0) {
      countdown = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => {
      if (countdown) {
        clearTimeout(countdown);
      }
    };
  }, [timer]);

  const formatTimer = (): string => {
    const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
    const seconds = String(timer % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleOtpChange = (value: string, index: number): void => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    index: number
  ): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = (): void => {
    const enteredOtp = otp.join("");
    const newErrors = { otp: "" };

    if (otp.some((digit) => !digit)) {
      newErrors.otp = t("error.otperror");
    } else if (enteredOtp !== correctOtp) {
      newErrors.otp = t("error.invalidotp");
    }

    setErrors(newErrors);

    if (!newErrors.otp) {
      navigate("/admin/dashboard");
    }
  };

  const handleResendOtp = (): void => {
    setTimer(60);
    setOtp(Array(6).fill(""));
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-between font-bold overflow-y-hidden">
      <Header />
      <div className="flex flex-col items-center">
        <h1 className="text-3xl text-theme font-bold mt-4">
          {t("adminTitle.villageName")}
        </h1>

        <div className="flex flex-col items-center mb-2">
          <div className="w-48 h-48 rounded-full flex items-center justify-center">
            <img src={logo} alt="logo" className="w-30 h-30" />
          </div>
        </div>

        <form
          className="w-full max-w-md px-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <h1 className="text-xl text-theme font-bold mt-1 text-center">
              {t("varification")}
            </h1>
          </div>
          <label className="block text-left text-theme font-bold mb-1">
            {t("label.otp")} {/* OTP label text dynamically */}
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
                title={`OTP digit ${index + 1}`}
                placeholder="0"
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

          {timer > 0 ? (
            <p className="text-right text-[#9ea3ae] text-sm mb-2 font-semibold">
              {t("label.notreceive")}{" "}
              <span className="font-bold text-black">{formatTimer()}</span>
            </p>
          ) : (
            <p
              className="text-right text-theme text-lg mb-2 cursor-pointer font-bold"
              onClick={handleResendOtp}
            >
              {t("label.notreceive")}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-theme text-white py-2.5 rounded-lg text-xl hover:bg-theme transition duration-200 font-bold"
          >
            {t("button.login")}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default AdminOtp;
