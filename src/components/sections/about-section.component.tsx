'use client';

import { forwardRef } from 'react';
import { ComparisonSection } from '@/components/about/comparison-section.component';
import { SearchChipsSection } from '@/components/about/search-chips-section.component';
import { COMPARISON_TYPES } from '@/types/about.type';

interface AboutSectionProps {
  refreshChips: boolean;
  onRefresh: () => void;
}

export const AboutSection = forwardRef<HTMLElement, AboutSectionProps>(
  ({ refreshChips, onRefresh }, ref) => {
    return (
      <section
        id="about-section"
        ref={ref}
        className="px-4 py-16 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center"
      >
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">
              기능 소개
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              기존 검색 방식과 내돈내산의 차이점을 확인해보세요.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <div className="flex h-full w-full">
              <ComparisonSection type={COMPARISON_TYPES.TRADITIONAL} className="h-full w-full" />
            </div>
            <div className="flex h-full w-full">
              <ComparisonSection type={COMPARISON_TYPES.NDNS} className="h-full w-full" />
            </div>
            <div className="lg:col-span-2">
              <SearchChipsSection refreshChips={refreshChips} onRefresh={onRefresh} />
            </div>
          </div>
        </div>
      </section>
    );
  }
);

AboutSection.displayName = 'AboutSection';
