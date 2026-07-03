import api from "./api";

const GetFamilyMembers = async (family_uuid: string) => {
  const { data } = await api.get(`/members-list/${family_uuid}`);
  return data;
};

const DeleteFamilyMembers = async (family_uuid: string) => {
  const { data } = await api.delete(`/member/${family_uuid}`);
  return data;
};

export { GetFamilyMembers, DeleteFamilyMembers };
