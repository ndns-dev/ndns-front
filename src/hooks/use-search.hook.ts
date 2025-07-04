import { useEffect, useState } from 'react';
import { useSearchStore } from '@/store/search.store';
import { searchApi } from '@/apis/search.api';
import { SearchApiResponse, CachedResults, SearchResultPost } from '@/types/search.type';
import { isPendingAnalysis } from '@/utils/post.util';

// 기본 페이지당 항목 수
const ITEMS_PER_PAGE = 10;
const STORAGE_KEY = 'search_cache';

// 로컬스토리지에서 캐시 불러오기
const loadCacheFromStorage = (): CachedResults => {
  if (typeof window === 'undefined') return {};
  const cached = localStorage.getItem(STORAGE_KEY);
  return cached ? JSON.parse(cached) : {};
};

// 로컬스토리지에 캐시 저장
const saveCacheToStorage = (cache: CachedResults) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
};

// 캐시 관리 함수
const updateCache = (
  query: string,
  page: number,
  posts: SearchResultPost[],
  totalResults: number,
  sponsoredResults: number,
  setCachedResults: (results: CachedResults | ((prev: CachedResults) => CachedResults)) => void,
  startIndex: number = 0
) => {
  setCachedResults((prevCache: CachedResults) => {
    const existingCache = prevCache[query] || {
      keywordData: {
        totalResults,
        itemsPerPage: ITEMS_PER_PAGE,
        sponsoredResults,
        timestamp: Date.now(),
      },
      pageData: {},
    };

    const existingPageData = existingCache.pageData[page] || {
      posts: [],
      currentCount: 0,
      isComplete: false,
    };

    // 새로운 포스트 추가 (중복 방지)
    let updatedPosts = [...existingPageData.posts];
    posts.forEach((post, index) => {
      const targetIndex = startIndex + index;
      if (targetIndex < ITEMS_PER_PAGE) {
        updatedPosts[targetIndex] = post;
      }
    });

    // 빈 공간 제거
    updatedPosts = updatedPosts.filter(Boolean);
    const currentCount = updatedPosts.length;
    const isComplete = currentCount >= ITEMS_PER_PAGE;

    // 페이지 데이터 업데이트
    const newCache = {
      ...prevCache,
      [query]: {
        ...existingCache,
        pageData: {
          ...existingCache.pageData,
          [page]: {
            posts: updatedPosts,
            currentCount,
            isComplete,
          },
        },
      },
    };

    // 캐시가 업데이트될 때마다 로컬스토리지에 저장
    saveCacheToStorage(newCache);

    return newCache;
  });
};

// 캐시된 결과를 SearchApiResponse 형식으로 변환
const convertCachedToResponse = (
  query: string,
  page: number,
  cachedResults: CachedResults
): SearchApiResponse | null => {
  const cachedData = cachedResults[query];
  if (!cachedData) return null;

  const pageData = cachedData.pageData[page];
  if (!pageData) return null;

  return {
    keyword: query,
    posts: pageData.posts,
    totalResults: cachedData.keywordData.totalResults,
    itemsPerPage: cachedData.keywordData.itemsPerPage,
    sponsoredResults: cachedData.keywordData.sponsoredResults,
    page,
  };
};

// 프리페칭 상태 관리를 위한 Map
// const prefetchingPages = new Map<string, Promise<{ requestId: string | null }>>();
// 프리페칭 취소를 위한 AbortController Map
// const prefetchControllers = new Map<string, AbortController>();

// 프리페칭 키 생성 함수
// const getPrefetchKey = (query: string, page: number) => `${query}-${page}`;

// 프리페칭 취소 함수
// const cancelPrefetch = (prefetchKey: string) => {
//   const controller = prefetchControllers.get(prefetchKey);
//   if (controller) {
//     if (!controller.signal.aborted) {
//       console.log('프리페칭 취소:', prefetchKey);
//       controller.abort();
//     }
//     prefetchControllers.delete(prefetchKey);
//     prefetchingPages.delete(prefetchKey);
//   }
// };

export const useSearch = () => {
  const {
    query,
    setQuery,
    results,
    setResults,
    error,
    setError,
    isLoading,
    setIsLoading,
    isSearchBarLoading,
    setIsSearchBarLoading,
    isModalLoading,
    setIsModalLoading,
    isCardLoading,
    setIsCardLoading,
    currentPage,
    setCurrentPage,
    cachedResults,
    setCachedResults,
    resetSearch,
    isFromMainNavigation,
    setIsFromMainNavigation,
  } = useSearchStore();

  // 네비게이션에서 온 검색인지 확인하는 상태
  const [isFromNavigation, setIsFromNavigation] = useState<boolean>(isFromMainNavigation);
  // 현재 활성화된 로딩 모달 추적
  const [activeLoadingModal, setActiveLoadingModal] = useState<string | null>(null);

  // 현재 진행 중인 페이지 요청을 추적하기 위한 Map
  const [activeRequests] = useState(() => new Map<string, Promise<{ requestId: string | null }>>());

  // SSE 구독을 관리하기 위한 Map
  const [activeSubscriptions] = useState(() => new Map<string, () => void>());

  // 로딩 모달 관리 함수
  const showLoadingModal = (key: string) => {
    if (!activeLoadingModal) {
      setActiveLoadingModal(key);
      setIsModalLoading(true);
      return true;
    }
    return false;
  };

  const hideLoadingModal = (key: string) => {
    if (activeLoadingModal === key) {
      setActiveLoadingModal(null);
      setIsModalLoading(false);
    }
  };

  // 컴포넌트 마운트 시 로컬스토리지에서 캐시 복원 및 초기 상태 설정
  useEffect(() => {
    const storedCache = loadCacheFromStorage();
    if (Object.keys(storedCache).length > 0) {
      setCachedResults(storedCache);

      // 현재 URL 파라미터 확인
      const urlParams = new URLSearchParams(window.location.search);
      const urlQuery = urlParams.get('q');
      const urlPage = parseInt(urlParams.get('page') || '1', 10);

      if (urlQuery) {
        const decodedQuery = decodeURIComponent(urlQuery);
        const cachedResponse = convertCachedToResponse(decodedQuery, urlPage, storedCache);

        if (cachedResponse && isPageComplete(decodedQuery, urlPage, storedCache)) {
          // 모든 로딩 상태 초기화
          setIsSearchBarLoading(false);
          setIsModalLoading(false);
          setIsCardLoading(false);
          setIsLoading(false);

          // 상태 업데이트
          setQuery(decodedQuery);
          setCurrentPage(urlPage);
          setResults(cachedResponse);
        }
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // URL 파라미터 처리 및 캐시된 결과 적용
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const urlQuery = urlParams.get('q');
    const urlPage = parseInt(urlParams.get('page') || '1', 10);

    if (!urlQuery) return;

    const decodedQuery = decodeURIComponent(urlQuery);

    // 현재 상태와 URL 파라미터가 다를 때만 처리
    if (decodedQuery === query && urlPage === currentPage) {
      return;
    }

    // referrer가 있고 같은 도메인이면서 /search가 아니면 네비게이션에서 온 것
    const referrer = document.referrer;
    const currentHost = window.location.host;
    const isFromMainPage = referrer.includes(currentHost) && !referrer.includes('/search');

    setIsFromNavigation(isFromMainPage);
    setIsFromMainNavigation(isFromMainPage);

    // 캐시 확인
    const storedCache = loadCacheFromStorage();
    const cachedResponse = convertCachedToResponse(decodedQuery, urlPage, storedCache);

    if (cachedResponse && isPageComplete(decodedQuery, urlPage, storedCache)) {
      // 모든 로딩 상태 초기화
      setIsSearchBarLoading(false);
      setIsModalLoading(false);
      setIsCardLoading(false);
      setIsLoading(false);

      // 상태 업데이트를 한 번에 처리
      const updateStates = () => {
        setQuery(decodedQuery);
        setCurrentPage(urlPage);
        setResults(cachedResponse);
      };
      updateStates();
    } else {
      // 캐시가 없는 경우 새로운 검색 실행
      handleSearch(decodedQuery, urlPage);
    }
  }, [window?.location.search]);

  // 캐시된 결과가 완성된 페이지인지 확인
  const isPageComplete = (
    query: string,
    page: number,
    cache: CachedResults = cachedResults
  ): boolean => {
    const cachedData = cache[query];
    if (!cachedData) return false;

    const pageData = cachedData.pageData[page];
    if (!pageData) return false;

    return pageData.isComplete;
  };

  // 현재 페이지의 데이터만 가져오는 함수
  const getCurrentPageData = (
    searchQuery: string,
    page: number,
    cache: CachedResults = cachedResults
  ): SearchApiResponse | null => {
    const cachedResponse = convertCachedToResponse(searchQuery, page, cache);
    if (cachedResponse && isPageComplete(searchQuery, page, cache)) {
      return cachedResponse;
    }
    return null;
  };

  // 검색 결과 처리 시 분석 대기 중인 포스트 처리
  const handlePendingAnalysis = (
    searchQuery: string,
    page: number,
    posts: SearchResultPost[],
    requestId: string,
    sseToken: string,
    source: 'fetchPageData' | 'prefetchNextPage' = 'fetchPageData'
  ) => {
    // 이미 해당 requestId에 대한 구독이 있다면 스킵
    if (activeSubscriptions.has(requestId)) {
      console.log(`[SSE] 이미 구독 중인 스트림 (${source}):`, { requestId, page });
      return;
    }

    const hasPendingPosts = posts.some(isPendingAnalysis);
    if (!hasPendingPosts) {
      console.log(`[SSE] 분석 대기 중인 포스트 없음 (${source}):`, { requestId, page });
      return;
    }

    console.log(`[SSE] 새로운 스트림 구독 시작 (${source}):`, {
      requestId,
      page,
      pendingCount: posts.filter(isPendingAnalysis).length,
    });

    const unsubscribe = searchApi.subscribeToAnalysis(requestId, sseToken, updatedPost => {
      // 상태 업데이트를 배치로 처리하여 불필요한 리렌더링 방지
      const batchUpdate = () => {
        setCachedResults(prevCache => {
          const existingCache = prevCache[searchQuery];
          if (!existingCache?.pageData[page]) return prevCache;

          const pageData = existingCache.pageData[page];
          const postIndex = pageData.posts.findIndex(post => post.link === updatedPost.link);
          if (postIndex === -1) return prevCache;

          const updatedPosts = [...pageData.posts];
          updatedPosts[postIndex] = updatedPost;

          const newCache = {
            ...prevCache,
            [searchQuery]: {
              ...existingCache,
              pageData: {
                ...existingCache.pageData,
                [page]: { ...pageData, posts: updatedPosts },
              },
            },
          };

          // 로컬스토리지 업데이트
          saveCacheToStorage(newCache);
          return newCache;
        });

        // 현재 표시 중인 결과만 업데이트
        if (results?.keyword === searchQuery && results.page === page) {
          const updatedPosts = results.posts.map((post: SearchResultPost) =>
            post.link === updatedPost.link ? updatedPost : post
          );
          setResults({ ...results, posts: updatedPosts });
        }
      };

      // requestAnimationFrame을 사용하여 상태 업데이트를 최적화
      requestAnimationFrame(batchUpdate);
    });

    if (unsubscribe) {
      activeSubscriptions.set(requestId, unsubscribe);
    }
  };

  // 컴포넌트 언마운트 시 모든 구독 정리
  useEffect(() => {
    return () => {
      activeSubscriptions.forEach(unsubscribe => unsubscribe());
      activeSubscriptions.clear();
    };
  }, [activeSubscriptions]);

  // 페이지 데이터 가져오기
  const fetchPageData = async (
    searchQuery: string,
    page: number
  ): Promise<{ requestId: string | null }> => {
    const requestKey = `${searchQuery}-${page}`;

    try {
      const {
        data: response,
        requestId,
        sseToken,
      } = await searchApi.searchBlogs({
        query: searchQuery,
        offset: (page - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
      });

      // 결과 즉시 설정
      const pageResults: SearchApiResponse = {
        keyword: searchQuery,
        posts: response.posts,
        totalResults: response.totalResults,
        itemsPerPage: ITEMS_PER_PAGE,
        sponsoredResults: response.sponsoredResults,
        page,
      };

      setResults(pageResults);

      // 모든 로딩 상태 해제
      setIsLoading(false);
      setIsSearchBarLoading(false);
      setIsCardLoading(false);
      setIsModalLoading(false);
      hideLoadingModal(requestKey);

      // 캐시 업데이트
      updateCache(
        searchQuery,
        page,
        response.posts,
        response.totalResults,
        response.sponsoredResults,
        setCachedResults
      );

      // 분석 대기 중인 포스트가 있는 경우에만 SSE 구독 시작
      handlePendingAnalysis(
        searchQuery,
        page,
        response.posts,
        requestId,
        sseToken,
        'fetchPageData'
      );

      return { requestId: requestId || null };
    } catch (error) {
      setError('검색 중 오류가 발생했습니다.');
      console.error('Search error:', error);
      setResults(null);

      // 에러 시에도 모든 로딩 상태 해제
      setIsLoading(false);
      setIsSearchBarLoading(false);
      setIsCardLoading(false);
      setIsModalLoading(false);
      hideLoadingModal(requestKey);

      return { requestId: null };
    }
  };

  /**
   * 검색을 실행하고 결과를 처리합니다.
   */
  const handleSearch = async (
    searchQuery: string | null,
    page: number = 1
  ): Promise<{ requestId: string | null }> => {
    if (!searchQuery) {
      setIsLoading(false);
      setIsSearchBarLoading(false);
      setIsCardLoading(false);
      setIsModalLoading(false);
      return { requestId: null };
    }

    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length < 2) {
      setError('검색어는 2글자 이상이어야 합니다.');
      setIsLoading(false);
      setIsSearchBarLoading(false);
      setIsCardLoading(false);
      setIsModalLoading(false);
      return { requestId: null };
    }

    const requestKey = `${trimmedQuery}-${page}`;

    // 이미 진행 중인 요청이 있다면 해당 요청을 반환
    if (activeRequests.has(requestKey)) {
      const request = activeRequests.get(requestKey);
      return request || { requestId: null };
    }

    // 기본 상태 업데이트
    setIsLoading(true);
    setIsSearchBarLoading(true);
    setIsCardLoading(true);
    setIsModalLoading(true);
    setQuery(trimmedQuery);
    setCurrentPage(page);

    // 로컬스토리지에서 캐시 확인
    const storedCache = loadCacheFromStorage();
    const cachedData = getCurrentPageData(trimmedQuery, page, storedCache);

    if (cachedData) {
      // 캐시된 데이터가 있으면 바로 표시
      setIsLoading(false);
      setIsSearchBarLoading(false);
      setIsCardLoading(false);
      setIsModalLoading(false);
      setCachedResults(storedCache);
      setResults(cachedData);
      return { requestId: null };
    }

    // 캐시된 데이터가 없을 때만 로딩 상태 설정
    showLoadingModal(requestKey);

    const request = fetchPageData(trimmedQuery, page);
    activeRequests.set(requestKey, request);

    try {
      const result = await request;
      return result;
    } catch (error) {
      console.error('Search error:', error);
      setIsLoading(false);
      setIsSearchBarLoading(false);
      setIsCardLoading(false);
      setIsModalLoading(false);
      hideLoadingModal(requestKey);
      return { requestId: null };
    } finally {
      activeRequests.delete(requestKey);
    }
  };

  return {
    query,
    setQuery,
    results,
    error,
    isLoading,
    isSearchBarLoading,
    isModalLoading,
    isCardLoading,
    currentPage,
    handleSearch,
    resetSearch,
    isFromMainNavigation,
    setIsFromMainNavigation,
    isFromNavigation,
    handlePendingAnalysis,
  };
};
