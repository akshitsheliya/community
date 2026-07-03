import { useState, useEffect } from "react";

const AppVersion = () => {
  const [version, setVersion] = useState("");
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth <= 1024) {
        setIsMobileOrTablet(true);
      } else {
        setIsMobileOrTablet(false);
      }
    };
    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  useEffect(() => {
    const storedVersion = localStorage.getItem("version");
    if (storedVersion) {
      setVersion(storedVersion);
    } else {
      setVersion("---");
    }
  }, []);

  if (!isMobileOrTablet) {
    return null;
  }

  return (
    <p className="text-xs text-gray-500 text-center mt-4 mb-2">
      App Version: {version}
    </p>
  );
};

export default AppVersion;
