'use client';

import React, { ReactNode, useEffect } from 'react';
import { useThemeStore } from '@/store/theme.store';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { isDarkMode } = useThemeStore();

  // 다크모드 상태가 변경될 때마다 HTML에 클래스 추가/제거
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // 초기 테마 설정 (클라이언트 사이드에서만)
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== 'undefined') {
      // localStorage에서 테마 설정을 불러오지 못한 경우에만 기본값 설정
      const themeData = localStorage.getItem('theme-storage');
      if (!themeData) {
        // 시스템 테마 설정 감지
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        // 시스템 설정에 따라 테마 적용 (모바일, PC 동일하게)
        useThemeStore.getState().setDarkMode(prefersDarkMode);
      }
    }
  }, []);

  return <>{children}</>;
};
