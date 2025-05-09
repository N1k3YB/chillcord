"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useThemeStore } from "@/lib/stores/theme-store";

interface ThemeContextType {
  theme: "dark" | "light";
  fontSize: "14px" | "16px" | "18px";
  setTheme: (theme: "dark" | "light") => void;
  setFontSize: (size: "14px" | "16px" | "18px") => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const themeStore = useThemeStore();
  
  useEffect(() => {
    // Применяем настройки темы к документу
    document.documentElement.setAttribute('data-theme', themeStore.theme);
    document.documentElement.style.fontSize = themeStore.fontSize;
    
    // Также применяем класс темы к body для более надежного переключения
    if (themeStore.theme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [themeStore.theme, themeStore.fontSize]);

  return (
    <ThemeContext.Provider value={{
      theme: themeStore.theme,
      fontSize: themeStore.fontSize,
      setTheme: themeStore.setTheme,
      setFontSize: themeStore.setFontSize
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}; 