interface FormDataType {
  full_name: string;
  passport_photo: File | null;
  photoPreview: string;
  govt_private: string;
  designation: string;
  experience_year: string;
  success_mantra: string;
  contact_number: string;
  country: string;
  city: string;
  thoughts_on_committee: string;
}

export const validateForm = (
  formData: FormDataType,
  isEditing: boolean,
  t: any
) => {
  const errors: Record<string, string> = {};

  if (!formData.full_name.trim()) {
    errors.full_name = t("abroadMembers.validation.fullNameRequired");
  }

  if (!isEditing && !formData.passport_photo && !formData.photoPreview) {
    errors.passport_photo = t("abroadMembers.validation.passportPhotoRequired");
  }

  if (!formData.designation.trim()) {
    errors.designation = t("abroadMembers.validation.designationRequired");
  }

  if (!formData.contact_number.trim()) {
    errors.contact_number = t("abroadMembers.validation.contactNumberRequired");
  } else if (!/^[+\d\s()-]{5,20}$/.test(formData.contact_number.trim())) {
    errors.contact_number = t("abroadMembers.validation.invalidContactNumber");
  }

  if (!formData.country.trim()) {
    errors.country = t("abroadMembers.validation.countryRequired");
  }

  if (!formData.city.trim()) {
    errors.city = t("abroadMembers.validation.cityRequired");
  }

  if (formData.experience_year && isNaN(Number(formData.experience_year))) {
    errors.experience_year = t("abroadMembers.validation.experienceNumberOnly");
  }
  return errors;
};
