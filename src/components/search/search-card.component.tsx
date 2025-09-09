import { PostWithDistance } from '@/types/search.type';
import { MapPin } from 'lucide-react';
import { env } from '@/config/env.schema';
import { formatDate } from '@/utils/format.util';
import { navigateToExternalUrl } from '@/utils/component.util';
import { SearchBadge } from '@/components/search/search-badge.component';
import { isPendingAnalysis, isSponsored } from '@/utils/post.util';
import { RetryOverlay } from './retry-overlay.component';

interface ResultCardProps {
  post: PostWithDistance;
  isStreamActive: boolean;
  isStreamEnded: boolean;
  onRetry?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  post,
  isStreamActive,
  isStreamEnded,
  onRetry,
}) => {
  return (
    <div className="relative">
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-4 border-l-4 border-transparent hover:border-l-4 ${
          isSponsored(post)
            ? 'hover:border-red-500'
            : isPendingAnalysis(post)
            ? 'hover:border-blue-500'
            : 'hover:border-emerald-500'
        } transition-all cursor-pointer`}
        onClick={() => navigateToExternalUrl(post.link)}
      >
        <div className="flex justify-between items-start mb-2">
          <h3
            className="text-lg font-semibold text-gray-900 dark:text-white"
            dangerouslySetInnerHTML={{ __html: post.title }}
          />
          <div className="flex items-center space-x-2">
            <SearchBadge post={post} />
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {post.bloggerName} • {formatDate(post.postDate)}
          {post.distance !== undefined && (
            <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <MapPin className="h-3 w-3" />
              {post.distance}km
            </span>
          )}
        </div>

        <div
          className="text-sm text-gray-700 dark:text-gray-300 mb-3"
          dangerouslySetInnerHTML={{ __html: post.description }}
        />

        {/* 개발 환경에서만 협찬 키워드 표시 */}
        {env.IS_DEVELOPMENT && post.sponsorIndicators.length > 0 && (
          <div className="mt-2 mb-3">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              협찬 키워드:
            </div>
            <div className="flex flex-wrap gap-1">
              {post.sponsorIndicators.map(
                (indicator, idx) =>
                  indicator.matchedText &&
                  indicator.matchedText.length < 5 && (
                    <span
                      key={idx}
                      className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300"
                      title={`출처: ${indicator.source}`}
                    >
                      {indicator.matchedText}
                    </span>
                  )
              )}
            </div>
          </div>
        )}
      </div>

      {/* 재시도하기 오버레이 */}
      {isPendingAnalysis(post) && !isStreamActive && isStreamEnded && onRetry && (
        <RetryOverlay onRetry={onRetry} />
      )}
    </div>
  );
};
