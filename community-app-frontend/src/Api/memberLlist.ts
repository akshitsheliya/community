import api from "./api";

const GetFamily = async (page: any, search: any = "") => {
  const { data } = await api.get(`/families`, {
    params: {
      page_number: page,
      search: search,
    },
  });
  return data;
};

const CreateMember = async (formData: any) => {
  const { data } = await api.post("/members", formData);
  return data;
};

export { GetFamily, CreateMember };
