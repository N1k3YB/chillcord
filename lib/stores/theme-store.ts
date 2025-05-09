import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'dark' | 'light';
  fontSize: '14px' | '16px' | '18px';
  setTheme: (theme: 'dark' | 'light') => void;
  setFontSize: (size: '14px' | '16px' | '18px') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set: any) => ({
      theme: 'dark',
      fontSize: '14px',
      setTheme: (theme: 'dark' | 'light') => set({ theme }),
      setFontSize: (fontSize: '14px' | '16px' | '18px') => set({ fontSize }),
    }),
    {
      name: 'theme-storage',
    }
  )
); 