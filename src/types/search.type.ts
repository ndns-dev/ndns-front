export interface SponsorIndicator {
  type: string;
  pattern: string;
  matchedText: string;
  source: string;
  source_info: {
    image_url?: string;
    detection_method?: string;
    text?: string;
  };
}

export interface SearchResultPost {
  title: string;
  link: string;
  description: string;
  bloggername: string;
  bloggerlink: string;
  postDate: string;
  isSponsored: boolean;
  sponsorProbability: number;
  sponsorIndicators: SponsorIndicator[];
}

export interface SearchApiResponse {
  keyword: string;
  totalResults: number;
  sponsoredResults: number;
  page: number;
  itemsPerPage: number;
  posts: SearchResultPost[];
}

// 캐시된 검색 결과 타입
export interface CachedResults {
  [key: string]: {
    apiResponse: SearchApiResponse;
    timestamp: number;
    pageData: {
      [page: number]: SearchResultPost[];
    };
  };
}

export interface SearchState {
  query: string;
  results: SearchApiResponse | null;
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  cachedResults: CachedResults;

  // 액션들
  setQuery: (query: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setResults: (results: SearchApiResponse) => void;
  getCachedResults: (query: string, page: number) => SearchApiResponse | null;
  resetSearch: () => void;
}
