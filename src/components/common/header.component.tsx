"use client";

import React from "react";
import Link from "next/link";
import { useSearchStore } from "@/store/search.store";

export const Header: React.FC = () => {
  const { clearLocalStorageCache } = useSearchStore();

  // 메인 페이지로 이동 시 캐시 초기화
  const handleHomeClick = () => {
    // 로컬 스토리지 캐시를 포함한 모든 검색 상태 초기화
    clearLocalStorageCache();
  };

  return (
    <header className="w-full bg-white dark:bg-gray-900 py-4 px-6 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold text-emerald-600 dark:text-emerald-400"
          onClick={handleHomeClick}
        >
          내돈내산
        </Link>
        <nav className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-gray-700 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
            onClick={handleHomeClick}
          >
            홈
          </Link>
          <Link
            href="/about"
            className="text-gray-700 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
          >
            소개
          </Link>
        </nav>
      </div>
    </header>
  );
};
