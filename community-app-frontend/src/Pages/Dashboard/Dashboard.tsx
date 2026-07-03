import { useEffect, useState, useCallback } from "react";
import { detect } from "detect-browser";
import DashboardLayout from "../Dashboard/Components/DashboardLayout";
import DashboardItems from "../Dashboard/Components/DashboardItems";
import DashboardCarousel from "../Dashboard/Components/DashboardCarousel";
import { Getcounts } from "../../Api/counts";
import Appversion from "../../component/Common/Appversion";
import AppUpdatePopup from "../../Pages/Appversion/Appversion-popup";

const Dashboard = () => {
  const [countsData, setCountsData] = useState(null);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [versionChecked, setVersionChecked] = useState(false);
  const [platform, setPlatform] = useState<"android" | "ios" | "web" | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(false);

  const fetchCounts = useCallback(async () => {
    try {
      const data = await Getcounts();
      const apiData = data?.data || {};
      setCountsData(apiData);

      const browser = detect();
      const os = browser?.os?.toLowerCase() ?? "";

      const isAndroid = os.includes("android");
      const isIOS =
        os.includes("ios") || os.includes("iphone") || os.includes("ipad");
      const currentPlatform = isAndroid ? "android" : isIOS ? "ios" : "web";
      setPlatform(currentPlatform);

      const latestVersion = isAndroid
        ? apiData.latest_android_app_version
        : isIOS
        ? apiData.latest_ios_app_version
        : null;

      const currentVersion = localStorage.getItem("version");

      if (currentVersion && latestVersion) {
        const currentVersionNum = parseFloat(currentVersion);
        const latestVersionNum = parseFloat(latestVersion);

        if (currentVersionNum < latestVersionNum) {
          const shouldForceUpdate = apiData.force_update === true;
          setShowUpdatePopup(true);
          setForceUpdate(shouldForceUpdate);
        }
      }

      setVersionChecked(true);
    } catch (error) {
      console.error("Error fetching version info:", error);
      setVersionChecked(true);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const handleRefreshDashboard = useCallback(async () => {
    setIsLoading(true);
    await fetchCounts();
    setIsLoading(false);
  }, [fetchCounts]);

  const handleConfirmUpdate = () => {
    const playStoreWebURL =
      "https://play.google.com/store/apps/details?id=com.weenggs.community.umrala&hl=en";
    const appStoreWebURL =
      "https://apps.apple.com/us/app/umrala-gam-samast-patel-samaj/id6743480517";

    if (platform === "android") {
      window.open(playStoreWebURL, "_blank");
    } else if (platform === "ios") {
      window.open(appStoreWebURL, "_blank");
    } else {
      window.open(playStoreWebURL, "_blank");
    }
  };

  const handleClosePopup = () => {
    if (!forceUpdate) {
      setShowUpdatePopup(false);
    }
  };

  if (!versionChecked) return null;

  return (
    <>
      <DashboardLayout
        countsData={countsData}
        onRefreshDashboard={handleRefreshDashboard}
        isLoading={isLoading}
      >
        <DashboardCarousel />
        <DashboardItems countsData={countsData} />
      </DashboardLayout>
      <Appversion />
      {showUpdatePopup && (
        <AppUpdatePopup
          onClose={handleClosePopup}
          onConfirm={handleConfirmUpdate}
          forceUpdate={forceUpdate}
        />
      )}
    </>
  );
};

export default Dashboard;
