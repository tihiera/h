import React from "react";

export default function Button({ children, className = "", variant = "primary", ...props }) {
  const baseClasses = "rounded-xl px-4 py-1.5 font-medium transition-all duration-200 ease-out";
  const variantClasses = {
    primary: "bg-gradient-to-r from-[#fb6058] to-[#ff7a6b] hover:from-[#fa5449] hover:to-[#ff6b5c] text-white shadow-sm hover:shadow-md",
    dark: "w-full rounded-2xl bg-gray-800 hover:bg-gray-700 text-white text-sm py-2.5 shadow-sm hover:shadow-md",
    cta: "rounded-2xl text-white font-semibold px-8 py-3.5 bg-gradient-to-r from-[#fb6058] to-[#ff7a6b] hover:from-[#fa5449] hover:to-[#ff6b5c] shadow-lg hover:shadow-xl"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}
