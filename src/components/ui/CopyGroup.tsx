// app/components/copy-group.tsx
"use client";

import { useState, useRef } from "react";
import { Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CopyGroupProps = {
  value: string;
  className?: string;
};

export function CopyGroup({ value, className }: CopyGroupProps) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const doCopy = async () => {
    try {
      const text = inputRef.current?.value ?? value;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      const t = setTimeout(() => setCopied(false), 1500);
      return () => clearTimeout(t);
    } catch {
      // optional: toast error
    }
  };

  return (
    <div
      className={["flex items-center gap-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Input
        ref={inputRef}
        value={value}
        readOnly
        className="font-mono"
        aria-label="Copyable text"
      />
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={doCopy}
              aria-label="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <span>{copied ? "Copied!" : "Click to copy"}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
