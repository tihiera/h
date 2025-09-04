import React from "react";

export default function Container({ children, className = "" }) {
  return (
    <div className={`max-w-xl mx-auto px-6 ${className}`}>
      {children}
    </div>
  );
}
