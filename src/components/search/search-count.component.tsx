import { SearchResultPost } from '@/types/search.type';

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
  const sponsoredCount = posts.filter(post => post.isSponsored).length;
  const nonSponsoredCount = posts.filter(post => !post.isSponsored).length;

  return (
    <div className="flex space-x-2 mb-4">
      <button
        onClick={onSponsoredClick}
        className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          협찬 포스트: <span className="text-red-500 font-semibold">{sponsoredCount}개</span>
        </p>
      </button>
      <button
        onClick={onNonSponsoredClick}
        className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          내돈내산 포스트:{' '}
          <span className="text-green-500 font-semibold">{nonSponsoredCount}개</span>
        </p>
      </button>
    </div>
  );
};
