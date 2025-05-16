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

      setQuery: (query: string) => set({ query }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
      setResults: (results: SearchApiResponse) => {
        const { query, cachedResults } = get();
        const cacheKey = query.toLowerCase().trim();
        const pageData = { ...(cachedResults[cacheKey]?.pageData || {}) };

        // 현재 페이지의 결과를 캐시에 저장
        pageData[results.page] = results.posts;

        // 캐시 업데이트
        const updatedCache = {
          ...cachedResults,
          [cacheKey]: {
            apiResponse: results,
            timestamp: Date.now(),
            pageData,
          },
        };

        set({
          results,
          isLoading: false,
          hasSearched: true,
          cachedResults: updatedCache,
        });
      },
      getCachedResults: (query: string, page: number) => {
        const { cachedResults } = get();
        const cacheKey = query.toLowerCase().trim();

        if (
          cachedResults[cacheKey] &&
          cachedResults[cacheKey].pageData[page] &&
          // 캐시가 30분 이내인지 확인
          Date.now() - cachedResults[cacheKey].timestamp < 30 * 60 * 1000
        ) {
          const cachedData = cachedResults[cacheKey];

          // 캐시된 응답을 복제하고 현재 페이지의 포스트로 업데이트
          const updatedResponse: SearchApiResponse = {
            ...cachedData.apiResponse,
            page,
            posts: cachedData.pageData[page],
          };

          return updatedResponse;
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
      clearSearchQuery: () => {
        // 캐시는 유지하고 검색어만 초기화
        set({ query: '' });
      },
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
    clearSearchQuery,
  } = useSearchStore.getState();

  const currentPath = window.location.pathname;

  // 메인 페이지에서는 쿼리를 초기화
  if (currentPath === '/') {
    clearSearchQuery();
  }
  // 검색 페이지에서만 마지막 결과 복원
  else if (currentPath.includes('/search')) {
    // 이전에 검색 결과가 있었지만 현재 결과가 없는 경우 (새로고침으로 인한 결과 초기화)
    if (hasSearched && query && !results) {
      // 로딩 상태 즉시 설정 (새로고침 직후 UI 깜빡임 방지)
      setLoading(true);

      // 캐시된 결과 확인 - 즉시 복원 (딜레이 제거)
      const cachedResult = getCachedResults(query, currentPage);
      if (cachedResult) {
        setResults(cachedResult);
        console.log(`새로고침 후 '${query}' 검색 결과 즉시 복원 (페이지 ${currentPage})`);
      }
      setLoading(false);
    }
  }
}
