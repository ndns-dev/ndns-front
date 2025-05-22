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
    keywordData: {
      totalResults: number;
      itemsPerPage: number;
      timestamp: number;
    };
    pageData: {
      [page: number]: {
        sponsoredResults: number;
        posts: SearchResultPost[];
      };
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
  pendingFetches: Map<number, Promise<SearchApiResponse>>;
  currentPage: number;
  isFromMainNavigation: boolean;

  // 액션들
  setQuery: (query: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setResults: (results: SearchApiResponse) => void;
  getCachedResults: (query: string, page: number) => SearchApiResponse | null;
  resetSearch: () => void;
  setPendingFetch: (page: number, promise: Promise<SearchApiResponse>) => void;
  removePendingFetch: (page: number) => void;
  getPendingFetch: (page: number) => Promise<SearchApiResponse> | undefined;
  setCurrentPage: (page: number) => void;
  setFromMainNavigation: (value: boolean) => void;
}
