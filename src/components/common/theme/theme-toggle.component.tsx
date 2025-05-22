'use client';

import React from 'react';
import { useThemeStore } from '@/store/theme.store';
import { Button } from '@/components/ui';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      className="fixed bottom-5 right-5 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none h-12 w-12"
      aria-label="테마 변경"
    >
      {isDarkMode ? (
        // 해 아이콘 (라이트 모드로 전환)
        <Sun className="h-6 w-6 text-amber-400" />
      ) : (
        // 달 아이콘 (다크 모드로 전환)
        <Moon className="h-6 w-6 text-gray-700" />
      )}
    </Button>
  );
};
