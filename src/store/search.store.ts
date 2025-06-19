import { create } from 'zustand';
import { SearchApiResponse, CachedResults } from '@/types/search.type';

interface SearchState {
  query: string;
  currentPage: number;
  results: SearchApiResponse | null;
  error: string | null;
  isLoading: boolean;
  isSearchBarLoading: boolean;
  isModalLoading: boolean;
  isCardLoading: boolean;
  isFromMainNavigation: boolean;
  hasSearched: boolean;
  cachedResults: CachedResults;
}

interface SearchActions {
  setQuery: (query: string) => void;
  setResults: (results: SearchApiResponse | null) => void;
  setError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsSearchBarLoading: (isLoading: boolean) => void;
  setIsModalLoading: (isModalLoading: boolean) => void;
  setIsCardLoading: (isCardLoading: boolean) => void;
  setCurrentPage: (currentPage: number) => void;
  setIsFromMainNavigation: (isFromMainNavigation: boolean) => void;
  setHasSearched: (hasSearched: boolean) => void;
  setCachedResults: (results: CachedResults | ((prev: CachedResults) => CachedResults)) => void;
  resetSearch: () => void;
}

const initialState: SearchState = {
  query: '',
  currentPage: 1,
  results: null,
  error: null,
  isLoading: false,
  isSearchBarLoading: false,
  isModalLoading: false,
  isCardLoading: false,
  isFromMainNavigation: false,
  hasSearched: false,
  cachedResults: {},
};

export const useSearchStore = create<SearchState & SearchActions>(set => ({
  ...initialState,

  setQuery: (query: string) => set({ query }),
  setResults: (results: SearchApiResponse | null) => set({ results }),
  setError: (error: string | null) => set({ error }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setIsSearchBarLoading: (isLoading: boolean) => set({ isSearchBarLoading: isLoading }),
  setIsModalLoading: (isModalLoading: boolean) => set({ isModalLoading }),
  setIsCardLoading: (isCardLoading: boolean) => set({ isCardLoading }),
  setCurrentPage: (currentPage: number) => set({ currentPage }),
  setIsFromMainNavigation: (isFromMainNavigation: boolean) => set({ isFromMainNavigation }),
  setHasSearched: (hasSearched: boolean) => set({ hasSearched }),
  setCachedResults: (results: CachedResults | ((prev: CachedResults) => CachedResults)) =>
    set(state => ({
      cachedResults: typeof results === 'function' ? results(state.cachedResults) : results,
    })),

  resetSearch: () => set(initialState),
}));

// 새로고침 후 초기화 로직: 저장된 캐시에서 마지막 결과 복원
if (typeof window !== 'undefined') {
  // 브라우저 환경에서만 실행
  const {
    query,
    currentPage,
    results,
    setResults,
    setIsLoading,
    resetSearch,
    cachedResults,
    setQuery,
    setCurrentPage,
  } = useSearchStore.getState();

  // URL에서 쿼리 파라미터 읽기
  const urlParams = new URLSearchParams(window.location.search);
  const urlQuery = urlParams.get('q');
  const urlPage = parseInt(urlParams.get('page') || '1', 10);

  // 새로고침 여부 확인
  const isRefresh = !document.referrer || document.referrer === window.location.href;
  const currentPath = window.location.pathname;

  // 메인 페이지에서만 초기화 (새로고침이 아닌 경우)
  if (currentPath === '/' && !isRefresh) {
    resetSearch();
  }
  // 검색 페이지에서는 결과 복원
  else if (currentPath.includes('/search')) {
    // URL에 검색어가 있는 경우 store 상태 업데이트
    if (urlQuery) {
      setQuery(decodeURIComponent(urlQuery));
      setCurrentPage(urlPage);

      // 캐시된 결과 확인 - 즉시 복원
      const cachedData = cachedResults[urlQuery];
      if (cachedData) {
        const pageData = cachedData.pageData[urlPage];
        if (pageData) {
          setIsLoading(true);
          try {
            const cachedResponse = {
              keyword: urlQuery,
              posts: pageData.posts,
              totalResults: cachedData.keywordData.totalResults,
              itemsPerPage: cachedData.keywordData.itemsPerPage,
              sponsoredResults: cachedData.keywordData.sponsoredResults,
              page: urlPage,
              isPartialResult: false,
              isInitialLoad: false,
              currentCount: pageData.currentCount,
            };
            setResults(cachedResponse);
          } catch (error) {
            console.error('캐시된 결과 복원 중 오류:', error);
          } finally {
            setIsLoading(false);
          }
        }
      }
    }
    // URL에 검색어가 없고, store에 이전 검색 결과가 있는 경우
    else if (query && !results) {
      setIsLoading(true);
      try {
        const cachedData = cachedResults[query];
        if (cachedData) {
          const pageData = cachedData.pageData[currentPage];
          if (pageData) {
            const cachedResponse = {
              keyword: query,
              posts: pageData.posts,
              totalResults: cachedData.keywordData.totalResults,
              itemsPerPage: cachedData.keywordData.itemsPerPage,
              sponsoredResults: cachedData.keywordData.sponsoredResults,
              page: currentPage,
              isPartialResult: false,
              isInitialLoad: false,
              currentCount: pageData.currentCount,
            };
            setResults(cachedResponse);
          }
        }
      } catch (error) {
        console.error('캐시된 결과 복원 중 오류:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }
}
