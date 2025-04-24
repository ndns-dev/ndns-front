export interface SponsorIndicator {
  type: string;
  pattern: string;
  matched_text: string;
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
  postdate: string;
  is_sponsored: boolean;
  sponsor_probability: number;
  sponsor_indicators: SponsorIndicator[];
}

export interface SearchApiResponse {
  keyword: string;
  total_results: number;
  filtered_results: number;
  page: number;
  items_per_page: number;
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
