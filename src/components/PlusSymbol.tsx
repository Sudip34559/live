import React from "react";
export const PlusSymbol = ({
  size = 24,
  thickness = 2,
  color = "#c0aafd",
  className = "",
}) => (
  <div className={`absolute ${className}`}>
    <div
      className="relative inline-block"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute top-1/2 left-0 w-full -translate-y-1/2"
        style={{ height: thickness, backgroundColor: color }}
      />
      <div
        className="absolute left-1/2 top-0 h-full -translate-x-1/2"
        style={{ width: thickness, backgroundColor: color }}
      />
    </div>
  </div>
);
