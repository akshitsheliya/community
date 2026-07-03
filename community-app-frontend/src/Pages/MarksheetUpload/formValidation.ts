export const formatPercentage = (value: string): string => {
  let processed = value.replace(/[^\d.]/g, "");

  if (processed.length > 2 && !processed.includes(".")) {
    processed = processed.slice(0, 2) + "." + processed.slice(2);
  }

  if (processed.includes(".")) {
    const parts = processed.split(".");
    if (parts[1]?.length > 2) {
      processed = parts[0] + "." + parts[1].slice(0, 2);
    }
  }

  return processed;
};

// Validate a single field
export const validateField = (
  name: string,
  value: any, 
  formData: any
): string | null => {
  const safeValue = typeof value === "string" ? value.trim() : "";

  switch (name) {
    case "student_name":
    case "father_full_name": // Ensure only alphabets and spaces
      return !safeValue
        ? `${
            name === "father_full_name" ? "Father's full name" : "Student name"
          } is required`
        : !/^[A-Za-z\s]+$/.test(safeValue)
        ? "Only alphabets are allowed"
        : null;

    case "percentage":
      return !safeValue
        ? "Percentage is required"
        : !/^(\d{1,2}(\.\d{1,2})?|100(\.0{1,2})?)$/.test(safeValue)
        ? "Enter valid percentage"
        : parseFloat(safeValue) > 100 || parseFloat(safeValue) < 0
        ? "Percentage must be between 0 and 100"
        : null;

    case "father_phone_number":
      return !safeValue
        ? "Phone number is required"
        : !/^\d+$/.test(safeValue)
        ? "Only numbers are allowed"
        : safeValue.length !== 10
        ? "Enter a valid 10-digit phone number"
        : null;

    case "standard":
      return !safeValue
        ? "Standard is required"
        : !/^(1[0-2]?|[1-9])$/.test(safeValue)
        ? "Standard must be between 1 and 12"
        : null;

    case "medium":
      return !safeValue ? "Medium is required" : null;

    case "marksheet_year": {
      const extractedYear = safeValue.split("-")[0];
      return !safeValue
        ? "Year is required"
        : !/^(202[3-6])$/.test(extractedYear)
        ? "Year must be between 2023 and 2026"
        : null;
    }

    case "stream":
      return formData.standard &&
        ["11", "12"].includes(formData.standard) &&
        !safeValue
        ? "Stream is required for standard 11 & 12"
        : null;

    default:
      return null;
  }
};


export const validateForm = (formData: any) => {
  const errors: { [key: string]: string } = {};

  Object.entries(formData).forEach(([key, value]) => {
    const error = validateField(key, value ?? "", formData); 
    if (error) errors[key] = error;
  });

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
