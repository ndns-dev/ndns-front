import { SearchResultPost } from '@/types/search.type';
import { ResultCard } from './search-card.component';
import { AdBanner } from '@/components/common/marketing';

interface SearchSectionProps {
  title: string;
  titleColor: string;
  posts: SearchResultPost[];
  sectionRef: React.MutableRefObject<HTMLDivElement | null>;
  showAdBanner?: boolean;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  title,
  titleColor,
  posts,
  sectionRef,
  showAdBanner = false,
}) => {
  if (posts.length === 0) return null;

  return (
    <div ref={sectionRef}>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2">
        <span className={titleColor}>{title}</span> 후기
      </h3>
      {posts.map((post, index) => (
        <ResultCard key={`${title.toLowerCase()}-${index}`} post={post} />
      ))}

      {/* 광고 배너 (내돈내산 섹션에만 표시) */}
      {showAdBanner && posts.length >= 3 && <AdBanner position="inline" />}
    </div>
  );
};
