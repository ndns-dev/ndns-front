import React, { FormEvent, useEffect, useRef } from 'react';
import { useSearch } from '@/hooks/use-search.hook';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Input, Button } from '@/components/ui';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/utils/class-name.util';

interface SearchBarProps {
  centered?: boolean;
  initialQuery?: string;
  isSearchPage?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  centered = false,
  initialQuery = '',
  isSearchPage = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { query, setQuery, handleSearch, isLoading } = useSearch();
  // initialQuery가 적용되었는지 추적하는 ref
  const initialQueryApplied = useRef(false);

  // initialQuery가 제공되면 쿼리 상태 초기화 (처음 한 번만)
  useEffect(() => {
    // 메인 페이지에서만 초기 쿼리를 설정하고, 검색 페이지에서는 URL의 쿼리를 사용
    if (initialQuery && !initialQueryApplied.current) {
      setQuery(initialQuery);
      initialQueryApplied.current = true;
    }
  }, [initialQuery, setQuery]);

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
        // 검색 페이지의 useEffect에서 검색이 실행될 것임
        router.push(`/search?q=${encodeURIComponent(query)}&page=1`);
      }
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className={cn('w-full', !isSearchPage && 'max-w-2xl', centered && 'mx-auto')}
    >
      <div className="relative">
        <Input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="검색어를 입력하세요 (예: 제주 애월 OO, OOO 건대입구점)"
          className="w-full px-5 py-6 pr-16 text-lg rounded-full"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full h-11 w-11 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
          ) : (
            <Search className="h-5 w-5 text-emerald-500" />
          )}
        </Button>
      </div>
    </form>
  );
};
