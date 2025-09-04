import React from "react";

export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl shadow-[0_6px_24px_rgba(0,0,0,0.06)] border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}
