'use client';

import React, { useEffect, useState, useRef, RefObject } from 'react';
import { SearchApiResponse, SearchResult } from '@/types/search.type';
import { useSearch } from '@/hooks/use-search.hook';
import { LoadingModal } from '@/components/common/feedback';
import { Sidebar } from '@/components/common/marketing';
import { Pagination } from '@/components/common/navigation';
import { AlertCircle } from 'lucide-react';
import { useSearchStore } from '@/store/search.store';
import { SearchCount } from './search-count.component';
import { SearchSection } from './search-section.component';
import { scrollToElement } from '@/utils/scroll.util';
import { isPendingAnalysis, isSponsored, isNonSponsored } from '@/utils/post.util';

interface SearchResultsProps {
  results: SearchApiResponse | null;
  error: string | null;
  onPageChange: (page: number) => void;
  currentPage: number;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  error,
  onPageChange,
  currentPage,
}) => {
  const { isLoading, isModalLoading } = useSearch();
  const isFromMainNavigation = useSearchStore(state => state.isFromMainNavigation);
  const [loadingMessages, setLoadingMessages] = useState<{ [key: number]: string }>({});
  const [subMessages, setSubMessages] = useState<{ [key: number]: string }>({});

  // 섹션 refs
  const sponsoredSectionRef = useRef<HTMLDivElement>(null);
  const nonSponsoredSectionRef = useRef<HTMLDivElement>(null);

  // 각 카드별 로딩 메시지 관리
  const updateLoadingMessage = (index: number) => {
    setLoadingMessages(prev => ({
      ...prev,
      [index]: '검색 중입니다. 잠시만 기다려주세요.',
    }));
    setSubMessages(prev => ({ ...prev, [index]: '' }));

    const timer1 = setTimeout(() => {
      setLoadingMessages(prev => ({
        ...prev,
        [index]: 'AI가 포스트를 분석하고 있습니다.\n잠시만 기다려주세요.',
      }));
    }, 2000);

    const timer2 = setTimeout(() => {
      setLoadingMessages(prev => ({
        ...prev,
        [index]: 'AI가 포스트를 분석하고 있습니다.\n조금만 더 기다려주세요.',
      }));
    }, 5000);

    const timer3 = setTimeout(() => {
      setLoadingMessages(prev => ({
        ...prev,
        [index]: '혹시 협찬인지\n다시 한 번 꼼꼼히 확인하고 있어요.',
      }));
    }, 9000);

    const timer4 = setTimeout(() => {
      setSubMessages(prev => ({
        ...prev,
        [index]: '거의 다 왔어요.\n조금만 더 기다려 주세요.',
      }));
    }, 12000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  };

  // 로딩 상태가 변경될 때마다 타이머 설정
  useEffect(() => {
    if (!isLoading) {
      setLoadingMessages({});
      setSubMessages({});
      return;
    }

    // 현재 표시된 포스트 수에 따라 새로운 타이머 설정
    if (results?.posts) {
      const currentCount = results.posts.length;
      const nextIndex = currentCount;
      return updateLoadingMessage(nextIndex);
    }
  }, [isLoading, results?.posts.length]);

  // 결과를 내돈내산, 협찬, 분석중으로 분리
  const pendingPosts = results?.posts.filter(isPendingAnalysis) || [];
  const nonSponsoredPosts = results?.posts.filter(isNonSponsored) || [];
  const sponsoredPosts = results?.posts.filter(isSponsored) || [];

  return (
    <>
      <LoadingModal isOpen={isModalLoading} />

      {/* 로딩 중에는 결과를 표시하지 않음 */}
      {isLoading && isFromMainNavigation ? (
        // 로딩 중 + 메인에서 이동한 경우에는 결과 컨텐츠 대신 빈 컨테이너만 표시
        <div className="mt-8 w-full max-w-4xl mx-auto h-screen">
          {isFromMainNavigation && <p className="text-center text-gray-500">검색 중...</p>}
        </div>
      ) : isLoading && results ? (
        // 로딩 중이면서 결과가 있는 경우 결과를 표시하면서 로딩 표시
        <div className="mt-8 w-full max-w-4xl mx-auto">
          <div className="lg:flex lg:space-x-6">
            <div className="lg:flex-1">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  &apos;{results.keyword}&apos; 검색 중... (현재 {results.posts.length}개 결과)
                </h2>
                <SearchCount
                  posts={results.posts}
                  onSponsoredClick={() => scrollToElement(sponsoredSectionRef.current)}
                  onNonSponsoredClick={() => scrollToElement(nonSponsoredSectionRef.current)}
                />
              </div>

              <div className="space-y-4">
                {pendingPosts.length > 0 && (
                  <SearchSection
                    title={SearchResult.PENDING}
                    titleColor="text-blue-500"
                    posts={pendingPosts}
                    showLoadingIndicator={true}
                  />
                )}

                <SearchSection
                  title={SearchResult.NON_SPONSORED}
                  titleColor="text-green-500"
                  posts={nonSponsoredPosts}
                  sectionRef={nonSponsoredSectionRef as RefObject<HTMLDivElement>}
                  showAdBanner={true}
                />

                <SearchSection
                  title={SearchResult.SPONSORED}
                  titleColor="text-red-500"
                  posts={sponsoredPosts}
                  sectionRef={sponsoredSectionRef as RefObject<HTMLDivElement>}
                />

                {/* 로딩 표시 */}
                <div className="mt-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2 whitespace-pre-line">
                    {loadingMessages[results.posts.length] || '검색 중입니다...'}
                  </p>
                  {subMessages[results.posts.length] && (
                    <p className="text-gray-400 text-sm mt-1 whitespace-pre-line">
                      {subMessages[results.posts.length]}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Sidebar />
          </div>
        </div>
      ) : isLoading ? (
        // 로딩 중이지만 새로고침인 경우 기존 결과 유지하며 로딩 모달 표시
        results && results.posts.length > 0 ? (
          <div className="mt-8 w-full max-w-4xl mx-auto opacity-50">
            {/* 동일한 결과 렌더링하되 반투명하게 표시 */}
            <div className="lg:flex lg:space-x-6">
              <div className="lg:flex-1">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    &apos;{results.keyword}&apos; 검색 결과 (총{' '}
                    {results.totalResults.toLocaleString()}개)
                  </h2>
                  <SearchCount
                    posts={results.posts}
                    onSponsoredClick={() => scrollToElement(sponsoredSectionRef.current)}
                    onNonSponsoredClick={() => scrollToElement(nonSponsoredSectionRef.current)}
                  />
                </div>
              </div>
              <Sidebar />
            </div>
          </div>
        ) : (
          <div className="mt-8 w-full max-w-4xl mx-auto h-screen"></div>
        )
      ) : error ? (
        <div className="mt-8 text-center">
          <div className="text-red-500 mb-2">
            <AlertCircle className="inline-block w-6 h-6 mr-1" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      ) : !results || results.posts.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="mt-8 w-full max-w-4xl mx-auto">
          <div className="lg:flex lg:space-x-6">
            <div className="lg:flex-1">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  &apos;{results.keyword}&apos; 검색 결과 (총{' '}
                  {results.totalResults.toLocaleString()}개)
                </h2>

                <SearchCount
                  posts={results.posts}
                  onSponsoredClick={() => scrollToElement(sponsoredSectionRef.current)}
                  onNonSponsoredClick={() => scrollToElement(nonSponsoredSectionRef.current)}
                />
              </div>

              <div className="space-y-4">
                {pendingPosts.length > 0 && (
                  <SearchSection
                    title={SearchResult.PENDING}
                    titleColor="text-blue-500"
                    posts={pendingPosts}
                    showLoadingIndicator={true}
                  />
                )}

                <SearchSection
                  title={SearchResult.NON_SPONSORED}
                  titleColor="text-green-500"
                  posts={nonSponsoredPosts}
                  sectionRef={nonSponsoredSectionRef as RefObject<HTMLDivElement>}
                  showAdBanner={true}
                />

                <SearchSection
                  title={SearchResult.SPONSORED}
                  titleColor="text-red-500"
                  posts={sponsoredPosts}
                  sectionRef={sponsoredSectionRef as RefObject<HTMLDivElement>}
                />

                {/* 페이지네이션 */}
                {results.totalResults >= results.itemsPerPage && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={results.totalResults}
                      onPageChange={onPageChange}
                    />
                  </div>
                )}
              </div>
            </div>
            <Sidebar />
          </div>
        </div>
      )}
    </>
  );
};
