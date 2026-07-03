import api from "./api";

 
const Getnews = async (page_number = 1, page_size = 25) => {
  try {
    const { data } = await api.get(`/news`, {
      params: {
        feed_type: "news",
        page_number,
        page_size,
      },
    });
    return data;
  } catch (error) {
    console.error("Error in Getnews API:", error);
    throw error;
  }
};
 

const Createnews = async (formData: FormData) => {
  try {
    const { data } = await api.post(`/news`, formData);
    return data;
  } catch (error) {
    console.error("Error in Createnews API:", error);
    throw error;
  }
};

const Getmembernews = async (newsUuid: string) => {
  try {
    const { data } = await api.get(`/news/${newsUuid}`);
    return data;
  } catch (error) {
    console.error("Error in Getmembernews API:", error);
    throw error;
  }
};

const deletenews = async (newsUuid: string) => {
  try {
    const { data } = await api.delete(`/news/${newsUuid}`);
    return data;
  } catch (error) {
    console.error("Error in deletenews API:", error);
    throw error;
  }
};

const Updatenews = async (newsUuid: string, formData: FormData) => {
  try {
    const { data } = await api.put(`/news/${newsUuid}`, formData);
    return data;
  } catch (error) {
    console.error("Error in Updatenews API:", error);
    throw error;
  }
};
export { Getnews, Createnews, Getmembernews, deletenews, Updatenews };