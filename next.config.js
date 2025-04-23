/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: ["blogfiles.naver.net", "postfiles.pstatic.net"],
  },

  // API 타임아웃 설정
  serverRuntimeConfig: {
    // 서버 측에서만 사용 가능한 설정
  },
  publicRuntimeConfig: {
    // 클라이언트와 서버 모두에서 사용 가능한 설정
    apiTimeout: 60000, // 60초
  },

  // 개발 환경에서 API 프록시 설정
  async rewrites() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/v1/:path*",
          destination: "http://127.0.0.1:8000/api/v1/:path*",
          basePath: false,
        },
      ];
    }
    return [];
  },

  // 실험적 기능
  experimental: {
    proxyTimeout: 60000,
  },
};

module.exports = nextConfig;
