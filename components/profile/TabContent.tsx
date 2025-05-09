"use client";

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabContentProps {
  children: ReactNode;
  className?: string;
}

export const TabContent = ({
  children,
  className
}: TabContentProps) => {
  return (
    <div 
      className={cn(
        "animate-fadeIn transition-all duration-300 ease-in-out",
        className
      )}
    >
      {children}
    </div>
  );
}; 