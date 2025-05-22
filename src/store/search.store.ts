import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SearchApiResponse, CachedResults, SearchState } from '@/types/search.type';

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      query: '',
      results: null,
      isLoading: false,
      error: null,
      hasSearched: false,
      cachedResults: {} as CachedResults,
      pendingFetches: new Map(),
      currentPage: 1,
      isFromMainNavigation: false,

      setQuery: (query: string) => set({ query }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
      setResults: (results: SearchApiResponse) => {
        const { query, cachedResults } = get();
        const cacheKey = query.toLowerCase().trim();

        // 현재 캐시 데이터 확인
        const existingCache = cachedResults[cacheKey] || {
          keywordData: {
            totalResults: results.totalResults,
            itemsPerPage: results.itemsPerPage,
            timestamp: Date.now(),
          },
          pageData: {},
        };

        // 페이지별 데이터 업데이트
        const pageData = { ...existingCache.pageData };
        pageData[results.page] = {
          sponsoredResults: results.sponsoredResults,
          posts: results.posts,
        };

        // 키워드 공통 정보 업데이트 (검색 결과 수가 변경되었을 수 있음)
        const keywordData = {
          ...existingCache.keywordData,
          totalResults: results.totalResults,
          timestamp: Date.now(),
        };

        // 캐시 업데이트
        const updatedCache = {
          ...cachedResults,
          [cacheKey]: {
            keywordData,
            pageData,
          },
        };

        set({
          results,
          isLoading: false,
          hasSearched: true,
          cachedResults: updatedCache,
          isFromMainNavigation: false,
        });
      },
      getCachedResults: (query: string, page: number) => {
        const { cachedResults } = get();
        const cacheKey = query.toLowerCase().trim();

        if (
          cachedResults[cacheKey] &&
          cachedResults[cacheKey].pageData[page] &&
          // 캐시가 30분 이내인지 확인
          Date.now() - cachedResults[cacheKey].keywordData.timestamp < 30 * 60 * 1000
        ) {
          const cachedData = cachedResults[cacheKey];
          const cachedPageData = cachedData.pageData[page];
          const { totalResults, itemsPerPage } = cachedData.keywordData;

          // 새 검색 응답 구조로 조합
          const responseData: SearchApiResponse = {
            keyword: cacheKey, // 캐시 키가 검색어
            totalResults,
            itemsPerPage,
            sponsoredResults: cachedPageData.sponsoredResults,
            page, // 페이지 번호는 파라미터로 받은 값 사용
            posts: cachedPageData.posts,
          };

          return responseData;
        }

        return null;
      },
      resetSearch: () =>
        set({
          query: '',
          results: null,
          isLoading: false,
          error: null,
          hasSearched: false,
          currentPage: 1,
        }),
      setPendingFetch: (page, promise) =>
        set(state => {
          const newMap = new Map(state.pendingFetches);
          newMap.set(page, promise);
          return { pendingFetches: newMap };
        }),
      removePendingFetch: page =>
        set(state => {
          const newMap = new Map(state.pendingFetches);
          newMap.delete(page);
          return { pendingFetches: newMap };
        }),
      getPendingFetch: page => get().pendingFetches.get(page),
      setCurrentPage: (page: number) => set({ currentPage: page }),

      setFromMainNavigation: (value: boolean) => set({ isFromMainNavigation: value }),
    }),
    {
      name: 'search-cache',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        query: state.query,
        results: state.results,
        cachedResults: state.cachedResults,
        hasSearched: state.hasSearched,
        currentPage: state.currentPage,
        isLoading: state.isLoading,
      }),
    }
  )
);

// 새로고침 후 초기화 로직: 저장된 캐시에서 마지막 결과 복원
if (typeof window !== 'undefined') {
  // 브라우저 환경에서만 실행 - 즉시 실행 (setTimeout 제거)
  const {
    query,
    currentPage,
    hasSearched,
    results,
    getCachedResults,
    setResults,
    setLoading,
    resetSearch,
  } = useSearchStore.getState();

  const currentPath = window.location.pathname;

  // 메인 페이지에서는 검색 상태를 완전히 초기화
  if (currentPath === '/') {
    resetSearch(); // 쿼리뿐 아니라 hasSearched도 초기화하여 새 검색 시작
    console.log('메인 페이지 접속: 검색 상태 완전히 초기화');
  }
  // 검색 페이지에서만 마지막 결과 복원
  else if (currentPath.includes('/search')) {
    // 이전에 검색 결과가 있었지만 현재 결과가 없는 경우 (새로고침으로 인한 결과 초기화)
    if (hasSearched && query && !results) {
      // 로딩 상태 즉시 설정 (새로고침 직후 UI 깜빡임 방지)
      setLoading(true);

      try {
        // 캐시된 결과 확인 - 즉시 복원 (딜레이 제거)
        const cachedResult = getCachedResults(query, currentPage);
        if (cachedResult) {
          setResults(cachedResult);
          console.log(`새로고침 후 '${query}' 검색 결과 즉시 복원 (페이지 ${currentPage})`);
        }
      } catch (error) {
        console.error('캐시된 결과 복원 중 오류:', error);
      } finally {
        setLoading(false);
      }
    }
  }
}
