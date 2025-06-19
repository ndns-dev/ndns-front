export interface SponsorIndicator {
  type: string;
  pattern: string;
  matchedText: string;
  source: string;
}

export interface SearchResultPost {
  title: string;
  link: string;
  description: string;
  bloggerName: string;
  bloggerLink: string;
  postDate: string;
  isSponsored: boolean;
  sponsorProbability: number;
  sponsorIndicators: SponsorIndicator[];
}

export interface SearchApiResponse {
  keyword: string;
  posts: SearchResultPost[];
  totalResults: number;
  itemsPerPage: number;
  sponsoredResults: number;
  page: number;
  isPartialResult?: boolean;
  isInitialLoad?: boolean;
  currentCount?: number;
}

export interface CachedKeywordData {
  totalResults: number;
  itemsPerPage: number;
  sponsoredResults: number;
  timestamp: number;
}

export interface CachedPageData {
  posts: SearchResultPost[];
  currentCount: number;
  isComplete: boolean;
}

export interface CachedResults {
  [query: string]: {
    keywordData: CachedKeywordData;
    pageData: {
      [page: number]: CachedPageData;
    };
  };
}

export interface SearchStateData {
  query: string;
  results: SearchApiResponse | null;
  error: string | null;
  isLoading: boolean;
  isSearchBarLoading: boolean;
  isModalLoading: boolean;
  isCardLoading: boolean;
  currentPage: number;
  cachedResults: CachedResults;
  isFromMainNavigation: boolean;
}

export interface SearchStateActions {
  setQuery: (query: string) => void;
  setResults: (results: SearchApiResponse | null) => void;
  setError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsSearchBarLoading: (isLoading: boolean) => void;
  setIsModalLoading: (isLoading: boolean) => void;
  setIsCardLoading: (isLoading: boolean) => void;
  setCurrentPage: (page: number) => void;
  setCachedResults: (results: CachedResults | ((prev: CachedResults) => CachedResults)) => void;
  resetSearch: () => void;
  setIsFromMainNavigation: (isFromMainNavigation: boolean) => void;
}

export type SearchState = SearchStateData & SearchStateActions;
