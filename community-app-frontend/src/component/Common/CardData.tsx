import { FaTrash, FaUser } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import { useTranslation } from "react-i18next";

const Card = ({
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
  const handleCallUser = (data: any) => {
    const moNumber = JSON.stringify(data);

    //@ts-ignore
    window?.flutter_inappwebview?.callHandler("callUser", moNumber);
  };
  const { t } = useTranslation();
  const getDonorTypeKey = (type: string) => {
    if (!type) return "";

    const normalizedType = type.trim().toLowerCase();
    if (normalizedType.includes("bhojan")) return "BhojanSamarambh";
    if (normalizedType.includes("inam")) return "InamVitran";
    return type.split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  };

  return (
    <>
      <div
        className={`bg-white rounded-lg shadow-md p-2 mb-4 flex items-center ${details && "cursor-pointer"
          }`}
      >
        <div
          className="flex flex-col items-center justify-center min-w-16"
          onClick={(e: any) => details(e)}
        >
          {image ? (
            <div className="bg-orange-100 border border-theme rounded-full">
              <img
                src={image}
                alt={userName}
                className="h-16 w-16 rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="bg-orange-100 rounded-full p-3 border border-theme">
              <FaUser className="text-theme" size={40} />
            </div>
          )}
        </div>

        <div className="flex-grow ml-4">
          <div onClick={(e: any) => details(e)}>
            <h2 className="font-bold text-theme leading-[20px]">{userName}</h2>
            {address && (
              <p className="text-xs font-normal leading-[15px]">
                {address}
              </p>
            )}
            {email && (
              <p className="text-xs font-normal leading-[15px]">{email}</p>
            )}
            {additionalInfo && <div className="mt-1">{additionalInfo}</div>}
          </div>
          <div className="flex justify-between w-full items-center mt-1">
            <div onClick={(e: any) => details(e)}>
              {phoneNumber && (
                <p
                  className="text-xs leading-[15px]"
                  onClick={() => handleCallUser(phoneNumber)}
                >
                  {phoneNumber}
                </p>
              )}
              {donor && (
                <div className="flex flex-col">
                  {showDonorType && donor.donor_type && (
                    <p className="text-xs font-bold text-theme mt-1">
                      {t(`donors.${getDonorTypeKey(donor.donor_type)}`)}
                    </p>
                  )}

                  <span
                    className={`px-3 py-1 rounded-full mt-1 text-white text-xs font-medium w-fit ${donor.is_lifetime_donor == 1 ? "bg-theme" : "bg-gray-600"
                      }`}
                  >
                    {donor.is_lifetime_donor == 1
                      ? t("donors.life_time_donor")
                      : donor.donation_year
                        ? `${t("donors.year")}: ${donor.donation_year}`
                        : t("donors.one_time_donor")}
                  </span>
                </div>
              )}
            </div>
            <div>
              {edit && (
                <button
                  className="text-theme hover:text-theme bg-transparent hover:bg-transparent rounded-full transition-colors border-0 p-0 mr-5"
                  onClick={(e: any) => onClickEdit(e)}
                  aria-label="edit"
                >
                  <MdEdit size={20} />
                </button>
              )}
              {deleteButton && (
                <button
                  className="text-theme hover:text-theme bg-transparent hover:bg-transparent rounded-full transition-colors border-0 p-0"
                  onClick={(e: any) => onClick(e)}
                  aria-label="Delete"
                >
                  <FaTrash size={20} />
                </button>
              )}
            </div>
          </div>
          {additionalbuttons && (
            <div className="flex space-x-2 justify-end">
              {additionalbuttons}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Card;