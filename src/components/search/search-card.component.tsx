import { SearchResultPost } from "@/types/search.type";
import { env } from "@/config/env.schema";
import { formatDate } from "@/utils/format.utils";
import { navigateToExternalUrl } from "@/utils/component.utils";

interface ResultCardProps {
    post: SearchResultPost;
  }
  
  export const ResultCard: React.FC<ResultCardProps> = ({ post }) => {
    return (
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-4 border-l-4 border-transparent hover:border-l-4 hover:border-emerald-500 transition-all cursor-pointer"
        onClick={() => navigateToExternalUrl(post.link)}
      >
        <div className="flex justify-between items-start mb-2">
          <h3
            className="text-lg font-semibold text-gray-900 dark:text-white"
            dangerouslySetInnerHTML={{ __html: post.title }}
          />
          <div className="flex items-center space-x-2">
            {post.isSponsored ? (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
                협찬 ({Math.round(post.sponsorProbability * 100)}%)
              </span>
            ) : (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                내돈내산
              </span>
            )}
          </div>
        </div>
  
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {post.bloggername} • {formatDate(post.postDate)}
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
    );
  };
  