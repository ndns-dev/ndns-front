import { create } from "zustand";
import {
  SearchApiResponse,
  CachedResults,
  SearchState,
} from "@/types/search.type";

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  results: null,
  isLoading: false,
  error: null,
  hasSearched: false,
  cachedResults: {} as CachedResults,

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
    }),
}));
