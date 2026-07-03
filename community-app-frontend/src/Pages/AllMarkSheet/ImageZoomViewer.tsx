import { useState, useEffect, useRef } from "react";

interface ImageZoomViewerProps {
  imageUrl: string;
  altText?: string;
  placeholderImage?: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImageZoomViewer = ({
  imageUrl,
  altText = "Image",
  placeholderImage = "/placeholder-marksheet.png",
  isOpen,
  onClose,
}: ImageZoomViewerProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    const handleBodyScroll = (show: boolean) => {
      if (show) {
        // Save the current scroll position
        const scrollY = window.scrollY;
        // Add styles to body to prevent scrolling
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";
      } else {
        // Restore the scroll position
        const scrollY = document.body.style.top;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    };

    if (isOpen) {
      handleBodyScroll(true);
    } else {
      handleBodyScroll(false);
    }

    // Cleanup function
    return () => {
      if (isOpen) {
        handleBodyScroll(false);
      }
    };
  }, [isOpen]);

  // Reset zoom and position when modal is opened
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const container = imageContainerRef.current;
    if (!container) return;

    // Get mouse position relative to the container
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate the position of the mouse relative to the image in the scaled coordinate system
    const imageX = (mouseX - position.x) / scale;
    const imageY = (mouseY - position.y) / scale;

    // Determine new scale
    const delta = e.deltaY > 0 ? 0.9 : 1.1; // Zoom out or in
    const newScale = Math.max(0.5, Math.min(5, scale * delta)); // Limit scale between 0.5 and 5

    // Calculate new position to keep the mouse point fixed
    const newPosition = {
      x: mouseX - imageX * newScale,
      y: mouseY - imageY * newScale,
    };

    setScale(newScale);
    setPosition(newPosition);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.button !== 0) return; // Only left mouse button
    setDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();

    if (e.touches.length !== 1) return;
    setDragging(true);
    setDragStart({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    setDragging(false);
  };

  // Handle double-tap to reset zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const resetZoom = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const zoomIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setScale((prev) => Math.min(prev * 1.2, 5));
  };

  const zoomOut = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setScale((prev) => Math.max(prev / 1.2, 0.5));
  };

  // Prevent background clicks from closing the modal
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-4 rounded-lg shadow-lg w-full max-w-4xl max-h-screen overflow-hidden flex flex-col"
        onClick={handleModalClick}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Image Viewer</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={zoomOut}
              className="bg-gray-200 p-2 rounded-full hover:bg-gray-300"
              aria-label="Zoom out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <span className="text-sm font-medium">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="bg-gray-200 p-2 rounded-full hover:bg-gray-300"
              aria-label="Zoom in"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
            <button
              onClick={resetZoom}
              className="bg-gray-200 p-2 rounded-full hover:bg-gray-300"
              aria-label="Reset zoom"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 p-2 rounded-full hover:bg-gray-300"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <div
          ref={imageContainerRef}
          className="overflow-hidden flex-1 flex items-center justify-center bg-gray-100 cursor-move"
          style={{ maxHeight: "calc(100vh - 120px)" }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleDoubleClick}
        >
          <div
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: "0 0",
              transition: dragging ? "none" : "transform 0.1s ease-out",
            }}
          >
            <img
              src={imageUrl}
              alt={altText}
              className="max-w-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = placeholderImage;
              }}
              draggable="false"
            />
          </div>
        </div>
        <div className="text-center text-sm text-gray-600 mt-2">
          <p>Scroll to zoom • Drag to pan • Double-click to reset</p>
        </div>
      </div>
    </div>
  );
};

export default ImageZoomViewer;
