import { apiClient } from "./base.api";
import { SearchApiResponse } from "@/types/search.type";

export interface SearchParams {
  query: string;
  offset?: number;
  limit?: number;
}

// API 요청 타임아웃 (밀리초)
const API_TIMEOUT = 30000; // 30초

export const searchApi = {
  /**
   * 블로그 검색 API
   * @param params 검색 파라미터
   */
  searchBlogs: (params: SearchParams): Promise<SearchApiResponse> => {
    return apiClient.get<SearchApiResponse>("v1/search", {
      params: {
        query: params.query,
        offset: params.offset || 0,
        limit: params.limit || 10,
      },
      timeout: API_TIMEOUT,
    });
  },
};
