import { useState } from "react";
import { useSearchStore } from "@/store/search.store";
import { searchApi } from "@/apis/search.api";

// 기본 페이지당 항목 수 (API 요청 및 UI에 표시할 항목 수)
const ITEMS_PER_PAGE = 10;
// 한 번에 프리페치할 페이지 수
const PREFETCH_COUNT = 1;

export const useSearch = () => {
  const {
    query,
    results,
    isLoading,
    error,
    hasSearched,
    setQuery,
    setLoading,
    setError,
    setResults,
    resetSearch,
    getCachedResults,
  } = useSearchStore();

  const [currentPage, setCurrentPage] = useState(1);

  // 검색 처리 함수
  const handleSearch = async (searchQuery?: string, page: number = 1) => {
    const currentQuery = searchQuery !== undefined ? searchQuery : query;

    if (!currentQuery.trim()) {
      setError("검색어를 입력해주세요.");
      return;
    }

    // 페이지 번호가 변경된 경우 (페이지네이션 클릭)
    if (page !== 1 && currentQuery === query) {
      // 캐시된 결과가 있는지 확인
      const cachedResults = getCachedResults(currentQuery, page);
      if (cachedResults) {
        console.log(`캐시된 결과 사용 (페이지 ${page})`);
        setResults(cachedResults);
        setCurrentPage(page);

        // 다음 페이지 프리페치 (백그라운드)
        prefetchNextPage(currentQuery, page);
        return;
      }
    }

    try {
      // 새 검색어 또는 캐시된 결과가 없으면 API 호출
      setLoading(true);
      setError(null);

      if (searchQuery) {
        setQuery(searchQuery);
      }

      // API 호출
      console.log(
        `'${currentQuery}' 검색 중... (페이지 ${page}, ${ITEMS_PER_PAGE}개 항목)`
      );
      const searchResults = await searchApi.searchBlogs({
        keyword: currentQuery,
        page,
        items_per_page: ITEMS_PER_PAGE
      });

      // 결과 저장
      setResults(searchResults);
      setCurrentPage(page);

      // 다음 페이지 프리페치 (백그라운드)
      prefetchNextPage(currentQuery, page);
    } catch (err) {
      setError("검색 중 오류가 발생했습니다. 다시 시도해주세요.");
      console.error("검색 오류:", err);
    }
  };

  // 다음 페이지 프리페치 (백그라운드 작업)
  const prefetchNextPage = async (queryText: string, currentPage: number) => {
    // 프리페치할 페이지들
    const pagesToFetch = [];
    for (let i = 1; i <= PREFETCH_COUNT; i++) {
      pagesToFetch.push(currentPage + i);
    }

    // 비동기로 다음 페이지들 가져오기
    for (const nextPage of pagesToFetch) {
      try {
        // 이미 캐시에 있는지 확인
        const cached = getCachedResults(queryText, nextPage);
        if (cached) continue;

        // 백그라운드에서 다음 페이지 데이터 가져오기
        console.log(`백그라운드에서 페이지 ${nextPage} 가져오는 중...`);
        const nextPageData = await searchApi.searchBlogs({
          keyword: queryText,
          page: nextPage,
          items_per_page: ITEMS_PER_PAGE
        });

        // 스토어에 결과 캐싱
        if (nextPageData && nextPageData.posts.length > 0) {
          setResults(nextPageData);
        }
      } catch (error) {
        // 프리페치는 실패해도 사용자에게 오류를 표시하지 않음
        console.error(`페이지 ${nextPage} 프리페치 실패:`, error);
      }
    }
  };

  return {
    query,
    results,
    isLoading,
    error,
    hasSearched,
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    setQuery,
    handleSearch,
    resetSearch,
    setCurrentPage,
  };
};
