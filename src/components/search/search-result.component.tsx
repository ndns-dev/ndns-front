"use client";

import React from "react";
import { SearchApiResponse } from "@/types/search.type";
import Pagination from "../common/pagination.component";
import { ResultCard } from "./search-card.component";
import { useSearch } from "@/hooks/use-search.hook";
import LoadingModal from "../common/loading-modal.component";

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

  // 로딩 모달 렌더링
  return (
    <>
      <LoadingModal isOpen={isLoading} />
      
      {error ? (
        <div className="mt-8 text-center">
          <div className="text-red-500 mb-2">
            <svg
              className="inline-block w-6 h-6 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      ) : !results || results.posts.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            검색 결과가 없습니다.
          </p>
        </div>
      ) : (
        <div className="mt-8 w-full max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              &apos;{results.keyword}&apos; 검색 결과 (총{" "}
              {results.totalResults.toLocaleString()}개)
            </h2>

            <div className="flex space-x-2 mb-4">
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  협찬 포스트:{" "}
                  <span className="text-red-500 font-semibold">
                    {results.posts.filter((post) => post.isSponsored).length}개
                  </span>
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  내돈내산 포스트:{" "}
                  <span className="text-green-500 font-semibold">
                    {results.posts.filter((post) => !post.isSponsored).length}개
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {results.posts.filter((post) => !post.isSponsored).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2">
                  <span className="text-green-500">내돈내산</span> 후기
                </h3>
                {results.posts.filter((post) => !post.isSponsored).map((post, index) => (
                  <ResultCard key={`non-sponsored-${index}`} post={post} />
                ))}
              </div>
            )}

            {results.posts.filter((post) => post.isSponsored).length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2">
                  <span className="text-red-500">협찬</span> 후기
                </h3>
                {results.posts.filter((post) => post.isSponsored).map((post, index) => (
                  <ResultCard key={`sponsored-${index}`} post={post} />
                ))}
              </div>
            )}
          </div>

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
      )}
    </>
  );
};
