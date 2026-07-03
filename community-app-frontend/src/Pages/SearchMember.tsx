import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "../component/Common/Header";
import { FaHome, FaBusinessTime } from "react-icons/fa";
import { PiStudentFill } from "react-icons/pi";
import { MdBloodtype } from "react-icons/md";
import DropDown from "../component/Common/DropDown"; // Adjust the path as per your file structure
import {
  BusinessOptions,
  Education,
  Blood,
  Rahenank,
} from "../utils/Constant/constants";

const SearchMember: React.FC = () => {
  const { t } = useTranslation();

  const [rahenank, setRahenank] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [business, setBusiness] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [education, setEducation] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [bloodGroup, setBloodGroup] = useState<{
    label: string;
    value: string;
  } | null>(null);

  return (
    <div className="h-screen bg-gray-100 flex flex-col items-center justify-center ">
      {/* Header */}
      <Header showBackArrow={true} title={t("title.search_member")} />

      {/* Content */}
      <div className="flex flex-col items-center w-full max-w-md mt-10 px-4">
        {/* Dynamic Dropdowns */}

        <DropDown
          placeholder="રહેણાંક પસંદ કરો"
          value={rahenank}
          options={Rahenank}
          onChange={(option) => setRahenank(option)}
          icon={<FaHome />}
        />
        <DropDown
          placeholder="વ્યવસાય પસંદ કરો"
          options={BusinessOptions}
          value={business}
          onChange={(option) => setBusiness(option)}
          className="mt-4"
          icon={<FaBusinessTime />}
        />
        <DropDown
          placeholder="શિક્ષણ પસંદ કરો"
          options={Education}
          value={education}
          onChange={(option) => setEducation(option)}
          className="mt-4"
          icon={<PiStudentFill />}
        />
        <DropDown
          placeholder="રક્ત જૂથ પસંદ કરો"
          options={Blood}
          value={bloodGroup}
          onChange={(option) => setBloodGroup(option)}
          className="mt-4"
          icon={<MdBloodtype />}
        />

        {/* Search Button */}
        <button
          type="button"
          className="w-full mt-6 bg-theme text-white py-3 rounded-lg text-lg font-bold shadow-md hover:bg-theme"
        >
          શોધો
        </button>
      </div>
    </div>
  );
};

export default SearchMember;
