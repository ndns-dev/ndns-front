"use client";

import React, { useState } from "react";
import Link from "next/link";

interface AdBannerProps {
  position?: "inline" | "sidebar";
}

export const AdBanner: React.FC<AdBannerProps> = ({ position = "inline" }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div 
      className={`
        bg-gray-100 dark:bg-gray-800 
        ${position === "inline" ? "w-full py-3 px-4 my-4" : "w-full p-4 rounded-lg my-3"}
        border border-gray-200 dark:border-gray-700 relative
      `}
    >
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        aria-label="광고 닫기"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex flex-col items-center text-center">
        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">광고</span>
        
        <div className="flex flex-col items-center">
          <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
            이곳에 광고가 표시됩니다
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            광고 문의: ndns.dev@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}; 