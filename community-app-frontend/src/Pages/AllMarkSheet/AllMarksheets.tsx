import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Header from "../../component/Common/Header";
import DropDown from "../../component/Common/DropDown";
import CircularArcLoader from "../../component/CustomCircularLoader";
import {
  standardOptions,
  streamOptions,
  mediumOptions,
  yearOptions,
  AppReject,
} from "../../utils/Constant/constants";
import { OptionType } from "../../helper/Types/types";
import { allMarksheet } from "../../Api/allMarkSheet";

const marksheets = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    }
  }, []);

  const [filters, setFilters] = useState<{
    selectedStandard: OptionType | null;
    selectedStream: OptionType | null;
    selectedMedium: OptionType | null;
    selectedYear: OptionType | null;
    selectedMarkshet: OptionType | null;
  }>({
    selectedStandard: null,
    selectedStream: null,
    selectedMedium: null,
    selectedYear: null,
    selectedMarkshet: AppReject[0],
  });

  const [marksheetData, setMarksheetData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleChange = (key: string, value: OptionType | null) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "selectedStandard" &&
      value?.value !== "11" &&
      value?.value !== "12"
        ? { selectedStream: null }
        : {}),
    }));
  };

  useEffect(() => {
    const fetchMarksheetData = async () => {
      setLoading(true);
      setError(null);
      try {
        const filtersToApply: Record<string, any> = {};

        if (filters.selectedStandard) {
          filtersToApply.standard = filters.selectedStandard.value;
        }
        if (filters.selectedStream) {
          filtersToApply.stream = filters.selectedStream.value;
        }
        if (filters.selectedMedium) {
          filtersToApply.medium = filters.selectedMedium.value;
        }
        if (filters.selectedYear) {
          filtersToApply.marksheet_year = filters.selectedYear.value;
        }
        if (filters.selectedMarkshet && filters.selectedMarkshet.value !== "") {
          filtersToApply.is_approved = filters.selectedMarkshet.value;
        }

        const response = await allMarksheet(filtersToApply);
        setMarksheetData(response?.data);
      } catch (err: any) {
        console.error("Error fetching marksheet data:", err);

        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          setError("Your session has expired. Redirecting to login...");
          setTimeout(() => {
            localStorage.clear();
            navigate("/login");
          }, 1500);
        } else {
          setError("Failed to load marksheet data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMarksheetData();
  }, [filters]);
  const isMarksheetRejected = (marksheet: any) => {
    return marksheet.is_approved === 0 && marksheet.rejection_reason !== null;
  };

  const filteredMarksheets = marksheetData?.filter((marksheet: any) => {
    if (filters.selectedMarkshet) {
      if (filters.selectedMarkshet.value === "1") {
        if (marksheet.is_approved !== 1) return false;
      } else if (filters.selectedMarkshet.value === "0") {
        if (!isMarksheetRejected(marksheet)) return false;
      } else if (filters.selectedMarkshet.value === "2") {
        if (marksheet.is_approved === 1 || isMarksheetRejected(marksheet))
          return false;
      }
    }

    return (
      (!filters.selectedStandard ||
        marksheet.standard == filters.selectedStandard.value) &&
      (!filters.selectedStream ||
        marksheet.stream == filters.selectedStream.value) &&
      (!filters.selectedMedium ||
        marksheet.medium == filters.selectedMedium.value) &&
      (!filters.selectedYear ||
        marksheet.marksheet_year == filters.selectedYear.value)
    );
  });

  const handleViewMarksheet = (marksheets: any) => {
    navigate(`/update-all-marksheet/${marksheets?.marksheet_uuid}`, {
      state: { marksheets },
    });
  };

  // const handlePreviewImage = (imageUrl: string) => {
  //   setPreviewImage(imageUrl);
  // };

  const getStatusLabel = (marksheet: any) => {
    if (marksheet.is_approved === 1) {
      return <span className="text-green-600 font-bold">Approved</span>;
    } else if (isMarksheetRejected(marksheet)) {
      return <span className="text-red-600 font-bold">Rejected</span>;
    } else {
      return <span className="text-yellow-600 font-bold">Pending</span>;
    }
  };

  return (
    <>
      <Header title={t("ReceivedMarksheets")} showBackArrow />

      <div className="p-4 ">
        <div className="flex sm:flex-nowrap flex-wrap gap-4 mb-6">
          <div className="w-full md:w-1/4">
            <DropDown
              label={t("marksheet.standard")}
              options={standardOptions}
              value={filters.selectedStandard}
              onChange={(option) => handleChange("selectedStandard", option)}
              placeholder={t("marksheetDetails.selectstanderd")}
            />
          </div>

          {filters.selectedStandard?.value == "11" ||
          filters.selectedStandard?.value == "12" ? (
            <div className="w-full md:w-1/4">
              <DropDown
                label={t("marksheet.stream")}
                options={streamOptions}
                value={filters.selectedStream}
                onChange={(option) => handleChange("selectedStream", option)}
                  placeholder={t("marksheetDetails.SelectStream")}
              />
            </div>
          ) : null}

          <div className="w-full md:w-1/4">
            <DropDown
              label={t("placeholders.Medium")}
              options={mediumOptions}
              value={filters.selectedMedium}
              onChange={(option) => handleChange("selectedMedium", option)}
              placeholder={t("marksheetDetails.SelectMedium")}
            />
          </div>

          <div className="w-full md:w-1/4">
            <DropDown
              label={t("donors.year")}
              options={yearOptions}
              value={filters.selectedYear}
              onChange={(option) => handleChange("selectedYear", option)}
              placeholder={t("marksheetDetails.SelectYear")}
            />
          </div>

          <div className="w-full md:w-1/4">
            <DropDown
              label={t("FindMarksheet")}
              options={AppReject}
              value={filters.selectedMarkshet}
              onChange={(option) => handleChange("selectedMarkshet", option)}
              placeholder={t("marksheetDetails.Findmarksheet")}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <CircularArcLoader size={60} color="brown" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMarksheets?.length > 0 ? (
              filteredMarksheets?.map((marksheet: any, index: number) => (
                <div
                  key={index}
                  className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200"
                >
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">
                      {marksheet.student_name}
                    </h3>
                    <div className="text-sm text-gray-600">
                      <p>Standard: {marksheet.standard}</p>
                      {marksheet.stream && <p>Stream: {marksheet.stream}</p>}
                      <p>Medium: {marksheet.medium}</p>
                      <p>Year: {marksheet.marksheet_year}</p>
                      {marksheet.percentage && (
                        <p>Percentage: {marksheet.percentage}%</p>
                      )}
                      <p className="mt-1">
                        <strong>Status: </strong>
                        {getStatusLabel(marksheet)}
                      </p>
                      {marksheet.is_approved === 1 && (
                        <p className="mt-1">
                          <strong>Approved by: </strong>
                          {marksheet.approved_by_name ||
                            marksheet.approved_by_user_id ||
                            "N/A"}
                        </p>
                      )}
                      {isMarksheetRejected(marksheet) && (
                        <p className="mt-1">
                          <strong>Rejected by: </strong>
                          {marksheet.approved_by_name ||
                            marksheet.approved_by_user_id ||
                            "N/A"}
                        </p>
                      )}
                      {isMarksheetRejected(marksheet) && (
                        <p className="text-red-500 mt-1">
                          <strong>Reason: </strong>
                          {marksheet.rejection_reason}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleViewMarksheet(marksheet)}
                      className="mt-3 w-full bg-theme hover:bg-admin text-white py-2 px-4 rounded-md"
                    >
                      View Marksheet
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">
                {marksheetData?.length > 0
                      ? t("marksheet.marksheet_status")
                      : t("marksheet.marksheets_available")}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-5">
          <div className="relative">
            <button
              className="absolute top-2 right-2 w-10 h-10 bg-gray-700 text-white p-2 rounded-full"
              onClick={() => setPreviewImage(null)}
            >
              ✕
            </button>
            <img
              src={previewImage}
              alt="Marksheet Preview"
              className="max-w-full max-h-screen rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default marksheets;
