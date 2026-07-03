import axios from "axios";
import { apiBaseUrl } from "./api";

export const changeCommunity = async (communityUUID: string) => {
  const token = localStorage.getItem("authToken");

  const response = await axios.post(
    `${apiBaseUrl}/api/auth/change-community`,
    {
      community_uuid: communityUUID,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response?.data?.data?.token) {
    const oldToken = localStorage.getItem("authToken");
    if (oldToken) {
      localStorage.setItem("oldAuthToken", oldToken);
    }
    localStorage.setItem("authToken", response.data.data.token);
  }

  return response;
};
