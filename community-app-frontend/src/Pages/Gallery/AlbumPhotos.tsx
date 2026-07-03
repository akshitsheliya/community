// import { useEffect, useRef, useState, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { getPhotosByAlbum, uploadPhoto } from "../../Api/Album";
// import Header from "../../component/Common/Header";
// import SubmitButton from "../../Pages/auth/Common/SubmitButton";
// import { FaCheckCircle, FaTimes, } from "react-icons/fa";
// import { Progress, Modal } from "antd";
// import { Image } from "antd";
// import { Notify } from "../../component/Common/Notify";
// import {
//   Photo,
//   FileUploadProgress,
//   ProgressEvent,
// } from "../../helper/Types/types";
// import { FaCamera, FaFileImage } from "react-icons/fa6";
// import CircularArcLoader from "../../component/CustomCircularLoader";
// import { GetMyphoto, GetSelfiePhoto, PostMyphoto , DeleteSelfie} from "../../Api/MyPhoto";
// import { useTranslation } from "react-i18next";

// const AlbumPhotos = () => {
//   const { album_uuid } = useParams();
//   const navigate = useNavigate();

//   let details = navigator.userAgent.toLowerCase();
//   let isIphone = /iphone/.test(details);
//   let isAndroid = /android/.test(details);

//   const imageUploadRef = useRef<any>(null);
//   const imageCameraUploadRef = useRef<any>(null);
//   const observerRef = useRef<IntersectionObserver | null>(null);
//   const loadingRef = useRef<HTMLDivElement | null>(null);
//   const cachedDataRef = useRef<Map<number, Photo[]>>(new Map());
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [selfieToDelete, setSelfieToDelete] = useState<string | null>(null);
//   const [deleteLoading, setDeleteLoading] = useState(false);
//   const [selfieLoading, setSelfieLoading] = useState(false);
//   const [photos, setPhotos] = useState<Photo[]>([]);
//   const [selectedFiles, setSelectedFiles] = useState<FileUploadProgress[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize] = useState(12);
//   const [hasMore, setHasMore] = useState(true);
//   const [myPhotos, setMyPhotos] = useState<boolean>(false);
//   const [selfiePhotos, setSelfiePhotos] = useState<any>(null);
//   const [selectedSelfieFiles, setSelectedSelfieFiles] = useState<any>(null);
//   const [selectedSelfieFilesId, setSelectedSelfieFilesId] = useState<any>(null);
//   const [selectedSelfieData, setSelectedSelfieData] = useState<any>(null);
//   const [openCamera, setOpenCamera] = useState<boolean>(false);
//   const [openSelfieSelectedImage, setOpenSelfieSelectedImage] = useState<boolean>(false);
//   const [faceRecognitionLoading, setFaceRecognitionLoading] = useState<boolean>(false);

//   const isAdmin = localStorage.getItem("isAdmin") == "1";
//   const [initialLoading, setInitialLoading] = useState<boolean>(true);
//   const { t } = useTranslation();
//   const handleDeleteSelfie = (selfieUuid: string) => {
//     setSelfieToDelete(selfieUuid);
//     setDeleteModalOpen(true);
//   };

//   const confirmDeleteSelfie = async () => {
//     if (!selfieToDelete) return;

//     setDeleteLoading(true);
//     try {
//       const response = await DeleteSelfie(selfieToDelete);
//       if (response.message) {
//         Notify(response.message, "success");

//         setSelfiePhotos((prevPhotos: any[]) =>
//           prevPhotos.filter(photo => photo.selfie_uuid !== selfieToDelete)
//         );

//         if (selectedSelfieFilesId === selfieToDelete) {
//           setSelectedSelfieFilesId(null);
//           setSelectedSelfieData(null);
//         }
//       }
//     } catch (error: any) {
//       console.error("Delete selfie error:", error);
//       Notify(error.response?.data?.message || "Failed to delete selfie", "error");
//     } finally {
//       setDeleteLoading(false);
//       setDeleteModalOpen(false);
//       setSelfieToDelete(null);
//     }
//   };
//   const fetchPhotos = useCallback(
//     async (page: number) => {
//       if (!album_uuid) return;
//       if (myPhotos) {
//         setInitialLoading(false);
//         return;
//       }
//       if (cachedDataRef.current.has(page)) {
//         const cachedPhotos = cachedDataRef.current.get(page);
//         if (page === 1) {
//           setPhotos(cachedPhotos || []);
//         } else {
//           setPhotos((prev) => [...prev, ...(cachedPhotos || [])]);
//         }
//         if (page === 1) {
//           setInitialLoading(false);
//         }
//         return;
//       }

//       try {
//         setIsLoading(true);
//         const data = await getPhotosByAlbum(album_uuid, page, pageSize);
//         if (data.success) {
//           const newPhotos = data.data;
//           cachedDataRef.current.set(page, newPhotos);

//           if (page === 1) {
//             setPhotos(newPhotos);
//           } else {
//             setPhotos((prev) => [...prev, ...newPhotos]);
//           }

//           setHasMore(newPhotos.length === pageSize);
//         }
//       } catch (error) {
//         console.error("Error fetching photos:", error);
//       } finally {
//         setIsLoading(false);
//         if (page === 1) {
//           setInitialLoading(false);
//         }
//       }
//     },
//     [album_uuid, pageSize, myPhotos]
//   );

//   useEffect(() => {
//     setPhotos([]);
//     setCurrentPage(1);
//     setHasMore(true);
//     setSelectedSelfieFilesId(null);
//     setSelectedSelfieData(null);

//     if (!myPhotos) {
//       cachedDataRef.current.clear();
//       setInitialLoading(true);
//       fetchPhotos(1);
//     } else {
//       setInitialLoading(false);
//     }
//   }, [album_uuid, fetchPhotos, myPhotos]);

//   useEffect(() => {
//     if (!myPhotos) {
//       const observer = new IntersectionObserver(
//         (entries) => {
//           const [entry] = entries;
//           if (entry.isIntersecting && hasMore && !isLoading) {
//             setCurrentPage((prev) => prev + 1);
//           }
//         },
//         { threshold: 0.5 }
//       );

//       if (loadingRef.current) {
//         observer.observe(loadingRef.current);
//       }

//       observerRef.current = observer;

//       return () => {
//         if (observerRef.current) {
//           observerRef.current.disconnect();
//         }
//       };
//     }
//   }, [hasMore, isLoading, myPhotos]);

//   useEffect(() => {
//     if (currentPage > 1 && hasMore && !myPhotos) {
//       fetchPhotos(currentPage);
//     }
//   }, [currentPage, hasMore, fetchPhotos, myPhotos]);

//   const handleFileChange = (event: any) => {
//     if (event.target.files && event.target.files.length > 0) {
//       const files = Array.from(event.target.files);
//       const validFiles: FileUploadProgress[] = [];

//       files.forEach((file: any) => {
//         if (!file.type.startsWith("image/")) {
//           Notify(
//             `${file.name} is not an image! Only images are allowed.`,
//             "error"
//           );
//           return;
//         }

//         validFiles.push({
//           file,
//           progress: 0,
//           uploaded: false,
//         });
//       });

//       if (validFiles.length > 0) {
//         setSelectedFiles(validFiles);
//         setIsUploadModalOpen(true);
//       }
//     }
//   };

//   const handleUpload = async () => {
//     if (!selectedFiles.length || !album_uuid) {
//       Notify("No files selected.", "error");
//       return;
//     }

//     setIsLoading(true);

//     for (let i = 0; i < selectedFiles.length; i++) {
//       let fileProgress = selectedFiles[i];

//       try {
//         const response = await uploadPhoto(album_uuid, fileProgress.file);
//         (progressEvent: ProgressEvent) => {
//           const percentCompleted = Math.round(
//             (progressEvent.loaded * 100) / progressEvent.total
//           );

//           setSelectedFiles((prevFiles) =>
//             prevFiles.map((f, index) =>
//               index == i ? { ...f, progress: percentCompleted } : f
//             )
//           );
//         };

//         if (response?.success) {
//           setSelectedFiles((prevFiles) =>
//             prevFiles.map((f, index) =>
//               index == i ? { ...f, uploaded: true, progress: 100 } : f
//             )
//           );
//         } else {
//           console.error(`Upload failed for ${fileProgress.file.name}`);
//         }
//       } catch (error) {
//         console.error(`Error uploading ${fileProgress.file.name}:`, error);
//       }
//     }

//     setIsLoading(false);
//     cachedDataRef.current.clear();
//     setCurrentPage(1);
//     fetchPhotos(1);
//     setTimeout(() => {
//       setSelectedFiles([]);
//       setIsUploadModalOpen(false);
//       navigate("/photos", { replace: true });
//     }, 500);
//   };

//   const handlePlusClick = () => {
//     if (isAdmin) {
//       if (isAndroid || isIphone) {
//         setOpenCamera(true);
//       } else {
//         if (imageUploadRef.current) {
//           imageUploadRef.current.click();
//         }
//       }
//     } else {
//       navigate("/Create-album");
//     }
//   };

//   const handleCameraClick = () => {
//     if (isAdmin) {
//       // @ts-ignore
//       window?.flutter_inappwebview?.callHandler("openCamera");
//     } else {
//       navigate("/Create-album");
//     }
//     setOpenCamera(false);
//   };

//   const handleImage = () => {
//     if (!myPhotos && imageUploadRef.current) {
//       imageUploadRef.current.click();
//       setOpenCamera(false);
//     } else if (imageCameraUploadRef.current) {
//       imageCameraUploadRef.current.click();
//     } else {
//       navigate("/Create-album");
//     }
//   };

//   const handleFileSelfieChange = async (event: any) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setSelectedSelfieFiles(file ? file : null);
//       setOpenSelfieSelectedImage(true);
//     }
//   };

//   const convertBase64ToFile = (base64String: any, fileName: any) => {
//     const base64 = base64String.split(",").pop();

//     const sanitizedBase64 = base64.replace(/[^A-Za-z0-9+/=]/g, "");

//     const byteString = atob(sanitizedBase64);

//     const ab = new ArrayBuffer(byteString.length);
//     const ia = new Uint8Array(ab);

//     // Convert binary data to array buffer
//     for (let i = 0; i < byteString.length; i++) {
//       ia[i] = byteString.charCodeAt(i);
//     }

//     // Create a Blob object from the array buffer
//     const blob = new Blob([ab], { type: "image/*" });

//     // Optionally convert Blob to File
//     const file = new File([blob], fileName, { type: "image/*" });

//     return file;
//   };

//   useEffect(() => {
//     const handleImageData = async (event: any) => {
//       const data: any = event.detail;

//       if (data?.name && data?.bytes) {
//         const file = convertBase64ToFile(data?.bytes, data?.name);
//         if (file) {
//           if (!myPhotos) {
//             const validFiles: any = [];

//             if (!file.type.startsWith("image/")) {
//               Notify(
//                 `${file.name} is not an image! Only images are allowed.`,
//                 "error"
//               );
//               return;
//             }

//             validFiles.push({
//               file,
//               progress: 0,
//               uploaded: false,
//             });

//             if (validFiles.length > 0) {
//               setSelectedFiles((prevImages: any) => [
//                 ...(prevImages || []),
//                 ...validFiles,
//               ]);
//               setIsUploadModalOpen(true);
//             }
//           } else {
//             setSelectedSelfieFiles(file);
//           }
//         }
//       }
//     };

//     window.addEventListener("getImage", handleImageData);

//     return () => {
//       window.removeEventListener("getImage", handleImageData);
//     };
//   }, []);

//   const handleSubmit = async (e: any) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       if (selectedSelfieFiles) {
//         const data: any = {
//           selfie: selectedSelfieFiles,
//         };

//         const result: any = await PostMyphoto(data);

//         if (result?.message) {
//           Notify(result?.message, "success");
//           setSelectedSelfieFiles(null);
//           setSelfiePhotos((prevRes: any) => [
//             {
//               id: result?.selfie_id,
//               upload_by_user_id: null,
//               selfie_uuid: result?.selfie_uuid,
//               img_selfie: result?.img_selfie,
//               added_on: new Date().toISOString(),
//             },
//             ...(prevRes || []),
//           ]);
//         }
//         setIsLoading(false);
//         setOpenSelfieSelectedImage(false);
//       }
//     } catch (error: any) {
//       console.error("Upload image error:", error);
//       Notify("Failed to upload image", "error");
//       setIsLoading(false);
//       setOpenSelfieSelectedImage(false);
//     }
//     setIsLoading(false);
//     setSelectedSelfieFiles(null);
//     setOpenSelfieSelectedImage(false);
//   };

//   useEffect(() => {
//     if (myPhotos) {
//       (async () => {
//         try {
//           setSelfieLoading(true);
//           const response = await GetMyphoto();
//           setSelfiePhotos(response.selfies);
//         } catch (error) {
//           console.error("Error fetching selfies:", error);
//           console.error("Error fetching selfies:", error);
//         } finally {
//           setSelfieLoading(false);
//         }
//       })();
//     }
//   }, [myPhotos]);

//   useEffect(() => {
//     if (selectedSelfieFilesId && myPhotos) {
//       (async () => {
//         try {
//           setFaceRecognitionLoading(true);
//           const response = await GetSelfiePhoto(
//             album_uuid,
//             selectedSelfieFilesId
//           );

//           setSelectedSelfieData(response.similarPhotos);
//         } catch (error) {
//           console.error("Error fetching selfie:", error);
//           Notify("Failed to fetch related photos", "error");
//         } finally {
//           setFaceRecognitionLoading(false);
//         }
//       })();
//     } else {
//       setSelectedSelfieData(null);
//     }
//   }, [selectedSelfieFilesId, album_uuid, myPhotos]);
//   const switchToAlbum = () => {
//     setMyPhotos(false);
//     setSelectedSelfieFilesId(null);
//     setSelectedSelfieData(null);
//   };

//   const switchToMyPhotos = () => {
//     setMyPhotos(true);
//     setSelectedSelfieData(null);
//   };

//   if (initialLoading) {
//     return (
//       <div className="flex flex-col h-[calc(100vh-75px)]">
//         <div>
//           <Header
//             showBackArrow={true}
//             title={t("albumphotos.album_photos")}
//             onPlusClick={handlePlusClick}
//             showPlusIcon={isAdmin}
//           />
//         </div>
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <CircularArcLoader size={50} color="brown" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-[calc(100vh-75px)]">
//       <div>
//         <Header
//           showBackArrow={true}
//           title={myPhotos ? t("albumphotos.myphotos") : t("albumphotos.album_photos")}
//           onPlusClick={handlePlusClick}
//           showPlusIcon={isAdmin}
//         />

//         <input
//           type="file"
//           className="hidden"
//           onChange={handleFileChange}
//           accept={"image/*"}
//           multiple
//           ref={imageUploadRef}
//           defaultValue={undefined}
//         />
//       </div>

//       {myPhotos && (
//         <div className={`flex items-center w-full mt-2 px-4 pb-2`}>
//           <div
//             onClick={handleImage}
//             className={`flex flex-col items-center min-w-[75px]`}
//           >
//             <FaCamera size={30} />
//             <span className="whitespace-nowrap text-ellipsis overflow-hidden">
//               {t("albumphotos.takeselfie")}
//             </span>

//             <input
//               type="file"
//               className="hidden"
//               onChange={handleFileSelfieChange}
//               accept={"image/*"}
//               ref={imageCameraUploadRef}
//               defaultValue={undefined}
//             />
//           </div>
//           <div
//             className={`${"w-[calc(100%-70px)]"} flex gap-2 overflow-auto ml-2 pb-4`}
//           >
//             {selfiePhotos?.length > 0 ? (
//               <>
//                 {selfiePhotos?.map((photo: any) => (
//                   <div
//                     key={photo.selfie_uuid}
//                     className={`min-w-16 max-w-16 h-16 ml-3 items-center flex-col flex justify-center relative ${selectedSelfieFilesId == photo?.selfie_uuid &&
//                       "border-2 border-theme p-1 rounded-lg"
//                       }`}
//                   >
//                     <div
//                       className="absolute -bottom-2 -right-2 bg-red-500 rounded-full p-1 cursor-pointer z-10"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleDeleteSelfie(photo.selfie_uuid);
//                       }}
//                     >
//                       <FaTimes className="text-white text-xs" />
//                     </div>
//                     <div
//                       className="w-full h-full"
//                       onClick={() => setSelectedSelfieFilesId(photo?.selfie_uuid)}
//                     >
//                       <img
//                         className="h-full w-full object-cover rounded-full"
//                         src={photo?.img_selfie}
//                         alt="Profile Images"
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </>
//             ) : (
//               <p className="text-gray-500 col-span-full text-center">
//                 {t("albumphotos.Noselfiefound")}
//               </p>
//             )}
//           </div>
        
//         </div>
//       )}


//       {faceRecognitionLoading && (

//         <div className="fixed inset-0  z-50 flex items-center justify-center">
//           <div className=" p-6 rounded-lg  text-center">
//             <span className="flex justify-center items-center w-full">
//             <CircularArcLoader size={50} color="brown" /></span>
//             <p className="mt-4 text-lg font-medium ">Finding similar photos...</p>
//           </div>
//         </div>
//       )}

//       {myPhotos && selectedSelfieData?.length > 0 && (
//         <div className="my-2 mx-2">
//           <hr />
//           <h3 className="text-lg font-bold mt-2">
//             {" "}
//             {t("albumphotos.selfierelatedphoto")}
//           </h3>
//           <Image.PreviewGroup>
//             <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2 p-3 w-full">
//               {selectedSelfieData?.map((photo: any) => (
//                 <div key={photo.photo_id} className="relative group">
//                   <Image
//                     src={photo.thumb_url}
//                     preview={{
//                       src: photo.photo_url,
//                     }}
//                     alt="Album photo"
//                     width="100%"
//                     height={100}
//                     className="w-full h-24 sm:h-32 object-cover rounded-sm shadow-md"
//                     style={{ objectFit: "cover" }}
//                   />
//                 </div>
//               ))}
//             </div>
//           </Image.PreviewGroup>
//           <hr />
//         </div>
//       )}

//       <div className="flex-1 overflow-y-auto ">
//         <Image.PreviewGroup>
//           <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2 p-3 w-full">
//             {photos.length > 0 ? (
//               photos.map((photo) => (
//                 <div key={photo.photo_id} className="relative group">
//                   <Image
//                     src={photo.thumb_url}
//                     preview={{
//                       src: photo.photo_url,
//                     }}
//                     alt="Album photo"
//                     width="100%"
//                     height={100}
//                     className="w-full h-24 sm:h-32 object-cover rounded-sm shadow-md"
//                     style={{ objectFit: "cover" }}
//                   />
//                 </div>
//               ))
//             ) : (
//               <p className=""></p>
//             )}
//           </div>
//         </Image.PreviewGroup>
//           {hasMore && (
//             <div ref={loadingRef} className="flex justify-center py-4">
//               {isLoading && <CircularArcLoader size={30} />}
//             </div>
//           )}
//         </div>
    
//       {myPhotos && (
//         <div className="flex-1">
//           {selfieLoading ? (
//             <div className="flex items-center justify-center inset-0  ">
//               <CircularArcLoader size={50} color="brown" />
//             </div>
//           ) : (
//             !selectedSelfieData?.length && !faceRecognitionLoading && (
//               <div className="flex items-top justify-center mt-10">
//                 <p className="text-gray-500 text-center">
//                   {selfiePhotos?.length > 0
//                       ? t("deleteconfirmation")
//                       : t("selectselfie") }
//                 </p>
//               </div>
//             )
//           )}
//         </div>
//       )}

//       <div className=" items-center w-full mt-2 justify-between px-4 fixed bottom-4 flex">  {/* flex */}
//         <button
//           onClick={switchToAlbum}
//           className={`font-bold text-base rounded-lg py-2 px-4 ${!myPhotos
//             ? "text-white bg-theme"
//             : "text-white bg-gray-300 hover:bg-gray-400"
//             }`}
//         >
//           {t("albumphotos.album")}
//         </button>
//         <button
//           onClick={switchToMyPhotos}
//           className={`font-bold text-base rounded-lg py-2 px-4 ${myPhotos
//             ? "text-white bg-theme"
//             : "text-white bg-gray-300 hover:bg-gray-400"
//             }`}
//         >
//           {t("albumphotos.myphotos")}
//         </button>
//       </div>

//       <Modal
//         title={t("albumphotos.uploadphotos")}
//         open={isUploadModalOpen}
//         onCancel={() => {
//           setSelectedFiles([]);
//           setIsUploadModalOpen(false);
//         }}
//         footer={[
//           <SubmitButton
//             key="upload"
//             isLoading={isLoading}
//             isDisabled={isLoading || selectedFiles.length === 0}
//             onClick={handleUpload}
//           >
//             Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}
//           </SubmitButton>,
//         ]}
//         centered
//         closeIcon={<FaTimes className="text-gray-500 hover:text-gray-700" />}
//       >
//         {selectedFiles.length == 0 ? (
//           <div className="text-center text-gray-500 py-4">
//             {t("albumphotos.Nofileselected")}
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {selectedFiles.map((fileProgress, index) => (
//               <div
//                 key={index}
//                 className="flex items-center space-x-3 border-b pb-3 last:border-b-0"
//               >
//                 <div className="flex-shrink-0 w-12 h-12">
//                   <img
//                     src={URL.createObjectURL(fileProgress.file)}
//                     alt={fileProgress.file.name}
//                     className="w-full h-full object-cover rounded"
//                   />
//                 </div>
//                 <div className="flex-grow whitespace-pre-wrap break-words max-w-full overflow-hidden">
//                   <p className="text-sm truncate font-medium">
//                     {fileProgress.file.name}
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     {(fileProgress.file.size / 1024 / 1024).toFixed(2)} MB
//                   </p>
//                   <Progress
//                     percent={fileProgress.progress}
//                     strokeWidth={6}
//                     strokeColor={
//                       fileProgress.progress < 50
//                         ? "#f5222d"
//                         : fileProgress.progress < 80
//                           ? "#faad14"
//                           : "#52c41a"
//                     }
//                     format={(percent) => `${percent}% Uploaded`}
//                   />
//                 </div>
//                 {fileProgress.uploaded && (
//                   <FaCheckCircle className="text-green-500 text-xl" />
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </Modal>

//       <Modal
//         title={
//           <>
//             <div className="flex flex-col gap-1">
//               <div className="ml-3 text-md font-semibold tracking-wide">
//                 {t("albumphotos.selectoption")}
//               </div>
//             </div>
//             <hr className="mt-3" />
//           </>
//         }
//         open={openCamera}
//         onCancel={() => setOpenCamera(false)}
//         centered
//         footer={false}
//         closable={false}
//       >
//         <div className="grid grid-cols-2 mt-4 gap-3">
//           <div
//             onClick={handleCameraClick}
//             className="py-2 font-bold text-base rounded drop-shadow-sm border-0 flex justify-center cursor-pointer"
//           >
//             <FaCamera className="text-gray-300 h-10 w-10" />
//           </div>

//           <div
//             onClick={handleImage}
//             className="py-2 font-bold text-base rounded drop-shadow-sm border-0 flex justify-center cursor-pointer"
//           >
//             <FaFileImage className="text-theme h-10 w-10" />
//           </div>
//         </div>
//       </Modal>

//       <Modal
//         title={
//           <>
//             <div className="flex flex-col gap-1">
//               <div className="ml-3 text-md font-semibold tracking-wide">
//                 {t("albumphotos.selfieimage")}
//               </div>
//             </div>
//             <hr className="mt-3" />
//           </>
//         }
//         open={openSelfieSelectedImage}
//         onCancel={() => setOpenSelfieSelectedImage(false)}
//         centered
//         footer={false}
//         closable={false}
//       >
//         <div className="w-full mt-4 gap-3">
//           {selectedSelfieFiles && (
//             <div className="flex items-center ml-2 justify-center">
//               <div className={`min-w-20 min-h-14`}>
//                 <Image
//                   src={URL.createObjectURL(selectedSelfieFiles)}
//                   alt="Profile Image"
//                   width="100%"
//                   height={100}
//                   style={{ objectFit: "cover" }}
//                 />
//               </div>

//               <button
//                 className={`font-bold text-base rounded-lg justify-center text-white relative m-5 ${isLoading ? "cursor-not-allowed opacity-50" : ""
//                   }`}
//                 disabled={isLoading}
//                 onClick={handleSubmit}
//               >
//                 <span
//                   className={`transition-opacity ${isLoading ? "opacity-0" : "opacity-100"
//                     }`}
//                 >
//                   {t("albumphotos.Upload")}
//                 </span>

//                 {isLoading && (
//                   <span className="flex items-center justify-center absolute inset-0">
//                     <CircularArcLoader size={30}  />
//                   </span>
//                 )}
//               </button>
//             </div>
//           )}
//         </div>
//       </Modal>

//       <Modal
//         title={
//           <>
//             <div className="flex flex-col gap-1">
//               <div className="ml-3 text-md font-semibold tracking-wide">
//                 {t("albumphotos.deleteselfie")}
//               </div>
//             </div>
//             <hr className="mt-3" />
//           </>
//         }
//         open={deleteModalOpen}
//         onCancel={() => {
//           setDeleteModalOpen(false);
//           setSelfieToDelete(null);
//         }}
//         centered
//         footer={[
//           <button
//             key="cancel"
//             onClick={() => {
//               setDeleteModalOpen(false);
//               setSelfieToDelete(null);
//             }}
//             className="font-bold text-base rounded-lg py-2 px-4 text-white bg-gray-300 hover:bg-gray-400"
//           >
//             {t("cancel")}
//           </button>,
//           <button
//             key="delete"
//             onClick={confirmDeleteSelfie}
//             className={`font-bold text-base rounded-lg py-2 px-4 text-white bg-red-500 hover:bg-red-600 ml-2 ${deleteLoading ? "opacity-50 cursor-not-allowed" : ""
//               }`}
//             disabled={deleteLoading}
//           >
//             {deleteLoading ? (
//               <CircularArcLoader size={20} color="white" />
//             ) : (
//               t("delete")
//             )}
//           </button>
//         ]}
//       >
//         <p className="py-4 text-center">
//           {t("albumphotos.deleteconfirmation")}
//         </p>
//       </Modal>
//     </div>
//   );
// };

// export default AlbumPhotos;























































import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPhotosByAlbum, uploadPhoto, triggerFaceRecognition } from "../../Api/Album";
import Header from "../../component/Common/Header";
import SubmitButton from "../../Pages/auth/Common/SubmitButton";
import { FaCheckCircle, FaTimes, } from "react-icons/fa";
import { Progress, Modal } from "antd";
import { Image } from "antd";
import { Notify } from "../../component/Common/Notify";
import {
  Photo,
  FileUploadProgress,
  ProgressEvent,
} from "../../helper/Types/types";
import { FaCamera, FaFileImage } from "react-icons/fa6";
import CircularArcLoader from "../../component/CustomCircularLoader";
import { GetMyphoto, GetSelfiePhoto, PostMyphoto, DeleteSelfie } from "../../Api/MyPhoto";
import { useTranslation } from "react-i18next";

const AlbumPhotos = () => {
  const { album_uuid } = useParams();
  const navigate = useNavigate();

  let details = navigator.userAgent.toLowerCase();
  let isIphone = /iphone/.test(details);
  let isAndroid = /android/.test(details);

  const imageUploadRef = useRef<any>(null);
  const imageCameraUploadRef = useRef<any>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const cachedDataRef = useRef<Map<number, Photo[]>>(new Map());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selfieToDelete, setSelfieToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selfieLoading, setSelfieLoading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileUploadProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  const [myPhotos, setMyPhotos] = useState<boolean>(false);
  const [selfiePhotos, setSelfiePhotos] = useState<any>(null);
  const [selectedSelfieFiles, setSelectedSelfieFiles] = useState<any>(null);
  const [selectedSelfieFilesId, setSelectedSelfieFilesId] = useState<any>(null);
  const [selectedSelfieData, setSelectedSelfieData] = useState<any>(null);
  const [openCamera, setOpenCamera] = useState<boolean>(false);
  const [openSelfieSelectedImage, setOpenSelfieSelectedImage] = useState<boolean>(false);
  const [faceRecognitionLoading, setFaceRecognitionLoading] = useState<boolean>(false);
  const [scanLoading, setScanLoading] = useState<boolean>(false);

  const isAdmin = localStorage.getItem("isAdmin") == "1";
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const { t } = useTranslation();
  const handleDeleteSelfie = (selfieUuid: string) => {
    setSelfieToDelete(selfieUuid);
    setDeleteModalOpen(true);
  };

  const confirmDeleteSelfie = async () => {
    if (!selfieToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await DeleteSelfie(selfieToDelete);
      if (response.message) {
        Notify(response.message, "success");

        setSelfiePhotos((prevPhotos: any[]) =>
          prevPhotos.filter(photo => photo.selfie_uuid !== selfieToDelete)
        );

        if (selectedSelfieFilesId === selfieToDelete) {
          setSelectedSelfieFilesId(null);
          setSelectedSelfieData(null);
        }
      }
    } catch (error: any) {
      console.error("Delete selfie error:", error);
      Notify(error.response?.data?.message || "Failed to delete selfie", "error");
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setSelfieToDelete(null);
    }
  };
  const fetchPhotos = useCallback(
    async (page: number) => {
      if (!album_uuid) return;
      if (myPhotos) {
        setInitialLoading(false);
        return;
      }
      if (cachedDataRef.current.has(page)) {
        const cachedPhotos = cachedDataRef.current.get(page);
        if (page === 1) {
          setPhotos(cachedPhotos || []);
        } else {
          setPhotos((prev) => [...prev, ...(cachedPhotos || [])]);
        }
        if (page === 1) {
          setInitialLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        const data = await getPhotosByAlbum(album_uuid, page, pageSize);
        if (data.success) {
          const newPhotos = data.data;
          cachedDataRef.current.set(page, newPhotos);

          if (page === 1) {
            setPhotos(newPhotos);
          } else {
            setPhotos((prev) => [...prev, ...newPhotos]);
          }

          setHasMore(newPhotos.length === pageSize);
        }
      } catch (error) {
        console.error("Error fetching photos:", error);
      } finally {
        setIsLoading(false);
        if (page === 1) {
          setInitialLoading(false);
        }
      }
    },
    [album_uuid, pageSize, myPhotos]
  );

  useEffect(() => {
    setPhotos([]);
    setCurrentPage(1);
    setHasMore(true);
    setSelectedSelfieFilesId(null);
    setSelectedSelfieData(null);

    if (!myPhotos) {
      cachedDataRef.current.clear();
      setInitialLoading(true);
      fetchPhotos(1);
    } else {
      setInitialLoading(false);
    }
  }, [album_uuid, fetchPhotos, myPhotos]);

  useEffect(() => {
    if (!myPhotos) {
      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting && hasMore && !isLoading) {
            setCurrentPage((prev) => prev + 1);
          }
        },
        { threshold: 0.5 }
      );

      if (loadingRef.current) {
        observer.observe(loadingRef.current);
      }

      observerRef.current = observer;

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }
  }, [hasMore, isLoading, myPhotos]);

  useEffect(() => {
    if (currentPage > 1 && hasMore && !myPhotos) {
      fetchPhotos(currentPage);
    }
  }, [currentPage, hasMore, fetchPhotos, myPhotos]);

  const handleFileChange = (event: any) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      const validFiles: FileUploadProgress[] = [];

      files.forEach((file: any) => {
        if (!file.type.startsWith("image/")) {
          Notify(
            `${file.name} is not an image! Only images are allowed.`,
            "error"
          );
          return;
        }

        validFiles.push({
          file,
          progress: 0,
          uploaded: false,
        });
      });

      if (validFiles.length > 0) {
        setSelectedFiles(validFiles);
        setIsUploadModalOpen(true);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles.length || !album_uuid) {
      Notify("No files selected.", "error");
      return;
    }

    setIsLoading(true);

    for (let i = 0; i < selectedFiles.length; i++) {
      let fileProgress = selectedFiles[i];

      try {
        const response = await uploadPhoto(album_uuid, fileProgress.file);
        (progressEvent: ProgressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );

          setSelectedFiles((prevFiles) =>
            prevFiles.map((f, index) =>
              index == i ? { ...f, progress: percentCompleted } : f
            )
          );
        };

        if (response?.success) {
          setSelectedFiles((prevFiles) =>
            prevFiles.map((f, index) =>
              index == i ? { ...f, uploaded: true, progress: 100 } : f
            )
          );
        } else {
          console.error(`Upload failed for ${fileProgress.file.name}`);
        }
      } catch (error) {
        console.error(`Error uploading ${fileProgress.file.name}:`, error);
      }
    }

    setIsLoading(false);
    cachedDataRef.current.clear();
    setCurrentPage(1);
    fetchPhotos(1);
    setTimeout(() => {
      setSelectedFiles([]);
      setIsUploadModalOpen(false);
      navigate("/photos", { replace: true });
    }, 500);
  };

  const handlePlusClick = () => {
    if (isAdmin) {
      if (isAndroid || isIphone) {
        setOpenCamera(true);
      } else {
        if (imageUploadRef.current) {
          imageUploadRef.current.click();
        }
      }
    } else {
      navigate("/Create-album");
    }
  };

  const handleCameraClick = () => {
    if (isAdmin) {
      // @ts-ignore
      window?.flutter_inappwebview?.callHandler("openCamera");
    } else {
      navigate("/Create-album");
    }
    setOpenCamera(false);
  };

  const handleImage = () => {
    if (!myPhotos && imageUploadRef.current) {
      imageUploadRef.current.click();
      setOpenCamera(false);
    } else if (imageCameraUploadRef.current) {
      imageCameraUploadRef.current.click();
    } else {
      navigate("/Create-album");
    }
  };

  const handleFileSelfieChange = async (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedSelfieFiles(file ? file : null);
      setOpenSelfieSelectedImage(true);
    }
  };

  const convertBase64ToFile = (base64String: any, fileName: any) => {
    const base64 = base64String.split(",").pop();

    const sanitizedBase64 = base64.replace(/[^A-Za-z0-9+/=]/g, "");

    const byteString = atob(sanitizedBase64);

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    // Convert binary data to array buffer
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // Create a Blob object from the array buffer
    const blob = new Blob([ab], { type: "image/*" });

    // Optionally convert Blob to File
    const file = new File([blob], fileName, { type: "image/*" });

    return file;
  };

  useEffect(() => {
    const handleImageData = async (event: any) => {
      const data: any = event.detail;

      if (data?.name && data?.bytes) {
        const file = convertBase64ToFile(data?.bytes, data?.name);
        if (file) {
          if (!myPhotos) {
            const validFiles: any = [];

            if (!file.type.startsWith("image/")) {
              Notify(
                `${file.name} is not an image! Only images are allowed.`,
                "error"
              );
              return;
            }

            validFiles.push({
              file,
              progress: 0,
              uploaded: false,
            });

            if (validFiles.length > 0) {
              setSelectedFiles((prevImages: any) => [
                ...(prevImages || []),
                ...validFiles,
              ]);
              setIsUploadModalOpen(true);
            }
          } else {
            setSelectedSelfieFiles(file);
          }
        }
      }
    };

    window.addEventListener("getImage", handleImageData);

    return () => {
      window.removeEventListener("getImage", handleImageData);
    };
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (selectedSelfieFiles) {
        const data: any = {
          selfie: selectedSelfieFiles,
        };

        const result: any = await PostMyphoto(data);

        if (result?.message) {
          Notify(result?.message, "success");
          setSelectedSelfieFiles(null);
          setSelfiePhotos((prevRes: any) => [
            {
              id: result?.selfie_id,
              upload_by_user_id: null,
              selfie_uuid: result?.selfie_uuid,
              img_selfie: result?.img_selfie,
              added_on: new Date().toISOString(),
            },
            ...(prevRes || []),
          ]);
        }
        setIsLoading(false);
        setOpenSelfieSelectedImage(false);
      }
    } catch (error: any) {
      console.error("Upload image error:", error);
      Notify("Failed to upload image", "error");
      setIsLoading(false);
      setOpenSelfieSelectedImage(false);
    }
    setIsLoading(false);
    setSelectedSelfieFiles(null);
    setOpenSelfieSelectedImage(false);
  };

  useEffect(() => {
    if (myPhotos) {
      (async () => {
        try {
          setSelfieLoading(true);
          const response = await GetMyphoto();
          setSelfiePhotos(response.selfies);
        } catch (error) {
          console.error("Error fetching selfies:", error);
          console.error("Error fetching selfies:", error);
        } finally {
          setSelfieLoading(false);
        }
      })();
    }
  }, [myPhotos]);

  useEffect(() => {
    if (selectedSelfieFilesId && myPhotos) {
      (async () => {
        try {
          setFaceRecognitionLoading(true);
          const response = await GetSelfiePhoto(
            album_uuid,
            selectedSelfieFilesId
          );

          setSelectedSelfieData(response.photos);
        } catch (error) {
          console.error("Error fetching selfie:", error);
          Notify("Failed to fetch related photos", "error");
        } finally {
          setFaceRecognitionLoading(false);
        }
      })();
    } else {
      setSelectedSelfieData(null);
    }
  }, [selectedSelfieFilesId, album_uuid, myPhotos]);

  const switchToAlbum = () => {
    setMyPhotos(false);
    setSelectedSelfieFilesId(null);
    setSelectedSelfieData(null);
  };

  const switchToMyPhotos = () => {
    setMyPhotos(true);
    setSelectedSelfieData(null);
  };

  // New function to handle scanning for face recognition
  // const handleScan = async () => {
  //   if (!album_uuid || !isAdmin) return;

  //   try {
  //     setScanLoading(true);
  //     const response = await triggerFaceRecognition(album_uuid);
  //     if (response.message) {
  //       Notify(response.message, "success");
  //       // Refresh photos after scanning
  //       cachedDataRef.current.clear();
  //       setCurrentPage(1);
  //       fetchPhotos(1);
  //     }
  //   } catch (error: any) {
  //     console.error("Error triggering face recognition:", error);
  //     Notify(error.response?.data?.message || "Failed to trigger face recognition", "error");
  //   } finally {
  //     setScanLoading(false);
  //   }
  // };
  // First, modify your handleScan function
  const handleScan = async () => {
    if (!album_uuid || !isAdmin) return;

    try {
      setScanLoading(true);
      // Show the toast notification with "Processing" message
      Notify("Processing face recognition...", "info");
      const response = await triggerFaceRecognition(album_uuid);
      if (response.message) {
        Notify(response.message, "success");
        // Refresh photos after scanning
        cachedDataRef.current.clear();
        setCurrentPage(1);
        fetchPhotos(1);
      }
    } catch (error: any) {
      console.error("Error triggering face recognition:", error);
      Notify(error.response?.data?.message || "Failed to trigger face recognition", "error");
    } finally {
      setScanLoading(false);
    }
  };
  if (initialLoading) {
    return (
       
      <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-75">
       
            <CircularArcLoader size={50} color="brown" />
          
        </div>
      
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-75px)]">
      <div>
        <Header
          showBackArrow={true}
          title={myPhotos ? t("albumphotos.myphotos") : t("albumphotos.album_photos")}
          onPlusClick={handlePlusClick}
          showPlusIcon={isAdmin && !myPhotos}

        />

        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={"image/*"}
          multiple
          ref={imageUploadRef}
          defaultValue={undefined}
        />
      </div>

      {myPhotos && (
        <div className={`flex items-center w-full mt-2 px-4 pb-2`}>
          <div
            onClick={handleImage}
            className={`flex flex-col items-center min-w-[75px]`}
          >
            <FaCamera size={30} />
            <span className="whitespace-nowrap text-ellipsis overflow-hidden">
              {t("albumphotos.takeselfie")}
            </span>

            <input
              type="file"
              className="hidden"
              onChange={handleFileSelfieChange}
              accept={"image/*"}
              ref={imageCameraUploadRef}
              defaultValue={undefined}
            />
          </div>
          <div
            className={`${"w-[calc(100%-70px)]"} flex gap-2 overflow-auto ml-2 pb-4`}
          >
            {selfiePhotos?.length > 0 ? (
              <>
                {selfiePhotos?.map((photo: any) => (
                  <div
                    key={photo.selfie_uuid}
                    className={`min-w-16 max-w-16 h-16 ml-3 items-center flex-col flex justify-center relative ${selectedSelfieFilesId == photo?.selfie_uuid &&
                      "border-2 border-theme p-1 rounded-lg"
                      }`}
                  >
                    <div
                      className="absolute -bottom-2 -right-2 bg-red-500 rounded-full p-1 cursor-pointer z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSelfie(photo.selfie_uuid);
                      }}
                    >
                      <FaTimes className="text-white text-xs" />
                    </div>
                    <div
                      className="w-full h-full"
                      onClick={() => setSelectedSelfieFilesId(photo?.selfie_uuid)}
                    >
                      <img
                        className="h-full w-full object-cover rounded-full"
                        src={photo?.img_selfie}
                        alt="Profile Images"
                      />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-gray-500 col-span-full text-center">
                {t("albumphotos.Noselfiefound")}
              </p>
            )}
          </div>

        </div>
      )}


      {faceRecognitionLoading && (

        <div className="fixed inset-0  z-50 flex items-center justify-center">
          <div className=" p-6 rounded-lg  text-center">
            <span className="flex justify-center items-center w-full">
              <CircularArcLoader size={50} color="brown" /></span>
            <p className="mt-4 text-lg font-medium ">Finding similar photos...</p>
          </div>
        </div>
      )}

      {/* {myPhotos && selectedSelfieData?.length > 0 && (
        <div className="my-2 mx-2">
          <hr />
          <h3 className="text-lg font-bold mt-2">
            {" "}
            {t("albumphotos.selfierelatedphoto")}
          </h3>
          <Image.PreviewGroup>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2 p-3 w-full">
              {selectedSelfieData?.map((photo: any) => (
                <div key={photo.photo_id} className="relative group">
                  <Image
                    src={photo.thumb_url}
                    preview={{
                      src: photo.photo_url,
                    }}
                    alt="Album photo"
                    width="100%"
                    height={100}
                    className="w-full h-24 sm:h-32 object-cover rounded-sm shadow-md"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          </Image.PreviewGroup>
          <hr />
        </div>
      )} */}
      {myPhotos && selectedSelfieData?.length > 0 && (
        <div className="my-2 mx-2">
          <hr />
          <h3 className="text-lg font-bold mt-2">
            {" "}
            {t("albumphotos.selfierelatedphoto")}
          </h3>
          <Image.PreviewGroup>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2 p-3 w-full">
              {selectedSelfieData?.map((photo: any) => (
                <div key={photo.photo_id} className="relative group">
                  <Image
                    src={photo.photo_url}
                    preview={{
                      src: photo.photo_url,
                    }}
                    alt="Album photo"
                    width="100%"
                    height={100}
                    className="w-full h-24 sm:h-32 object-cover rounded-sm shadow-md"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          </Image.PreviewGroup>
          <hr />
        </div>
      )}
      <div className="flex-1 overflow-y-auto ">
        <Image.PreviewGroup>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2 p-3 w-full">
            {photos.length > 0 ? (
              photos.map((photo) => (
                <div key={photo.photo_id} className="relative group">
                  <Image
                    src={photo.photo_url}
                    preview={{
                      src: photo.photo_url,
                    }}
                    alt="Album photo"
                    width="100%"
                    height={100}
                    className="w-full h-24 sm:h-32 object-cover rounded-sm shadow-md"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ))
            ) : (
              <p className=""></p>
            )}
          </div>
        </Image.PreviewGroup>
        {hasMore && (
          <div ref={loadingRef} className="flex justify-center py-4">
            {isLoading && <CircularArcLoader size={30} />}
          </div>
        )}
      </div>

      {/* {myPhotos && (
        <div className="flex-1">
          {selfieLoading ? (
            <div className="flex items-center justify-center inset-0  ">
              <CircularArcLoader size={50} color="brown" />
            </div>
          ) : (
            !selectedSelfieData?.length && !faceRecognitionLoading && (
              <div className="flex items-top justify-center mt-10">
                <p className="text-gray-500 text-center">
                  {selfiePhotos?.length > 0
                    ? t("deleteconfirmation")
                    : t("selectselfie")}
                </p>
              </div>
            )
          )}
        </div>
      )} */}
      {myPhotos && (
        <div className="flex-1">
          {selfieLoading ? (
            <div className="flex items-center justify-center inset-0">
              <CircularArcLoader size={50} color="brown" />
            </div>
          ) : (
            /* This is the problematic section */
            !selectedSelfieData?.length && !faceRecognitionLoading && (
              <div className="flex items-top justify-center mt-10">
                <p className="text-gray-500 text-center">
                  {selfiePhotos?.length > 0
                    ? t("deleteconfirmation")
                    : t("selectselfie")}
                </p>
              </div>
            )
          )}
        </div>
      )}
      <div className="flex items-center w-full mt-2 justify-between px-4 fixed bottom-4">
        <button
          onClick={switchToAlbum}
          className={`font-bold text-base rounded-lg py-2 px-4 ${!myPhotos
            ? "text-white bg-theme"
            : "text-white bg-gray-300 hover:bg-gray-400"
            }`}
        >
          {t("albumphotos.album")}
        </button>
{/* 
        {isAdmin && !myPhotos && (
          <button
            onClick={handleScan}
            className={`font-bold text-base rounded-lg py-2 px-4 text-white bg-blue-500 hover:bg-blue-600 flex items-center justify-center ${scanLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            disabled={scanLoading}
          >
            {scanLoading ? (
              <CircularArcLoader size={20} color="white" />
            ) : (
              <>
                <FaCamera className="mr-2" />
                {t("scan")}
              </>
            )}
          </button>
        )} */}
        {isAdmin && !myPhotos && (
          <button
            onClick={handleScan}
            className={`font-bold text-base rounded-lg py-2 px-4 text-white bg-blue-500 
      ${scanLoading ? "opacity-70 cursor-not-allowed bg-gray-400" : "hover:bg-blue-600"} 
      flex items-center justify-center`}
            disabled={scanLoading}
          >
            <FaCamera className="mr-2" />
            {scanLoading ? t("processing") : t("scan")}
          </button>
        )}
        <button
          onClick={switchToMyPhotos}
          className={`font-bold text-base rounded-lg py-2 px-4 ${myPhotos
            ? "text-white bg-theme"
            : "text-white bg-gray-300 hover:bg-gray-400"
            }`}
        >
          {t("albumphotos.myphotos")}
        </button>
      </div>

      <Modal
        title={t("albumphotos.uploadphotos")}
        open={isUploadModalOpen}
        onCancel={() => {
          setSelectedFiles([]);
          setIsUploadModalOpen(false);
        }}
        footer={[
          <SubmitButton
            key="upload"
            isLoading={isLoading}
            isDisabled={isLoading || selectedFiles.length === 0}
            onClick={handleUpload}
          >
            Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}
          </SubmitButton>,
        ]}
        centered
        closeIcon={<FaTimes className="text-gray-500 hover:text-gray-700" />}
      >
        {selectedFiles.length == 0 ? (
          <div className="text-center text-gray-500 py-4">
            {t("albumphotos.Nofileselected")}
          </div>
        ) : (
          <div className="space-y-4">
            {selectedFiles.map((fileProgress, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 border-b pb-3 last:border-b-0"
              >
                <div className="flex-shrink-0 w-12 h-12">
                  <img
                    src={URL.createObjectURL(fileProgress.file)}
                    alt={fileProgress.file.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="flex-grow whitespace-pre-wrap break-words max-w-full overflow-hidden">
                  <p className="text-sm truncate font-medium">
                    {fileProgress.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(fileProgress.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Progress
                    percent={fileProgress.progress}
                    strokeWidth={6}
                    strokeColor={
                      fileProgress.progress < 50
                        ? "#f5222d"
                        : fileProgress.progress < 80
                          ? "#faad14"
                          : "#52c41a"
                    }
                    format={(percent) => `${percent}% Uploaded`}
                  />
                </div>
                {fileProgress.uploaded && (
                  <FaCheckCircle className="text-green-500 text-xl" />
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        title={
          <>
            <div className="flex flex-col gap-1">
              <div className="ml-3 text-md font-semibold tracking-wide">
                {t("albumphotos.selectoption")}
              </div>
            </div>
            <hr className="mt-3" />
          </>
        }
        open={openCamera}
        onCancel={() => setOpenCamera(false)}
        centered
        footer={false}
        closable={false}
      >
        <div className="grid grid-cols-2 mt-4 gap-3">
          <div
            onClick={handleCameraClick}
            className="py-2 font-bold text-base rounded drop-shadow-sm border-0 flex justify-center cursor-pointer"
          >
            <FaCamera className="text-gray-300 h-10 w-10" />
          </div>

          <div
            onClick={handleImage}
            className="py-2 font-bold text-base rounded drop-shadow-sm border-0 flex justify-center cursor-pointer"
          >
            <FaFileImage className="text-theme h-10 w-10" />
          </div>
        </div>
      </Modal>

      <Modal
        title={
          <>
            <div className="flex flex-col gap-1">
              <div className="ml-3 text-md font-semibold tracking-wide">
                {t("albumphotos.selfieimage")}
              </div>
            </div>
            <hr className="mt-3" />
          </>
        }
        open={openSelfieSelectedImage}
        onCancel={() => setOpenSelfieSelectedImage(false)}
        centered
        footer={false}
        closable={false}
      >
        <div className="w-full mt-4 gap-3">
          {selectedSelfieFiles && (
            <div className="flex items-center ml-2 justify-center">
              <div className={`min-w-20 min-h-14`}>
                <Image
                  src={URL.createObjectURL(selectedSelfieFiles)}
                  alt="Profile Image"
                  width="100%"
                  height={100}
                  style={{ objectFit: "cover" }}
                />
              </div>
              <button
                className={`font-bold text-base rounded-lg justify-center text-white relative m-5 ${isLoading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                disabled={isLoading}
                onClick={handleSubmit}
              >
                <span
                  className={`transition-opacity ${isLoading ? "opacity-0" : "opacity-100"
                    }`}
                >
                  {t("albumphotos.Upload")}
                </span>

                {isLoading && (
                  <span className="flex items-center justify-center absolute inset-0">
                    <CircularArcLoader size={30} />
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        title={
          <>
            <div className="flex flex-col gap-1">
              <div className="ml-3 text-md font-semibold tracking-wide">
                {t("albumphotos.deleteselfie")}
              </div>
            </div>
            <hr className="mt-3" />
          </>
        }
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelfieToDelete(null);
        }}
        centered
        footer={[
          <button
            key="cancel"
            onClick={() => {
              setDeleteModalOpen(false);
              setSelfieToDelete(null);
            }}
            className="font-bold text-base rounded-lg py-2 px-4 text-white bg-gray-300 hover:bg-gray-400"
          >
            {t("cancel")}
          </button>,
          <button
            key="delete"
            onClick={confirmDeleteSelfie}
            className={`font-bold text-base rounded-lg py-2 px-4 text-white bg-red-500 hover:bg-red-600 ml-2 ${deleteLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <CircularArcLoader size={20} color="white" />
            ) : (
              t("delete")
            )}
          </button>
        ]}
      >
        <p className="py-4 text-center">
          {t("albumphotos.deleteconfirmation")}
        </p>
      </Modal>
    </div>
  );
};

export default AlbumPhotos;