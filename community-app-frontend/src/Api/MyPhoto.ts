import api from "./api";

const GetMyphoto = async () => {
  const { data } = await api.get(`/selfies`);
  return data;
};

const PostMyphoto = async (formData: FormData) => {
  const { data } = await api.post(`/selfie/upload`, formData);
  return data;
};

const GetSelfiePhoto = async (albumId: any, selfieId: any) => {
  const { data } = await api.get(`/selfie/${selfieId}/album/${albumId}`);
  return data;
};

const DeleteSelfie = async (selfieUuid: string) => {
  const { data } = await api.delete(`/selfie/${selfieUuid}`);
  return data;
};

export { GetMyphoto, PostMyphoto, GetSelfiePhoto, DeleteSelfie };