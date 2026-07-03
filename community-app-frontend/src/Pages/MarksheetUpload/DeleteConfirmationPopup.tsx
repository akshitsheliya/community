import React from "react";
import { useTranslation } from "react-i18next";

interface DeleteConfirmationPopupProps {
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationPopup: React.FC<DeleteConfirmationPopupProps> = ({
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000]"
      onClick={onClose} // Click outside to close
    >
      <div
        className="bg-white w-80 rounded-2xl shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Stop propagation to prevent closing when clicking inside
      >
        {/* Header */}
        <div className="bg-theme p-4 text-white text-lg font-bold text-center">
          {t("Delete Marksheet")}
        </div>

        {/* Delete Confirmation */}
        <div className="pt-8 pb-4">
          <p className="mb-4 flex justify-center  w-full text-center">
            {t("Are you sure you want to delete this marksheet?")}
          </p>
          <div className="flex justify-center space-x-10">
            <button
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded"
              onClick={onClose}
            >
              {t("cancel")}
            </button>
            <button
              className="bg-theme text-white px-9 py-2 rounded"
              onClick={onConfirm}
            >
              {t("ok")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationPopup;
