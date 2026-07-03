import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaTags,
  FaBriefcase,
  FaAddressCard,
} from "react-icons/fa";
import Header from "../../component/Common/Header";
import ImagePreview from "./BusinessImagePreview";
import { useTranslation } from "react-i18next";
import { getBusinessById } from "../../Api/Business";
import { Notify } from "../../component/Common/Notify";
import { BusinessFormData } from "../../helper/Types/types";
import { MdAddBusiness } from "react-icons/md";
import { RiCustomerService2Fill } from "react-icons/ri";
const BusinessDetails = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  // interface Business {
  //     business_photo: string;
  //     business_name: string;
  //     business_type: string;
  //     contact_number: string;
  //     contact_email: string;
  //     address: string;
  //     city: string;
  //     state: string;
  //     category: string;
  //     business_uuid: string;
  // }
  const [business, setBusiness] = useState<BusinessFormData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location?.state?.data) {
      setBusiness(mapBusinessData(location.state.data));
    } else if (id) {
      fetchBusinessData(id);
    }
  }, [location?.state?.data, id]);

  const mapBusinessData = (data: any) => {
    return {
      business_photo: data?.business_photo || data?.business_logo || "",
      business_logo: data?.business_logo || "",
      business_name: data?.business_name || "",
      business_type: data?.business_type || "",
      contact_number: data?.contact_number || "",
      contact_email: data?.contact_email || "",
      address: data?.address || "",
      city: data?.city || "",
      state: data?.state || "",
      category: data?.category || "",
      business_uuid: data?.business_uuid || id || "",
      services_products: data?.services_products || [],
    };
  };

  const fetchBusinessData = async (uuid: any) => {
    try {
      setLoading(true);
      const data = await getBusinessById(uuid);
      setBusiness(mapBusinessData(data));
    } catch (error) {
      console.error("Error fetching business details:", error);
      Notify(t("Failed to fetch business details"), "error");
    } finally {
      setLoading(false);
    }
  };
  //     if (window?.flutter_inappwebview?.callHandler) {
  //         window.flutter_inappwebview.callHandler(
  //             "callUser",
  //             JSON.stringify(phoneNumber)
  //         );
  //     } else {
  //         window.location.href = `tel:${phoneNumber}`;
  //     }
  // };

  return (
    <>
      <Header title={t("Business2.details")} showBackArrow={true} />

      {loading ? (
        <div className="flex justify-center items-center h-[calc(100vh-20px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-theme"></div>
        </div>
      ) : business ? (
        <div className="flex justify-center items-center  bg-gray-100 p-2">
          <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="relative h-48 bg-theme bg-opacity-10">
              {business.business_photo ? (
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  <ImagePreview
                    src={
                      business.business_photo instanceof File
                        ? URL.createObjectURL(business.business_photo)
                        : business.business_photo
                    }
                    alt={business.business_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  <FaBuilding className="text-theme opacity-20" size={120} />
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-6 border-b pb-6 mb-6">
                {business.business_logo ? (
                  <img
                    src={
                      business.business_logo instanceof File
                        ? URL.createObjectURL(business.business_logo)
                        : business.business_logo
                    }
                    alt={business.business_name}
                    className="w-24 h-24 rounded-full border-4 border-black object-cover shadow-md"
                  />
                ) : (
                  <div className="bg-orange-100 rounded-full p-5 border-4 border-theme shadow-md">
                    <MdAddBusiness className="text-theme" size={40} />
                  </div>
                )}
                <span>
                  <h1 className="text-xl font-bold text-theme">
                    {business.business_name}
                  </h1>
                  <div className="flex items-center mt-2">
                    <span className="bg-theme bg-opacity-10 text-theme text-xs px-3 py-1 rounded-full">
                      {business.business_type}
                    </span>
                    {business.category && (
                      <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full ml-2">
                        {business.category}
                      </span>
                    )}
                  </div>
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {business.contact_number && (
                  <div className="flex items-center p-4 bg-blue-50 rounded-lg ">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <FaPhone className="text-blue-600" size={16} />
                    </div>
                    <div className="ml-4">
                      <p className="text-xs text-blue-600 font-bold">
                        {t("Business2.phone")}
                      </p>
                      <p className="font-medium text-blue-800">
                        {business.contact_number}
                      </p>
                    </div>
                  </div>
                )}

                {business.contact_email && (
                  <div className="flex items-center p-4 bg-green-50 rounded-lg">
                    <div className="p-3 bg-green-100 rounded-full">
                      <FaEnvelope className="text-green-600" size={16} />
                    </div>
                    <div className="ml-4">
                      <p className="text-xs text-green-600 font-bold">
                        {t("Business2.email")}
                      </p>
                      <p className="font-medium text-green-800">
                        {business.contact_email}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold mb-4">
                  {t("Business2.details")}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      icon: <FaAddressCard />,
                      label: t("Business2.address"),
                      value: business.address,
                    },
                    {
                      icon: <FaMapMarkerAlt />,
                      label: t("Business2.location"),
                      value: `${business.city}${
                        business.city && business.state ? ", " : ""
                      }${business.state}`,
                      color: "purple",
                    },
                    {
                      icon: <FaTags />,
                      label: t("Business2.category"),
                      value: business.category,
                      color: "indigo",
                    },
                    {
                      icon: <FaBriefcase />,
                      label: t("Business2.business_type"),
                      value: business.business_type,
                      color: "pink",
                    },
                  ]
                    .filter((item) => item.value)
                    .map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-3 p-3 bg-${item.color}-50 rounded-lg`}
                      >
                        <div className={`text-${item.color}-600 text-xl`}>
                          {item.icon}
                        </div>
                        <div>
                          <p
                            className={`text-base font-bold text-${item.color}-600`}
                          >
                            {item.label}
                          </p>
                          <p className={`text-sm text-black`}>{item.value}</p>
                        </div>
                      </div>
                    ))}
                </div>
                {business && business.services_products && (
                  <div className="flex items-start space-x-4 p-3 overflow-hidden rounded-lg shadow-sm md:col-span-2 col-span-2">
                    <div className="text-theme text-xl pt-1">
                      <RiCustomerService2Fill />
                    </div>
                    <div className="max-w-full">
                      <p className="text-base font-bold text-theme">
                        {t("professionaldetails.thoughts_on_committee")}
                      </p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap break-words max-w-full">
                        {business.services_products}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <FaBuilding className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-700">
              {t("Business not found")}
            </h3>
            <button
              className="mt-4 bg-theme text-white px-4 py-2 rounded"
              onClick={() => navigate(-1)}
            >
              {t("Go back")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BusinessDetails;
