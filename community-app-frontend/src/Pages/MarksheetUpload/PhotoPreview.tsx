import { IoIosCloseCircleOutline } from "react-icons/io";

interface PhotoPreviewProps {
    onClose: () => void;
    imageSrc: string | null;
}

const PhotoPreview: React.FC<PhotoPreviewProps> = ({ onClose, imageSrc }) => {

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center p-10 justify-center z-50">
            {/* Close Button */}
            <button
                className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-600 transition"
                onClick={onClose}
            >
                <IoIosCloseCircleOutline size={30} />
            </button>

            {imageSrc ? (
                <img
                    src={imageSrc}
                    alt="Zoomed Marksheet"
                    className="max-w-full max-h-full rounded-lg shadow-lg"
                    onClick={onClose}
                />
            ) : (
                <p className="text-white">No marksheet image available.</p>
            )}
        </div>
    );
};

export default PhotoPreview;
