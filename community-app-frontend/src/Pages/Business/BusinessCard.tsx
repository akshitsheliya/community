
import {
    FaTrash,
    FaUser,
    FaBuilding,
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import ImagePreview from "./BusinessImagePreview";

const ImageSlideshow = ({
    images,
    alt,
}: {
    images: string | string[];
    alt: string;
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imagesArray, setImagesArray] = useState<string[]>([]);

    useEffect(() => {
        if (images) {
            const imgArray = Array.isArray(images) ? images : [images];
            setImagesArray(imgArray);
        }
    }, [images]);

    if (!imagesArray.length) {
        return (
            <div className="bg-orange-100 rounded-lg p-4 border border-theme flex items-center justify-center w-full h-full">
                <FaBuilding className="text-theme" size={36} />
            </div>
        );
    }

    const nextSlide = (e: any) => {
        e.stopPropagation();
        setCurrentIndex((prevIndex) => (prevIndex + 1) % imagesArray.length);
    };

    const prevSlide = (e: any) => {
        e.stopPropagation();
        setCurrentIndex(
            (prevIndex) => (prevIndex - 1 + imagesArray.length) % imagesArray.length
        );
    };

    return (
        <div className="relative w-full h-full rounded-lg overflow-hidden flex justify-center">
            <ImagePreview
                src={imagesArray[currentIndex]}
                alt={alt}
                className="w-full h-full object-cover"
            />

            {imagesArray.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-1 rounded-full"
                        aria-label="Previous image"
                    >
                        <FaChevronLeft size={14} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-1 rounded-full"
                        aria-label="Next image"
                    >
                        <FaChevronRight size={14} />
                    </button>
                    <div className="absolute bottom-1 left-0 right-0 flex justify-center space-x-1">
                        {imagesArray.map((_, index) => (
                            <div
                                key={index}
                                className={`w-1.5 h-1.5 rounded-full ${index === currentIndex ? "bg-white" : "bg-white bg-opacity-50"
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const BusinessCard = ({
    image,
    userName,
    phoneNumber,
    address,
    email,
    onClick,
    donor,
    deleteButton,
    edit,
    onClickEdit,
    additionalInfo,
    additionalbuttons,
    details,
    showDonorType,
}: {
    image?: any;
    userName?: any;
    address?: any;
    email?: any;
    phoneNumber?: any;
    onClick?: any;
    donor?: any;
    deleteButton?: any;
    edit?: any;
    onClickEdit?: any;
    additionalInfo?: any;
    additionalbuttons?: any;
    details?: any;
    showDonorType?: any;
}) => {

    const { t } = useTranslation();

    const getDonorTypeKey = (type: any) => {
        if (!type) return "";

        const normalizedType = type.trim().toLowerCase();
        if (normalizedType.includes("bhojan")) return "BhojanSamarambh";
        if (normalizedType.includes("inam")) return "InamVitran";
        return type
            .split(" ")
            .map(
                (word: any) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join("");
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex flex-col md:flex-row">
                {/* Left side - Image/Slideshow */}
                <div
                    className="w-full md:w-48 h-48 md:h-full flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ImageSlideshow images={image} alt={userName} />
                </div>

                {/* Right side - Content */}
                <div className="flex-grow p-4">
                    <div className="flex justify-between items-start">
                        <div onClick={details} className="cursor-pointer flex-grow">
                            <h2 className="font-bold text-theme text-xl leading-tight mb-2">
                                {userName}
                            </h2>

                            <div className="space-y-2">
                                {address && (
                                    <div className="flex items-start">
                                        <FaBuilding
                                            className="mr-2 mt-1 text-gray-500 flex-shrink-0"
                                            size={14}
                                        />
                                        <p className="text-sm text-gray-600">{address}</p>
                                    </div>
                                )}

                                {email && (
                                    <div className="flex items-start">
                                        <FaUser
                                            className="mr-2 mt-1 text-gray-500 flex-shrink-0"
                                            size={14}
                                        />
                                        <p className="text-sm text-gray-600">{email}</p>
                                    </div>
                                )}

                                {phoneNumber && (
                                    <div
                                        className="flex items-center mt-1 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();

                                        }}
                                    >
                                        <FaPhone
                                            className="mr-2 text-black flex-shrink-0"
                                            size={14}
                                        />
                                        <p className="text-sm font-medium text-black">
                                            {phoneNumber}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action buttons - Moved to top right */}
                        <div className="flex space-x-2 ml-4">
                            {edit && (
                                <button
                                    className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors p-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClickEdit();
                                    }}
                                    aria-label="edit"
                                >
                                    <MdEdit size={18} />
                                </button>
                            )}

                            {deleteButton && (
                                <button
                                    className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-full transition-colors p-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClick();
                                    }}
                                    aria-label="Delete"
                                >
                                    <FaTrash size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {additionalInfo && <div className="mt-3">{additionalInfo}</div>}

                    {/* Donor information */}
                    {donor && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            {showDonorType && donor.donor_type && (
                                <div className="bg-orange-50 px-3 py-1 rounded-lg text-theme text-xs font-bold">
                                    {t(`donors.${getDonorTypeKey(donor.donor_type)}`)}
                                </div>
                            )}

                            <div
                                className={`px-3 py-1 rounded-lg text-white text-xs font-medium ${donor.is_lifetime_donor == 1 ? "bg-theme" : "bg-gray-600"
                                    }`}
                            >
                                {donor.is_lifetime_donor == 1
                                    ? t("donors.life_time_donor")
                                    : donor.donation_year
                                        ? `${t("donors.year")}: ${donor.donation_year}`
                                        : t("donors.one_time_donor")}
                            </div>
                        </div>
                    )}

                    {/* Additional buttons */}
                    {additionalbuttons && (
                        <div className="flex flex-wrap gap-2 mt-4">{additionalbuttons}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Phone icon component
const FaPhone = ({ className, size }: { className: any; size: any }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="currentColor"
    >
        <path d="M497.39 361.8l-112-48a24 24 0 0 0-28 6.9l-49.6 60.6A370.66 370.66 0 0 1 130.6 204.11l60.6-49.6a23.94 23.94 0 0 0 6.9-28l-48-112A24.16 24.16 0 0 0 122.6.61l-104 24A24 24 0 0 0 0 48c0 256.5 207.9 464 464 464a24 24 0 0 0 23.4-18.6l24-104a24.29 24.29 0 0 0-14.01-27.6z" />
    </svg>
);

export default BusinessCard;

