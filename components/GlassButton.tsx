import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const GlassButton = ({
  children,
  onClick,
  className,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
}: GlassButtonProps) => {
  const baseClasses = "font-medium flex items-center justify-center rounded-lg transition-all duration-300 border backdrop-blur-sm cursor-pointer";
  
  const variantClasses = {
    primary: "bg-primary text-white border-primary hover:bg-primary-dark shadow-lg hover:shadow-xl",
    secondary: "bg-white/20 text-primary border-primary/20 hover:bg-white/30",
    outline: "bg-transparent text-primary border-primary hover:bg-primary/10",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
};
