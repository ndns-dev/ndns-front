import { z } from "zod";

/**
 * 서버 및 브라우저 환경에서 사용할 환경 변수 유효성 검사 스키마
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  NEXT_PUBLIC_API_URL: z.string().url(),
});

/**
 * 유효성이 검증된 환경 변수
 */
export const env = {
  // Node 환경
  NODE_ENV: process.env.NODE_ENV || "development",

  // API URL
  NEXT_PUBLIC_API_URL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:8000"
      : process.env.NEXT_PUBLIC_API_URL,

  // 유틸리티 프로퍼티
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_TEST: process.env.NODE_ENV === "test",
};

// 환경 변수 유효성 검사 시도
try {
  envSchema.parse(env);
} catch (error) {
  if (error instanceof z.ZodError) {
    throw new Error(
      `❌ 환경 변수 유효성 검사 오류: ${JSON.stringify(error.errors, null, 2)}`
    );
  }
}
