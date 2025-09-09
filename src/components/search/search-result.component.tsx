'use client';

import React, { useRef, useState } from 'react';
import { SearchApiResponse, SearchResult, SearchResultPost } from '@/types/search.type';
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
import { LocationDisplay } from '@/components/common/location';
import { SortDropdown, SortOption } from './sort-dropdown.component';
import { sortPostsByDistance, hasLocationData } from '@/utils/distance.util';
import { useLocationStore } from '@/store/location.store';

interface SearchResultsProps {
  results: SearchApiResponse | null;
  error: string | null;
  onPageChange: (page: number) => void;
  currentPage: number;
  getPostStreamStatus: (
    post: SearchResultPost
  ) => { isActive: boolean; isEnded: boolean; jobId: string } | null;
  onRetry: (jobId: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  error,
  onPageChange,
  currentPage,
  getPostStreamStatus,
  onRetry,
}) => {
  const { isLoading, isModalLoading } = useSearch();
  const isFromMainNavigation = useSearchStore(state => state.isFromMainNavigation);
  const { location: userLocation } = useLocationStore();
  const [sortOption, setSortOption] = useState<SortOption>('default');

  // 섹션 refs
  const sponsoredSectionRef = useRef<HTMLDivElement>(null);
  const nonSponsoredSectionRef = useRef<HTMLDivElement>(null);

  // 정렬된 포스트들
  const sortedPosts = results
    ? sortOption === 'distance'
      ? sortPostsByDistance(results.posts, userLocation)
      : results.posts
    : [];

  // 결과를 내돈내산, 협찬, 분석중으로 분리
  const pendingPosts = sortedPosts.filter(isPendingAnalysis);
  const nonSponsoredPosts = sortedPosts.filter(isNonSponsored);
  const sponsoredPosts = sortedPosts.filter(isSponsored);

  // 위치 데이터가 있는지 확인
  const hasLocation = results ? hasLocationData(results.posts) : false;

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
                <div className="mb-4">
                  <LocationDisplay showRefreshButton={true} />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <SearchCount
                    posts={results.posts}
                    onSponsoredClick={() => scrollToElement(sponsoredSectionRef.current)}
                    onNonSponsoredClick={() => scrollToElement(nonSponsoredSectionRef.current)}
                  />
                  {hasLocation && (
                    <SortDropdown
                      value={sortOption}
                      onChange={setSortOption}
                      hasLocationData={hasLocation}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {pendingPosts.length > 0 && (
                  <SearchSection
                    title={SearchResult.PENDING}
                    titleColor="text-blue-500"
                    posts={pendingPosts}
                    getPostStreamStatus={getPostStreamStatus}
                    onRetry={onRetry}
                    showLoadingIndicator={true}
                  />
                )}

                {nonSponsoredPosts.length > 0 && (
                  <SearchSection
                    title={SearchResult.NON_SPONSORED}
                    titleColor="text-green-500"
                    posts={nonSponsoredPosts}
                    getPostStreamStatus={getPostStreamStatus}
                    onRetry={onRetry}
                  />
                )}

                {sponsoredPosts.length > 0 && (
                  <SearchSection
                    title={SearchResult.SPONSORED}
                    titleColor="text-red-500"
                    posts={sponsoredPosts}
                    getPostStreamStatus={getPostStreamStatus}
                    onRetry={onRetry}
                  />
                )}
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
                <div className="mb-4">
                  <LocationDisplay showRefreshButton={true} />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <SearchCount
                    posts={results.posts}
                    onSponsoredClick={() => scrollToElement(sponsoredSectionRef.current)}
                    onNonSponsoredClick={() => scrollToElement(nonSponsoredSectionRef.current)}
                  />
                  {hasLocation && (
                    <SortDropdown
                      value={sortOption}
                      onChange={setSortOption}
                      hasLocationData={hasLocation}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {pendingPosts.length > 0 && (
                  <SearchSection
                    title={SearchResult.PENDING}
                    titleColor="text-blue-500"
                    posts={pendingPosts}
                    getPostStreamStatus={getPostStreamStatus}
                    onRetry={onRetry}
                    showLoadingIndicator={true}
                  />
                )}

                {nonSponsoredPosts.length > 0 && (
                  <SearchSection
                    title={SearchResult.NON_SPONSORED}
                    titleColor="text-green-500"
                    posts={nonSponsoredPosts}
                    getPostStreamStatus={getPostStreamStatus}
                    onRetry={onRetry}
                  />
                )}

                {sponsoredPosts.length > 0 && (
                  <SearchSection
                    title={SearchResult.SPONSORED}
                    titleColor="text-red-500"
                    posts={sponsoredPosts}
                    getPostStreamStatus={getPostStreamStatus}
                    onRetry={onRetry}
                  />
                )}

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
