import React from 'react';

interface InputProps {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  type = 'text',
  required,
  value,
  onChange,
  disabled,
  placeholder
}) => {
  return (
    <div className="relative w-full">
      <label 
        htmlFor={id} 
        className="block text-xs font-semibold text-gray-300 uppercase mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className="
          w-full
          px-3
          py-2
          rounded-md
          bg-[#202225]
          border
          border-gray-800
          text-white
          focus:outline-none
          focus:ring-2
          focus:ring-[#5865F2]
          focus:border-transparent
          transition
          disabled:opacity-70
          disabled:cursor-not-allowed
          placeholder:text-gray-500
          text-sm
        "
      />
    </div>
  );
};

export default Input; 