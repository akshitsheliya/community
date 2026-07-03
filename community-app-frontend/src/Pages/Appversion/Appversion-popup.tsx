import { useTranslation } from "react-i18next";

interface AppUpdatePopupProps {
  onClose: () => void;
  onConfirm: () => void;
  forceUpdate: boolean;
}

const AppUpdatePopup = ({
  onClose,
  onConfirm,
  forceUpdate,
}: AppUpdatePopupProps) => {
  const { t } = useTranslation();
  const handleUpdateClick = () => {
    if (window?.flutter_inappwebview?.callHandler) {
      try {
        window.flutter_inappwebview.callHandler("openConfirm");
      } catch (error) {
        console.error("Error calling Flutter handler:", error);
        onConfirm();
      }
    } else {
      onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000]"
      onClick={forceUpdate ? undefined : onClose}
    >
      <div
        className="bg-white w-80 rounded-2xl shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-8 pb-4 px-4 text-center">
          <p className="mb-4 font-semibold text-lg">Update</p>
          <p className="text-sm text-gray-600 mb-6">
            A new version of the app is available. Please update to continue.
          </p>
          <div className="flex justify-center space-x-6">
            {!forceUpdate && (
              <button
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded"
                onClick={onClose}
              >
                {t("cancel")}
              </button>
            )}
            <button
              className="bg-theme text-white px-6 py-2 rounded"
              onClick={handleUpdateClick}
            >
              {t("update")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppUpdatePopup;