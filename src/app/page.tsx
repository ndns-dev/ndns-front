"use client";

import { Header } from "@/components/common/header.component";
import { SearchBar } from "@/components/search/search-bar.component";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center flex-grow">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              내돈내산
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              블로그 리뷰에서 협찬 포스트를 필터링하고 진짜 리뷰만
              찾아보세요
            </p>
          </div>

          <div className="w-full max-w-2xl">
            <SearchBar centered />
          </div>

          <div className="mt-8 text-sm text-gray-500 dark:text-gray-500 text-center">
            예시 검색어: 강남 맛집, 신논현역 카페
          </div>
        </div>
      </main>

      <footer className="py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          © 2025 내돈내산. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
