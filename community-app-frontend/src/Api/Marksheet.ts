  import api from "./api";

  const marksheetGet = async () => {
    try {
      const { data } = await api.get(`/marksheets`);
      return data;
    } catch (error) {
      console.error("❌ Error in marksheetGet:", error);
      throw error;
    }
  };

  const processMarksheet = async (selectedFile: File, selectedType?: string) => {
    const formData = new FormData();
    formData.append("marksheet_photo", selectedFile);

    if (selectedType) {
      formData.append("type", selectedType);
    }

    try {
      const { data } = await api.post("/process-marksheet", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    } catch (error) {
      console.error("❌ Error in processMarksheet:", error);
      throw error;
    }
  };

  const marksheetdelete = async (marksheet_uuid: string): Promise<void> => {
    if (!marksheet_uuid) {
      console.error("❌ Invalid UUID");
      return;
    }

    try {
      await api.delete(`/marksheets/${marksheet_uuid}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
    } catch (error: any) {
      console.error("❌ Error in marksheetdelete:", error);
      throw error;
    }
  };

  export { marksheetGet, processMarksheet, marksheetdelete };
