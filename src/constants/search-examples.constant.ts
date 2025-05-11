// 자주 사용되는 검색 예시들
import { ChipTheme, getUniqueRandomThemes } from "@/components/common/chip";

// 상세 지역 키워드 (근처 적용 가능)
export const SPECIFIC_LOCATIONS = [
  "강남역",
  "신논현역",
  "서울숲",
  "이태원",
  "홍대",
  "해운대",
  "서울역",
  "광화문",
  "가로수길",
  "종로",
  "신촌",
  "건대입구",
];

// 큰 범주 지역명 (근처 적용 불가)
export const BROAD_LOCATIONS = [
  "강남",
  "서울",
  "부산",
  "제주도",
  "강원도",
  "여수",
  "경주",
  "인천",
  "대구",
  "대전",
];

// 모든 지역 키워드
export const LOCATIONS = [...SPECIFIC_LOCATIONS, ...BROAD_LOCATIONS];

// 음식 관련 키워드
export const FOOD_KEYWORDS = [
  "맛집",
  "카페",
  "레스토랑",
  "분식",
  "치킨",
  "피자",
  "한식",
  "일식",
  "중식",
  "양식",
  "브런치",
  "디저트",
  "베이커리",
  "파스타",
  "삼겹살",
  "갈비",
  "돈까스",
  "초밥",
  "라멘",
  "핫도그",
  "햄버거",
  "샌드위치",
  "빵집",
  "빵지순례",
];

// 여행 관련 키워드
export const TRAVEL_KEYWORDS = [
  "숙소",
  "호텔",
  "펜션",
  "에어비앤비",
  "리조트",
  "글램핑",
  "캠핑",
  "여행",
  "관광",
  "액티비티",
  "트레킹",
  "렌트카",
  "드라이브",
  "해변",
  "온천",
  "스파",
  "전망대",
  "명소",
  "공원",
  "박물관",
  "미술관",
];

// 기타 생활 키워드
export const LIFESTYLE_KEYWORDS = [
  "헬스장",
  "요가",
  "필라테스",
  "운동",
  "공방",
  "독서실",
  "스터디카페",
  "미용실",
  "네일샵",
  "인테리어",
  "가구",
  "화장품",
  "옷가게",
  "쇼핑몰",
  "신발",
  "가방",
  "자전거",
  "킥보드",
  "스케이트",
  "수영장",
];

// 검색어 수식어 (옵셔널)
export const SUFFIX_KEYWORDS = [
  "추천",
  "후기",
  "리뷰",
  "정보",
  "비교",
  "솔직후기",
  "평가",
  "순위",
  "베스트",
  "인기",
  "BEST",
  "TOP 10",
];

// 강조 형용사 (옵셔널)
export const EMPHASIS_KEYWORDS = ["진짜", "내돈내산", "찐"];

/**
 * 검색어 조합 생성 함수
 * 모든 카테고리(tech 제외)에 location을 필수로 포함
 * 수식어는 옵셔널(30% 확률로 생략)
 */
export const generateRandomSearchQuery = (): string => {
  // 랜덤 키워드 선택을 위한 헬퍼 함수
  const getRandomItem = <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
  };

  // 수식어를 포함할지 결정 (70% 확률로 포함)
  const includeSuffix = Math.random() < 0.7;

  // 강조 형용사를 포함할지 결정 (40% 확률로 포함)
  const includeEmphasis = Math.random() < 0.4;
  const emphasis = includeEmphasis
    ? `${getRandomItem(EMPHASIS_KEYWORDS)} `
    : "";

  // 수식어 설정
  const suffix = includeSuffix
    ? ` ${emphasis}${getRandomItem(SUFFIX_KEYWORDS)}`
    : "";

  // 검색어 유형 랜덤 선택 (지역+음식, 지역+여행, 지역+생활)
  const queryType = Math.floor(Math.random() * 3);

  // 지역 선택 (50% 확률로 상세 지역 또는 큰 범주 지역)
  const useSpecificLocation = Math.random() < 0.5;
  const location = useSpecificLocation
    ? getRandomItem(SPECIFIC_LOCATIONS)
    : getRandomItem(BROAD_LOCATIONS);

  // "근처"를 포함할지 결정 (상세 지역인 경우에만 40% 확률로 추가)
  const includeNearby = useSpecificLocation && Math.random() < 0.4;
  const nearby = includeNearby ? " 근처" : "";

  switch (queryType) {
    case 0: {
      // 지역 + 음식
      // 음식 키워드 뒤에 "맛집"을 붙일지 결정 (50% 확률)
      const includeMatjip = Math.random() < 0.5;
      const foodKeyword = getRandomItem(FOOD_KEYWORDS);
      const food =
        includeMatjip && !foodKeyword.includes("맛집")
          ? `${foodKeyword} 맛집`
          : foodKeyword;

      return `${location}${nearby} ${food}${suffix}`;
    }

    case 1: // 지역 + 여행
      return `${location}${nearby} ${getRandomItem(TRAVEL_KEYWORDS)}${suffix}`;

    case 2: // 지역 + 생활
      return `${location}${nearby} ${getRandomItem(
        LIFESTYLE_KEYWORDS
      )}${suffix}`;

    default:
      return `${location}${nearby} ${getRandomItem(FOOD_KEYWORDS)}${suffix}`;
  }
};

// 랜덤 검색어 배열 생성 함수
export const getRandomSearchQueries = (count: number = 4): string[] => {
  const queries: string[] = [];
  for (let i = 0; i < count; i++) {
    // 중복 방지 (최대 10번 시도)
    let query;
    let attempts = 0;
    do {
      query = generateRandomSearchQuery();
      attempts++;
    } while (queries.includes(query) && attempts < 10);

    queries.push(query);
  }
  return queries;
};

// 예시와 테마를 함께 랜덤으로 제공하는 타입
export interface ExampleWithTheme {
  label: string;
  theme: ChipTheme;
}
