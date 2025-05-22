'use client';

import { useState } from 'react';
import { Header, Footer } from '@/components/common/navigation';
import { ComparisonSection } from '@/components/about/comparison-section.component';
import { SearchChipsSection } from '@/components/about/search-chips-section.component';
import { COMPARISON_TYPES } from '@/types/about.type';

export default function AboutPage() {
  const [refreshChips, setRefreshChips] = useState(false);

  // 새로고침 트리거 함수
  const triggerRefresh = () => {
    setRefreshChips(prev => !prev);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* 기존 검색 방식 섹션 */}
            <ComparisonSection type={COMPARISON_TYPES.TRADITIONAL} />

            {/* 내돈내산 검색 섹션 */}
            <ComparisonSection type={COMPARISON_TYPES.NDNS} />
          </div>

          {/* 검색 칩 섹션 - 칼럼 2개 차지 */}
          <div className="grid grid-cols-1 gap-6">
            <SearchChipsSection refreshChips={refreshChips} onRefresh={triggerRefresh} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
