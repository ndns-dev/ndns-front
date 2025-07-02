import { apiClient } from './base.api';
import { SearchApiResponse, SearchResultPost } from '@/types/search.type';

export interface SearchParams {
  query: string;
  offset?: number;
  limit?: number;
  signal?: AbortSignal;
}

// API 요청 타임아웃 (밀리초)
const API_TIMEOUT = 30000; // 30초

export const searchApi = {
  /**
   * 블로그 검색 API
   * @param params 검색 파라미터
   */
  searchBlogs: async (
    params: SearchParams
  ): Promise<{ data: SearchApiResponse; requestId: string }> => {
    const response = await apiClient.getWithHeaders<{ data: SearchApiResponse; headers: Headers }>(
      'v1/search',
      {
        params: {
          query: params.query,
          offset: params.offset || 0,
          limit: params.limit || 10,
        },
        timeout: API_TIMEOUT,
        signal: params.signal,
      }
    );
    const requestId = response.headers.get('X-Req-Id');
    if (!requestId) {
      throw new Error('정상적인 요청이 아닙니다. 다시 시도해주세요.');
    }

    return {
      data: response.data,
      requestId,
    };
  },

  /**
   * 분석 결과를 SSE로 받아오는 메서드
   * @param requestId 요청 ID (X-Req-Id)
   * @param onUpdate 업데이트 콜백
   */
  subscribeToAnalysis: (
    requestId: string,
    onUpdate: (post: SearchResultPost) => void
  ): (() => void) => {
    const eventSource = new EventSource(`/external/stream?reqId=${requestId}`);

    eventSource.onmessage = event => {
      const data = JSON.parse(event.data);
      console.log('eventSourceData:::::: ', data);
      onUpdate(data);
    };

    eventSource.onerror = error => {
      console.error('SSE 연결 오류:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  },
};
