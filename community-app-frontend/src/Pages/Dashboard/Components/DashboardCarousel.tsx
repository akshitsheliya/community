import { useEffect, useRef, useState } from "react";
import { Carousel, Modal } from "antd";

type CommunitySliderConfig = {
  images?: string[];
  default?: string[];
  [key: string]: unknown;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const ZoomablePreviewImage = ({ src }: { src: string }) => {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const gestureRef = useRef<{
    startDistance: number;
    startScale: number;
    dragStartX: number;
    dragStartY: number;
    dragging: boolean;
  }>({
    startDistance: 0,
    startScale: 1,
    dragStartX: 0,
    dragStartY: 0,
    dragging: false,
  });

  const reset = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const getTouchDistance = (
    touches: { length: number; [index: number]: { clientX: number; clientY: number } }
  ) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  return (
    <div
      className="w-full h-[80vh] overflow-hidden flex items-center justify-center bg-black/5 rounded"
      onWheel={(e) => {
        e.preventDefault();
        const next = clamp(scale + (e.deltaY < 0 ? 0.15 : -0.15), 1, 4);
        setScale(next);
        if (next === 1) setTranslate({ x: 0, y: 0 });
      }}
      onMouseDown={(e) => {
        if (scale <= 1) return;
        gestureRef.current.dragging = true;
        gestureRef.current.dragStartX = e.clientX - translate.x;
        gestureRef.current.dragStartY = e.clientY - translate.y;
      }}
      onMouseMove={(e) => {
        if (!gestureRef.current.dragging || scale <= 1) return;
        const nextX = e.clientX - gestureRef.current.dragStartX;
        const nextY = e.clientY - gestureRef.current.dragStartY;
        setTranslate({ x: nextX, y: nextY });
      }}
      onMouseUp={() => {
        gestureRef.current.dragging = false;
      }}
      onMouseLeave={() => {
        gestureRef.current.dragging = false;
      }}
      onTouchStart={(e) => {
        if (e.touches.length === 2) {
          gestureRef.current.startDistance = getTouchDistance(e.touches);
          gestureRef.current.startScale = scale;
          gestureRef.current.dragging = false;
          return;
        }

        if (e.touches.length === 1 && scale > 1) {
          gestureRef.current.dragging = true;
          gestureRef.current.dragStartX = e.touches[0].clientX - translate.x;
          gestureRef.current.dragStartY = e.touches[0].clientY - translate.y;
        }
      }}
      onTouchMove={(e) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          const currentDistance = getTouchDistance(e.touches);
          if (!gestureRef.current.startDistance) return;
          const zoomFactor = currentDistance / gestureRef.current.startDistance;
          const nextScale = clamp(gestureRef.current.startScale * zoomFactor, 1, 4);
          setScale(nextScale);
          if (nextScale === 1) setTranslate({ x: 0, y: 0 });
          return;
        }

        if (e.touches.length === 1 && gestureRef.current.dragging && scale > 1) {
          e.preventDefault();
          const nextX = e.touches[0].clientX - gestureRef.current.dragStartX;
          const nextY = e.touches[0].clientY - gestureRef.current.dragStartY;
          setTranslate({ x: nextX, y: nextY });
        }
      }}
      onTouchEnd={() => {
        gestureRef.current.dragging = false;
        gestureRef.current.startDistance = 0;
      }}
      onDoubleClick={reset}
      style={{ touchAction: "none" }}
    >
      <img
        src={src}
        alt="Slider preview"
        className="max-w-full max-h-full object-contain select-none"
        draggable={false}
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: "center center",
          transition: gestureRef.current.dragging ? "none" : "transform 0.08s linear",
          cursor: scale > 1 ? "grab" : "zoom-in",
        }}
      />
    </div>
  );
};

const DashboardCarousel = () => {
  const [images, setImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const loadSliderImages = async () => {
      try {
        const communityData = JSON.parse(localStorage.getItem("communityData") || "{}");
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const fileCandidates = [
          String(communityData?.community_id || "").trim(),
          String(communityData?.community_number || "").trim(),
          String(userData?.community_id || "").trim(),
          "1",
        ].filter(Boolean);

        let loadedImages: string[] = [];

        for (const candidate of fileCandidates) {
          const jsonPath = `${import.meta.env.BASE_URL}${candidate}.json`;
          const response = await fetch(jsonPath, { cache: "no-store" });
          if (!response.ok) continue;

          const config: CommunitySliderConfig = await response.json();
          const resolved = Array.isArray(config.images)
            ? config.images
            : Array.isArray(config.default)
              ? config.default
              : [];
          const validImages = (resolved || []).filter(
            (url) => typeof url === "string" && url.trim() !== ""
          );

          if (validImages.length > 0) {
            loadedImages = validImages;
            break;
          }
        }

        if (loadedImages.length === 0) {
          console.warn("Dashboard slider JSON not found for candidates:", fileCandidates);
        }

        setImages(loadedImages);
      } catch (error) {
        console.error("Failed to load dashboard slider images:", error);
        setImages([]);
      }
    };

    loadSliderImages();
  }, []);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="sticky left-0 w-full z-10">
      <Carousel autoplay autoplaySpeed={3000}>
        {images.map((img, index) => (
          <div key={index}>
            <img
              src={img}
              alt={`Slide ${index + 1}`}
              className="w-full sm:h-[500px] h-[200px] object-contain"
              onClick={() => setPreviewImage(img)}
            />
          </div>
        ))}
      </Carousel>

      <Modal
        open={Boolean(previewImage)}
        footer={null}
        onCancel={() => setPreviewImage(null)}
        centered
        width="90vw"
      >
        {previewImage && <ZoomablePreviewImage src={previewImage} />}
      </Modal>
    </div>
  );
};

export default DashboardCarousel;
