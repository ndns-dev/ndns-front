"use client";

import React, { useMemo } from "react";
import { Chip, ChipTheme, getUniqueRandomThemes } from "./chip.component";

interface ChipGroupProps {
  labels: string[];
  searchable?: boolean;
  className?: string;
  // 특정 테마 사용 여부, 지정하지 않으면 랜덤 테마 적용
  themes?: ChipTheme[] | null;
  // 재사용 가능한 랜덤 테마 사용 여부
  reusableThemes?: boolean;
}

export const ChipGroup: React.FC<ChipGroupProps> = ({
  labels,
  searchable = true,
  className = "",
  themes = null, // null이면, 랜덤 테마 적용
  reusableThemes = false,
}) => {
  // 랜덤 테마 생성 (컴포넌트 마운트 시 한 번만 생성됨)
  const chipThemes = useMemo(() => {
    if (themes) return themes;

    // 재사용 가능한 테마 옵션: 최대 6개 테마만 생성하고 반복 사용
    if (reusableThemes) {
      const uniqueThemes = getUniqueRandomThemes(Math.min(6, labels.length));
      // 필요한 경우 테마를 반복시켜 labels 길이만큼 채움
      return labels.map(
        (_, index) => uniqueThemes[index % uniqueThemes.length]
      );
    }

    // 모든 칩에 고유한 테마 지정
    return getUniqueRandomThemes(labels.length);
  }, [labels.length, themes, reusableThemes]);

  return (
    <div className={`flex flex-wrap ${className}`}>
      {labels.map((label, index) => (
        <Chip
          key={index}
          label={label}
          theme={chipThemes[index]}
          searchable={searchable}
        />
      ))}
    </div>
  );
};
