import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { LocalStorageProvider } from "./Context/LocalStorageContext.tsx";
import { GetSingleUser } from "./Api/user.ts";

const tokenfromurl = new URL(window.location.href).searchParams.get("token");
if (tokenfromurl && !localStorage.getItem("authToken")) {
  (async () => {
    window.localStorage.setItem("authToken", tokenfromurl);
    const users: any = await GetSingleUser();
    localStorage.setItem("isAdmin", users?.data?.is_community_admin);
    localStorage.setItem("userData", JSON.stringify(users?.data));
  })();
}

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(
  <>
    <LocalStorageProvider>
      <App />
    </LocalStorageProvider>
  </>
);
