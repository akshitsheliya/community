import { useState } from "react";
import logo from "../../../assets/img/community.png";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HiOutlinePhone } from "react-icons/hi";
import Header from "../../Components/Common/Header";
import Footer from "../../Components/Common/Footer";

const AdminLogin = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [errors, setErrors] = useState({ mobile_no: "" });
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { mobile_no: "" };

    if (!mobileNumber.trim()) {
      newErrors.mobile_no = t("error.mobile");
    } else if (mobileNumber.length !== 10) {
      newErrors.mobile_no = t("error.validmobile");
    }

    setErrors(newErrors);

    if (!newErrors.mobile_no) {
      navigate("/admin/otp");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/[^0-9]/g, "");
    setMobileNumber(input);

    if (input.length === 10) {
      setErrors({ mobile_no: "" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-between font-bold overflow-y-hidden">
      <Header />
      <div className="flex flex-col items-center ">
        <h1 className="text-3xl text-theme font-bold mt-4">
          {t("adminTitle.villageName")}
        </h1>

        <div className="flex flex-col items-center mb-2">
          <div className="w-48 h-48 rounded-full flex items-center justify-center">
            <img src={logo} alt="logo" className="w-30 h-30" />
          </div>
        </div>

        <div>
          <h1 className="text-xl text-theme font-bold mt-1">
            {t("loginasadmin")}
          </h1>
        </div>
        <form className="w-full max-w-md px-4" onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <label className="block text-left text-theme font-bold mb-1">
              {t("label.mobile")}
            </label>

            <div className="relative">
              <input
                type="tel"
                value={mobileNumber}
                onChange={handleChange}
                placeholder={t("placeholder.enterNumber")}
                className={`w-full px-2 pt-3 border-[1.5px] ${
                  errors.mobile_no ? "border-red-500" : "border-black"
                } rounded-md text-sm shadow-md outline-none placeholder-[#788288] text-black ${
                  errors.mobile_no ? "pb-9" : "pb-2.5"
                }`}
                maxLength={10}
              />
              <HiOutlinePhone className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />

              {errors.mobile_no && (
                <span className="absolute left-2 bottom-1 text-red-500 text-xs font-extralight">
                  {errors.mobile_no}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-themetext-white py-2.5 rounded-lg text-xl hover:bg-theme transition duration-200 font-bold"
          >
            {t("button.submit")}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLogin;
