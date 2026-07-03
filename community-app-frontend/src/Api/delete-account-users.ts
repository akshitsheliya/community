import api from "./api";

const deleteUserAccount = async (): Promise<void> => {
  await api.delete(`/user`);
};

export default deleteUserAccount;
