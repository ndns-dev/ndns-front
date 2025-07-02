import { SearchResult, SearchResultPost } from '@/types/search.type';
import { isSponsored, isPendingAnalysis, isNonSponsored } from '@/utils/post.util';

interface SearchCountProps {
  posts: SearchResultPost[];
  onSponsoredClick: () => void;
  onNonSponsoredClick: () => void;
}

export const SearchCount: React.FC<SearchCountProps> = ({
  posts,
  onSponsoredClick,
  onNonSponsoredClick,
}) => {
  const sponsoredCount = posts.filter(isSponsored).length;
  const pendingCount = posts.filter(isPendingAnalysis).length;
  const nonSponsoredCount = posts.filter(isNonSponsored).length;

  return (
    <div className="flex space-x-2 mb-4">
      <button
        onClick={onSponsoredClick}
        className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
      >
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {SearchResult.SPONSORED}{' '}
          <span className="text-red-500 font-semibold">{sponsoredCount}개</span>
        </p>
      </button>
      <button
        onClick={onNonSponsoredClick}
        className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
      >
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {SearchResult.NON_SPONSORED}{' '}
          <span className="text-green-500 font-semibold">{nonSponsoredCount}개</span>
        </p>
      </button>
      {pendingCount > 0 && (
        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {SearchResult.PENDING}{' '}
            <span className="text-blue-500 font-semibold">{pendingCount}개</span>
          </p>
        </div>
      )}
    </div>
  );
};
