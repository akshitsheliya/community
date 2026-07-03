import { useState } from "react";
import { useTranslation } from "react-i18next";
import api, { authAPI } from "../../Api/api";
import { ApiError } from "../../helper/Types/types";
import { toast } from "react-toastify";

import logo from "../../assets/img/community.png";
import { HiOutlinePhone } from "react-icons/hi";
import CircularArcLoader from "../../component/CustomCircularLoader";
import OtpInputField from "./Common/OtpInputField";
import OtpTimer from "./Common/OtpTimer";
import useOtpTimer from "./Common/useOtpTimer";
import { Notify } from "../../component/Common/Notify";

const DeleteUser = () => {
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [mobileNo, setMobileNo] = useState<boolean>(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [otpInput, setOtpInput] = useState<boolean>(false);
  const [reson, setReson] = useState<any>(null);
  const [errors, setErrors] = useState<any>({ mobile_no: "", otp: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  const { timer, resetTimer, formatTimer } = useOtpTimer(180);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    // Input validation
    if (!mobileNumber.trim()) {
      setErrors({ mobile_no: t("email_placeholder_mobile_number") });
      setLoading(false);
      return;
    } else if (mobileNumber.length != 10) {
      setErrors({ mobile_no: t("Valid_Mobile_no") });
      setLoading(false);
      return;
    }

    try {
      const response: any = await authAPI.post("/login/mobile", {
        phone_number: mobileNumber,
      });

      if (response?.data?.status == 200) {
        setMobileNo(true);
        Notify(response?.data?.message, "success");
        // const otp = response.data?.data?.otp;

        // if (otp) {
        //   toast.success(`Your OTP is: ${otp}`, { autoClose: 5000 });
        //   setMobileNo(true)
        // } else {
        //   toast.error("OTP not received, please try again.");
        // }
      } else {
        setErrors({
          mobile_no:
            response.data.error || response.data.message || t("Login failed"),
        });
        Notify(
          response.error || response.message || t("Login failed"),
          "error"
        );
      }
    } catch (err: unknown) {
      const error: any = err as any;
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        (error instanceof Error ? error.message : "Network error");

      // setErrors({ mobile_no: t(errorMessage) || errorMessage });
      Notify(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/[^0-9]/g, "");
    setMobileNumber(input);

    if (!input.trim()) {
      setErrors({ mobile_no: t("email_placeholder_mobile_number") });
    } else {
      setErrors({ mobile_no: "" });
    }
  };

  const storeToken = (responseData: any) => {
    const token = responseData?.data?.token;

    if (token) {
      localStorage.setItem("authToken", token);
      return true;
    } else {
      console.warn("Token not found in response:", responseData);
      Notify("Token not found in response", "warning");
      return false;
    }
  };

  const handleResendOtp = async (): Promise<void> => {
    resetTimer();
    setErrors({ otp: "" });
    setOtp(Array(6).fill(""));

    try {
      const response: any = await authAPI.post("/login/mobile", {
        phone_number: mobileNumber,
      });

      if (response.status == 200) {
        Notify(response?.data?.message, "success");
        // const otp = response.data?.data.otp;

        // if (otp) {
        //   toast.success(`Your OTP is: ${otp}`, { autoClose: 5000 });
        // } else {
        //   toast.error("OTP not received, please try again.");
        // }
      } else {
        const errorMessage =
          response.data.error ||
          response.data.message ||
          t("error_sending_otp");
        setErrors({ otp: errorMessage });
        toast.error(errorMessage);
      }
    } catch (err: unknown) {
      const error = err as any;
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        t("error_sending_otp");

      setErrors({ otp: t(errorMessage) || errorMessage });
      toast.error(t(errorMessage) || errorMessage);
    }
  };

  const handleSubmitOtp = async (e: any) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    setErrors({ otp: "" });
    if (enteredOtp.length !== 6) {
      setErrors({ otp: t("please_enter_complete_otp") });
      return;
    }
    setLoading(true);
    try {
      const response: any = await api.post("/login/verify-otp", {
        phone_number: mobileNumber,
        otp: enteredOtp,
      });

      if (response.status == 200 && response.data.success) {
        if (response.status == 200) {
          const tokenStored = storeToken(response.data);
          if (tokenStored) {
            setOtpInput(true);
          } else {
            setErrors({ otp: t("login_successful_but_token_missing") });
          }
        } else {
          const errorMessage =
            response.data.error || response.data.message || t("invalid_otp");
          setErrors({ otp: errorMessage });
        }
      }
    } catch (err: unknown) {
      console.error("OTP verification error:", err);
      const error = err as ApiError;
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        t("error_otp_verification");

      setErrors({ otp: t(errorMessage) || errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReson = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response: any = await api.post("/user", {
        reason_for_delete_account: reson,
      });

      if (response) {
        setMobileNo(false);
        setOtpInput(false);
        setErrors({ mobile_no: "", otp: "" });
        setOtp(Array(6).fill(""));
        setMobileNumber("");
        Notify(response?.data?.message, "success");
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-between font-bold overflow-y-hidden">
      <div className="flex flex-col items-center mt-24">
        <div className="flex flex-col items-center mb-2">
          <h1 className="text-3xl text-theme font-bold mt-4">
            {t("title.village_Name")}
          </h1>
          <div className="w-48 h-48 rounded-full flex items-center justify-center">
            <img src={logo} alt="logo" className="w-30 h-30" />
          </div>
        </div>

        <form className="w-full max-w-md px-4" onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <label className="block text-left text-theme font-bold mb-1">
              {t("Delete user mo")}*
            </label>
            <div className="relative">
              <input
                type="tel"
                value={mobileNumber}
                onChange={handleChange}
                placeholder={t("email_placeholder_mobile_number")}
                className={`w-full px-2 pt-3 border-[1.5px] ${
                  errors.mobile_no ? "border-red-500" : "border-black"
                } rounded-md text-sm shadow-md outline-none placeholder-[#788288] text-black`}
                style={{ paddingBottom: errors.mobile_no ? "34px" : "10px" }}
                maxLength={10}
                disabled={mobileNo}
              />
              <HiOutlinePhone className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
              {errors.mobile_no && (
                <span className="absolute left-2 bottom-1 text-red-500 text-xs font-extralight">
                  {errors.mobile_no}
                </span>
              )}
            </div>
          </div>
          {!mobileNo && (
            <button
              type="submit"
              className={`w-full bg-theme text-white py-2.5 rounded-lg text-xl hover:bg-theme transition duration-200 font-bold flex items-center justify-center relative ${
                mobileNumber.length != 10 || loading
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
              disabled={mobileNumber.length != 10 || loading}
            >
              <span
                className={`transition-opacity ${
                  loading ? "opacity-0" : "opacity-100"
                }`}
              >
                {t("submit")}
              </span>

              {loading && (
                <span className="absolute">
                  <CircularArcLoader size={30} />
                </span>
              )}
            </button>
          )}
        </form>

        {/* Otp Input */}
        {mobileNo && mobileNumber?.length == 10 && !otpInput && (
          <form className="w-full max-w-md px-4" onSubmit={handleSubmitOtp}>
            <OtpInputField
              otp={otp}
              setOtp={setOtp}
              errors={errors}
              setErrors={setErrors}
            />
            <OtpTimer
              timer={timer}
              onResendOtp={handleResendOtp}
              formatTimer={formatTimer}
            />

            <button
              type="submit"
              className={`w-full bg-theme text-white py-2.5 rounded-lg text-xl hover:bg-theme transition duration-200 font-bold flex items-center justify-center relative ${
                mobileNumber.length != 10 || loading
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
              disabled={loading}
            >
              <span
                className={`transition-opacity ${
                  loading ? "opacity-0" : "opacity-100"
                }`}
              >
                {t("submit")}
              </span>

              {loading && (
                <span className="absolute">
                  <CircularArcLoader size={30} />
                </span>
              )}
            </button>
          </form>
        )}

        {/* Reson Input */}
        {mobileNo && otpInput && (
          <form className="w-full max-w-md px-4" onSubmit={handleSubmitReson}>
            <div className="bg-white rounded-xl">
              <label className="font-medium tracking-wide text-md">
                {"Reason"}
              </label>
              <textarea
                id="simple-search"
                rows={2}
                className="flex items-center border border-[#D9D9D9] w-full rounded-lg p-3 my-3"
                placeholder={"Reason"}
                value={reson}
                onChange={(e) => setReson(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className={`w-full bg-theme text-white py-2.5 rounded-lg text-xl hover:bg-theme transition duration-200 font-bold flex items-center justify-center relative ${
                mobileNumber.length != 10 || loading
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
              disabled={loading}
            >
              <span
                className={`transition-opacity ${
                  loading ? "opacity-0" : "opacity-100"
                }`}
              >
                {t("submit")}
              </span>

              {loading && (
                <span className="absolute">
                  <CircularArcLoader size={30} />
                </span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DeleteUser;
