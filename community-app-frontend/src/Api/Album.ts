import api, { apiOnlyData } from "./api";

export const GetAlbums = async () => {
  try {
    const response = await api.get(`/albums`);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error fetching albums:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const createAlbum = async (albumName: string, year: string) => {
  try {
    const response = await apiOnlyData.post("/albums", {
      photo_album_name: albumName,
      photo_album_year: year,
    });
    return response.data;
  } catch (error: any) {
    console.error("❌ API Call Failed:", error.response?.data || error.message);
    throw error;
  }
};

export const getPhotosByAlbum = async (
  album_uuid: any,
  currentPage: any,
  pageSize: any
) => {
  try {
    const response = await api.get(
      `/photos/${album_uuid}?page_number=${currentPage}&page_size=${pageSize}`
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error fetching photos:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const uploadPhoto = async (album_uuid: string, file: File) => {
  const formData = new FormData();
  formData.append("gallery", file);

  try {
    const response = await api.post(`/photos/${album_uuid}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("❌ Upload Error:", error.response?.data || error.message);
    return { success: false, message: error.message };
  }
};

export const AlbumDelete = async (album_uuid: string | number) => {
  try {
    const response = await api.delete(`/albums/${album_uuid}`);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error in AlbumDelete API:",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const triggerFaceRecognition = async (album_uuid:any) => {
  try {
    const response = await api.post(`/face-recognition/album/${album_uuid}`);
    return response.data;
  } catch (error:any) {
    console.error(
      "❌ Error triggering face recognition:",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const triggerallFaceRecognition = async () => {
  try {
    const response = await api.post(`/face/process-selfie`);
    return response.data;
  } catch (error:any) {
    console.error(
      "❌ Error triggering face recognition:",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const updateAlbum = async (
  album_uuid: string,
  albumName: string,
  year: string
) => {
  try {
    const response = await apiOnlyData.put(`/albums/${album_uuid}`, {
      photo_album_name: albumName,
      photo_album_year: parseInt(year, 10), // Convert year to number
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating album:",
      error.response?.data || error.message
    );
    throw error;
  }
};
