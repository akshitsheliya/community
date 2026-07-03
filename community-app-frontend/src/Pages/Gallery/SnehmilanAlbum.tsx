import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CiCalendarDate } from "react-icons/ci";
import Header from "../../component/Common/Header";
import DropDown from "../../component/Common/DropDown";
import { Year } from "../../utils/Constant/constants";
import api from "../../Api/api";
import SubmitButton from "../../Pages/auth/Common/SubmitButton";
import { Notify } from "../../component/Common/Notify";

const SnehmilanAlbum = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [year, setYear] = useState<{ label: string; value: string } | null>(
    null
  );
  const [albumName, setAlbumName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAlbum = async () => {
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("token");

    if (!token) {
      Notify("You are not logged in. Please log in again.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(
        "/albums",
        {
          photo_album_name: albumName,
          photo_album_year: year?.value,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      navigate("/photos", { state: { newAlbum: response.data } });
    } catch (error: any) {
      console.error(
        "Failed to create album:",
        error.response?.data || error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header showBackArrow={true} title={t("Album.Album")} />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center overflow-hidden w-full">
        <div className="flex flex-col items-center w-full max-w-md pt-10 px-4">
          <input
            type="text"
            placeholder={t("Album.EnterAlbumName")}
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-theme"
          />

          <DropDown
            placeholder={t("Album.selectYear")}
            options={Year}
            value={year}
            onChange={(option) => setYear(option)}
            icon={<CiCalendarDate />}
            className="mt-4"
          />

          <SubmitButton
            isLoading={isLoading}
            isDisabled={isLoading || !albumName || !year}
            onClick={handleCreateAlbum}
            className="mt-6"
          >
            {t("Album.CreateAlbum")}
          </SubmitButton>
        </div>
      </div>
    </>
  );
};

export default SnehmilanAlbum;
