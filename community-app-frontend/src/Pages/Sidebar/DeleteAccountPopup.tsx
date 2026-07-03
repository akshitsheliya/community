import React, { useState } from "react";
import deleteUserAccount from "../../Api/delete-account-users";
import { useTranslation } from "react-i18next";
interface DeleteAccountPopupProps {
  onClose: () => void;
  onConfirm: () => void;
}


const DeleteAccountPopup: React.FC<DeleteAccountPopupProps> = ({
  onClose,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const handleDeleteAccount = async () => {
    setLoading(true);
    setError(null);

    try {
      await deleteUserAccount();
      onConfirm();
    } catch (err) {
      setError("Failed to delete account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000]"
      onClick={onClose}
    >
      <div
        className="bg-white w-80 rounded-2xl shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-red-600 p-4 text-white text-lg font-bold text-center">
          {t("DeleteAccount")}
        </div>

        {/* Confirmation Message */}
        <div className="pt-6 pb-4 px-4 text-center">
          <p className="mb-4 text-gray-700">
            {t("DeleteNote")}.
          </p>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Buttons */}
          <div className="flex justify-center space-x-4 mt-4">
            <button
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded"
              onClick={onClose}
              disabled={loading}
            >
              {t("cancel")}
            </button>
            <button
              className={`px-6 py-2 rounded text-white ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600"
              }`}
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              {loading ? "Deleting..." : t("delete")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountPopup;
