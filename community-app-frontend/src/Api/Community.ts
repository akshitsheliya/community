import { authAPI } from "./api";

const submitCommunityNumber = async (communityNumber:any, communityUUID = null) => {
  const params = {
    community_number: communityNumber,
    ...(communityUUID ? { community_uuid: communityUUID } : {}),
  };

  return await authAPI.get(`/community`, { params });
};

export { submitCommunityNumber };