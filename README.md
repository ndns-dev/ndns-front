# 내돈내산 - 블로그 협찬 리뷰 필터링 서비스

네이버 블로그에서 협찬 리뷰를 필터링하고 진짜 내돈내산 포스트만 찾아볼 수 있는 서비스입니다.

## 주요 기능

- 검색어 기반 블로그 포스트 검색
- 협찬/내돈내산 포스트 자동 분류
- 직관적인 UI로 협찬 포스트와 내돈내산 포스트 구분
- 검색 결과 페이지네이션
- 다크모드 지원

## 기술 스택

- **프론트엔드**: Next.js 15, React 19, TypeScript
- **상태 관리**: Zustand
- **스타일링**: TailwindCSS 4
- **환경변수 관리**: Zod
- **API 통신**: Fetch API

## 시작하기

로컬 개발 환경에서 프로젝트를 시작하려면:

```bash
# 의존성 설치
npm install
# or
yarn install

# 개발 서버 실행
npm run dev
# or
yarn dev
```

http://localhost:3000 에서 애플리케이션을 확인할 수 있습니다.

## 프로젝트 구조

```
src/
├── apis/           # API 클라이언트 및 인터페이스
├── app/            # Next.js 앱 라우터 페이지
├── components/     # 재사용 가능한 UI 컴포넌트
├── config/         # 환경 변수 및 설정
├── hooks/          # 커스텀 React 훅
├── services/       # 비즈니스 로직 서비스
├── store/          # Zustand 상태 관리
├── types/          # TypeScript 타입 정의
└── utils/          # 유틸리티 함수
```