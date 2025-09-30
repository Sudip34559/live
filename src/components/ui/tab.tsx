import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Badge } from "./badge";

interface TabProps {
  text: string;
  selected: boolean;
  setSelected: (text: string) => void;
  discount?: boolean;
}

export const Tab = ({
  text,
  selected,
  setSelected,
  discount = false,
}: TabProps) => {
  return (
    <button
      onClick={() => setSelected(text)}
      className={cn(
        "relative w-fit px-4 py-2 text-sm font-semibold capitalize text-foreground transition-colors",
        discount && "flex items-center justify-center gap-2.5"
      )}
    >
      <span className="relative z-10">{text}</span>
      {selected && (
        <motion.span
          layoutId="tab"
          transition={{ type: "spring", duration: 0.4 }}
          className="absolute inset-0 z-0 rounded-full dark:bg-[#1c1917] bg-white  shadow-sm"
        ></motion.span>
      )}
      {discount && (
        <Badge
          className={cn(
            "relative z-10 whitespace-nowrap bg-gray-100 text-xs text-black dark:text-white shadow-none",
            selected
              ? "dark:bg-[#3f324a]  bg-[#f3e5f5]"
              : "dark:bg-[#1c1917] bg-white  "
          )}
        >
          Save 35%
        </Badge>
      )}
    </button>
  );
};
