// import { MdDelete, MdEdit } from "react-icons/md";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import Header from "../../component/Common/Header";
// import { GetAlbums, AlbumDelete, updateAlbum } from "../../Api/Album";
// import CircularArcLoader from "../../component/CustomCircularLoader";

// const SnehmmilanPhoto = () => {
//   const { t } = useTranslation();
//   const navigate = useNavigate();

//   const [albums, setAlbums] = useState<any>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
//   const [editAlbumName, setEditAlbumName] = useState("");
//   const [editAlbumYear, setEditAlbumYear] = useState("");

//   const isAdmin = localStorage.getItem("isAdmin") == "1";

//   useEffect(() => {
//     fetchAlbums();
//   }, []);

//   const fetchAlbums = async () => {
//     setIsLoading(true);
//     try {
//       const response = await GetAlbums();
//       if (response.success) {
//         setAlbums(response.data);
//       } else {
//         console.error("Failed to fetch albums:", response.message);
//       }
//     } catch (error) {
//       console.error("Error fetching albums:", error);
//     } finally {
//       setTimeout(() => setIsLoading(false), 1000);
//     }
//   };

//   const handleAlbumClick = (album_uuid: string) => {
//     navigate(`/album-photos/${album_uuid}`);
//   };

//   const handleDeleteAlbum = async () => {
//     if (!selectedAlbum) return;
//     setIsDeleting(true);
//     try {
//       const response = await AlbumDelete(selectedAlbum.album_uuid);
//       if (response.success) {
//         setAlbums(
//           albums.filter(
//             (album: any) => album.album_uuid !== selectedAlbum.album_uuid
//           )
//         );
//         setShowDeleteModal(false);
//       } else {
//         console.error("Failed to delete album:", response.message);
//       }
//     } catch (error) {
//       console.error("Error deleting album:", error);
//     } finally {
//       setTimeout(() => setIsDeleting(false), 1000);
//     }
//   };

//   const handleEditAlbum = async () => {
//     if (!selectedAlbum) return;
//     setIsEditing(true);
//     try {
//       const response = await updateAlbum(
//         selectedAlbum.album_uuid,
//         editAlbumName,
//         editAlbumYear
//       );
//       if (response.success) {
//         // Update the album in the list
//         const updatedAlbums = albums.map((album: any) =>
//           album.album_uuid === selectedAlbum.album_uuid
//             ? {
//                 ...album,
//                 photo_album_name: editAlbumName,
//                 photo_album_year: editAlbumYear,
//               }
//             : album
//         );
//         setAlbums(updatedAlbums);
//         setShowEditModal(false);
//       } else {
//         console.error("Failed to update album:", response.message);
//       }
//     } catch (error) {
//       console.error("Error updating album:", error);
//     } finally {
//       setTimeout(() => setIsEditing(false), 1000);
//     }
//   };

//   return (
//     <>
//       <Header
//         showBackArrow={true}
//         title={t("title.snehmilan_photo")}
//         onPlusClick={() => isAdmin && navigate("/Create-album")}
//         showPlusIcon={isAdmin}
//       />
//       <div className="flex justify-center items-center w-full">
//         {isLoading ? (
//           <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-75">
//             <CircularArcLoader size={60} color="brown" />
//           </div>
//         ) : albums.length > 0 ? (
//           <ul className="w-full">
//             {albums.map((album: any) => (
//               <li
//                 key={album.album_uuid}
//                 className="p-3 border-b border-gray-300 flex justify-between items-center"
//               >
//                 <div
//                   className="cursor-pointer flex-grow"
//                   onClick={() => handleAlbumClick(album.album_uuid)}
//                 >
//                   <strong>{album.photo_album_year ?? "No Name"}</strong>
//                   {"-"}
//                   {album.photo_album_name}
//                 </div>
//                 {isAdmin && (
//                   <div className="flex items-center gap-3">
//                     <button
//                       className="p-0 hover:bg-transparent bg-transparent border-0"
//                       onClick={() => {
//                         setSelectedAlbum(album);
//                         setEditAlbumName(album.photo_album_name ?? "");
//                         setEditAlbumYear(album.photo_album_year ?? "");
//                         setShowEditModal(true);
//                       }}
//                     >
//                       <MdEdit
//                         size={24}
//                         className="text-red-500 hover:bg-transparent "
//                       />
//                     </button>
//                     <button
//                       className=" text-red-500 hover:bg-transparent bg-transparent border-0 p-0 ]"
//                       onClick={() => {
//                         setSelectedAlbum(album);
//                         setShowDeleteModal(true);
//                       }}
//                     >
//                       <MdDelete
//                         size={24}
//                         className="text-red-500 hover:bg-transparent "
//                       />
//                     </button>
//                   </div>
//                 )}
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p className="text-gray-500 text-center">No albums found.</p>
//         )}
//       </div>

//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg m-5">
//             <p className="text-lg font-semibold mb-4">
//               Are you sure you want to delete this album?
//             </p>
//             <div className="flex justify-end space-x-4">
//               <button
//                 className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
//                 onClick={() => setShowDeleteModal(false)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//                 onClick={handleDeleteAlbum}
//               >
//                 {isDeleting ? (
//                   <CircularArcLoader size={20} color="white" />
//                 ) : (
//                   "OK"
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Album Modal */}
//       {showEditModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg m-5 w-96">
//             <h2 className="text-lg font-semibold mb-4">Edit Album</h2>
//             <div className="mb-4">
//               <label htmlFor="albumName" className="block mb-2">
//                 Album Name
//               </label>
//               <input
//                 id="albumName"
//                 type="text"
//                 value={editAlbumName}
//                 onChange={(e) => setEditAlbumName(e.target.value)}
//                 className="w-full px-3 py-2 border rounded-md"
//                 placeholder="Enter album name"
//               />
//             </div>
//             <div className="mb-4">
//               <label htmlFor="albumYear" className="block mb-2">
//                 Year
//               </label>
//               <input
//                 id="albumYear"
//                 type="text"
//                 value={editAlbumYear}
//                 onChange={(e) => setEditAlbumYear(e.target.value)}
//                 className="w-full px-3 py-2 border rounded-md"
//                 placeholder="Enter album year"
//               />
//             </div>
//             <div className="flex justify-end space-x-4">
//               <button
//                 className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
//                 onClick={() => setShowEditModal(false)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="px-4 py-2 bg-red-500 text-white rounded"
//                 onClick={handleEditAlbum}
//               >
//                 {isEditing ? (
//                   <CircularArcLoader size={20} color="white" />
//                 ) : (
//                   "Update"
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default SnehmmilanPhoto;
































import { MdDelete, MdEdit } from "react-icons/md";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../../component/Common/Header";
import { GetAlbums, AlbumDelete, updateAlbum, triggerallFaceRecognition } from "../../Api/Album";
import CircularArcLoader from "../../component/CustomCircularLoader";

const SnehmmilanPhoto = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [albums, setAlbums] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [editAlbumName, setEditAlbumName] = useState("");
  const [editAlbumYear, setEditAlbumYear] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const [scanMessageType, setScanMessageType] = useState<"success" | "error" | "">("");

  const isAdmin = localStorage.getItem("isAdmin") == "1";

  useEffect(() => {
    fetchAlbums();
  }, []);

  // Clear scan message after 5 seconds
  useEffect(() => {
    if (scanMessage) {
      const timer = setTimeout(() => {
        setScanMessage("");
        setScanMessageType("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [scanMessage]);

  const fetchAlbums = async () => {
    setIsLoading(true);
    try {
      const response = await GetAlbums();
      if (response.success) {
        setAlbums(response.data);
      } else {
        console.error("Failed to fetch albums:", response.message);
      }
    } catch (error) {
      console.error("Error fetching albums:", error);
    } finally {
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  const handleAlbumClick = (album_uuid: string) => {
    navigate(`/album-photos/${album_uuid}`);
  };

  const handleDeleteAlbum = async () => {
    if (!selectedAlbum) return;
    setIsDeleting(true);
    try {
      const response = await AlbumDelete(selectedAlbum.album_uuid);
      if (response.success) {
        setAlbums(
          albums.filter(
            (album: any) => album.album_uuid !== selectedAlbum.album_uuid
          )
        );
        setShowDeleteModal(false);
      } else {
        console.error("Failed to delete album:", response.message);
      }
    } catch (error) {
      console.error("Error deleting album:", error);
    } finally {
      setTimeout(() => setIsDeleting(false), 1000);
    }
  };

  const handleEditAlbum = async () => {
    if (!selectedAlbum) return;
    setIsEditing(true);
    try {
      const response = await updateAlbum(
        selectedAlbum.album_uuid,
        editAlbumName,
        editAlbumYear
      );
      if (response.success) {
        // Update the album in the list
        const updatedAlbums = albums.map((album: any) =>
          album.album_uuid === selectedAlbum.album_uuid
            ? {
              ...album,
              photo_album_name: editAlbumName,
              photo_album_year: editAlbumYear,
            }
            : album
        );
        setAlbums(updatedAlbums);
        setShowEditModal(false);
      } else {
        console.error("Failed to update album:", response.message);
      }
    } catch (error) {
      console.error("Error updating album:", error);
    } finally {
      setTimeout(() => setIsEditing(false), 1000);
    }
  };

  const handleAllScan = async () => {
    setIsScanning(true);
    setScanMessage("");
    setScanMessageType("");

    try {
      const response = await triggerallFaceRecognition();
      if (response.success) {
        setScanMessage("Face recognition process started successfully");
        setScanMessageType("success");
      } else {
        console.error("Failed to trigger face recognition:", response.message);
        setScanMessage("No unprocessed selfies found.");
        setScanMessageType("error");
      }
    } catch (error) {
      console.error("Error triggering face recognition:", error);
      setScanMessage("Error starting face recognition process");
      setScanMessageType("error");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        showBackArrow={true}
        title={t("title.snehmilan_photo")}
        onPlusClick={() => isAdmin && navigate("/Create-album")}
        showPlusIcon={isAdmin}
      />
      <div className="flex justify-center  w-full flex-grow">
        {isLoading ? (
          <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-75">
            <CircularArcLoader size={60} color="brown" />
          </div>
        ) : albums.length > 0 ? (
          <ul className="w-full">
            {albums.map((album: any) => (
              <li
                key={album.album_uuid}
                className="p-3 border-b border-gray-300 flex justify-between items-center"
              >
                <div
                  className="cursor-pointer flex-grow"
                  onClick={() => handleAlbumClick(album.album_uuid)}
                >
                  <strong>{album.photo_album_year ?? "No Name"}</strong>
                  {"-"}
                  {album.photo_album_name}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-3">
                    <button
                      className="p-0 hover:bg-transparent bg-transparent border-0"
                      onClick={() => {
                        setSelectedAlbum(album);
                        setEditAlbumName(album.photo_album_name ?? "");
                        setEditAlbumYear(album.photo_album_year ?? "");
                        setShowEditModal(true);
                      }}
                    >
                      <MdEdit
                        size={24}
                        className="text-red-500 hover:bg-transparent "
                      />
                    </button>
                    <button
                      className=" text-red-500 hover:bg-transparent bg-transparent border-0 p-0 ]"
                      onClick={() => {
                        setSelectedAlbum(album);
                        setShowDeleteModal(true);
                      }}
                    >
                      <MdDelete
                        size={24}
                        className="text-red-500 hover:bg-transparent "
                      />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center flex items-center">No albums found.</p>
        )}
      </div>

      {/* Footer with All Scan button */}
      {isAdmin && (
        <div className="bg-white p-4 shadow-md sticky bottom-0 flex flex-col items-center">
          {scanMessage && (
            <div
              className={`mb-3 px-4 py-2 rounded text-sm w-full max-w-md text-center ${scanMessageType === "success"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-100 text-red-700 border border-red-200"
                }`}
            >
              {scanMessage}
            </div>
          )}
          <button
            className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center min-w-32"
            onClick={handleAllScan}
            disabled={isScanning}
          >
            {isScanning ? (
              <CircularArcLoader size={20} color="white" />
            ) : (
              "All Scan"
            )}
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg m-5">
            <p className="text-lg font-semibold mb-4">
              Are you sure you want to delete this album?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleDeleteAlbum}
              >
                {isDeleting ? (
                  <CircularArcLoader size={20} color="white" />
                ) : (
                  "OK"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Album Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg m-5 w-96">
            <h2 className="text-lg font-semibold mb-4">Edit Album</h2>
            <div className="mb-4">
              <label htmlFor="albumName" className="block mb-2">
                Album Name
              </label>
              <input
                id="albumName"
                type="text"
                value={editAlbumName}
                onChange={(e) => setEditAlbumName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter album name"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="albumYear" className="block mb-2">
                Year
              </label>
              <input
                id="albumYear"
                type="text"
                value={editAlbumYear}
                onChange={(e) => setEditAlbumYear(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter album year"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded"
                onClick={handleEditAlbum}
              >
                {isEditing ? (
                  <CircularArcLoader size={20} color="white" />
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnehmmilanPhoto;