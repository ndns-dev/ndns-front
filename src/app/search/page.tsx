"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/common/header.component";
import { SearchBar } from "@/components/search/search-bar.component";
import { SearchResults } from "@/components/search/search-result.component";
import { useSearch } from "@/hooks/use-search.hook";
import { SponsorBanner } from "@/components/common/sponsor-banner.component";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  
  const {
    results,
    error,
    currentPage,
    handleSearch,
    query,
  } = useSearch();

  // 컴포넌트 마운트 시 URL에서 쿼리 파라미터 가져와서 검색
  useEffect(() => {
    // URL 쿼리가 있는 경우에만 처리
    if (queryParam) {
      // 현재 쿼리와 URL 쿼리가 다르거나 결과가 없는 경우 검색 수행
      if (queryParam !== query || !results) {
        console.log(`URL 파라미터로 새 검색 실행: ${queryParam}, 페이지: ${pageParam}`);
        handleSearch(queryParam, pageParam);
      } 
      // URL의 페이지 파라미터와 현재 페이지가 다른 경우 해당 페이지로 이동
      else if (pageParam !== currentPage) {
        console.log(`URL 페이지 파라미터로 페이지 변경: ${pageParam}`);
        handleSearch(query, pageParam);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParam, pageParam]); // 의존성 배열은 간소화

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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <SponsorBanner position="top" />
      
      <main className="flex-grow flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-4xl mx-auto pt-8">
          <div className="w-full mb-8">
            <SearchBar initialQuery={queryParam} />
          </div>

          <SearchResults
            results={results}
            error={error}
            onPageChange={handlePageChange}
            currentPage={currentPage}
          />
        </div>
      </main>

      <footer className="py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          © 2025 내돈내산. All rights reserved.
        </div>
      </footer>
    </div>
  );
} 