import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { GetSingleUser } from "../Api/user";

interface LocalStorageContextProps {
  userData: any;
  setUserData: any;
  refreshUserData: () => Promise<void>;
}

const LocalStorageContext = createContext<LocalStorageContextProps | undefined>(
  undefined
);

interface LocalStorageProviderProps {
  children: ReactNode;
}

export const LocalStorageProvider: React.FC<LocalStorageProviderProps> = ({
  children,
}) => {
  const [userData, setUserData] = useState<any>(null);

  const refreshUserData = useCallback(async () => {
    if (localStorage.getItem("authToken")) {
      const users: any = await GetSingleUser();
      localStorage.setItem("isAdmin", users?.data?.is_community_admin);
      localStorage.setItem("userData", JSON.stringify(users?.data));
      setUserData(users?.data);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const loginData = localStorage.getItem("userData");
      if (loginData) {
        setUserData(JSON.parse(loginData));
      } else if (localStorage.getItem("authToken")) {
        await refreshUserData();
      }
    })();
  }, [refreshUserData]);

  return (
    <LocalStorageContext.Provider
      value={{
        userData,
        setUserData,
        refreshUserData,
      }}
    >
      {children}
    </LocalStorageContext.Provider>
  );
};

export const useLocalStorage = (): LocalStorageContextProps => {
  const context = useContext(LocalStorageContext);
  if (!context) {
    throw new Error(
      "useLocalStorage must be used within a LocalStorageProvider"
    );
  }
  return context;
};
