"use client";

import React, { useState } from "react";
import Link from "next/link";

interface SponsorBannerProps {
  position?: "top" | "sidebar";
}

export const SponsorBanner: React.FC<SponsorBannerProps> = ({ position = "top" }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div 
      className={`
        bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700
        ${position === "top" ? "w-full py-3 px-4" : "w-full lg:w-64 p-4 rounded-lg"}
        border border-emerald-100 dark:border-gray-600 relative
      `}
    >
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        aria-label="닫기"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex flex-col items-center text-center">
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
          {position === "top" 
            ? "내돈내산 서비스 운영 및 개발을 위한 후원을 받고 있습니다" 
            : "내돈내산 서비스를 후원해주세요"}
        </p>
        <div className="flex space-x-2 mt-1">
          <Link 
            href="/sponsor" 
            className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded transition-colors"
          >
            후원하기
          </Link>
          <Link 
            href="/about" 
            className="text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-3 py-1 rounded transition-colors"
          >
            광고 문의
          </Link>
        </div>
      </div>
    </div>
  );
}; 