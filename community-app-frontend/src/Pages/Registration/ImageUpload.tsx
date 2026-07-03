import { useTranslation } from "react-i18next";
import { MdCameraAlt, MdOutlineImage } from "react-icons/md";
// import { FormData } from "./Registration";

const ImageUpload = ({
  onChange,
  imageUploadRef,
  handleButtonClick,
  handleCameraOpen,
}: {
  onChange: any;
  imageUploadRef: any;
  handleButtonClick: any;
  handleCameraOpen: any;
}) => {
  const { t } = useTranslation();
  return (
    <div className="p-4 border-2  border-theme rounded-lg flex items-center justify-between">
      <div className="flex cursor-pointer" onClick={handleButtonClick}>
        <p className="text-black font-semibold">
          {t("idproof")}
          <br />
          {t("uploadidprrof")}
        </p>
      </div>
      <span className="flex items-center gap-1">
        <div onClick={handleButtonClick} className="cursor-pointer">
          <MdOutlineImage className="text-theme text-4xl" />
        </div>
        <input
          type="file"
          accept={"image/*"}
          ref={imageUploadRef}
          style={{ display: "none" }}
          defaultValue={undefined}
          onChange={(e: any) => onChange(e)}
        />

        <div className="" onClick={handleCameraOpen}>
          <MdCameraAlt className="text-theme text-4xl" />
        </div>
      </span>
    </div>
  );
};

export default ImageUpload;
