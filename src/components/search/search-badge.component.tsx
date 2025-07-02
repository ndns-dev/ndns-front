import { SearchResult, SearchResultPost } from '@/types/search.type';
import { isPendingAnalysis, isSponsored, isNonSponsored } from '@/utils/post.util';

interface SearchBadgeProps {
  post: SearchResultPost;
  className?: string;
}

export const SearchBadge = ({ post, className = '' }: SearchBadgeProps) => {
  return (
    <div className={`inline-flex items-center ${className}`}>
      {isSponsored(post) ? (
        <span className="bg-red-100 text-red-800 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300 whitespace-nowrap">
          {SearchResult.SPONSORED}{' '}
          {post.sponsorProbability && `(${Math.round(post.sponsorProbability * 100)}%)`}
        </span>
      ) : isPendingAnalysis(post) ? (
        <span className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 whitespace-nowrap">
          {SearchResult.PENDING}
        </span>
      ) : (
        <span className="bg-green-100 text-green-800 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 whitespace-nowrap">
          {SearchResult.NON_SPONSORED}
        </span>
      )}
    </div>
  );
};
