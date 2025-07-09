import { apiClient } from './base.api';
import { AnalysisMessage, AnalysisResult, SearchApiResponse } from '@/types/search.type';
import { env } from '@/config/env.schema';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { SseType } from '@/types/sse.type';
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
    console.log('[SSE] 토큰 - 검색 요청:', { query: params.query, requestId, sseToken });
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
    onUpdate: (result: AnalysisResult) => void
  ): (() => void) | undefined => {
    console.log('[SSE] 토큰 - 분석 요청1:', { requestId, sseToken });

    const url = `${process.env.NEXT_PUBLIC_API_URL}/external/stream?reqId=${requestId}`;

    try {
      const eventSource = new EventSourcePolyfill(url, {
        headers: {
          Authorization: `Bearer ${sseToken}`,
        },
        withCredentials: true,
      });

      let isConnected = false;
      console.log('[SSE] 연결 시도:', {
        requestId,
        url,
        timestamp: new Date().toISOString(),
        readyState: eventSource.readyState, // CONNECTING: 0, OPEN: 1, CLOSED: 2
      });

      const connectionTimeout = setTimeout(() => {
        if (!isConnected) {
          console.error('[SSE] 연결 타임아웃 - 연결 상태:', {
            requestId,
            url,
            readyState: eventSource.readyState,
            timestamp: new Date().toISOString(),
            eventSource: {
              url: eventSource.url,
              withCredentials: eventSource.withCredentials,
              readyState: eventSource.readyState,
            },
          });
          eventSource.close();
        }
      }, 10000);

      eventSource.onopen = () => {
        isConnected = true;
        clearTimeout(connectionTimeout);
        console.log('[SSE] 연결 성공 - 상태:', {
          requestId,
          url,
          readyState: eventSource.readyState,
          timestamp: new Date().toISOString(),
          eventSource: {
            url: eventSource.url,
            withCredentials: eventSource.withCredentials,
            readyState: eventSource.readyState,
          },
        });
      };

      eventSource.onmessage = event => {
        try {
          const data: AnalysisMessage = JSON.parse(event.data);
          const type = event.type as SseType;

          console.log('[SSE] Parsed message:', data);

          if (type === SseType.CONNECTED) {
            console.log('[SSE] 서버 연결 확인:', {
              requestId,
              result: data.result,
              timestamp: new Date().toISOString(),
            });
          } else if (type === SseType.MESSAGE) {
            try {
              console.log('[SSE] 분석 완료:', data.result);
              const result = JSON.parse(data.result as unknown as string) as AnalysisResult;
              onUpdate(result);
            } catch (parseError) {
              console.error('[SSE] 분석 결과 파싱 오류:', {
                requestId,
                error: parseError,
                rawPost: data.result,
                timestamp: new Date().toISOString(),
              });
            }
          }
        } catch (error) {
          console.error('[SSE] 메시지 파싱 오류:', {
            requestId,
            error,
            rawData: event.data,
            timestamp: new Date().toISOString(),
          });
        }
      };

      eventSource.onerror = error => {
        const errorInfo = {
          requestId,
          readyState: eventSource.readyState,
          isConnected,
          url,
          timestamp: new Date().toISOString(),
          error:
            error instanceof Error
              ? {
                  name: error.name,
                  message: error.message,
                  stack: error.stack,
                }
              : error,
        };

        console.error('[SSE] 연결 오류:', errorInfo);

        if (eventSource.readyState === EventSource.CLOSED) {
          isConnected = false;
          clearTimeout(connectionTimeout);
          console.log('[SSE] 연결 종료됨:', {
            requestId,
            timestamp: new Date().toISOString(),
          });
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
