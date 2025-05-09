"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface TabHeaderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  className?: string;
}

export const TabHeader = ({
  title,
  description,
  icon: Icon,
  className
}: TabHeaderProps) => {
  return (
    <div className={cn("mb-6", className)}>
      {Icon && (
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-6 w-6 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>
      )}
      {!Icon && (
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
      )}
      <p className="text-zinc-400 mt-1">{description}</p>
    </div>
  );
}; 