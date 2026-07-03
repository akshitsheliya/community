import api from "./api";

const Getdonors = async (params = {}) => {
  const { data } = await api.get(`/donors`, { params });
  return data;
};

const Deletedonor = async (donor_id: number) => {
  const { data } = await api.delete(`donors/${donor_id}`);
  return data;
};

const Getmembers = async (page_number: any, page_size: any, search: any) => {
  const { data } = await api.get(`/members`, {
    params: { page_number, page_size, search },
  });
  return data;
};

const PostDonormembers = async (member_uuid: string, donorData: any) => {
  const { data } = await api.post(`/donors/${member_uuid}`, donorData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return data;
};

const PostDonors = async (formData: FormData) => {
  const { data } = await api.post("/donors", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

const UpdateDonors = async (id: any, formData: FormData) => {
  const { data } = await api.put(`/donors/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export {
  Getdonors,
  Getmembers,
  Deletedonor,
  PostDonors,
  PostDonormembers,
  UpdateDonors,
};
