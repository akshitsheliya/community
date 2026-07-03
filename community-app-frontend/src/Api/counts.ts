import api from "./api";

const Getcounts = async (year = new Date().getFullYear()) => {
  const { data } = await api.get(`/counts?year=${year}`);

  if (data?.data && !data.data.pendingMarksheetsCount) {
    data.data.pendingMarksheetsCount = data.data.marksheetsCount || 0;
  }

  return data;
};

export { Getcounts };
