import React from 'react';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  type = 'button',
  fullWidth,
  children,
  onClick,
  secondary,
  danger,
  disabled,
}) => {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`
        flex 
        justify-center 
        rounded-md 
        px-4 
        py-2.5
        text-sm 
        font-semibold 
        outline-none
        focus:outline-none
        hover:opacity-90
        ${disabled && 'opacity-50 cursor-not-allowed'}
        ${fullWidth && 'w-full'}
        ${secondary ? 'bg-gray-700 text-white hover:bg-gray-600' : ''}
        ${danger ? 'bg-red-500 text-white hover:bg-red-600' : ''}
        ${!secondary && !danger && 'bg-[#5865F2] text-white hover:bg-[#4752C4]'}
        transition-colors
        duration-200
      `}
    >
      {children}
    </button>
  );
};

export default Button; 