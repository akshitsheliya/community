import React from "react";
import { Image, ImageProps } from "antd";

interface ImagePreviewProps extends Omit<ImageProps, "preview"> {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  previewMask?: React.ReactNode;
  showPreviewIcon?: boolean;
}

/**
 * A reusable image preview component using Ant Design Image
 *
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for the image
 * @param {number|string} width - Width of the image
 * @param {number|string} height - Height of the image
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} previewMask - Custom mask content for preview
 * @param {boolean} showPreviewIcon - Whether to show preview mask or not
 * @returns {JSX.Element} - Image component with preview capability
 */
const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt = "Image",
  width,
  height,
  className = "",
  previewMask,
  showPreviewIcon = true,
  ...restProps
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`${className}`}
      preview={{
        mask: showPreviewIcon
          ? previewMask || (
              <div className="flex items-center justify-center text-white">
                <span>Preview</span>
              </div>
            )
          : null,
        getContainer: document.body, 
      }}
      {...restProps}
    />
  );
};

export default ImagePreview;
