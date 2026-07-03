import { useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "../component/Common/Header";
import DropDown from "../component/Common/DropDown";
import {
  standardOptions,
  streamOptions,
  mediumOptions,
  yearOptions,
} from "../utils/Constant/constants"; // Import dropdown options
import { OptionType } from "../helper/Types/types";

const AllMarksheet = () => {
  const { t } = useTranslation();

  // Single state object renamed to filters
  const [filters, setFilters] = useState<{
    selectedStandard: OptionType | null;
    selectedStream: OptionType | null;
    selectedMedium: OptionType | null;
    selectedYear: OptionType | null;
  }>({
    selectedStandard: null,
    selectedStream: null,
    selectedMedium: null,
    selectedYear: null,
  });
  // Handle dropdown change
  const handleChange = (key: any, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "selectedStandard" &&
        value?.value !== "11 Std" &&
        value?.value !== "12 Std"
        ? { selectedStream: null }
        : {}), // Reset stream if standard is not 11 or 12
    }));
  };

  return (
    <>
      <Header title={t("AllMarksheet")} showBackArrow showSearchIcon={true} />

      <div className="w-full">
        <div className="flex flex-wrap gap-4">
          {/* Standard Dropdown */}
          <div className="w-full md:w-1/4">
            <DropDown
              label="Standard"
              options={standardOptions}
              value={filters.selectedStandard}
              onChange={(option) => handleChange("selectedStandard", option)}
              placeholder="Select Standard"
            />
          </div>

          {/* Stream Dropdown (Visible only for Standard 11 or 12) */}
          {filters.selectedStandard?.value == "11 Std" ||
            filters.selectedStandard?.value == "12 Std" ? (
            <div className="w-full md:w-1/4">
              <DropDown
                label="Stream"
                options={streamOptions}
                value={filters.selectedStream}
                onChange={(option) => handleChange("selectedStream", option)}
                placeholder="Select Stream"
              />
            </div>
          ) : null}

          {/* Medium Dropdown */}
          <div className="w-full md:w-1/4">
            <DropDown
              label="Medium"
              options={mediumOptions}
              value={filters.selectedMedium}
              onChange={(option) => handleChange("selectedMedium", option)}
              placeholder="Select Medium"
            />
          </div>

          {/* Year Dropdown */}
          <div className="w-full md:w-1/4">
            <DropDown
              label="Year"
              options={yearOptions}
              value={filters.selectedYear}
              onChange={(option) => handleChange("selectedYear", option)}
              placeholder="Select Year"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AllMarksheet;
