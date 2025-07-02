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
const prefetchingPages = new Map<string, Promise<void>>();
// 프리페칭 취소를 위한 AbortController Map
const prefetchControllers = new Map<string, AbortController>();

// 프리페칭 키 생성 함수
const getPrefetchKey = (query: string, page: number) => `${query}-${page}`;

// 프리페칭 취소 함수
const cancelPrefetch = (prefetchKey: string) => {
  const controller = prefetchControllers.get(prefetchKey);
  if (controller) {
    console.log('프리페칭 취소:', prefetchKey);
    controller.abort();
    prefetchControllers.delete(prefetchKey);
    prefetchingPages.delete(prefetchKey);
  }
};

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
  const [activeRequests] = useState(() => new Map<string, Promise<void>>());

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

          // 다음 페이지 프리페칭
          const totalPages = Math.ceil(cachedResponse.totalResults / ITEMS_PER_PAGE);
          if (urlPage < totalPages) {
            prefetchNextPage(decodedQuery, urlPage + 1, cachedResponse.totalResults);
          }
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

      // 상태 업데이트
      setQuery(decodedQuery);
      setCurrentPage(urlPage);
      setResults(cachedResponse);

      // 다음 페이지 프리페칭
      const totalPages = Math.ceil(cachedResponse.totalResults / ITEMS_PER_PAGE);
      if (urlPage < totalPages) {
        prefetchNextPage(decodedQuery, urlPage + 1, cachedResponse.totalResults);
      }
    } else {
      // 캐시가 없는 경우 새로운 검색 실행
      handleSearch(decodedQuery, urlPage);
    }
  }, [window.location.search]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // 포스트 업데이트 핸들러
  const updatePost = (query: string, page: number, updatedPost: SearchResultPost) => {
    setCachedResults(prevCache => {
      const existingCache = prevCache[query];
      if (!existingCache?.pageData[page]) return prevCache;

      const pageData = existingCache.pageData[page];
      const postIndex = pageData.posts.findIndex(post => post.link === updatedPost.link);

      if (postIndex === -1) return prevCache;

      const updatedPosts = [...pageData.posts];
      updatedPosts[postIndex] = updatedPost;

      return {
        ...prevCache,
        [query]: {
          ...existingCache,
          pageData: { ...existingCache.pageData, [page]: { ...pageData, posts: updatedPosts } },
        },
      };
    });

    // 현재 표시 중인 결과 업데이트
    if (results?.keyword === query && results.page === page) {
      const updatedPosts = results.posts.map(post =>
        post.link === updatedPost.link ? updatedPost : post
      );
      setResults({ ...results, posts: updatedPosts });
    }
  };

  // 분석 상태 구독
  const subscribeToAnalysis = (query: string, page: number, reqId: string) => {
    const subscriptionKey = `${query}-${page}-${reqId}`;

    if (activeSubscriptions.has(subscriptionKey)) return;

    const unsubscribe = searchApi.subscribeToAnalysis(reqId, updatedPost => {
      updatePost(query, page, updatedPost);

      // 현재 표시 중인 결과 업데이트
      if (results?.keyword === query && results.page === page) {
        const updatedPosts = results.posts.map(post =>
          post.link === updatedPost.link ? updatedPost : post
        );
        setResults({ ...results, posts: updatedPosts });
      }
    });

    activeSubscriptions.set(subscriptionKey, unsubscribe);
  };

  // 검색 결과 처리 시 분석 대기 중인 포스트 처리
  const handlePendingAnalysis = (
    searchQuery: string,
    page: number,
    posts: SearchResultPost[],
    requestId: string
  ) => {
    const hasPendingPosts = posts.some(isPendingAnalysis);

    if (hasPendingPosts && requestId) {
      subscribeToAnalysis(searchQuery, page, requestId);
    }
  };

  // 컴포넌트 언마운트 시 모든 구독 정리
  useEffect(() => {
    return () => {
      activeSubscriptions.forEach(unsubscribe => unsubscribe());
      activeSubscriptions.clear();
    };
  }, []);

  // 페이지 데이터 가져오기
  const fetchPageData = async (searchQuery: string, page: number) => {
    const requestKey = `${searchQuery}-${page}`;

    // 현재 진행 중인 프리페칭이 있다면 취소하고 캐시 확인
    const prefetchKey = getPrefetchKey(searchQuery, page);
    if (prefetchingPages.has(prefetchKey)) {
      cancelPrefetch(prefetchKey);

      // 취소 후 캐시 확인
      const storedCache = loadCacheFromStorage();
      const cachedData = getCurrentPageData(searchQuery, page, storedCache);
      if (cachedData) {
        setCachedResults(storedCache);
        setResults(cachedData);
        setIsModalLoading(false);
        setIsSearchBarLoading(false);
        setIsCardLoading(false);
        setIsLoading(false);
        hideLoadingModal(requestKey);
        return;
      }
    }

    try {
      const { data: response, requestId } = await searchApi.searchBlogs({
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
      setIsCardLoading(false);
      setIsSearchBarLoading(false);
      setIsLoading(false);

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
      handlePendingAnalysis(searchQuery, page, response.posts, requestId);

      // 다음 페이지 프리페칭
      const totalPages = Math.ceil(response.totalResults / ITEMS_PER_PAGE);
      if (page < totalPages) {
        prefetchNextPage(searchQuery, page + 1, response.totalResults);
      }
    } catch (error) {
      setError('검색 중 오류가 발생했습니다.');
      console.error('Search error:', error);
      setResults(null);
      setIsSearchBarLoading(false);
      setIsLoading(false);
      setIsCardLoading(false);
    } finally {
      hideLoadingModal(requestKey);
    }
  };

  // 다음 페이지 프리페칭 (10개씩 1번 호출)
  const prefetchNextPage = async (searchQuery: string, nextPage: number, totalResults: number) => {
    const prefetchKey = getPrefetchKey(searchQuery, nextPage);

    // 이미 프리페칭 중이면 스킵
    if (prefetchingPages.has(prefetchKey)) {
      return;
    }

    // 로컬스토리지에서 직접 캐시 확인
    const storedCache = loadCacheFromStorage();
    if (isPageComplete(searchQuery, nextPage, storedCache)) {
      return;
    }

    const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);
    if (nextPage > totalPages) {
      return;
    }

    // 새로운 AbortController 생성
    const controller = new AbortController();
    prefetchControllers.set(prefetchKey, controller);

    const prefetchPromise = (async () => {
      try {
        const { data: response, requestId } = await searchApi.searchBlogs({
          query: searchQuery,
          offset: (nextPage - 1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
          signal: controller.signal,
        });

        // 분석 대기 중인 포스트가 있는 경우에만 SSE 구독 시작
        handlePendingAnalysis(searchQuery, nextPage, response.posts, requestId);

        updateCache(
          searchQuery,
          nextPage,
          response.posts,
          response.totalResults,
          response.sponsoredResults,
          setCachedResults
        );
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('프리페칭 취소됨:', prefetchKey);
        } else {
          console.error('프리페칭 오류:', prefetchKey, error);
        }
      } finally {
        prefetchControllers.delete(prefetchKey);
        prefetchingPages.delete(prefetchKey);
      }
    })();

    prefetchingPages.set(prefetchKey, prefetchPromise);
  };

  // 검색 핸들러
  const handleSearch = async (searchQuery: string, page: number = 1) => {
    if (!searchQuery.trim()) {
      setError('검색어를 입력해주세요.');
      return;
    }

    const requestKey = `${searchQuery}-${page}`;

    // 이미 진행 중인 요청이 있다면 해당 요청을 반환
    if (activeRequests.has(requestKey)) {
      return activeRequests.get(requestKey);
    }

    // 프리페칭 중인 이전 페이지가 있는지 확인
    const prevPageKey = getPrefetchKey(searchQuery, page - 1);
    if (prefetchingPages.has(prevPageKey)) {
      cancelPrefetch(prevPageKey);
    }

    // 현재 페이지의 프리페칭 상태 확인
    const currentPrefetchKey = getPrefetchKey(searchQuery, page);
    if (prefetchingPages.has(currentPrefetchKey)) {
      setIsModalLoading(true);
      showLoadingModal(requestKey);

      try {
        // 프리페칭 완료 대기
        await prefetchingPages.get(currentPrefetchKey);

        // 로컬스토리지에서 최신 캐시 확인
        const storedCache = loadCacheFromStorage();
        const cachedData = getCurrentPageData(searchQuery, page, storedCache);

        if (cachedData) {
          setCachedResults(storedCache);
          setQuery(searchQuery);
          setCurrentPage(page);
          setResults(cachedData);

          // 모든 로딩 상태 초기화
          setIsModalLoading(false);
          setIsSearchBarLoading(false);
          setIsCardLoading(false);
          setIsLoading(false);
          hideLoadingModal(requestKey);

          // 다음 페이지 프리페칭
          const totalPages = Math.ceil(cachedData.totalResults / ITEMS_PER_PAGE);
          if (page < totalPages) {
            prefetchNextPage(searchQuery, page + 1, cachedData.totalResults);
          }
          return;
        }
      } catch (error) {
        console.error('프리페칭 대기 중 오류:', currentPrefetchKey, error);
      }
    }

    // 다음 페이지의 프리페칭 상태 확인 및 취소
    const nextPageKey = getPrefetchKey(searchQuery, page + 1);
    if (prefetchingPages.has(nextPageKey)) {
      cancelPrefetch(nextPageKey);
    }

    setQuery(searchQuery);
    setCurrentPage(page);

    // 로컬스토리지에서 캐시 확인
    const storedCache = loadCacheFromStorage();
    const cachedData = getCurrentPageData(searchQuery, page, storedCache);

    if (cachedData) {
      // 캐시된 데이터가 있으면 바로 표시
      setCachedResults(storedCache);
      setResults(cachedData);

      // 다음 페이지 프리페칭
      const totalPages = Math.ceil(cachedData.totalResults / ITEMS_PER_PAGE);
      if (page < totalPages) {
        prefetchNextPage(searchQuery, page + 1, cachedData.totalResults);
      }
      return;
    }

    // 캐시된 데이터가 없을 때만 로딩 상태 설정
    setIsModalLoading(true);
    setIsSearchBarLoading(true);
    setIsLoading(true);
    showLoadingModal(requestKey);

    const request = fetchPageData(searchQuery, page);
    activeRequests.set(requestKey, request);

    try {
      await request;
    } finally {
      activeRequests.delete(requestKey);
      hideLoadingModal(requestKey);
    }

    return request;
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
  };
};
