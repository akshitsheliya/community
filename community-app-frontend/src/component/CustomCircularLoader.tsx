import { useEffect, useState } from "react";

const CircularArcLoader = ({ size = 100, color = "white" }) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 30) % 360);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const blockCount = 8;
  const arcSpan = 180; // Semi-circle (180 degrees)

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          transform: `rotate(${rotation}deg)`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {Array.from({ length: blockCount }).map((_, i) => {
          // Calculate position in the semi-circle
          const angle = (arcSpan / (blockCount - 1)) * i;

          // Scale block size based on position (smaller at the ends)
          const sizeScale = Math.sin((angle * Math.PI) / 180);
          const blockSize = size * 0.07 + size * 0.04 * sizeScale;

          // Calculate position on the arc
          const radius = size * 0.4;
          const x = radius * Math.cos((angle * Math.PI) / 180);
          const y = radius * Math.sin((angle * Math.PI) / 180);

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                width: blockSize,
                height: blockSize,
                backgroundColor: color,
                top: `calc(50% - ${y}px)`,
                left: `calc(50% + ${x}px)`,
                transform: "translate(-50%, -50%)",
                opacity: 0.2 + (0.4 * i) / (blockCount - 3),
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CircularArcLoader;
