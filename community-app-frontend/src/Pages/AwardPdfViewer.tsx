import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../component/Common/Header";
import { apiBaseUrl } from "../Api/api";

const AwardPdfViewer = () => {
  const location = useLocation();
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userAgent = navigator.userAgent || "";
  const isAndroid = /Android/i.test(userAgent);
  const isMobileOrWebView =
    /Android|iPhone|iPad|iPod/i.test(userAgent) ||
    /\bwv\b|WebView|Version\/[\d.]+.*Safari/i.test(userAgent);

  const { inlineUrl, downloadUrl } = useMemo(() => {
    const token =
      localStorage.getItem("authToken") ||
      new URL(window.location.href).searchParams.get("token") ||
      "";
    const lang = localStorage.getItem("i18nextLng") || "en";
    const namesOnly = new URLSearchParams(location.search).get("namesOnly") === "1";
    const approvedOnly =
      new URLSearchParams(location.search).get("approvedOnly") === "1";
    const query = `token=${encodeURIComponent(token)}&lang=${encodeURIComponent(lang)}${
      namesOnly ? "&namesOnly=1" : ""
    }${approvedOnly ? "&approvedOnly=1" : ""}`;
    return {
      inlineUrl: `${apiBaseUrl}/api/generate-pdf?${query}`,
      downloadUrl: `${apiBaseUrl}/api/generate-pdf?download=1&${query}`,
    };
  }, [location.search]);
  const pdfFileName = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const approvedOnly = params.get("approvedOnly") === "1";
    const namesOnly = params.get("namesOnly") === "1";
    if (approvedOnly) return "All-Received-Marksheets.pdf";
    if (namesOnly) return "top5_all_standards_names_only.pdf";
    return "top5_all_standards.pdf";
  }, [location.search]);
  const androidViewerUrl = `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(
    inlineUrl
  )}`;

  const handleShare = async () => {
    try {
      setSharing(true);
      setError(null);

      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          Accept: "application/pdf",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to prepare PDF for sharing");
      }

      const blob = await response.blob();
      const file = new File([blob], pdfFileName, {
        type: "application/pdf",
      });

      if (
        navigator.share &&
        (navigator as any).canShare &&
        (navigator as any).canShare({ files: [file] })
      ) {
        await navigator.share({
          title: "Award Eligible Students PDF",
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: "Award Eligible Students PDF",
          url: isAndroid ? androidViewerUrl : inlineUrl,
        });
      } else {
        if (isAndroid && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(downloadUrl);
          setError("Share is not supported on this Android WebView. Download link copied.");
        } else {
          window.location.href = downloadUrl;
        }
      }
    } catch (err: any) {
      setError(err?.message || "Unable to share PDF");
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.target = "_self";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenPdf = () => {
    window.location.href = isAndroid ? androidViewerUrl : inlineUrl;
  };

  return (
    <>
      <Header title="Top 5 Award Eligible Students" showBackArrow />
      <div className="h-[calc(100vh-120px)] bg-gray-50 px-4 py-3">
        <div className="mb-3 flex gap-3">
          <button
            onClick={handleDownload}
            className="rounded bg-theme px-4 py-2 text-white font-semibold"
          >
            Download PDF
          </button>
          <button
            onClick={handleShare}
            disabled={sharing}
            className="rounded border border-theme bg-theme px-4 py-2 text-white font-semibold hover:text-white disabled:opacity-60"
          >
            {sharing ? "Preparing..." : "Share PDF"}
          </button>
          {isMobileOrWebView && (
            <button
              onClick={handleOpenPdf}
              className="rounded border border-theme bg-theme px-4 py-2 text-white font-semibold hover:text-white"
            >
              Open PDF
            </button>
          )}
        </div>
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        {isMobileOrWebView ? (
          <div className="rounded border border-gray-300 bg-white p-4 text-sm text-gray-700">
            PDF preview is limited in some mobile WebViews. Use `Open PDF` or
            `Download PDF`.
          </div>
        ) : (
          <iframe
            src={inlineUrl}
            title="Award Eligible Students PDF"
            className="h-[calc(100%-52px)] w-full rounded border border-gray-300 bg-white"
          />
        )}
      </div>
    </>
  );
};

export default AwardPdfViewer;
