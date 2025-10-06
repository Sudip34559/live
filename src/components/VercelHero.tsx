"use client";
// components/VercelHero.tsx
import React from "react";

const VercelLogo = () => (
  <svg
    aria-label="Vercel logomark"
    role="img"
    viewBox="0 0 74 64"
    className="h-[14px] w-auto"
  >
    <path
      d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z"
      fill="currentColor"
    />
  </svg>
);

export default function VercelHero() {
  return (
    <section
      className="relative min-h-[calc(100vh-var(--vh100-offset,0px))] overflow-hidden bg-[var(--geist-background)] text-[var(--ds-gray-1000)]"
      style={{
        fontFamily: "var(--font-sans, var(--font-sans-fallback))",
        fontSynthesis: "initial",
        ["font-synthesis-weight" as any]: "none",
      }}
    >
      {/* Rainbow gradient backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 40%, rgba(120,119,198,0.30), transparent),
            radial-gradient(ellipse 60% 50% at 80% 50%, rgba(255,214,0,0.10), transparent),
            radial-gradient(ellipse 60% 50% at 20% 50%, rgba(120,119,198,0.20), transparent)
          `,
        }}
      />

      {/* Grid guides (12 x 8) */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 12 }).map((_, col) => (
          <div
            key={`v-col-${col}`}
            className="absolute top-0 h-full border-r"
            style={{
              left: `calc(${col} * (100% / 12))`,
              width: `calc(100% / 12)`,
              borderColor: "rgba(0,0,0,0.1)",
            }}
          />
        ))}
        {Array.from({ length: 8 }).map((_, row) => (
          <div
            key={`v-row-${row}`}
            className="absolute left-0 w-full border-b"
            style={{
              top: `calc(${row} * (100% / 8))`,
              height: `calc(100% / 8)`,
              borderColor: "rgba(0,0,0,0.1)",
            }}
          />
        ))}
      </div>

      {/* Triangle rays SVG layer */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1200 700"
      >
        <path fill="var(--geist-background)" d="M485 650.4h230L600 451.21z" />
        {Array.from({ length: 15 }).map((_, i) => {
          const opacity = [
            1, 0.93, 0.87, 0.8, 0.73, 0.67, 0.6, 0.53, 0.47, 0.4, 0.33, 0.27,
            0.2, 0.13, 0.07,
          ][i];
          const y = 451.21 + i * 9.12;
          return (
            <path
              key={i}
              stroke="var(--geist-foreground)"
              opacity={opacity}
              d={`M715 650.4 L600 ${y} L485 650.4`}
            />
          );
        })}
      </svg>
    </section>
  );
}
