'use client';

import { useEffect, useRef, useState } from 'react';
import { Header, Footer } from '@/components/common/navigation';
import { SearchBar } from '@/components/search/search-bar.component';
import { RandomSearchChips } from '@/components/common/chip';
import { Button } from '@/components/ui';
import { RefreshCw } from 'lucide-react';

export default function Home() {
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [refreshChips, setRefreshChips] = useState(false);

  // 컴포넌트 마운트 시 애니메이션 효과
  useEffect(() => {
    const container = searchContainerRef.current;
    if (container) {
      container.classList.add('transition-all', 'duration-700', 'ease-in-out');
      container.style.opacity = '0';
      container.style.transform = 'translateY(20px)';

      setTimeout(() => {
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
      }, 300);
    }
  }, []);

  // 새로고침 트리거 함수
  const triggerRefresh = () => {
    setRefreshChips(prev => !prev);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center flex-grow">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              내돈내산
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              블로그 리뷰에서 협찬 포스트를 필터링하고 진짜 리뷰만 찾아보세요
            </p>
          </div>

          <div ref={searchContainerRef} className="w-full max-w-2xl">
            <SearchBar centered />
          </div>

          <div className="mt-8 text-center">
            <div className="flex items-center justify-center mb-3">
              <p className="text-sm text-gray-500 dark:text-gray-500">예시 검색어</p>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 ml-2 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400"
                onClick={triggerRefresh}
                aria-label="검색어 새로고침"
                title="다른 검색어 보기"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <div className="min-h-[88px]">
              <RandomSearchChips
                count={6}
                className="justify-center"
                searchable={true}
                refreshInterval={8000} // 8초마다 자동 갱신
                showRefreshButton={false} // 컴포넌트 내 버튼 숨김
                key={`search-chips-${refreshChips}`} // 리렌더링 트리거용 키
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
