import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../component/Common/Header";
import InputField from "../../component/Common/InputField";
import DropDown from "../../component/Common/DropDown";
import { t } from "i18next";
import { streamOptions, mediumOptions } from "../../utils/Constant/constants";
import {
  updateMarkSheet,
  approveMarkSheet,
  rejectMarkSheet,
} from "../../Api/allMarkSheet";
import { Notify } from "../../component/Common/Notify";
import ImagePreview from "../../component/Common/ImagePreview";
import api from "../../Api/api";

interface OptionType {
  label: string;
  value: string;
}

interface ActiveStandard {
  year: string;
  standards: string;
  lastDate: string;
}

const UpdateAllMarkSheet = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { marksheets } = location.state || {};
  const [standard, setStandard] = useState<OptionType | null>(null);
  const [stream, setStream] = useState<OptionType | null>(null);
  const [medium, setMedium] = useState<OptionType | null>(null);
  const [year, setYear] = useState<OptionType | null>(null);
  const [studentName, setStudentName] = useState(
    marksheets?.student_name || ""
  );
  const [percentage, setPercentage] = useState(marksheets?.percentage || "");
  const [fatherPhoneNumber, setFatherPhoneNumber] = useState(
    marksheets?.father_phone_number || ""
  );
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [fatherFullName, setFatherFullName] = useState(
    marksheets?.father_full_name || ""
  );
  const [activeStandards, setActiveStandards] = useState<ActiveStandard[]>([]);
  const [standardOptions, setStandardOptions] = useState<OptionType[]>([]);

  useEffect(() => {
    fetchCountsAndStandards();
    if (marksheets) {
      setStudentName(marksheets.student_name || "");
      setPercentage(marksheets.percentage || "");
      setFatherPhoneNumber(marksheets.father_phone_number || "");
      setFatherFullName(marksheets.father_full_name || "");
      setMedium(
        mediumOptions.find((opt) => opt.value === marksheets.medium) || null
      );
      setStream(
        streamOptions.find((opt) => opt.value === marksheets.stream) || null
      );
    }
  }, [marksheets]);

  const fetchCountsAndStandards = async () => {
    try {
      const response = await api.get("/counts");

      if (response.data?.success && response.data.data.activeStandards) {
        setActiveStandards(response.data.data.activeStandards);
        generateStandardOptions(response.data.data.activeStandards);
        if (marksheets) {
          setTimeout(() => {
            const stdOption = {
              value: marksheets.standard || "",
              label: `Standard ${marksheets.standard || ""}`,
            };
            setStandard(stdOption);
            if (marksheets.standard && marksheets.marksheet_year) {
              const yearOption = {
                value: marksheets.marksheet_year,
                label: marksheets.marksheet_year,
              };
              setYear(yearOption);
            }
          }, 0);
        }
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
    options.sort((a, b) => parseInt(a.value) - parseInt(b.value));

    setStandardOptions(options);
  };

  const handleStandardChange = (selectedOption: OptionType | null) => {
    setStandard(selectedOption);
    setYear(null);
  };
  const getYearOptionsForStandard = (standardValue: string) => {
    if (!standardValue) return [];

    const relevantActiveStandard = activeStandards.find((stdData) =>
      stdData.standards
        .split(",")
        .map((s) => s.trim())
        .includes(standardValue)
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
  const filteredYearOptions = standard
    ? getYearOptionsForStandard(standard.value)
    : [];
  const capitalizeWords = (text: string) => {
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };
  const handleStudentNameChange = (e: any) => {
    setStudentName(capitalizeWords(e.target.value));
  };
  const handleFatherNameChange = (e: any) => {
    setFatherFullName(capitalizeWords(e.target.value));
  };

  const handleApprove = async () => {
    try {
      const updatedData = {
        student_name: studentName,
        standard: standard?.value,
        stream: stream?.value,
        medium: medium?.value,
        marksheet_year: year?.value,
        percentage,
        father_phone_number: fatherPhoneNumber,
        father_full_name: fatherFullName,
      };

      await updateMarkSheet(marksheets.marksheet_uuid, updatedData);
      await approveMarkSheet(marksheets.marksheet_uuid);

      Notify("Marksheet saved & approved successfully!", "success");
      navigate("/marksheet");
    } catch (error) {
      console.error("Error updating marksheet:", error);
      Notify("Failed to update marksheet. Please try again.", "error");
    }
  };

  const submitRejectReason = async () => {
    if (rejectReason.trim()) {
      try {
        console.log("Payload being sent:", {
          rejection_reason: rejectReason,
        });

        await rejectMarkSheet(marksheets.marksheet_uuid, rejectReason);

        Notify(`Marksheet rejected. Reason: ${rejectReason}`, "success");

        setShowRejectPopup(false);
        setRejectReason("");
        navigate("/marksheet");
      } catch (error) {
        console.error("Error rejecting marksheet:", error);
        Notify("Failed to reject marksheet. Please try again.", "error");
      }
    } else {
      Notify("Please enter a reason for rejection.", "warning");
    }
  };

  return (
    <>
      <Header title={"AllMarksheet"} showBackArrow />
      <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-center text-theme mb-4">
          Update Marksheet
        </h2>
        {marksheets?.marksheet_photo && (
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Marksheet Image</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <ImagePreview
                src={marksheets.marksheet_photo}
                alt={`${marksheets.student_name || "Student"} marksheet`}
                width="100%"
                height="auto"
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/placeholder-marksheet.png";
                }}
                previewMask={
                  <div className="flex items-center justify-center text-white">
                    <span>Click to view</span>
                  </div>
                }
              />
            </div>
          </div>
        )}

        <InputField
          label={t("name")}
          name="studentName"
          placeholder={t("placeholders.name")}
          value={studentName}
          onChange={handleStudentNameChange}
        />

        <DropDown
          label="Standard"
          options={standardOptions}
          value={standard}
          onChange={handleStandardChange}
          placeholder="Select Standard"
          isRequired
        />

        {standard?.value === "11" || standard?.value === "12" ? (
          <DropDown
            label="Stream"
            options={streamOptions}
            value={stream}
            onChange={setStream}
            placeholder="Select Stream"
            isRequired
          />
        ) : null}
        <InputField
          label={t("Percentage")}
          name="percentage"
          type="number"
          placeholder={t("Enter percentage")}
          onChange={(e) => setPercentage(e.target.value)}
          value={percentage}
        />
        <DropDown
          label="Medium"
          options={mediumOptions}
          value={medium}
          onChange={setMedium}
          placeholder="Select Medium"
          isRequired
        />

        <DropDown
          label="Marksheet Year"
          options={filteredYearOptions}
          value={year}
          onChange={setYear}
          placeholder="Select Year"
          isRequired
        />

        <InputField
          label={t("Enter father's phone number")}
          name="fatherPhoneNumber"
          type="tel"
          placeholder={t("Enter father's phone number")}
          onChange={(e) => setFatherPhoneNumber(e.target.value)}
          value={fatherPhoneNumber}
        />
        <InputField
          label={t("Enter father's full name")}
          name="fatherFullName"
          placeholder={t("Enter father's full name")}
          onChange={handleFatherNameChange}
          value={fatherFullName}
        />
        <div className="flex gap-4">
          <button
            onClick={() => setShowRejectPopup(true)}
            className="w-full bg-red-500 text-white font-bold py-2 rounded hover:bg-red-600"
          >
            Reject
          </button>
          <button
            onClick={handleApprove}
            className="w-full bg-green-500 text-white font-bold py-2 rounded hover:bg-green-600"
          >
            Save & Approve
          </button>
        </div>
        {showRejectPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-bold mb-4">Reason for Rejection</h3>
              <textarea
                className="w-full p-2 border border-gray-300 rounded mb-4"
                rows={4}
                placeholder="Enter reason for rejection"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowRejectPopup(false)}
                  className="bg-gray-300 text-black font-bold py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRejectReason}
                  className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UpdateAllMarkSheet;
