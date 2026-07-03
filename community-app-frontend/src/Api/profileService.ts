import api from "../Api/api";

const submitProfileData = async (formData: any) => {
  const response = await api.post("/profile", formData);
  return response;
};

const profileUpdate = async (id: any, formData: any) => {
  const { data } = await api.put(`/user/${id}`, formData);
  return data;
};

export { submitProfileData, profileUpdate };
