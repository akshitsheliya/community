import { apiOnlyData } from "./api";

const languageApi = async (app_language: any) => {
  const token = localStorage.getItem("authToken")
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return await apiOnlyData.put("/language", app_language, { headers });
};

export default languageApi;
