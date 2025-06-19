import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { useSearch } from '@/hooks/use-search.hook';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/class-name.util';
import { useSearchUIStore } from '@/store/search-ui.store';
import { SearchForm } from './search-form.component';

interface SearchBarProps {
  centered?: boolean;
  initialQuery?: string;
  isSearchPage?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  centered = false,
  initialQuery = '',
  isSearchPage = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { query, setQuery, handleSearch, isLoading, resetSearch } = useSearch();
  const formRef = useRef<HTMLFormElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const searchUIStore = useSearchUIStore();

  // initialQuery가 적용되었는지 추적하는 ref
  const initialQueryApplied = useRef(false);

  // 메인 페이지에서는 모든 검색 상태를 초기화
  useEffect(() => {
    if (centered && pathname === '/') {
      resetSearch();
      console.log('메인 페이지 SearchBar 마운트: 검색 상태 초기화');
    }
  }, [centered, pathname, resetSearch]);

  // initialQuery가 제공되면 쿼리 상태 초기화 (처음 한 번만)
  useEffect(() => {
    // 메인 페이지(centered=true)에서는 초기 쿼리를 설정하지 않음
    // 검색 페이지에서만 URL의 쿼리를 사용
    if (initialQuery && !initialQueryApplied.current && !centered) {
      setQuery(initialQuery);
      initialQueryApplied.current = true;
    }
  }, [initialQuery, setQuery, centered]);

  // 스크롤 위치에 따라 검색바 위치 조정
  useEffect(() => {
    if (!pathname.includes('/search') || !searchBarRef.current) return;

    // 초기 상태 설정 (첫 렌더링 시에만)
    const isSearchPath = pathname.includes('/search');
    if (isSearchPath) {
      setIsSticky(false);
      setOpacity(1);

      // 메서드만 사용하고 직접 의존성에 추가하지 않음
      if (searchUIStore.searchBarMode !== 'origin') {
        searchUIStore.setSearchBarMode('origin');
      }
    }

    // 스크롤을 통한 사이드바 노출 관련 상수
    const START_FADE_OFFSET = 0; // 스크롤 즉시 시작
    const FULL_FADE_OFFSET = 200; // 이 위치에서 완전히 전환됨
    const FADE_RANGE = FULL_FADE_OFFSET - START_FADE_OFFSET;

    const checkScroll = () => {
      const scrollY = window.scrollY;

      // 단순한 선형 계산
      // START_FADE_OFFSET보다 작으면 0, FULL_FADE_OFFSET보다 크면 1, 그 사이는 비례 계산
      const progress = Math.max(0, Math.min(1, (scrollY - START_FADE_OFFSET) / FADE_RANGE));

      // 단순하게 메인 검색바와 사이드바 검색바의 opacity를 정반대로 설정
      const mainOpacity = 1 - progress;
      const sidebarOpacity = progress;
      setOpacity(mainOpacity);

      // 스토어에 투명도 값 업데이트
      if (typeof searchUIStore.setStickyOpacity === 'function') {
        searchUIStore.setStickyOpacity(sidebarOpacity);
      }

      // UI 모드 상태 업데이트 - 중간 지점인 0.5를 기준으로 모드 전환
      const currentMode = searchUIStore.searchBarMode;
      const shouldBeSticky = progress > 0.5;

      if (shouldBeSticky !== (currentMode === 'sidebar')) {
        searchUIStore.setSearchBarMode(shouldBeSticky ? 'sidebar' : 'origin');
        searchUIStore.setTransition(true);
      } else if (progress > 0 && progress < 1) {
        searchUIStore.setTransition(true);
      } else {
        searchUIStore.setTransition(false);
      }
    };

    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();

    return () => {
      window.removeEventListener('scroll', checkScroll);
      searchUIStore.setSearchBarMode('origin');
    };
  }, [pathname]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (query && query.trim().length >= 2) {
      // 이미 검색 페이지에 있는지 확인
      const isOnSearchPage = pathname.includes('/search');

      if (isOnSearchPage) {
        // 이미 검색 페이지에 있으면 URL만 업데이트하고 검색 실행
        router.push(`/search?q=${encodeURIComponent(query)}&page=1`);
        handleSearch(query, 1);
      } else {
        // 메인 페이지에서는 검색 페이지로 이동만 수행
        // 검색 페이지의 useEffect에서 검색이 실행될 것임
        router.push(`/search?q=${encodeURIComponent(query)}&page=1`);
      }
    }
  };

  return (
    <>
      {/* 원래 위치의 검색 폼 */}
      <div
        ref={searchBarRef}
        className="w-full h-[68px]"
        style={{
          opacity: opacity,
          visibility: opacity < 0.01 ? 'hidden' : 'visible', // 완전히 투명해지면 hidden으로 변경
          transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.2s', // 부드러운 전환
        }}
      >
        <div className="relative" style={{ opacity: Math.min(1, opacity * 2) }}>
          <SearchForm
            onSubmit={onSubmit}
            query={query}
            setQuery={setQuery}
            isLoading={isLoading}
            placeholder="검색어를 입력하세요 (예: 제주 애월 OO, OOO 건대입구점)"
            className={cn(!isSearchPage && 'max-w-2xl', centered && 'mx-auto')}
            inputClassName="w-full px-5 py-6 pr-16 text-lg rounded-full"
            buttonSize="default"
            formRef={formRef as React.RefObject<HTMLFormElement>}
          />
        </div>
      </div>

      {/* 스티키 검색 폼 (데스크톱) */}
      {!pathname.includes('/search') && (
        <div
          className={cn(
            'fixed shadow-md hidden lg:block transition-all duration-300 ease-in-out',
            isSticky ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          style={{
            transition: 'opacity 0.4s ease, top 0.4s ease',
            boxShadow: isSticky ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
            width: '256px', // w-64와 동일한 너비
            right: 'calc(50% - 32rem + 20px)', // 중앙 기준 옆으로 이동
            top: isSticky ? '16px' : '-5rem',
            zIndex: 10,
          }}
        >
          <SearchForm
            onSubmit={onSubmit}
            query={query}
            setQuery={setQuery}
            isLoading={isLoading}
            placeholder="검색어를 입력하세요"
            inputClassName="w-full px-4 py-3 pr-12 text-base rounded-full"
            buttonSize="small"
          />
        </div>
      )}

      {/* 모바일 및 태블릿용 스티키 검색 폼 */}
      {!pathname.includes('/search') && (
        <div
          className={cn(
            'lg:hidden fixed bottom-4 left-4 right-4 z-10 transition-all duration-300 ease-in-out',
            isSticky ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'
          )}
          style={{
            transition: 'opacity 0.4s ease, transform 0.4s ease',
            boxShadow: isSticky ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
          }}
        >
          <SearchForm
            onSubmit={onSubmit}
            query={query}
            setQuery={setQuery}
            isLoading={isLoading}
            placeholder="검색어를 입력하세요"
            inputClassName="w-full px-4 py-3 pr-12 text-base rounded-full shadow-lg"
            buttonSize="small"
          />
        </div>
      )}
    </>
  );
};
