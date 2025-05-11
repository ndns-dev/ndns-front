"use client";

import React, { useEffect, useState } from "react";
import { getRandomSearchQueries } from "@/constants/search-examples.constant";
import { Button, Badge } from "@/components/ui";
import { RefreshCw, Search } from "lucide-react";

interface RandomSearchChipsProps {
  count?: number;
  className?: string;
  searchable?: boolean;
  refreshInterval?: number | null; // 자동 갱신 간격 (밀리초), null이면 갱신 안함
  showRefreshButton?: boolean; // 새로고침 버튼 표시 여부
}

// 사용 가능한 테마 목록
const AVAILABLE_THEMES = [
  "secondary",
  "green",
  "blue",
  "red",
  "yellow",
  "purple",
  "pink",
  "indigo",
];

// 중복 없는 랜덤 테마 배열 생성 함수
function getUniqueRandomThemes(count: number): string[] {
  const themes = [...AVAILABLE_THEMES];
  const result: string[] = [];

  // count가 전체 테마 개수보다 많을 경우 조정
  const actualCount = Math.min(count, themes.length);

  for (let i = 0; i < actualCount; i++) {
    const randomIndex = Math.floor(Math.random() * themes.length);
    result.push(themes[randomIndex]);
    themes.splice(randomIndex, 1); // 사용한 테마 제거
  }

  // 만약 필요한 테마 수가 더 많다면 다시 원래 테마에서 랜덤하게 선택 (여기서는 중복 허용)
  if (count > actualCount) {
    for (let i = actualCount; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * AVAILABLE_THEMES.length);
      result.push(AVAILABLE_THEMES[randomIndex]);
    }
  }

  return result;
}

export function RandomSearchChips({
  count = 6,
  className = "",
  searchable = true,
  refreshInterval = null,
  showRefreshButton = true, // 기본값을 true로 설정
}: RandomSearchChipsProps) {
  const [examples, setExamples] = useState<
    Array<{ label: string; theme: string }>
  >([]);

  // 랜덤 예시 새로고침 함수
  const refreshExamples = () => {
    const queries = getRandomSearchQueries(count);
    const randomThemes = getUniqueRandomThemes(count);

    setExamples(
      queries.map((query, index) => ({
        label: query,
        theme: randomThemes[index % randomThemes.length],
      }))
    );
  };

  // 컴포넌트 마운트 시 및 의존성 변경 시 예시 새로고침
  useEffect(() => {
    refreshExamples();

    // 자동 갱신 설정
    if (refreshInterval) {
      const interval = setInterval(refreshExamples, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [count, refreshInterval]);

  return (
    <div className={`flex flex-wrap ${className}`}>
      {examples.map((example, index) => (
        <Badge
          key={`${example.label}-${index}`}
          variant={example.theme as any}
          className="mr-2 mb-2 cursor-pointer flex items-center gap-1 !text-gray-700 !bg-opacity-100"
          onClick={() => {
            if (searchable) {
              // handle search functionality if needed
              console.log(`Searching for: ${example.label}`);
            }
          }}
        >
          <Search size={10} className="mr-0.5" /> {example.label}
        </Badge>
      ))}

      {showRefreshButton && (
        <Button
          variant="outline"
          size="icon"
          onClick={refreshExamples}
          className="flex items-center justify-center w-8 h-8 mr-2 mb-2 text-gray-500 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 bg-white dark:bg-gray-700"
          aria-label="검색어 새로고침"
          title="다른 검색어 보기"
        >
          <RefreshCw size={16} />
        </Button>
      )}
    </div>
  );
}
