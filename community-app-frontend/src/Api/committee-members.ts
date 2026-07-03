

import api, { apiOnlyData } from "./api";

const Getcomitteemember = async () => {
  try {
    const { data } = await api.get(`/committee`);
    return data;
  } catch (error) {
    console.error("Error fetching committee members:", error);
    throw error;
  }
};

const Deletecomitteemember = async (member_uuid: any) => {
  try {
    const { data } = await api.delete(`/committee/${member_uuid}`);
    return data;
  } catch (error) {
    console.error(`Error deleting committee member ${member_uuid}:`, error);
    throw error;
  }
};

const Updatecomitteemember = async (memberUuid: any, designation: any) => {
  try {
    if (!memberUuid || !designation) {
      throw new Error("Member UUID and designation are required");
    }

    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Unauthorized: No token found");

    const { data } = await apiOnlyData.put(
      `/committee/${memberUuid}`,
      designation
    );

    return data;
  } catch (error: any) {
    console.error(
      `Error updating committee member (${memberUuid}):`,
      error?.response?.data || error.message
    );
    throw error;
  }
};

const EditCommitteeMember = async (memberUuid :any, designationData:any) => {
  try {
    if (!memberUuid || !designationData) {
      throw new Error("Member UUID and designation data are required");
    }

    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Unauthorized: No token found");

    const { data } = await apiOnlyData.put(
      `/edit-committee/${memberUuid}`,
      designationData
    );

    return data;
  } catch (error:any) {
    console.error(
      `Error editing committee member designation (${memberUuid}):`,
      error?.response?.data || error.message
    );
    throw error;
  }
};

export {
  Getcomitteemember,
  Deletecomitteemember,
  Updatecomitteemember,
  EditCommitteeMember,
};
