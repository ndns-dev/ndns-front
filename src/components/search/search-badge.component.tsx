interface SearchBadgeProps {
  isSponsored: boolean;
  sponsorProbability?: number;
  className?: string;
}

export const SearchBadge = ({
  isSponsored,
  sponsorProbability,
  className = '',
}: SearchBadgeProps) => {
  return (
    <div className={`inline-flex items-center ${className}`}>
      {isSponsored ? (
        <span className="bg-red-100 text-red-800 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300 whitespace-nowrap">
          협찬 {sponsorProbability && `(${Math.round(sponsorProbability * 100)}%)`}
        </span>
      ) : (
        <span className="bg-green-100 text-green-800 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 whitespace-nowrap">
          내돈내산
        </span>
      )}
    </div>
  );
};
