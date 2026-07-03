import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SingleValue } from "react-select";
import { useTranslation } from "react-i18next";
import { Image } from "antd";
import Header from "../component/Common/Header";
import DropDown from "../component/Common/DropDown";
import { GetAwardStudents } from "../Api/AwardStudents";
import { mediumOptions, streamOptions } from "../utils/Constant/constants";
import { Student } from "../helper/Types/types";
import CircularArcLoader from "../../src/component/CustomCircularLoader";
import api from "../Api/api";

const AwardStudents = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const isAdmin = userData.is_community_admin === 1;
  const [formData, setFormData] = useState<{
    year: SingleValue<{ label: string; value: string }> | null;
    standard: SingleValue<{
      label: string;
      value: string;
      name?: string;
    }> | null;
    medium: SingleValue<{ label: string; value: string }> | null;
    stream: SingleValue<{ label: string; value: string }> | null;
  }>({
    year: null,
    standard: null,
    medium: null,
    stream: null,
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [yearOptions, setYearOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [standardOptions, setStandardOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [filteredYearOptions, setFilteredYearOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);

  const shouldShowStream =
    formData.standard?.value === "11" || formData.standard?.value === "12";
  useEffect(() => {
    const fetchCountsData = async () => {
      try {
        const response = await api.get("/counts");
        if (response.data.success) {
          const activeStandards = response.data.data.activeStandards;
          const years = activeStandards.map((item: { year: string }) => ({
            label: item.year,
            value: item.year,
          }));
          setYearOptions(years);
          setFilteredYearOptions(years);
          if (activeStandards.length > 0) {
            const standards = activeStandards[0].standards
              .split(",")
              .map((standard: string) => ({
                label: standard,
                value: standard,
              }));
            setStandardOptions(standards);
          }
        }
      } catch (err) {
        console.error("Error fetching counts data:", err);
      }
    };

    fetchCountsData();
  }, []);

  const handleChange = (
    field: string,
    value: SingleValue<{ label: string; value: string; name?: string }>
  ) => {
    if (field === "standard") {
      const standardValue = value?.value;

      if (standardValue === "10" || standardValue === "12") {
        const filtered = yearOptions.filter((year) => year.value === "2024");
        setFilteredYearOptions(filtered.length > 0 ? filtered : yearOptions);
      } else if (
        standardValue === "1" ||
        standardValue === "2" ||
        standardValue === "3" ||
        standardValue === "4" ||
        standardValue === "5" ||
        standardValue === "6" ||
        standardValue === "7" ||
        standardValue === "8" ||
        standardValue === "9" ||
        standardValue === "11"
      ) {
        const filtered = yearOptions.filter((year) => year.value === "2025");
        setFilteredYearOptions(filtered.length > 0 ? filtered : yearOptions);
      } else {
        setFilteredYearOptions(yearOptions);
      }

      if (standardValue !== "11" && standardValue !== "12") {
        setFormData((prev) => ({
          ...prev,
          [field]: value,
          stream: null,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const downloadPDF = async (approvedOnly = false) => {
    if (pdfLoading) {
      console.log(
        "PDF generation already in progress. Ignoring duplicate request."
      );
      return;
    }
    setPdfLoading(true);
    setError(null);

    try {
      navigate(
        approvedOnly
          ? "/award-eligible-students/pdf?approvedOnly=1"
          : "/award-eligible-students/pdf"
      );
    } catch (error: any) {
      console.error("Error generating PDF:", error.message, error.stack);
      setError(`Failed to generate PDF: ${error.message}`);
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    const fetchAwardStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        const params: Record<string, string> = {};
        if (formData.standard?.value) params.standard = formData.standard.value;
        if (formData.year?.value) params.marksheet_year = formData.year.value;
        if (formData.medium?.value) params.medium = formData.medium.value;
        if (shouldShowStream && formData.stream?.value) {
          params.stream = formData.stream.value;
        }

        const response = await GetAwardStudents(params);
        if (response.success) {
          setStudents(response.data || []);
        } else {
          setStudents([]);
          setError("Failed to fetch students.");
        }
      } catch (err) {
        setStudents([]);
        setError("Failed to fetch students.");
      } finally {
        setLoading(false);
      }
    };

    fetchAwardStudents();
  }, [
    formData.standard?.value,
    formData.year?.value,
    formData.medium?.value,
    formData.stream?.value,
    shouldShowStream,
  ]);

  return (
    <>
      <Header title={t("title.AwardEligiblestudent")} showBackArrow />
      <div className="bg-gray-50 h-[calc(100vh-120px)]">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <CircularArcLoader size={60} color="brown" />
          </div>
        ) : (
          <>
            <div className="px-4 py-4">
              <div className="p-4 z-10 shadow-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <DropDown
                    placeholder={t("placeholders.standard")}
                    options={standardOptions}
                    value={formData.standard}
                    onChange={(value) => handleChange("standard", value)}
                  />

                  {shouldShowStream && (
                    <DropDown
                      placeholder={t("placeholders.stream")}
                      options={streamOptions}
                      value={formData.stream}
                      onChange={(value) => handleChange("stream", value)}
                    />
                  )}
                  <DropDown
                    placeholder={t("placeholders.year")}
                    options={filteredYearOptions}
                    value={formData.year}
                    onChange={(value) => handleChange("year", value)}
                  />

                  <DropDown
                    placeholder={t("placeholders.Medium")}
                    options={mediumOptions}
                    value={formData.medium}
                    onChange={(value) => handleChange("medium", value)}
                  />
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="px-4 py-4">
                <div className="p-4 bg-white shadow-md rounded-md">
                  <div className="mt-4">
                    <button
                      onClick={() => downloadPDF(false)}
                      disabled={pdfLoading}
                      className="w-full py-2 px-4 text-white font-semibold bg-theme rounded hover:bg-admin"
                    >
                      {pdfLoading
                        ? "Generating PDF..."
                        : t("placeholders.GeneratePDF")}
                    </button>
                    <button
                      onClick={() => downloadPDF(true)}
                      disabled={pdfLoading}
                      className="w-full mt-3 py-2 px-4 text-white font-semibold bg-theme rounded hover:bg-admin"
                    >
                      {pdfLoading
                        ? "Generating PDF..."
                        : "Generate PDF for All Approved Marksheet"}
                    </button>
                  </div>
                  {error && (
                    <p className="text-red-500 text-center mt-4">{error}</p>
                  )}
                </div>
              </div>
            )}

            <div className="px-4 py-4">
              {!formData.year && !formData.standard && !formData.medium ? (
                <p className="text-center text-gray-500 py-8">
                  {t("awardstudents.filterPrompt")}
                </p>
              ) : students.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {students.map((student, index) => (
                    <div
                      key={index}
                      className="bg-theme text-white rounded-lg shadow-md p-4 transition-all hover:shadow-lg"
                    >
                      <h3 className="text-lg font-bold truncate">
                        {student.student_name}
                      </h3>
                      <p className="text-sm">
                        {t("awardstudents.standard")}: {student.standard}
                      </p>
                      {t("awardstudents.medium")}: {student.medium}
                      {student.stream && (
                        <p className="text-sm">
                          {t("awardstudents.stream")}: {student.stream}
                        </p>
                      )}
                      <p className="text-sm">
                        {t("awardstudents.percentage")}: {student.percentage}%
                      </p>
                      <p className="text-sm">
                        {t("awardstudents.year")}: {student.marksheet_year}
                      </p>
                      <button
                        onClick={() => {
                          if (!student.marksheet_photo) return;
                          setPreviewImage(student.marksheet_photo);
                          setPreviewVisible(true);
                        }}
                        disabled={!student.marksheet_photo}
                        className={`mt-3 w-full py-2 px-4 rounded-md font-semibold ${
                          student.marksheet_photo
                            ? "bg-white text-theme hover:bg-gray-100"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        View Marksheet
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  {t("awardstudents.noStudentsFound")}
                </p>
              )}
            </div>
          </>
        )}
      </div>
      {previewImage && (
        <Image
          src={previewImage}
          alt="Student Marksheet"
          style={{ display: "none" }}
          preview={{
            visible: previewVisible,
            src: previewImage,
            onVisibleChange: (visible) => {
              setPreviewVisible(visible);
              if (!visible) {
                setPreviewImage(null);
              }
            },
            getContainer: document.body,
          }}
        />
      )}
    </>
  );
};

export default AwardStudents;
