import api, { apiOnlyData } from "./api";

const GetSingleUser = async () => {
  const { data } = await api.get(`/user`);
  return data;
};

const GetUnVerifyUser = async () => {
  const { data } = await api.get(`/unverified`);
  return data;
};

const GetApproveUser = async (id: any) => {
  const { data } = await api.put(`/approve/${id}`);
  return data;
};

const GetRejectUser = async (id: any, reason: any) => {
  const { data } = await apiOnlyData.put(`/reject/${id}`, reason);
  return data;
};

export { GetSingleUser, GetUnVerifyUser, GetApproveUser, GetRejectUser };
