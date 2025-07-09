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
  // const [isFromNavigation, setIsFromNavigation] = useState<boolean>(isFromMainNavigation);
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
    }
  }, []);

  // URL 파라미터 처리 및 캐시된 결과 적용 로직 제거
  // useEffect(() => {
  //   if (typeof window === 'undefined') return;
  //   ...
  // }, [window?.location.search]);

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

    // jobId와 post를 매핑하는 Map 생성
    const postJobMap = new Map<string, number>();
    posts.forEach((post, index) => {
      if (isPendingAnalysis(post)) {
        // 분석 중인 포스트의 경우 jobId를 찾음
        const jobId = post.sponsorIndicators[0]?.source?.text;
        if (jobId) {
          postJobMap.set(jobId, index);
          console.log('[SSE] 포스트 매핑 추가:', {
            index,
            jobId,
            title: post.title,
            indicators: post.sponsorIndicators,
          });
        }
      }
    });

    const unsubscribe = searchApi.subscribeToAnalysis(requestId, sseToken, analysisResult => {
      console.log('[SSE] 분석 결과 수신:', {
        ...analysisResult,
        availableJobIds: Array.from(postJobMap.keys()),
        posts: posts.map(post => ({
          title: post.title,
          jobId: post.sponsorIndicators[0]?.source?.text,
          isPending: isPendingAnalysis(post),
        })),
      });

      // 상태 업데이트를 배치로 처리하여 불필요한 리렌더링 방지
      const batchUpdate = () => {
        let updatedCache = false;

        console.log('[SSE] 업데이트 시도:', {
          results,
          searchQuery,
          page,
          hasResults: !!results,
          currentKeyword: results?.keyword,
          currentPage: results?.page,
        });

        // 캐시 업데이트
        setCachedResults(prevCache => {
          const existingCache = prevCache[searchQuery];
          if (!existingCache?.pageData[page]) return prevCache;

          const pageData = existingCache.pageData[page];

          // 모든 분석 대기 중인 포스트를 확인
          let foundPostIndex = -1;
          pageData.posts.forEach((post, index) => {
            if (isPendingAnalysis(post)) {
              console.log('Checking post:', {
                title: post.title,
                storedJobId: post.sponsorIndicators[0]?.source?.text,
                receivedJobId: analysisResult.jobId,
                isPending: isPendingAnalysis(post),
              });

              if (post.sponsorIndicators[0]?.source?.text === analysisResult.jobId) {
                foundPostIndex = index;
              }
            }
          });

          if (foundPostIndex === -1) {
            console.log('[SSE] 매칭되는 포스트를 찾을 수 없음:', {
              jobId: analysisResult.jobId,
              availableJobIds: Array.from(postJobMap.keys()),
              posts: pageData.posts.map(post => ({
                title: post.title,
                jobId: post.sponsorIndicators[0]?.source?.text,
                isPending: isPendingAnalysis(post),
              })),
            });
            return prevCache;
          }

          updatedCache = true;
          const updatedPosts = [...pageData.posts];
          // 기존 포스트 데이터를 유지하면서 분석 결과만 업데이트
          updatedPosts[foundPostIndex] = {
            ...updatedPosts[foundPostIndex],
            isSponsored: analysisResult.isSponsored,
            sponsorProbability: analysisResult.sponsorProbability,
            // 기존 indicators를 모두 제거하고 새로운 indicator로 교체
            sponsorIndicators: [
              {
                type: analysisResult.sponsorIndicator.type,
                pattern: analysisResult.sponsorIndicator.pattern,
                matchedText: analysisResult.sponsorIndicator.matchedText,
                probability: analysisResult.sponsorIndicator.probability,
                source: analysisResult.sponsorIndicator.source,
              },
            ],
          };

          console.log('[SSE] 포스트 업데이트:', {
            index: foundPostIndex,
            title: updatedPosts[foundPostIndex].title,
            isSponsored: analysisResult.isSponsored,
            oldIndicators: pageData.posts[foundPostIndex].sponsorIndicators,
            newIndicators: updatedPosts[foundPostIndex].sponsorIndicators,
          });

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

        // 현재 표시 중인 결과만 업데이트 (캐시 업데이트 성공 여부와 관계없이 체크)
        const currentCache = loadCacheFromStorage();
        const latestPageData = currentCache[searchQuery]?.pageData[page];

        if (latestPageData) {
          console.log('[SSE] 최신 캐시 데이터로 UI 업데이트 시도:', {
            hasResults: !!results,
            currentKeyword: results?.keyword,
            targetKeyword: searchQuery,
            currentPage: results?.page,
            targetPage: page,
            cacheUpdated: updatedCache,
            posts: latestPageData.posts.map(post => ({
              title: post.title,
              isSponsored: post.isSponsored,
              isPending: isPendingAnalysis(post),
              indicators: post.sponsorIndicators,
            })),
          });

          // results가 없거나 현재 페이지/키워드가 일치할 때 업데이트
          if (!results || (results.keyword === searchQuery && results.page === page)) {
            setResults({
              keyword: searchQuery,
              posts: latestPageData.posts,
              totalResults: currentCache[searchQuery].keywordData.totalResults,
              itemsPerPage: currentCache[searchQuery].keywordData.itemsPerPage,
              sponsoredResults: currentCache[searchQuery].keywordData.sponsoredResults,
              page,
            });
          }
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
    // isFromNavigation,
    handlePendingAnalysis,
  };
};
