import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../component/Common/Header";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import { Progress } from "antd"; // Import Progress from Ant Design
import {
  marksheetGet,
  marksheetdelete,
  processMarksheet,
} from "../../Api/Marksheet";
import { Notify } from "../../component/Common/Notify";
import DeleteConfirmationPopup from "./DeleteConfirmationPopup"; // Import the new popup component

const MarksheetUpload = () => {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const navigate = useNavigate();
  const { t } = useTranslation();
  let details = navigator.userAgent.toLowerCase();
  let isIphone = /iphone/.test(details);
  let isAndroid = /android/.test(details);

  const [isZoomed, setIsZoomed] = useState<string | null>(null);
  const [marksheets, setMarksheets] = useState<any[]>([]);
  const [showDeletePopup, setShowDeletePopup] = useState<boolean>(false);
  const [marksheetToDelete, setMarksheetToDelete] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchMarksheets = async () => {
      try {
        const response = await marksheetGet();
        if (response.success) {
          setMarksheets(response.data); // Set marksheet data from API response
        } else {
          console.error("Failed to fetch marksheet data");
        }
      } catch (error) {
        console.error("❌ Error fetching marksheets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarksheets();
  }, []);

  const convertBase64ToFile = (base64String: any, fileName: any) => {
    const base64 = base64String.split(",").pop();
    const sanitizedBase64 = base64.replace(/[^A-Za-z0-9+/=]/g, "");
    const byteString = atob(sanitizedBase64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: "image/*" });
    const file = new File([blob], fileName, { type: "image/*" });
    return file;
  };

  useEffect(() => {
    const handleImageData = async (event: any) => {
      const data: any = event.detail;

      if (data?.name && data?.bytes) {
        const file = convertBase64ToFile(data?.bytes, data?.name);
        const fileExtension = file.name.split(".").pop();
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;
        const fileUrl = `${uniqueFileName}`;
        handleFileProcessing(fileUrl, file);
      }
    };

    window.addEventListener("getImage", handleImageData);

    return () => {
      window.removeEventListener("getImage", handleImageData);
    };
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: any) => {
    if (event.target.files?.[0]) {
      const selectedFile = event.target.files[0];
      const fileExtension = selectedFile.name.split(".").pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const fileUrl = `${uniqueFileName}`;
      handleFileProcessing(fileUrl, selectedFile);
    }
  };

  const handleFileProcessing = async (_fileUrl: string, selectedFile: File) => {
    setError(null);
    setLoading(true);
    setUploadProgress(0); // Reset progress at start

    Notify("Please Wait, Marksheet is Uploading...", "info");

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          // Only update progress if less than 90%
          // We'll set it to 100% when the upload is actually complete
          if (prev < 90) {
            return prev + 10;
          }
          return prev;
        });
      }, 500);

      // Modified to wrap the processMarksheet call
      const response = await processMarksheet(selectedFile, "marksheet");

      // Clear the interval once upload is done
      clearInterval(progressInterval);
      setUploadProgress(100); // Set to 100% when complete

      if (response) {
        console.log("API Response:", response);

        // Extract the image URL from the response - handle both possible formats
        const imageUrl =
          response?.marksheetUrl ||
          (response?.data && response.data.marksheetUrl) ||
          null;

        // Prepare extracted data from the response
        const extractedData = response?.extractedData || response?.data || {};

        // Add the image URL to the data for display in the list
        const newMarksheet = {
          marksheet_uuid: uuidv4(),
          id: Date.now(),
          image: imageUrl,
          data: extractedData,
        };

        console.log("New marksheet object:", newMarksheet);
        setMarksheets((prev: any) => [newMarksheet, ...prev]);

        // Navigate with the correct data
        navigate("/marksheet-details", {
          state: {
            imageUrl: imageUrl,
            marksheetData: {
              ...extractedData,
              marksheetUrl: imageUrl,
            },
          },
        });
      } else {
        setError("No data extracted from marksheet.");
      }
    } catch (error: any) {
      setError("Failed to process marksheet. Try again.");
      console.error("Error processing marksheet:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCameraOpen = () => {
    // @ts-ignore
    window?.flutter_inappwebview?.callHandler("openCamera");
  };

  // Updated to show confirmation popup instead of deleting immediately
  const handleDelete = (marksheet_uuid: string) => {
    setMarksheetToDelete(marksheet_uuid);
    setShowDeletePopup(true);
  };

  // Actual deletion happens here after confirmation
  const confirmDelete = async () => {
    if (!marksheetToDelete) {
      return;
    }

    try {
      await marksheetdelete(marksheetToDelete);
      Notify("Marksheet deleted successfully", "success");
      setMarksheets((prevMarksheets: any) =>
        prevMarksheets.filter(
          (m: any) => m.marksheet_uuid !== marksheetToDelete
        )
      );
    } catch (error) {
      console.error("❌ Delete Error:", error);
      Notify("Failed to delete marksheet", "error");
    } finally {
      setShowDeletePopup(false);
      setMarksheetToDelete(null);
    }
  };

  const closeDeletePopup = () => {
    setShowDeletePopup(false);
    setMarksheetToDelete(null);
  };

  // Handle image zoom
  const handleImageClick = (imageUrl: string) => {
    setIsZoomed(imageUrl);
  };

  return (
    <>
      <Header title={t("marksheet.title")} className="z-50" showBackArrow />

      <div className="min-h-[calc(100vh-70px)] bg-gray-100 flex flex-col items-center w-full">
        <div className="max-w-3xl w-full h-full bg-white shadow-md rounded-lg p-4 items-start">
          <h2 className="text-xl font-bold text-gray-700 text-center">
            {t("marksheet.uploadInstructions")}
          </h2>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
            <ul className="text-gray-600 text-sm list-disc pl-5">
              <li>{t("marksheet.clear_and_visible")}</li>
              <li>{t("marksheet.readable_info")}</li>
              <li>{t("marksheet.no_folded_marksheet")}</li>
              <li>{t("marksheet.good_lighting")}</li>
            </ul>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="flex flex-col w-full items-center justify-center mt-4">
            <button
              onClick={() =>
                isAndroid || isIphone ? handleCameraOpen() : handleUploadClick()
              }
              disabled={loading}
              className="bg-theme hover:bg-theme flex items-center justify-center text-white w-64 font-semibold py-2 px-4 rounded-lg shadow-md transition"
            >
              {loading ? t("Uploading…") : t("marksheet.upload_marksheet")}
            </button>

            {/* Add Ant Design Progress bar */}
            {loading && (
              <div className="w-64 mt-4">
                <Progress
                  percent={uploadProgress}
                  status={uploadProgress === 100 ? "success" : "active"}
                  strokeColor={{
                    "0%": "#108ee9",
                    "100%": "#87d068",
                  }}
                />
                <p className="text-center text-sm text-gray-600 mt-1">
                  {uploadProgress}% Complete
                </p>
              </div>
            )}
          </div>

          {error && <p className="text-red-500 mt-2 text-center">{error}</p>}

          <div className=" mt-6">
            <h2 className="text-2xl font-bold mb-4 text-center">
              {t("marksheet.your_marksheet_status")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {marksheets.length > 0 ? (
                marksheets.map((marksheet: any) => (
                  <div
                    key={marksheet.marksheet_uuid || marksheet.id}
                    className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 flex flex-col "
                  >
                    {/* Add the image display here */}
                    {marksheet.image && (
                      <div
                        className="cursor-pointer h-48 overflow-hidden"
                        onClick={() => handleImageClick(marksheet.image)}
                      >
                        <img
                          src={marksheet.image}
                          alt="Marksheet"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg mb-1 truncate">
                          {marksheet.student_name || "N/A"}
                        </h3>
                        <div className="text-sm text-gray-600">
                          <p>
                            <strong>Standard:</strong>{" "}
                            {marksheet.standard || "N/A"}
                          </p>
                          <p>
                            {marksheet.stream ? (
                              <>
                                <strong>Stream:</strong> {marksheet.stream}
                              </>
                            ) : null}
                          </p>
                          <p>
                            <strong>Medium:</strong> {marksheet.medium || "N/A"}
                          </p>
                          <p>
                            <strong>Year:</strong>{" "}
                            {marksheet.marksheet_year || "N/A"}
                          </p>
                          <p>
                            <strong>Percentage:</strong>{" "}
                            {marksheet.percentage || "N/A"}
                          </p>
                          <p>
                            <strong>Status: </strong>
                            {marksheet.is_approved === 1 ? (
                              <span className="text-green-600 font-bold">
                                Approved
                              </span>
                            ) : marksheet.is_approved === 0 &&
                              marksheet.rejection_reason ? (
                              <span className="text-red-600 font-bold">
                                Rejected
                              </span>
                            ) : (
                              <span className="text-yellow-600 font-bold">
                                Pending
                              </span>
                            )}
                          </p>
                          {marksheet.is_approved === 0 &&
                            marksheet.rejection_reason && (
                              <p className="text-red-500 mt-1">
                                <strong>Reason: </strong>
                                {marksheet.rejection_reason}
                              </p>
                            )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(marksheet.marksheet_uuid)}
                        className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center col-span-full">
                  {t("marksheet.marksheets_available")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isZoomed && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-5">
          <div className="relative">
            <button
              className="absolute top-2 right-2 w-10 bg-gray-700 text-white p-2 rounded-full"
              onClick={() => setIsZoomed(null)}
            >
              ✕
            </button>
            <img
              src={isZoomed}
              alt="Zoomed Marksheet"
              className="max-w-full max-h-screen rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <DeleteConfirmationPopup
          onClose={closeDeletePopup}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
};

export default MarksheetUpload;
