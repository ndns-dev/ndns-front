import React, { FormEvent } from "react";
import { useSearch } from "@/hooks/use-search.hook";
import { useLoadingMessage } from "@/utils/loading.utils";

interface SearchBarProps {
  centered?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ centered = false }) => {
  const { query, setQuery, handleSearch, isLoading } = useSearch();

  // 로딩 메시지 상태 관리 (유틸리티 훅 사용)
  const loadingMessage = useLoadingMessage(
    isLoading,
    "검색 중...",
    "협찬 여부를 확인하고 있습니다. 잠시만 기다려주세요.",
    2000
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <form
      onSubmit={onSubmit}
      className={`w-full max-w-2xl ${centered ? "mx-auto" : ""}`}
    >
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색어를 입력하세요 (예: 제주 애월 OO, OOO 건대입구점)"
          className="w-full px-5 py-4 pr-16 text-lg rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-emerald-500 text-white p-3 rounded-full hover:bg-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-700 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-40"
                cx="12"
                cy="12"
                r="10"
                stroke="white"
                strokeWidth="3"
              ></circle>
              <path
                className="opacity-90"
                fill="white"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* 로딩 중일 때 메시지 표시 */}
      {isLoading && (
        <div className="text-center mt-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {loadingMessage}
          </p>
        </div>
      )}
    </form>
  );
};
