import api, { apiOnlyData } from "./api";

const allMarksheet = async (filters: Record<string, any> = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const { data } = await api.get(`/all-marksheets?${queryParams}`);
  return data;
};

const updateMarkSheet = async (marksheet_uuid: string, updatedData: any) => {
  const { data } = await apiOnlyData.put(
    `/marksheets/edit/${marksheet_uuid}`,
    updatedData
  );
  return data;
};

const approveMarkSheet = async (marksheet_uuid: string) => {
  const { data } = await apiOnlyData.put(
    `/marksheets/approve/${marksheet_uuid}`
  );
  return data;
};

const rejectMarkSheet = async (
  marksheet_uuid: string,
  rejection_reason: string
) => {
  const { data } = await apiOnlyData.put(
    `/marksheets/reject/${marksheet_uuid}`,
    {
      rejection_reason,
    }
  );
  return data;
};

export {
  allMarksheet,
  updateMarkSheet,
  approveMarkSheet,
  rejectMarkSheet,
};
