import React from "react";
import Link from "next/link";

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white dark:bg-gray-900 py-4 px-6 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold text-emerald-600 dark:text-emerald-400"
        >
          내돈내산
        </Link>
        <nav className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-gray-700 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
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
