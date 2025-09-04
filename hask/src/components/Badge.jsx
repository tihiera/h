import React from "react";
export default function Badge({ children }) {
  return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">{children}</span>;
}
