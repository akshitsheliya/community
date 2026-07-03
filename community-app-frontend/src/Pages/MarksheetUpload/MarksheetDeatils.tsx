import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ImagePreview from "../../component/Common/ImagePreview";
import Header from "../../component/Common/Header";
import api, { apiOnlyData } from "../../Api/api";
import FormField from "../../Pages/MarksheetUpload/FormField";
import SelectField from "../../Pages/MarksheetUpload/SelectField";
import { OptionType } from "../../helper/Types/types";
import {
  validateField,
  formatPercentage,
} from "../../Pages/MarksheetUpload/formValidation";
import { useTranslation } from "react-i18next";
import { Notify } from "../../component/Common/Notify";

interface MarksheetData {
  student_name: string;
  percentage: string;
  standard: string;
  medium: string;
  marksheet_year: string;
  stream: any;
  father_full_name: string;
  father_phone_number: string;
  marksheet_photo?: string | null;
  marksheetUrl?: string | null;
  relativePath: string;
}

interface ActiveStandard {
  year: string;
  standards: string;
  lastDate: string;
}

const MarksheetDetails: any = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const imageUrl = location.state?.imageUrl || null;
  const extractedData = location.state?.marksheetData || {};
  const { t } = useTranslation();
  const [marksheetData, setMarksheetData] = useState<MarksheetData>({
    student_name: "",
    percentage: "",
    standard: "",
    medium: "",
    marksheet_year: "",
    father_full_name: "",
    father_phone_number: "",
    stream: null,
    relativePath: "",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(imageUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [formTouched, setFormTouched] = useState(false);
  const [activeStandards, setActiveStandards] = useState<ActiveStandard[]>([]);
  const [standardOptions, setStandardOptions] = useState<OptionType[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const dropdownOptions = {
    medium: [
      { value: "Gujarati", label: "Gujarati" },
      { value: "English", label: "English" },
    ],
    stream: [
      { value: "science", label: "Science" },
      { value: "commerce", label: "Commerce" },
      { value: "arts", label: "Arts" },
    ],
  };

  // Fetch counts and standards only once when component mounts
  useEffect(() => {
    fetchCountsAndStandards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle initial data setup separately, only once
  useEffect(() => {
    if (!initialDataLoaded) {
      if (Object.keys(extractedData).length > 0) {
        const errors: { [key: string]: string } = {};
        Object.entries(extractedData).forEach(([key, value]) => {
          const error = validateField(key, value as string, extractedData);
          if (error) errors[key] = error;
        });

        setMarksheetData(extractedData);

        // Use marksheetUrl from extractedData, fall back to imageUrl from location state
        const imageToDisplay = extractedData.marksheetUrl || imageUrl;
        setPreviewImage(imageToDisplay);

        setValidationErrors(errors);
        console.log("Setting preview image to:", imageToDisplay);
      } else {
        fetchMarksheetData();
      }

      setInitialDataLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDataLoaded]);

  const fetchCountsAndStandards = async () => {
    try {
      const response = await api.get("/counts");

      if (response.data?.success && response.data.data.activeStandards) {
        setActiveStandards(response.data.data.activeStandards);
        generateStandardOptions(response.data.data.activeStandards);
      } else {
        console.warn("No active standards found:", response.data?.message);
        setStandardOptions([
          { value: "9", label: "Standard 9" },
          { value: "10", label: "Standard 10" },
          { value: "11", label: "Standard 11" },
          { value: "12", label: "Standard 12" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching counts and standards:", error);
    }
  };

  const generateStandardOptions = (activeStds: ActiveStandard[]) => {
    const options: OptionType[] = [];

    activeStds.forEach((stdData) => {
      const standardsList = stdData.standards.split(",");

      standardsList.forEach((std) => {
        if (!options.some((option) => option.value === std.trim())) {
          options.push({
            value: std.trim(),
            label: `Standard ${std.trim()}`,
          });
        }
      });
    });

    options.sort(
      (a, b) => parseInt(a.value as string) - parseInt(b.value as string)
    );

    setStandardOptions(options);
  };

  const fetchMarksheetData = async () => {
    try {
      const response = await api.get("/marksheets");
      if (response.data?.success && response.data.data.length > 0) {
        const latestMarksheet = response.data.data[0];
        setMarksheetData(latestMarksheet);
        setPreviewImage(latestMarksheet.marksheetUrl);
      }
    } catch (error) {
      console.error("Error fetching marksheet data:", error);
    }
  };

  const updateField = (name: string, value: string) => {
    setMarksheetData((prev) => ({ ...prev, [name]: value }));

    const error = validateField(name, value, marksheetData);
    setValidationErrors((prev) => {
      if (error) {
        return { ...prev, [name]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
    });
  };

  const capitalizeEachWord = (str: string) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    let newValue = value;

    if (!formTouched) setFormTouched(true);

    if (name === "student_name" || name === "father_full_name") {
      newValue = capitalizeEachWord(value);
    } else if (name === "percentage") {
      newValue = formatPercentage(value);
    } else if (name === "father_phone_number") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 10) return;
      newValue = numericValue;
    }

    setMarksheetData((prev) => ({ ...prev, [name]: newValue }));

    const error = validateField(name, newValue, marksheetData);
    setValidationErrors((prev) => {
      if (error) {
        return { ...prev, [name]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
    });
  };

  const handleSelectChange = (
    selectedOption: OptionType | null,
    fieldName: string
  ) => {
    if (!formTouched) setFormTouched(true);

    const selectedValue = selectedOption?.value || "";
    updateField(fieldName, selectedValue);

    if (fieldName === "standard") {
      setMarksheetData((prev) => ({
        ...prev,
        marksheet_year: "",
      }));
    }
  };

  const getYearOptionsForStandard = (standard: string) => {
    if (!standard) return [];

    const relevantActiveStandard = activeStandards.find((stdData) =>
      stdData.standards
        .split(",")
        .map((s) => s.trim())
        .includes(standard)
    );

    if (relevantActiveStandard) {
      const year = relevantActiveStandard.year;

      return [
        {
          value: year,
          label: year,
        },
      ];
    }

    return [];
  };

  const filteredYearOptions = getYearOptionsForStandard(marksheetData.standard);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    Object.entries(marksheetData).forEach(([key, value]) => {
      const error = validateField(key, value as string, marksheetData);
      if (error) errors[key] = error;
    });

    if (
      marksheetData.standard &&
      ["11", "12"].includes(marksheetData.standard) &&
      !marksheetData.stream
    ) {
      errors.stream = "Stream is required for standard 11 & 12";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveClick = async () => {
    setFormTouched(true);

    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const dataToSave = {
        ...marksheetData,
        stream: marksheetData.stream || null,
        marksheet_photo: marksheetData.relativePath || null,
      };

      if (
        dataToSave.marksheet_year &&
        dataToSave.marksheet_year.includes("-")
      ) {
        dataToSave.marksheet_year = dataToSave.marksheet_year.split("-")[0];
      }

      const response = await apiOnlyData.post("/marksheets", dataToSave);
      if (response.status === 200 || response.status === 201) {
        navigate("/dashboard");
      }
    } catch (error: any) {
      Notify(error.response.data.message,"error");
      console.error("Error saving marksheet data:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const findSelectedOption = (options: OptionType[], value: string | null) => {
    if (!value) return null;
    return options.find((option) => option.value === value) || null;
  };

  const getError = (field: string) =>
    formTouched ? validationErrors[field] : undefined;

  return (
    <>
      <Header title={t("marksheetDetails.title")} showBackArrow />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-3 w-full">
        <div className="w-full max-w-4xl bg-white shadow-md rounded-lg sm:p-6 p-2 flex flex-col md:flex-row">
          <div className="w-full md:w-2/3 p-2 mb-4">
            <h2 className="text-xl font-bold text-gray-700 mb-6">
              {t("marksheetDetails.title")}
            </h2>

            <FormField
              label={t("marksheet.student_name")}
              name="student_name"
              value={marksheetData.student_name || ""}
              placeholder={t("marksheetDetails.EnterStudentName")}
              onChange={handleInputChange}
              error={getError("student_name")}
            />

            <SelectField
              label={t("marksheet.standard")}
              options={standardOptions}
              value={findSelectedOption(
                standardOptions,
                marksheetData.standard
              )}
              onChange={(option) => handleSelectChange(option, "standard")}
              placeholder={t("marksheetDetails.selectstanderd")}
              error={getError("standard")}
            />

            {marksheetData.standard &&
              ["11", "12"].includes(marksheetData.standard) && (
                <SelectField
                  label={t("marksheet.stream")}
                  options={dropdownOptions.stream}
                  value={findSelectedOption(
                    dropdownOptions.stream,
                    marksheetData.stream
                  )}
                  onChange={(option) => handleSelectChange(option, "stream")}
                  placeholder={t("marksheetDetails.SelectStream")}
                  error={getError("stream")}
                />
              )}

            <FormField
              label={t("marksheet.percentage")}
              name="percentage"
              value={marksheetData.percentage || ""}
              onChange={handleInputChange}
              placeholder={t("marksheetDetails.EnterPercentage")}
              maxLength={6}
              error={getError("percentage")}
            />

            <SelectField
              label={t("marksheet.medium")}
              options={dropdownOptions.medium}
              value={findSelectedOption(
                dropdownOptions.medium,
                marksheetData.medium
              )}
              onChange={(option) => handleSelectChange(option, "medium")}
              placeholder={t("marksheetDetails.SelectMedium")}
              error={getError("medium")}
            />

            <SelectField
              label={t("marksheet.marksheet_year")}
              options={filteredYearOptions}
              value={findSelectedOption(
                filteredYearOptions,
                marksheetData.marksheet_year
              )}
              onChange={(option) =>
                handleSelectChange(option, "marksheet_year")
              }
              placeholder={t("marksheetDetails.SelectYear")}
              error={getError("marksheet_year")}
            />

            <FormField
              label={t("marksheetDetails.fathername")}
              name="father_full_name"
              value={marksheetData.father_full_name || ""}
              placeholder={t("marksheetDetails.EnterFatherName")}
              onChange={handleInputChange}
              error={getError("father_full_name")}
            />

            <FormField
              label={t("marksheetDetails.fathernumber")}
              name="father_phone_number"
              value={marksheetData.father_phone_number || ""}
              onChange={handleInputChange}
              placeholder={t("marksheetDetails.EnterFatherNumber")}
              maxLength={10}
              error={getError("father_phone_number")}
            />

            <div className="flex space-x-4">
              <button
                className="bg-theme text-white px-4 py-2 rounded-lg hover:bg-theme transition"
                onClick={handleSaveClick}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : t("received_marksheets.save")}
              </button>
            </div>
          </div>
          <div className="w-full md:w-1/3 flex justify-center items-center sm:mt-0 mt-6">
            {previewImage ? (
              <div className="w-full flex flex-col items-center">
                <ImagePreview
                  src={previewImage}
                  alt="Marksheet"
                  width={224}
                  height={256}
                  className="shadow-md"
                />
                <p className="text-xs text-gray-500 mt-2 break-all">
                  {previewImage}
                </p>
              </div>
            ) : (
              <div className="text-gray-500">No marksheet image found.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MarksheetDetails;
