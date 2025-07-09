/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['blogfiles.naver.net', 'postfiles.pstatic.net'],
  },

  // API 타임아웃 설정
  serverRuntimeConfig: {
    // 서버 측에서만 사용 가능한 설정
  },
  publicRuntimeConfig: {
    // 클라이언트와 서버 모두에서 사용 가능한 설정
    apiTimeout: 60000, // 60초
  },

  // 실험적 기능
  experimental: {
    proxyTimeout: 60000,
  },
};

module.exports = nextConfig;
