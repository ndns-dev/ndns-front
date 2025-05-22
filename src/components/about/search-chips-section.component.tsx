'use client';

import React from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui';
import { RandomSearchChips } from '@/components/common/chip';

interface SearchChipsSectionProps {
  refreshChips: boolean;
  onRefresh: () => void;
}

export const SearchChipsSection: React.FC<SearchChipsSectionProps> = ({
  refreshChips,
  onRefresh,
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md p-8 relative comparison-card">
      <div className="absolute top-4 right-4 text-blue-400">
        <Search size={24} />
      </div>

      <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-8 flex items-center">
        이렇게 검색해보세요
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 ml-2 bg-white dark:bg-gray-700 text-blue-500 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-200"
          onClick={onRefresh}
          aria-label="검색어 새로고침"
          title="다른 검색어 보기"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </h1>

      {/* 검색 칩 컨테이너: 고정된 높이와 일정한 레이아웃 */}
      <div className="relative search-chips-wrapper">
        {/* 고정 높이 컨테이너 */}
        <div className="min-h-[50px] overflow-y-auto py-2 flex items-start">
          <div className="w-full">
            <div className="search-chips-container">
              <RandomSearchChips
                count={10}
                className="flex flex-wrap gap-2 w-full uniform-chip-height"
                searchable={true}
                showRefreshButton={false}
                key={`search-chips-${refreshChips}`}
              />
            </div>
          </div>
        </div>

        {/* 오버플로우 표시 그라데이션 */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-800 dark:to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};
