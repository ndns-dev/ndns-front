import { SearchResultPost } from '@/types/search.type';

/**
 * 포스트가 분석 중인지 확인합니다.
 */
export const isPendingAnalysis = (post: SearchResultPost): boolean => {
  return post.sponsorIndicators.some(indicator => indicator.type === 'pending');
};

/**
 * 포스트가 협찬인지 확인합니다.
 */
export const isSponsored = (post: SearchResultPost): boolean => {
  return post.isSponsored;
};

/**
 * 포스트가 내돈내산인지 확인합니다.
 */
export const isNonSponsored = (post: SearchResultPost): boolean => {
  return !post.isSponsored && !isPendingAnalysis(post);
};
