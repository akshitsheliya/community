import api from "./api";

export const GetAwardStudents = async (params: Record<string, string> = {}) => {
  const { data } = await api.get(`/award-eligible`, { params });
  return data;
};

export const GenerateTop5PDF = async () => {
  try {
    const response = await api.get(`/generate-pdf`, {
      responseType: "blob",
    });

    const contentDisposition = response.headers["content-disposition"];
    const filename = contentDisposition
      ? contentDisposition.split("filename=")[1]?.replace(/['"]/g, "")
      : `top5_boards_.pdf`;

    const blob = new Blob([response.data], { type: "application/pdf" });
    return { blob, filename };
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
