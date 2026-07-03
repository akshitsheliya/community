// import React from "react";
// import { FaTrash } from "react-icons/fa6";
// import { MdEdit } from "react-icons/md";
// import { useTranslation } from "react-i18next";
// import ImagePreview from "./ImagePreview";

// interface NewsCardProps {
//   image?: string;
//   title: string;
//   description?: string;
//   date?: string;
//   newsType?: string;
//   onDeleteClick?: () => void;
//   onEditClick?: () => void;
//   onCardClick?: () => void;
//   additionalInfo?: React.ReactNode;
//   additionalButtons?: React.ReactNode;
//   showEdit?: boolean;
//   showDelete?: boolean;
// }

// const NewsCard = ({
//   image,
//   title,
//   description,
//   date,
//   newsType,
//   onDeleteClick,
//   onEditClick,
//   onCardClick,
//   additionalInfo,
//   additionalButtons,
//   showEdit = false,
//   showDelete = true,
// }: NewsCardProps) => {
//   const { t } = useTranslation();
//   const handleCardClick = () => {
//     if (onCardClick) {
//       onCardClick();
//     }
//   };

//   return (
//     <div
//       className={`bg-white rounded-lg shadow-md p-2 mb-4 block ${onCardClick && "cursor-pointer"}`}
//     >
//       <div className="mb-3">
//         {image ? (
//           <div className="w-full h-48 rounded-lg overflow-hidden flex justify-center items-center">
//             <ImagePreview
//               src={image}
//               alt={title}
//               className="w-full h-full"
//               onClick={handleCardClick}
//             />
//           </div>
//         ) : (
//           <div
//             className="w-full h-40 bg-orange-100 rounded-lg flex items-center justify-center border border-theme cursor-pointer"
//             onClick={handleCardClick}
//           >
//             <span className="text-theme text-lg">No Image</span>
//           </div>
//         )}
//       </div>

//       <div className="overflow-hidden">
//         <div onClick={handleCardClick}>
//           <h2 className="font-bold text-theme leading-[22px] text-[16px]  ">
//             {title}
//           </h2>
//           {description && (
//             <p className="text-sm line-clamp-2 mt-1 font-semibold text-gray-500 ">
//               {description}
//             </p>
//           )}
//           {(date || newsType) && (
//             <div className="flex items-center mt-2">
//               {date && (
//                 <span className="text-gray-500 text-xs">
//                   {date}
//                 </span>
//               )}
//               {newsType && (
//                 <span className="px-2 py-0.5 bg-orange-100 text-theme rounded-full text-sm">
//                   {t(`news.types.${newsType}`)}
//                 </span>
//               )}
//             </div>
//           )}
//           {additionalInfo && <div className="mt-2">{additionalInfo}</div>}
//         </div>
//         <div className="flex justify-between w-full items-center mt-3">
//           <div className="flex-grow"></div>
//           <div className="flex items-center">
//             {showEdit && (
//               <button
//                 className="text-theme hover:text-theme bg-transparent hover:bg-transparent rounded-full transition-colors border-0 p-0 mr-5"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   if (onEditClick) onEditClick();
//                 }}
//                 aria-label="edit"
//               >
//                 <MdEdit size={20} />
//               </button>
//             )}
//             {showDelete && (
//               <button
//                 className="text-theme hover:text-theme bg-transparent hover:bg-transparent rounded-full transition-colors border-0 p-0"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   if (onDeleteClick) onDeleteClick();
//                 }}
//                 aria-label="Delete"
//               >
//                 <FaTrash size={20} />
//               </button>
//             )}
//           </div>
//         </div>
//         {additionalButtons && (
//           <div className="flex space-x-2 justify-end mt-2">
//             {additionalButtons}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default NewsCard;

import React from "react";
import { FaTrash } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import { useTranslation } from "react-i18next";
import ImagePreview from "./ImagePreview";

interface NewsCardProps {
  image?: string;
  title: string;
  description?: string;
  date?: string;
  newsType?: string;
  onDeleteClick?: () => void;
  onEditClick?: () => void;
  onCardClick?: () => void;
  additionalInfo?: React.ReactNode;
  additionalButtons?: React.ReactNode;
  showEdit?: boolean;
  showDelete?: boolean;
}

const NewsCard = ({
  image,
  title,
  description,
  date,
  newsType,
  onDeleteClick,
  onEditClick,
  onCardClick,
  additionalInfo,
  additionalButtons,
  showEdit = false,
  showDelete = true,
}: NewsCardProps) => {
  const { t } = useTranslation();
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick();
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-2 mb-4 block ${onCardClick && "cursor-pointer"}`}
    >
      <div className="mb-3">
        {image ? (
          <div
            className="w-full rounded-lg overflow-hidden flex justify-center items-center bg-gray-200"
            style={{ minHeight: "150px" }}
          >
            <div className="w-full flex justify-center">
              <ImagePreview
                src={image}
                alt={title}
                className="max-w-full w-auto rounded-lg"
                style={{ maxHeight: "none", height: "auto" }}
                onClick={handleCardClick}
              />
            </div>
          </div>
        ) : (
          <div
            className="w-full h-40 bg-orange-100 rounded-lg flex items-center justify-center border border-theme cursor-pointer"
            onClick={handleCardClick}
          >
            <span className="text-theme text-lg">No Image</span>
          </div>
        )}
      </div>

      <div className="overflow-hidden">
        <div onClick={handleCardClick}>
          <h2 className="font-bold text-theme leading-[22px] text-[16px]  ">
            {title}
          </h2>
          {description && (
            <p className="text-sm mt-1 font-semibold text-gray-500 ">
              {description}
            </p>
          )}
          {(date || newsType) && (
            <div className="flex items-center mt-2">
              {date && (
                <span className="text-gray-500 text-xs">
                  {date}
                </span>
              )}
              {newsType && (
                <span className="px-2 py-0.5 bg-orange-100 text-theme rounded-full text-sm">
                  {t(`news.types.${newsType}`)}
                </span>
              )}
            </div>
          )}
          {additionalInfo && <div className="mt-2">{additionalInfo}</div>}
        </div>
        <div className="flex justify-between w-full items-center mt-3">
          <div className="flex-grow"></div>
          <div className="flex items-center">
            {showEdit && (
              <button
                className="text-theme hover:text-theme bg-transparent hover:bg-transparent rounded-full transition-colors border-0 p-0 mr-5"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEditClick) onEditClick();
                }}
                aria-label="edit"
              >
                <MdEdit size={20} />
              </button>
            )}
            {showDelete && (
              <button
                className="text-theme hover:text-theme bg-transparent hover:bg-transparent rounded-full transition-colors border-0 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDeleteClick) onDeleteClick();
                }}
                aria-label="Delete"
              >
                <FaTrash size={20} />
              </button>
            )}
          </div>
        </div>
        {additionalButtons && (
          <div className="flex space-x-2 justify-end mt-2">
            {additionalButtons}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsCard;