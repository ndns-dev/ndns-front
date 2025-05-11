"use client";

import React from "react";
import Link from "next/link";
import { useSearchStore } from "@/store/search.store";
import { MenuButton } from "./menu-button.component";

export const Header: React.FC = () => {
  const { clearSearchQuery } = useSearchStore();

  const handleHomeClick = () => {
    // 검색어 초기화
    clearSearchQuery();
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-bold text-emerald-600 dark:text-emerald-400"
            onClick={handleHomeClick}
          >
            내돈내산
          </Link>
          <nav className="flex items-center space-x-4">
            <MenuButton />
          </nav>
        </div>
      </div>
    </header>
  );
};
