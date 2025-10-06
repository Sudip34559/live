import React from "react";
import { ArrowRight } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const animatedButtonVariants = cva(
  "group relative cursor-pointer overflow-hidden rounded-full border text-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-background border-input hover:bg-accent hover:text-accent-foreground",
        primary:
          "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80",
        outline:
          "border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost:
          "border-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "w-32 p-2",
        sm: "w-28 p-1.5 text-sm",
        lg: "w-40 p-3 text-lg",
        xl: "w-48 p-4 text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof animatedButtonVariants> {
  text?: string;
  icon?: React.ReactNode;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  className,
  variant,
  size,
  text = "Button",
  icon = <ArrowRight className="h-4 w-4" />,
  ...props
}) => {
  return (
    <button
      className={cn(animatedButtonVariants({ variant, size, className }))}
      {...props}
    >
      {/* Original text that slides out */}
      <span className="inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
        {text}
      </span>

      {/* New content that slides in */}
      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100">
        <span>{text}</span>
        {icon}
      </div>

      {/* Expanding background */}
      <div className="absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg bg-primary transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8] group-hover:bg-primary" />
    </button>
  );
};

export default AnimatedButton;
