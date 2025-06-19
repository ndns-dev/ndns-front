'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { StickySearchBar } from '@/components/search/sticky-search-bar.component';
import { cn } from '@/utils/class-name.util';
import { AdBanner } from '@/components/common/marketing/ad-banner.component';
import { useSearchUIStore } from '@/store/search-ui.store';
import { useThemeStore } from '@/store/theme.store';
interface SidebarProps {
  categories?: string[];
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const [searchBarOpacity, setSearchBarOpacity] = useState(0);
  const [searchBarMode, setSearchBarMode] = useState<'origin' | 'sidebar'>('origin');
  const animationRef = useRef<number | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { isDarkMode } = useThemeStore();
  const searchUIStore = useSearchUIStore();
  // 검색 페이지인지 확인
  const isSearchPage = pathname.includes('/search');

  // 광고 스타일 상태 추가
  const [adStyle, setAdStyle] = useState({ transition: 'none' });

  // 스티키 상태 구독 및 애니메이션 개선
  useEffect(() => {
    // 현재 상태와 다를 때만 업데이트
    if (searchBarOpacity !== searchUIStore.stickyOpacity) {
      setSearchBarOpacity(searchUIStore.stickyOpacity);
    }
    if (searchBarMode !== searchUIStore.searchBarMode) {
      setSearchBarMode(searchUIStore.searchBarMode);
    }
  }, [searchUIStore.stickyOpacity, searchUIStore.searchBarMode]);

  // 검색바 스티키 상태에 따른 스타일 반영
  useEffect(() => {
    const isTransitioning = searchUIStore.transitionActive;

    // 사이드바 스타일 업데이트
    setAdStyle({
      // 부드러운 전환 효과
      transition: isTransitioning ? 'transform 0.2s ease-out' : 'none',
    });
  }, [searchUIStore.transitionActive]);

  // 검색바 모드에 따른 스타일 적용
  const showStickySearchBar = isSearchPage && searchBarMode === 'sidebar';

  // 사이드바 위치 업데이트를 위한 별도의 useEffect
  useEffect(() => {
    const updateSidebarPosition = () => {
      if (sidebarRef.current) {
        const rect = sidebarRef.current.getBoundingClientRect();
        searchUIStore.setSidebarPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    // 초기 위치 설정
    updateSidebarPosition();

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', updateSidebarPosition);

    return () => {
      window.removeEventListener('resize', updateSidebarPosition);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={sidebarRef}
      className={`
        ${className}
        hidden lg:block w-64
        ${searchBarMode === 'sidebar' ? 'pt-0' : 'mt-14'}
      `}
    >
      <div className="sticky top-4 z-10 flex flex-col">
        {/* 사이드바 내 스티키 검색 폼 */}
        {isSearchPage && (
          <StickySearchBar isSticky={showStickySearchBar} opacity={searchBarOpacity} />
        )}

        {/* 사이드바 광고 */}
        <div
          className={cn(
            'hidden md:flex flex-col gap-4 w-full max-w-xs sticky',
            isDarkMode ? 'text-gray-200' : 'text-gray-800'
          )}
          style={adStyle}
        >
          <AdBanner position="sidebar" />
        </div>
      </div>
    </div>
  );
};
