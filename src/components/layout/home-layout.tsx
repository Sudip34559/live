"use client";
import React, { useEffect } from "react";
import { NavbarHome } from "../navbar";
import GradualBlurMemo from "../GradualBlur";
import { useTheme } from "next-themes";

export default function Homelayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setTheme } = useTheme();
  useEffect(() => {
    setTheme("dark"); // force dark mode
  }, [setTheme]);
  return (
    <div className="w-full h-screen">
      {/* Navbar at top level for window scroll detection */}
      <NavbarHome />
      <div className="relative">
        {/* Add enough content height to enable scrolling */}
        <div className="min-h-screen px-4 md:px-6 lg:px-8 ">{children}</div>
      </div>
    </div>
  );
}
