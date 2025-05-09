"use client";

import { Moon, Sun, Brush } from "lucide-react";
import { TabHeader } from "@/components/profile/TabHeader";
import { TabContent } from "@/components/profile/TabContent";
import { useTheme } from "@/app/context/ThemeContext";

export default function AppearancePage() {
  const { theme, fontSize, setTheme, setFontSize } = useTheme();

  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
  };

  const handleFontSizeChange = (size: "14px" | "16px" | "18px") => {
    setFontSize(size);
  };

  return (
    <div className="p-8">
      <TabHeader 
        title="Внешний вид" 
        description="Настройте внешний вид интерфейса ChillCord"
        icon={Brush}
      />
      
      <TabContent>
        <div className="max-w-3xl mx-auto">
          {/* Выбор темы */}
          <div className="bg-zinc-800/50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-medium text-white mb-4">Тема</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Темная тема */}
              <div 
                className={`bg-zinc-800 ${theme === 'dark' ? 'border-2 border-indigo-500' : 'border border-zinc-700'} rounded-lg p-4 relative cursor-pointer`}
                onClick={() => handleThemeChange('dark')}
                data-theme-preview="dark"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Moon className="h-5 w-5 text-white" />
                    <span className="text-white font-medium">Темная</span>
                  </div>
                  <div className={`h-4 w-4 rounded-full ${theme === 'dark' ? 'bg-indigo-500' : 'bg-zinc-600'}`}></div>
                </div>
                <div className="h-32 rounded-md bg-zinc-900 border border-zinc-700">
                  <div className="h-6 w-full bg-zinc-800 border-b border-zinc-700"></div>
                  <div className="flex h-[calc(100%-24px)]">
                    <div className="w-10 bg-zinc-800 border-r border-zinc-700"></div>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-16 h-3 bg-zinc-700 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            
              {/* Светлая тема */}
              <div 
                className={`bg-zinc-800 ${theme === 'light' ? 'border-2 border-indigo-500' : 'border border-zinc-700'} rounded-lg p-4 relative cursor-pointer`}
                onClick={() => handleThemeChange('light')}
                data-theme-preview="light"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sun className="h-5 w-5 text-white" />
                    <span className="text-white font-medium">Светлая</span>
                  </div>
                  <div className={`h-4 w-4 rounded-full ${theme === 'light' ? 'bg-indigo-500' : 'bg-zinc-600'}`}></div>
                </div>
                <div className="h-32 rounded-md bg-zinc-100 border border-zinc-300">
                  <div className="h-6 w-full bg-white border-b border-zinc-300"></div>
                  <div className="flex h-[calc(100%-24px)]">
                    <div className="w-10 bg-white border-r border-zinc-300"></div>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-16 h-3 bg-zinc-300 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
          {/* Размер шрифта */}
          <div className="bg-zinc-800/50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Размер шрифта</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Размер шрифта сообщений</span>
                <div className="flex items-center bg-zinc-700 rounded-md overflow-hidden">
                  <button 
                    className={`px-3 py-1 text-sm ${fontSize === '14px' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-600/50'}`}
                    onClick={() => handleFontSizeChange('14px')}
                  >
                    14px
                  </button>
                  <button 
                    className={`px-3 py-1 text-sm ${fontSize === '16px' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-600/50'}`}
                    onClick={() => handleFontSizeChange('16px')}
                  >
                    16px
                  </button>
                  <button 
                    className={`px-3 py-1 text-sm ${fontSize === '18px' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-600/50'}`}
                    onClick={() => handleFontSizeChange('18px')}
                  >
                    18px
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabContent>
    </div>
  );
} 