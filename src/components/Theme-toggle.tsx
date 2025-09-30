"use client";

import { MoonStarIcon, SunIcon, MonitorIcon } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useState } from "react";

import { Button } from "./ui/button";

export function ToggleTheme() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, themes } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = useCallback(() => {
    const themeOrder = ["light", "dark", "system"];
    const currentIndex = themeOrder.indexOf(theme || "system");
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  }, [theme, setTheme]);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <span className="sr-only">Toggle Theme</span>
      </Button>
    );
  }

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <SunIcon className="h-4 w-4" />;
      case "dark":
        return <MoonStarIcon className="h-4 w-4" />;
      case "system":
        return <MonitorIcon className="h-4 w-4" />;
      default:
        return <SunIcon className="h-4 w-4" />;
    }
  };

  return (
    <Button variant="outline" size="icon" onClick={handleToggle}>
      {getIcon()}
      <span className="sr-only">Toggle Theme (Current: {theme})</span>
    </Button>
  );
}
