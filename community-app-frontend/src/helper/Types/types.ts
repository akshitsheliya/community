import { ChangeEventHandler, ReactNode } from "react";
import { ActionMeta, OptionsOrGroups, SingleValue } from "react-select";

export interface ApiResponse {
  error: any;
  message: any;
  token: boolean;
  success?: boolean;
  status: number;
  data: {
    error?: string;
    message?: string;
    success?: boolean;
    token?: string;
    otp?: string;
  };
}

export type AllMarkSheet = {
  label: string;
  value: string;
};

export interface ApiError {
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

export interface OtpVerificationProps {
  phoneNumber: number;
  onOtpVerified: () => void;
}

export interface ErrorState {
  mobile_no: string;
}

export interface FormData {
  firstName: string;
  lastName: string;
  surname: string;
  gender: string;
  numberOfFamilyMembers?: number | string;
}

export type OptionType = {
  label: string;
  value: string;
};

export interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: any) => void;
  onKeyDown?: (e: any) => void;
  error?: string;
  placeholder?: string;
  maxLength?: number;
}

export interface DropDownProps {
  value?: OptionType | null;
  onChange?: (newValue: OptionType | null) => void;
  isRequired?: boolean;
  placeholder?: string;
  label: string;
  options: OptionType[];
}

// helper/Types/types.ts
export interface FormData {
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  address: string;
  email: string;
  password: string;
  phone: string;
  occupation: string;
  business: string;
  buisnessDetails: string;
  maritalStatus: string;
  city: string;
  bloodGroup: string;
  id_proof: string;
}

export interface DropdownOption {
  label: string;
  value: string;
  name?: string;
}

export interface SidebarProps {
  isSidebarOpen?: boolean;
  toggleSidebar: (isOpen: boolean) => void;
}

export interface SidebarItemProps {
  icon: ReactNode;
  text: string;
  onClick?: () => void;
}
export interface Student {
  marksheet_uuid?: string;
  marksheet_photo?: string | null;
  marksheet_year: any;
  student_name: string;
  standard: string;
  medium: string;
  stream: string | null;
  percentage: number;
}

export interface Dropdowndata {
  value?: { label: string; value: string } | null;
  onChange?:
    | ((
        newValue: SingleValue<{ label: string; value: string }> | null,
        actionMeta: ActionMeta<{ label: string; value: string }>
      ) => void)
    | undefined;
  isRequired?: boolean;
  placeholder?: string;
  label?: string;
  options?: OptionsOrGroups<{ label: string; value: string }, never>;
  fontSize?: string;
  className?: string;
  icon?: React.ReactNode;
  isClearable?: boolean;
  disabled?: any;
  isLoading?: any;
}

export interface PersonalDetailsProps {
  formData: any;
  onChange: (name: any, value: any) => void;
  errors: any;
  setErrors: any;
  disabled?: any;
}

export interface HeaderProps {
  toggleSidebar?: () => void;

  showBackArrow?: boolean;
  showProfileIcon?: boolean;
  showskipoption?: boolean;
  showPlusIcon?: boolean;
  showSearchIcon?: boolean;
  showhomeIcon?: boolean;

  title?: string;
  className?: string;
  classNameTitle?: string;
  plusIconClass?: string;

  onSearch?: (searchText: string) => void;
  onClearSearch?: () => void;
 
  onHomeClick?: () => void;
  onPlusClick?: () => void;
 
  plusIconLink?: string;
  backUrl?: string;

  unreadNotifications?: number;
  bellAnimating?: boolean;
  notificationComponent?: React.ReactNode;

  familyMembersStatus?: string;

  // dashboard dropdown
  villageList?: any[];
  selectedVillage?: string;
  onVillageChange?: (value: string) => void;
}

export interface PhotoPreviewProps {
  imageSrc: string;
  onClose: () => void;
  stream?: string;
}

export interface InputFieldType {
  className?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  isRequired?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  name: string;
  label: string;
  icon?: ReactNode;
  type?: string;
  labelClassName?: string;
  errorMsg?: string;
  disabled?: boolean;
  pattern?: string;
  min?: number;
  max?: number;
  onKeyDown?: any;
  EgClassName?: any;
  maxLength?: any;
}

export type NewsCardProps = {
  title: string;
  description: string;
  links?: { url: string; text: string }[];
};

export interface Member {
  isMainMember: any;
  father_name: string;
  first_name: string;
  surname: string;
  address: string | null;
  phone_number: string;
  email_id: string | null;
  family_uuid: string;
}

export interface Photo {
  thumb_url: string | undefined;
  photo_id: string;
  photo_url: string;
}

export interface FileUploadProgress {
  file: File;
  progress: number;
  uploaded: boolean;
}

export interface ProgressEvent {
  loaded: number;
  total: number;
}

// src/helper/Types/types.ts

// Business Form Data Interface
export interface BusinessFormData {
  business_name: string;
  city: string;
  state: string;
  address: string;
  contact_number: string;
  contact_email: string;
  business_type: string;
  category: string;
  business_logo: File | any | null;
  business_photo: File | null;
  services_products: string | any;
}

// Business API Response Interface
export interface Business {
  business_uuid: string;
  business_name: string;
  city: string;
  state: string;
  address: string;
  contact_number: string;
  contact_email: string;
  business_type: string;
  category: string;
  business_logo: string | any | null;
  business_photo: string | null;
  created_at?: string;
  updated_at?: string;
  can_edit?: any;
  isAdmin_can_edit?: any;
  services_products?: any | string;
}

// Validation Errors Interface
export interface ValidationErrors {
  [key: string]: string;
}

// Category Interface for filters
export interface Category {
  id: string | number;
  name: string;
  value?: string;
}
