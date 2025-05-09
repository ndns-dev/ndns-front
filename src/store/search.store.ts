import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  SearchApiResponse,
  CachedResults,
  SearchState,
} from "@/types/search.type";

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      query: "",
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
          query: "",
          results: null,
          isLoading: false,
          error: null,
          hasSearched: false,
          currentPage: 1,
          // cachedResults와 pendingFetches는 유지
          // 완전히 초기화하려면 아래 주석을 해제
          // cachedResults: {} as CachedResults,
          // pendingFetches: new Map(),
        }),
      setPendingFetch: (page, promise) => 
        set(state => {
          const newMap = new Map(state.pendingFetches);
          newMap.set(page, promise);
          return { pendingFetches: newMap };
        }),
      removePendingFetch: (page) => 
        set(state => {
          const newMap = new Map(state.pendingFetches);
          newMap.delete(page);
          return { pendingFetches: newMap };
        }),
      getPendingFetch: (page) => get().pendingFetches.get(page),
      setCurrentPage: (page: number) => set({ currentPage: page }),
      // 검색어만 초기화하는 함수
      resetQuery: () => {
        set({
          query: "",
          results: null,
          error: null,
          isLoading: false,
        });
      },
      
      // 로컬 스토리지에서 검색 캐시를 완전히 제거하는 함수
      clearLocalStorageCache: () => {
        // 로컬 스토리지에서 검색 캐시 삭제
        if (typeof window !== 'undefined') {
          localStorage.removeItem('search-cache');
          
          // 상태도 초기화
          set({
            query: "",
            results: null,
            isLoading: false,
            error: null,
            hasSearched: false,
            currentPage: 1,
            cachedResults: {} as CachedResults,
            pendingFetches: new Map(),
          });
        }
      },
    }),
    {
      name: "search-cache",
      storage: createJSONStorage(() => localStorage),
      // pendingFetches는 Promise 객체를 포함하므로 직렬화할 수 없어 제외함
      partialize: (state) => ({
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
  // 브라우저 환경에서만 실행
  setTimeout(() => {
    const { query, currentPage, hasSearched, results, getCachedResults, setResults, setLoading } = useSearchStore.getState();
    
    // 이전에 검색 결과가 있었지만 현재 결과가 없는 경우 (새로고침으로 인한 결과 초기화)
    if (hasSearched && query) {
      // 로딩 상태 즉시 설정 (새로고침 직후 UI 깜빡임 방지)
      setLoading(true);
      
      // 캐시된 결과 확인
      const cachedResult = getCachedResults(query, currentPage);
      if (cachedResult) {
        // 약간의 딜레이 후 결과 복원
        setTimeout(() => {
          setResults(cachedResult);
          setLoading(false);
          console.log(`새로고침 후 '${query}' 검색 결과 복원 (페이지 ${currentPage})`);
        }, 300);
      } else {
        setLoading(false);
      }
    }
  }, 0);
}
