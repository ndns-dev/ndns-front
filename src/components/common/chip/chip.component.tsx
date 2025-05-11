"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge.component";
import { Search } from "lucide-react";
import { cn } from "@/utils/class-name.util";

// 미리 정의된 칩 테마 타입
export type ChipTheme =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "blue"
  | "green"
  | "indigo"
  | "red"
  | "yellow"
  | "purple"
  | "pink";

// 모든 사용 가능한 테마 배열
const ALL_THEMES: ChipTheme[] = [
  "default",
  "secondary",
  "blue",
  "green",
  "indigo",
  "red",
  "yellow",
  "purple",
  "pink",
];

// 랜덤 테마를 생성하는 유틸리티 함수
export const getRandomTheme = (exclude: ChipTheme[] = []): ChipTheme => {
  const availableThemes = ALL_THEMES.filter(
    (theme) => !exclude.includes(theme)
  );
  const randomIndex = Math.floor(Math.random() * availableThemes.length);
  return availableThemes[randomIndex];
};

// 여러 개의 고유한 랜덤 테마를 생성하는 유틸리티 함수
export const getUniqueRandomThemes = (count: number): ChipTheme[] => {
  const themes: ChipTheme[] = [];
  for (let i = 0; i < Math.min(count, ALL_THEMES.length); i++) {
    themes.push(getRandomTheme(themes));
  }
  return themes;
};

interface ChipProps {
  label: string;
  onClick?: () => void;
  // 확장된 테마 옵션
  theme?: ChipTheme;
  searchable?: boolean;
  // 커스텀 클래스를 추가할 수 있는 옵션
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  onClick,
  theme = "default",
  searchable = false,
  className = "",
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (searchable) {
      router.push(`/search?q=${encodeURIComponent(label)}&page=1`);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <Badge
      variant={theme}
      className={cn(
        "px-3 py-1.5 text-sm font-medium mb-2 mr-2 cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      {searchable && <Search className="w-3 h-3 mr-1.5" strokeWidth={2.5} />}
      {label}
    </Badge>
  );
};
