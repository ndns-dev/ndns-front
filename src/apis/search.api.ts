import { apiClient } from "./base.api";
import { SearchApiResponse } from "@/types/search.type";

export interface SearchParams {
  keyword: string;
  page?: number;
  items_per_page?: number;
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
        keyword: params.keyword,
        page: params.page || 1,
        items_per_page: params.items_per_page || 10,
      },
      timeout: API_TIMEOUT,
    });
  },
};
