import api from "./api";

 const GetFamilyRep = async () => {
  const { data } = await api.get(`/representatives`);
  return data;
};


export  {GetFamilyRep};