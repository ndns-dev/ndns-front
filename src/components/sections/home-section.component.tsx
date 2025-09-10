'use client';

import { forwardRef } from 'react';
import { SearchBar } from '@/components/search/search-bar.component';
import { RandomSearchChips } from '@/components/common/chip';
import { LocationFetcher } from '@/components/common/location/location-fetcher.component';
import { LocationDisplay } from '@/components/common/location/location-display.component';

interface HomeSectionProps {
  searchContainerRef: React.RefObject<HTMLDivElement | null>;
  refreshChips: boolean;
  onRefresh: () => void;
}

export const HomeSection = forwardRef<HTMLElement, HomeSectionProps>(
  ({ searchContainerRef }, ref) => {
    return (
      <section
        id="home-section"
        ref={ref}
        className="flex flex-col items-center px-4 py-16 min-h-screen"
      >
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center flex-grow">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              내돈내산
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              블로그 리뷰에서 협찬 포스트를 필터링하고 진짜 리뷰만 찾아보세요.
            </p>
          </div>

          <div ref={searchContainerRef} className="w-full max-w-2xl">
            <SearchBar centered />
          </div>

          <div className="mt-8">
            <LocationDisplay />
          </div>

          <div className="mt-8">
            <RandomSearchChips showRefreshButton={true} />
          </div>
        </div>

        {/* 백그라운드에서 위치 정보 수집 */}
        <LocationFetcher autoFetch={true} />
      </section>
    );
  }
);

HomeSection.displayName = 'HomeSection';
