import React, { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useSearch } from '@/hooks/use-search.hook';
import { Input, Button } from '@/components/ui';
import { Loader2, Search } from 'lucide-react';
import { cn } from '@/utils/class-name.util';
import { useThemeStore } from '@/store/theme.store';
import { SearchForm } from './search-form.component';

interface StickySearchBarProps {
  isSticky: boolean;
  opacity?: number;
  className?: string;
}

export const StickySearchBar: React.FC<StickySearchBarProps> = ({
  isSticky,
  opacity = 1,
  className = '',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { query, setQuery, handleSearch, isLoading } = useSearch();
  const { isDarkMode } = useThemeStore();

  // 폼 제출 처리
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (query) {
      // 이미 검색 페이지에 있는지 확인
      const isOnSearchPage = pathname.includes('/search');

      if (isOnSearchPage) {
        // 이미 검색 페이지에 있으면 URL만 업데이트하고 검색 실행
        router.push(`/search?q=${encodeURIComponent(query)}&page=1`);
        handleSearch(query, 1);
      } else {
        // 메인 페이지에서는 검색 페이지로 이동만 수행
        router.push(`/search?q=${encodeURIComponent(query)}&page=1`);
      }
    }
  };

  // 낮은 투명도에서 표시 여부 결정 (0.01보다 낮으면 완전히 숨김)
  const isVisible = opacity > 0.01;

  return (
    <div
      className={cn('mb-4', className)}
      style={{
        opacity: opacity, // 완전 투명(0)부터 완전 불투명(1)까지 부드럽게 변화
        maxHeight: isSticky ? '68px' : '0', // 높이를 더 확보하여 테두리가 보이도록
        visibility: isVisible ? 'visible' : 'hidden',
        // 부드러운 opacity 전환을 위한 transition 설정
        transition: 'opacity 0.3s ease, visibility 0.3s ease, maxHeight 0.2s ease',
      }}
    >
      <SearchForm
        onSubmit={onSubmit}
        query={query}
        setQuery={setQuery}
        isLoading={isLoading}
        placeholder="검색어를 입력하세요"
        inputClassName="w-full px-4 py-3 pr-12 text-base rounded-full"
        buttonSize="small"
      />
    </div>
  );
};
