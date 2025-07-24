'use client';

import { useEffect, useState } from 'react';
import { useSearchStore } from '@/store/search.store';
import { useRouter, usePathname } from 'next/navigation';

interface StateLoaderProps {
  children: React.ReactNode;
}

export const StateLoader: React.FC<StateLoaderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { query, hasSearched } = useSearchStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 초기에 로컬 스토리지에서 상태를 복원한 후에만 렌더링 시작
    const timeout = setTimeout(() => {
      // 검색 이력이 있고 결과가 없고 현재 메인 페이지에 있으면 검색 페이지로 리다이렉트
      if (hasSearched && query && pathname === '/') {
        router.push(`/search?q=${encodeURIComponent(query)}&page=1`);
      }

      // 로딩 상태 해제
      setIsLoading(false);
    }, 10); // 아주 짧은 지연 (상태 복원이 완료될 시간 필요)

    return () => clearTimeout(timeout);
  }, [hasSearched, query, pathname, router]);

  // 로딩 중일 때는 빈 화면 또는 로딩 인디케이터 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* 간단한 로딩 스피너 (빠르게 완료되면 거의 보이지 않음) */}
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-emerald-500 rounded-full"></div>
      </div>
    );
  }

  return <>{children}</>;
};
