import api from "./api";

const Getsurname = async () => {
  const token = localStorage.getItem("authToken") || localStorage.getItem("token");
  if (!token) throw new Error("Unauthorized: No token found");

  const { data } = await api.get(`/surname`, {
    headers: {
      token: token
    },
  });
  return data;
};

export { Getsurname };
