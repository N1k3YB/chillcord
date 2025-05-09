"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { RouteTracker } from "@/components/RouteTracker";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <Toaster position="top-center" />
        <RouteTracker />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
} 