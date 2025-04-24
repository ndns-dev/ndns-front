"use client";

import React from "react";
import { SearchResultPost, SearchApiResponse } from "@/types/search.type";
import { env } from "@/config/env.schema";
import { formatDate } from "@/utils/format.utils";
import { navigateToExternalUrl } from "@/utils/component.utils";

interface ResultCardProps {
  post: SearchResultPost;
}

const ResultCard: React.FC<ResultCardProps> = ({ post }) => {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-4 border-l-4 border-transparent hover:border-l-4 hover:border-emerald-500 transition-all cursor-pointer"
      onClick={() => navigateToExternalUrl(post.link)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3
          className="text-lg font-semibold text-gray-900 dark:text-white"
          dangerouslySetInnerHTML={{ __html: post.title }}
        />
        <div className="flex items-center space-x-2">
          {post.is_sponsored ? (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
              협찬 ({Math.round(post.sponsor_probability * 100)}%)
            </span>
          ) : (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
              내돈내산
            </span>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {post.bloggername} • {formatDate(post.postdate)}
      </div>

      <div
        className="text-sm text-gray-700 dark:text-gray-300 mb-3"
        dangerouslySetInnerHTML={{ __html: post.description }}
      />

      {/* 개발 환경에서만 협찬 키워드 표시 */}
      {env.IS_DEVELOPMENT && post.sponsor_indicators.length > 0 && (
        <div className="mt-2 mb-3">
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            협찬 키워드:
          </div>
          <div className="flex flex-wrap gap-1">
            {post.sponsor_indicators.map(
              (indicator, idx) =>
                indicator.matched_text &&
                indicator.matched_text.length < 5 && (
                  <span
                    key={idx}
                    className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300"
                    title={`출처: ${indicator.source}`}
                  >
                    {indicator.matched_text}
                  </span>
                )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
  // 에러 상태
  if (error) {
    return (
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
    );
  }

  // 결과가 없는 경우
  if (!results || results.posts.length === 0) {
    return (
      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          검색 결과가 없습니다.
        </p>
      </div>
    );
  }

  // 협찬 여부에 따른 분류
  const sponsoredPosts = results.posts.filter((post) => post.is_sponsored);
  const nonSponsoredPosts = results.posts.filter((post) => !post.is_sponsored);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(results.total_results / results.items_per_page);

  return (
    <div className="mt-8 w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          &apos;{results.keyword}&apos; 검색 결과 (총{" "}
          {results.total_results.toLocaleString()}개)
        </h2>

        <div className="flex space-x-2 mb-4">
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              협찬 포스트:{" "}
              <span className="text-red-500 font-semibold">
                {sponsoredPosts.length}개
              </span>
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              내돈내산 포스트:{" "}
              <span className="text-green-500 font-semibold">
                {nonSponsoredPosts.length}개
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {nonSponsoredPosts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2">
              <span className="text-green-500">내돈내산</span> 후기
            </h3>
            {nonSponsoredPosts.map((post, index) => (
              <ResultCard key={`non-sponsored-${index}`} post={post} />
            ))}
          </div>
        )}

        {sponsoredPosts.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2">
              <span className="text-red-500">협찬</span> 후기
            </h3>
            {sponsoredPosts.map((post, index) => (
              <ResultCard key={`sponsored-${index}`} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // 표시할 페이지 번호 (최대 5개)
  const getPageNumbers = () => {
    const pageNumbers = [];
    let startPage: number;
    let endPage: number;

    if (totalPages <= 5) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= 3) {
        startPage = 1;
        endPage = 5;
      } else if (currentPage + 2 >= totalPages) {
        startPage = totalPages - 4;
        endPage = totalPages;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center space-x-1">
      {/* 첫 페이지 버튼 */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="sr-only">첫 페이지</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M8.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L4.414 10l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* 이전 페이지 버튼 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="sr-only">이전 페이지</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* 페이지 번호 버튼들 */}
      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`px-3 py-1 rounded-md ${
            currentPage === number
              ? "bg-emerald-500 text-white"
              : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {number}
        </button>
      ))}

      {/* 다음 페이지 버튼 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="sr-only">다음 페이지</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* 마지막 페이지 버튼 */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="sr-only">마지막 페이지</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10 4.293 14.293a1 1 0 000 1.414z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M11.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L15.586 10l-4.293 4.293a1 1 0 000 1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};
