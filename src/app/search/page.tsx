'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header, Footer } from '@/components/common/navigation';
import { SearchBar } from '@/components/search/search-bar.component';
import { SearchResults } from '@/components/search/search-result.component';
import { useSearch } from '@/hooks/use-search.hook';
// import { searchApi } from '@/apis/search.api';
import { SearchResultPost } from '@/types/search.type';
import { isPendingAnalysis } from '@/utils/post.util';

interface StreamStatus {
  isActive: boolean;
  isEnded: boolean;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q');
  // const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const containerRef = useRef<HTMLDivElement>(null);

  const { results, error, isLoading, handleSearch, handlePendingAnalysis } = useSearch();
  // const isFromMainNavigation = useSearchStore(state => state.isFromMainNavigation);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStreams, setActiveStreams] = useState<Map<string, StreamStatus>>(new Map());
  const [requestId, setRequestId] = useState<string | null>(null);

  // 페이지 변경 핸들러
  const handlePageChange = async (page: number) => {
    if (page === currentPage) return;

    const query = searchParams.get('q') || '';
    const searchUrl = `/search?q=${encodeURIComponent(query)}&page=${page}`;
    router.replace(searchUrl);

    const result = await handleSearch(query, page);
    if (result?.requestId) {
      setRequestId(result.requestId);
    }
    setCurrentPage(page);
  };

  // 컴포넌트 마운트 시 URL에서 쿼리 파라미터 가져와서 검색
  useEffect(() => {
    const query = searchParams.get('q');
    const page = Number(searchParams.get('page')) || 1;

    if (query) {
      handleSearch(query, page).then(result => {
        if (result?.requestId) {
          setRequestId(result.requestId);
        }
        setCurrentPage(page);
      });
    }
  }, [searchParams, handleSearch]);

  // SSE 스트림 구독 관리
  useEffect(() => {
    if (!results?.posts || !requestId || isLoading) return;

    // 분석 중인 포스트가 있는지 확인
    const hasPendingPosts = results.posts.some(post => isPendingAnalysis(post));

    if (!hasPendingPosts) {
      return;
    }

    // 이미 활성화된 스트림이 있는지 확인
    if (activeStreams.has(requestId)) {
      return;
    }

    // 상태만 업데이트 (불필요한 리렌더링 방지)
    setActiveStreams(prev => {
      const current = prev.get(requestId);
      if (current?.isActive) {
        return prev;
      }
      const next = new Map(prev);
      next.set(requestId, { isActive: true, isEnded: false });
      return next;
    });

    // cleanup 함수
    return () => {
      setActiveStreams(prev => {
        const current = prev.get(requestId);
        if (!current) {
          return prev;
        }
        const next = new Map(prev);
        next.delete(requestId);
        return next;
      });
    };
  }, [requestId, results?.posts, isLoading]);

  // 재시도 핸들러 (메모이제이션)
  const handleRetry = useCallback(
    (jobId: string) => {
      if (!results) return;

      // 이미 활성화된 스트림이 있는지 확인
      if (activeStreams.has(jobId)) {
        return;
      }

      setActiveStreams(prev => {
        const next = new Map(prev);
        next.set(jobId, { isActive: true, isEnded: false });
        return next;
      });

      // handlePendingAnalysis(results.keyword, results.page, results.posts, jobId);
    },
    [results, handlePendingAnalysis, activeStreams]
  );

  // 포스트별 스트림 상태 확인 함수 (메모이제이션)
  const getPostStreamStatus = useCallback(
    (post: SearchResultPost) => {
      const jobId = post.sponsorIndicators[0]?.source?.text;
      if (!jobId) return null;

      const status = activeStreams.get(jobId);
      return {
        isActive: status?.isActive ?? false,
        isEnded: status?.isEnded ?? false,
        jobId,
      };
    },
    [activeStreams]
  );

  // 컴포넌트 마운트 시 애니메이션 효과
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // 시작 위치에서 원래 위치로 애니메이션
      container.classList.add('transition-transform', 'duration-500', 'ease-out');
      container.style.transform = 'translateY(20px)';
      container.style.opacity = '0';

      setTimeout(() => {
        container.style.transform = 'translateY(0)';
        container.style.opacity = '1';
      }, 100);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-4xl mx-auto mb-8 flex justify-center">
          <div className="w-full max-w-2xl">
            <SearchBar initialQuery={queryParam || ''} isSearchPage={false} />
          </div>
        </div>

        <div
          ref={containerRef}
          className="w-full max-w-4xl mx-auto transition-all duration-500"
          id="search-results-container"
        >
          <SearchResults
            results={results}
            error={error}
            onPageChange={handlePageChange}
            currentPage={currentPage}
            getPostStreamStatus={getPostStreamStatus}
            onRetry={handleRetry}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
