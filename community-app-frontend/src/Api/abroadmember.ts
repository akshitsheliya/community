import api from "./api";

const getAbroadMembers = async () => {
  try {
    const response = await api.get(`/abroad`);
    return Array.isArray(response.data)
      ? response.data
      : response.data && Array.isArray(response.data.data)
      ? response.data.data
      : [];
  } catch (error) {
    console.error("Error in getAbroadMembers:", error);
    return [];
  }
};

const getAbroadMemberByUuid = async (abroad_uuid: any) => {
  try {
    const response = await api.get(`/abroad/${abroad_uuid}`);
    const memberData = response.data.data || response.data;
    return memberData;
  } catch (error) {
    console.error("Error in getAbroadMemberByUuid:", error);
    throw error;
  }
};

const createAbroadMember = async (formData: FormData) => {
  try {
    const response = await api.post(`/abroad`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in createAbroadMember:", error);
    throw error;
  }
};

const updateAbroadMember = async (abroad_uuid: string, formData: FormData) => {
  try {
    // Log the form data being sent (for debugging)
    console.log("Updating member with UUID:", abroad_uuid);
    console.log("Form data keys:", [...formData.keys()]);

    const response = await api.put(`/abroad/${abroad_uuid}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in updateAbroadMember:", error);
    throw error;
  }
};

const deleteAbroadMember = async (abroadUuid: string) => {
  try {
    const response = await api.delete(`/abroad/${abroadUuid}`);
    return response.data;
  } catch (error) {
    console.error("Error in deleteAbroadMember:", error);
    throw error;
  }
};

export {
  getAbroadMembers,
  getAbroadMemberByUuid,
  createAbroadMember,
  updateAbroadMember,
  deleteAbroadMember,
};
