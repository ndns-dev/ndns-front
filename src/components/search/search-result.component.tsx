'use client';

import React from 'react';
import { SearchApiResponse } from '@/types/search.type';
import { ResultCard } from './search-card.component';
import { useSearch } from '@/hooks/use-search.hook';
import { LoadingModal } from '@/components/common/feedback';
import { AdBanner, Sidebar } from '@/components/common/marketing';
import { Pagination } from '@/components/common/navigation';
import { AlertCircle } from 'lucide-react';
import { useSearchStore } from '@/store/search.store';

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
  // useSearch 훅에서 로딩 상태 가져오기
  const { isLoading } = useSearch();
  // 메인 페이지에서 넘어왔는지 확인
  const isFromMainNavigation = useSearchStore(state => state.isFromMainNavigation);

  // 로딩 모달 렌더링
  return (
    <>
      <LoadingModal isOpen={isLoading} />

      {/* 로딩 중에는 결과를 표시하지 않음 */}
      {isLoading && isFromMainNavigation ? (
        // 로딩 중 + 메인에서 이동한 경우에는 결과 컨텐츠 대신 빈 컨테이너만 표시
        <div className="mt-8 w-full max-w-4xl mx-auto h-screen">
          {isFromMainNavigation && <p className="text-center text-gray-500">검색 중...</p>}
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
                  {/* 결과 카운트 정보 */}
                  <div className="flex space-x-2 mb-4">
                    <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        협찬 포스트:{' '}
                        <span className="text-red-500 font-semibold">
                          {results.posts.filter(post => post.isSponsored).length}개
                        </span>
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        내돈내산 포스트:{' '}
                        <span className="text-green-500 font-semibold">
                          {results.posts.filter(post => !post.isSponsored).length}개
                        </span>
                      </p>
                    </div>
                  </div>
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

                <div className="flex space-x-2 mb-4">
                  <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      협찬 포스트:{' '}
                      <span className="text-red-500 font-semibold">
                        {results.posts.filter(post => post.isSponsored).length}개
                      </span>
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      내돈내산 포스트:{' '}
                      <span className="text-green-500 font-semibold">
                        {results.posts.filter(post => !post.isSponsored).length}개
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {results.posts.filter(post => !post.isSponsored).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2">
                      <span className="text-green-500">내돈내산</span> 후기
                    </h3>
                    {results.posts
                      .filter(post => !post.isSponsored)
                      .map((post, index) => (
                        <ResultCard key={`non-sponsored-${index}`} post={post} />
                      ))}

                    {/* 내돈내산 결과 아래 광고 배너 */}
                    {results.posts.filter(post => !post.isSponsored).length >= 3 && (
                      <AdBanner position="inline" />
                    )}
                  </div>
                )}

                {results.posts.filter(post => post.isSponsored).length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2">
                      <span className="text-red-500">협찬</span> 후기
                    </h3>
                    {results.posts
                      .filter(post => post.isSponsored)
                      .map((post, index) => (
                        <ResultCard key={`sponsored-${index}`} post={post} />
                      ))}
                  </div>
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
