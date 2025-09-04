import React from "react";
export default function Avatar({ src, alt, size=48 }) {
  return (
    <img src={src} alt={alt} width={size} height={size}
      className="rounded-full object-cover border border-gray-200" />
  );
}
