import { env } from "@/config/env.schema";

/**
 * API 요청에 사용할 기본 URL
 */
export const API_BASE_URL = "/api/v1";

/**
 * 기본 API 클라이언트 구현
 */

// 명시적으로 지정할 수 없는 API 응답 타입
export type ApiResponse<T = unknown> = T;

/**
 * API 요청 옵션 인터페이스
 */
export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

/**
 * API 에러 타입
 */
export interface ApiError extends Error {
  statusCode?: number;
  data?: unknown;
}

/**
 * API 클라이언트 class
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * API 요청 실행
   * @param path API 경로
   * @param options 요청 옵션
   * @returns 응답 데이터
   */
  private async request<T = unknown>(
    path: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const url = this.createUrl(path, options.params);

    try {
      // 요청 타임아웃 설정
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), options.timeout || 30000);
      const signal = controller.signal;

      const response = await fetch(url, {
        ...options,
        signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...options.headers,
        },
      });
      clearTimeout(id);

      // 요청 실패 시
      if (!response.ok) {
        throw this.handleRequestError(response);
      }

      // 데이터가 없는 경우
      if (response.status === 204) {
        return {} as T;
      }

      // JSON 응답 파싱
      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("요청 시간이 초과되었습니다.");
      }
      throw error;
    }
  }

  /**
   * API 요청 URL 생성
   * @param path API 경로
   * @param params 쿼리 파라미터
   * @returns 완성된 URL
   */
  private createUrl(
    path: string,
    params: Record<string, string | number | boolean | undefined> = {}
  ): string {
    const url = new URL(path, this.baseUrl);

    // 쿼리 파라미터 추가
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });

    return url.toString();
  }

  /**
   * API 에러 처리
   * @param response 에러 응답
   * @returns 에러 객체
   */
  private handleRequestError(response: Response): ApiError {
    const error: ApiError = new Error(
      `${response.status} ${response.statusText}`
    );
    error.statusCode = response.status;

    return error;
  }

  /**
   * GET 요청
   * @param path API 경로
   * @param options 요청 옵션
   * @returns 응답 데이터
   */
  public async get<T = unknown>(
    path: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "GET",
    });
  }

  /**
   * POST 요청
   * @param path API 경로
   * @param body 요청 바디
   * @param options 요청 옵션
   * @returns 응답 데이터
   */
  public async post<T = unknown>(
    path: string,
    body?: unknown,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT 요청
   * @param path API 경로
   * @param body 요청 바디
   * @param options 요청 옵션
   * @returns 응답 데이터
   */
  public async put<T = unknown>(
    path: string,
    body?: unknown,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE 요청
   * @param path API 경로
   * @param options 요청 옵션
   * @returns 응답 데이터
   */
  public async delete<T = unknown>(
    path: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient(env.NEXT_PUBLIC_API_URL + API_BASE_URL);
