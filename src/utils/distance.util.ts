import { geocoding } from 'korea-sigungu-geocoding';
import { PostWithDistance, SearchResultPost } from '@/types/search.type';
import { LocationData } from '@/store/location.store';

/**
 * 검색 결과 포스트들을 거리순으로 정렬
 */
export const sortPostsByDistance = (
  posts: SearchResultPost[],
  userLocation: LocationData | null
): PostWithDistance[] => {
  if (!userLocation) {
    return posts.map(post => ({ ...post }));
  }

  const postsWithDistance: PostWithDistance[] = posts.map(post => {
    if (!post.location) {
      return { ...post };
    }

    try {
      const distance = geocoding.calculateDistance(
        userLocation.lat,
        userLocation.lng,
        parseFloat(post.location.latitude),
        parseFloat(post.location.longitude),
        'km'
      );

      return {
        ...post,
        distance: Math.round(distance * 10) / 10, // 소수점 첫째자리까지
      };
    } catch (error) {
      console.error('거리 계산 오류:', error);
      return { ...post };
    }
  });

  // 거리가 있는 포스트들을 거리순으로 정렬, 거리가 없는 포스트들은 뒤에 배치
  return postsWithDistance.sort((a, b) => {
    if (a.distance === undefined && b.distance === undefined) return 0;
    if (a.distance === undefined) return 1;
    if (b.distance === undefined) return -1;
    return a.distance - b.distance;
  });
};

/**
 * 위치 정보가 있는 포스트가 있는지 확인
 */
export const hasLocationData = (posts: SearchResultPost[]): boolean => {
  return posts.some(post => post.location !== undefined);
};
