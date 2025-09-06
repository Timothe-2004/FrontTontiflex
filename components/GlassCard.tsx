import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard = ({ children, className, hover = true }: GlassCardProps) => {
  return (
    <div
      className={cn(
        "bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-lg shadow-md transition-all duration-300 p-6",
        hover && "hover:shadow-xl hover:-translate-y-1 hover:bg-primary/20",
        className
      )}
    >
      {children}
    </div>
  );
};
