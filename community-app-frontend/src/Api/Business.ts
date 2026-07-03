import api, { apiOnlyData } from "./api";

// Get all businesses
export const getAllBusinesses = async (search = "") => {
  try {
    const response = await api.get("/business", {
      params: search ? { search } : {},
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching businesses:", error);
    throw error;
  }
};
 

// Get business by UUID
export const getBusinessById = async (uuid: any) => {
  try {
    const response = await api.get(`/business/${uuid}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching business with UUID ${uuid}:`, error);
    throw error;
  }
};

// Create new business
export const createBusiness = async (formData:any) => {
  try {
    const response = await apiOnlyData.post("/business", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating business:", error);
    throw error;
  }
};

// Update business
export const updateBusiness = async (uuid:any, formData:any) => {
  try {
    const response = await api.put(`/business/${uuid}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating business with UUID ${uuid}:`, error);
    throw error;
  }
};

// Delete business
export const deleteBusiness = async (uuid:any) => {
  try {
    const response = await api.delete(`/business/${uuid}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting business with UUID ${uuid}:`, error);
    throw error;
  }
};


export const getBusinessCategories = async () => {
  try {
    const response = await api.get(`/business-categories`);
    console.log("Categories Response:", response.data); 
    return response.data;
  } catch (error) {
    console.error(`Error fetching business categories`, error);
    throw error;
  }
};
