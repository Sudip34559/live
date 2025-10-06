"use client";
import React, { useEffect } from "react";
import GradualBlurMemo from "../GradualBlur";
import { NavbarHome } from "../navbar";
import { useTheme } from "next-themes";

export default function BlurLayout({
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
      {/* Content that creates scrollable document */}
      <div className="relative">
        {/* Add enough content height to enable scrolling */}
        <div className="min-h-screen  pb-24">{children}</div>

        {/* Bottom blur positioned at page level */}
        <div className="fixed bottom-0 inset-x-0 pointer-events-none z-20">
          <GradualBlurMemo
            target="parent"
            position="bottom"
            height="6rem"
            strength={2.5}
            divCount={8}
            curve="bezier"
            exponential={true}
            opacity={1}
            className="pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}
