'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header, Footer } from '@/components/common/navigation';
import { SearchBar } from '@/components/search/search-bar.component';
import { SearchResults } from '@/components/search/search-result.component';
import { useSearch } from '@/hooks/use-search.hook';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const containerRef = useRef<HTMLDivElement>(null);

  const { results, error, currentPage, handleSearch, query, isFromNavigation } = useSearch();

  // 컴포넌트 마운트 시 URL에서 쿼리 파라미터 가져와서 검색
  useEffect(() => {
    // URL 쿼리가 있는 경우에만 처리
    if (queryParam && queryParam.trim().length >= 2) {
      // 네비게이션에서 온 경우는 handleSearch에서 특별히 처리
      if (isFromNavigation) {
        console.log(`메인 페이지에서 검색 이동: ${queryParam}`);
        handleSearch(queryParam, pageParam);
      }
      // 새로고침이나 직접 URL 입력의 경우: 현재 쿼리와 URL 쿼리가 다르거나 결과가 없는 경우에만 검색
      else if (queryParam !== query || !results) {
        console.log(`URL 파라미터로 새 검색 실행: ${queryParam}, 페이지: ${pageParam}`);
        handleSearch(queryParam, pageParam);
      }
      // URL의 페이지 파라미터와 현재 페이지가 다른 경우 해당 페이지로 이동
      else if (pageParam !== currentPage) {
        console.log(`URL 페이지 파라미터로 페이지 변경: ${pageParam}`);
        handleSearch(query, pageParam);
      }
    }
  }, [queryParam, pageParam, isFromNavigation]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (query) {
      // 현재 페이지와 다른 경우에만 처리
      if (page !== currentPage) {
        // URL 업데이트
        router.push(`/search?q=${encodeURIComponent(query)}&page=${page}`);
        // 이미 캐시된 결과가 있는지 확인
        handleSearch(query, page);
      }
    }
  };

  // 컴포넌트 마운트 시 애니메이션 효과
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // 시작 위치에서 원래 위치로 애니메이션
      container.classList.add('transition-transform', 'duration-500', 'ease-out');
      container.style.transform = 'translateY(20px)';
      container.style.opacity = '0';

      setTimeout(() => {
        container.style.transform = 'translateY(0)';
        container.style.opacity = '1';
      }, 100);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-4xl mx-auto mb-8 flex justify-center">
          <div className="w-full max-w-2xl">
            <SearchBar initialQuery={queryParam} isSearchPage={false} />
          </div>
        </div>

        <div
          ref={containerRef}
          className="w-full max-w-4xl mx-auto transition-all duration-500"
          id="search-results-container"
        >
          <SearchResults
            results={results}
            error={error}
            onPageChange={handlePageChange}
            currentPage={currentPage}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
