import React from "react";

export default function TextField({ 
  label, 
  placeholder, 
  type = "text", 
  required = false, 
  variant = "default",
  value,
  onChange,
  readOnly = false,
  ...props
}) {
  const baseClasses = variant === "large" 
    ? "w-full rounded-xl text-gray-800 placeholder:text-gray-400 border px-4 py-3 text-sm focus:outline-none"
    : "mt-1 w-full rounded-lg border text-sm placeholder:text-gray-400 px-3 py-2 focus:outline-none";
    
  const interactiveClasses = readOnly
    ? "bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed"
    : "bg-white border-gray-200 focus:ring-2 focus:ring-[#fb6058]/40";

  const inputClasses = `${baseClasses} ${interactiveClasses}`;

  return (
    <label className="block text-sm mb-3">
      <span className="font-medium text-gray-800">
        {label}{required && " *"}
        {readOnly && <span className="text-xs text-gray-500 ml-1">(publicly visible)</span>}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={inputClasses}
        {...props}
      />
    </label>
  );
}
