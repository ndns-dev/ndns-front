import { apiClient } from './base.api';
import { SearchApiResponse, SearchResultPost } from '@/types/search.type';
import { env } from '@/config/env.schema';
import { EventSourcePolyfill } from 'event-source-polyfill';

export interface SearchParams {
  query: string;
  offset?: number;
  limit?: number;
  signal?: AbortSignal;
}

// API 요청 타임아웃 (밀리초)
const API_TIMEOUT = 30000; // 30초

interface AnalysisCallbacks {
  onComplete: () => void;
  onError: () => void;
}

// // SSE 연결 관리를 위한 Map
// const activeConnections = new Map<
//   string,
//   {
//     eventSource: EventSourcePolyfill;
//     retryCount: number;
//     isConnected: boolean;
//   }
// >();

// // SSE 연결 재시도 설정
// const MAX_RETRY_COUNT = 3;
// const RETRY_INTERVAL = 1000;

export const searchApi = {
  /**
   * 블로그 검색 API
   * @param params 검색 파라미터
   */
  searchBlogs: async (
    params: SearchParams
  ): Promise<{ data: SearchApiResponse; requestId: string; sseToken: string }> => {
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
    const sseToken = response.headers.get('X-Sse-Token');
    console.log('[SSE] 토큰 - 검색 요청:', { requestId, sseToken });
    if (!requestId || !sseToken) {
      throw new Error('정상적인 요청이 아닙니다. 다시 시도해주세요.');
    }

    return {
      data: response.data,
      requestId,
      sseToken,
    };
  },

  /**
   * 분석 결과를 SSE로 받아오는 메서드
   * @param requestId 요청 ID (X-Req-Id)
   * @param sseToken SSE 토큰 (X-Sse-Token)
   * @param onUpdate 업데이트 콜백
   */
  subscribeToAnalysis: (
    requestId: string,
    sseToken: string,
    onUpdate: (post: SearchResultPost) => void
  ): (() => void) | undefined => {
    console.log('[SSE] 토큰 - 분석 요청:', { requestId, sseToken });

    const url = `${process.env.NEXT_PUBLIC_API_URL}/external/stream?reqId=${requestId}`;

    try {
      const eventSource = new EventSourcePolyfill(url, {
        headers: {
          Authorization: `Bearer ${sseToken}`,
        },
        withCredentials: true,
      });

      let isConnected = false;
      const connectionTimeout = setTimeout(() => {
        if (!isConnected) {
          console.error('[SSE] 연결 타임아웃:', {
            requestId,
            url,
            readyState: eventSource.readyState,
          });
          eventSource.close();
        }
      }, 10000); // 10초 타임아웃

      eventSource.onopen = () => {
        isConnected = true;
        clearTimeout(connectionTimeout);
        console.log('[SSE] 연결 성공:', {
          requestId,
          url,
          readyState: eventSource.readyState,
        });
      };

      eventSource.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          console.log('[SSE] 메시지 수신:', {
            requestId,
            type: data.type,
            message: data.message,
          });

          switch (data.type) {
            case 'connected':
              console.log('[SSE] 서버 연결 확인:', {
                requestId,
                message: data.message,
                timestamp: new Date().toISOString(),
              });
              break;

            case 'analysisComplete':
              if (data.post) {
                console.log('[SSE] 분석 완료:', {
                  requestId,
                  post: data.post,
                });
                onUpdate(data.post);
              }
              break;

            default:
              // 분석 결과일 수 있으므로 post 객체가 있는지 확인
              if (data.post) {
                console.log('[SSE] 분석 결과 수신:', {
                  requestId,
                  post: data.post,
                });
                onUpdate(data.post);
              } else {
                console.log('[SSE] 기타 메시지:', {
                  requestId,
                  data,
                });
              }
          }
        } catch (error) {
          console.error('[SSE] 메시지 파싱 오류:', {
            requestId,
            error,
            data: event.data,
          });
        }
      };

      eventSource.onerror = error => {
        console.error('[SSE] 연결 오류:', {
          requestId,
          error,
          readyState: eventSource.readyState,
          isConnected,
          url,
        });

        if (eventSource.readyState === EventSource.CLOSED) {
          isConnected = false;
          clearTimeout(connectionTimeout);
        }
      };

      return () => {
        clearTimeout(connectionTimeout);
        console.log('[SSE] 연결 종료:', {
          requestId,
          readyState: eventSource.readyState,
        });
        eventSource.close();
      };
    } catch (error) {
      console.error('[SSE] 초기화 오류:', {
        requestId,
        error,
        url,
      });
      return undefined;
    }
  },

  /**
   * SSE를 통해 분석 결과를 구독합니다.
   */
  subscribeToAnalysisForJob: (jobId: string, callbacks: AnalysisCallbacks) => {
    const eventSource = new EventSource(
      `${env.NEXT_PUBLIC_API_URL}/api/v1/search/analysis/subscribe/${jobId}`
    );

    eventSource.onmessage = event => {
      const data = JSON.parse(event.data);
      if (data.status === 'completed') {
        callbacks.onComplete();
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      callbacks.onError();
      eventSource.close();
    };

    // cleanup 함수 반환
    return () => {
      eventSource.close();
    };
  },
};

export default searchApi;
