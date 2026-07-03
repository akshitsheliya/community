import React from "react";

interface ButtonProps {
  text: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ text, onClick }) => {
  return (
    <button
      className="bg-white rounded text-theme font-bold px-3 py-1 mt-2"
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default Button;
