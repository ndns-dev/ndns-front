import React from 'react';
import { SearchResultPost } from '@/types/search.type';
import { ResultCard } from './search-card.component';
import { AdBanner } from '@/components/common/marketing';

interface SearchSectionProps {
  title: string;
  titleColor: string;
  posts: SearchResultPost[];
  sectionRef?: React.RefObject<HTMLDivElement>;
  showAdBanner?: boolean;
  showLoadingIndicator?: boolean;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  title,
  titleColor,
  posts,
  sectionRef,
  showAdBanner = false,
  showLoadingIndicator = false,
}) => {
  if (posts.length === 0) return null;

  return (
    <div ref={sectionRef} className="mb-8">
      <div className="flex items-center mb-4">
        <h3 className={`text-lg font-semibold ${titleColor}`}>{title}</h3>
        <span className="ml-2 text-gray-500">({posts.length})</span>
        {showLoadingIndicator && (
          <div className="ml-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-500">분석 중...</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {posts.map((post, index) => (
          <React.Fragment key={post.link}>
            <ResultCard post={post} />
            {showAdBanner && index === 2 && <AdBanner />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
