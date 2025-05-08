"use client";

import React from "react";
import { SearchResultPost, SearchApiResponse } from "@/types/search.type";
import { env } from "@/config/env.schema";
import { formatDate } from "@/utils/format.utils";
import { navigateToExternalUrl } from "@/utils/component.utils";
import Pagination from "../common/pagination.component";

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
          {post.isSponsored ? (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
              협찬 ({Math.round(post.sponsorProbability * 100)}%)
            </span>
          ) : (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
              내돈내산
            </span>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {post.bloggername} • {formatDate(post.postDate)}
      </div>

      <div
        className="text-sm text-gray-700 dark:text-gray-300 mb-3"
        dangerouslySetInnerHTML={{ __html: post.description }}
      />

      {/* 개발 환경에서만 협찬 키워드 표시 */}
      {env.IS_DEVELOPMENT && post.sponsorIndicators.length > 0 && (
        <div className="mt-2 mb-3">
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            협찬 키워드:
          </div>
          <div className="flex flex-wrap gap-1">
            {post.sponsorIndicators.map(
              (indicator, idx) =>
                indicator.matchedText &&
                indicator.matchedText.length < 5 && (
                  <span
                    key={idx}
                    className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300"
                    title={`출처: ${indicator.source}`}
                  >
                    {indicator.matchedText}
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
  totalPages: number;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  error,
  onPageChange,
  currentPage,
  totalPages,
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
  const sponsoredPosts = results.posts.filter((post) => post.isSponsored);
  const nonSponsoredPosts = results.posts.filter((post) => !post.isSponsored);

  // 총 페이지 수 계산
  const safeItemsPerPage = results.itemsPerPage || 10;
  
  return (
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
      {results.totalResults >= safeItemsPerPage && (
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
