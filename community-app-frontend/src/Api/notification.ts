import api from "./api";

// Function to get all notifications
const getNotifications = async () => {
  const { data } = await api.get("/notification");
  return data;
};

const readallNotifications = async () => {
  const { data } = await api.put("/notification");
  return data;
};
// Function to mark a notification as read
const markNotificationAsRead = async (notification_uuid: string) => {
  const { data } = await api.put(
    `/notification/${notification_uuid}`,
    {}, // Empty body as per your API spec
    {
      headers: {
        "Accept-Language": "gu_IN", // Using your language header
      },
    }
  );
  return data;
};

export { getNotifications, markNotificationAsRead, readallNotifications };
