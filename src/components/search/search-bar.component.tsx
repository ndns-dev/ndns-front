import React, { FormEvent, useEffect, useRef } from "react";
import { useSearch } from "@/hooks/use-search.hook";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

interface SearchBarProps {
  centered?: boolean;
  initialQuery?: string;
  isSearchPage?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  centered = false,
  initialQuery = "",
  isSearchPage = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { query, setQuery, handleSearch, isLoading } = useSearch();
  // initialQuery가 적용되었는지 추적하는 ref
  const initialQueryApplied = useRef(false);

  // initialQuery가 제공되면 쿼리 상태 초기화 (처음 한 번만)
  useEffect(() => {
    // 메인 페이지에서만 초기 쿼리를 설정하고, 검색 페이지에서는 URL의 쿼리를 사용
    if (initialQuery && !initialQueryApplied.current) {
      setQuery(initialQuery);
      initialQueryApplied.current = true;
    }
  }, [initialQuery, setQuery]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (query) {
      // 이미 검색 페이지에 있는지 확인
      const isOnSearchPage = pathname.includes("/search");

      if (isOnSearchPage) {
        // 이미 검색 페이지에 있으면 URL만 업데이트하고 검색 실행
        router.push(`/search?q=${encodeURIComponent(query)}&page=1`);
        handleSearch(query, 1);
      } else {
        // 메인 페이지에서는 검색 페이지로 이동만 수행
        // 검색 페이지의 useEffect에서 검색이 실행될 것임
        router.push(`/search?q=${encodeURIComponent(query)}&page=1`);
      }
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className={`w-full ${!isSearchPage ? "max-w-2xl" : ""} ${
        centered ? "mx-auto" : ""
      }`}
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
    </form>
  );
};
