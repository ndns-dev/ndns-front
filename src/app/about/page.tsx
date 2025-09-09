'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  useEffect(() => {
    // 홈페이지의 기능소개 섹션으로 리다이렉트
    router.replace('/?section=about');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">기능 소개 페이지로 이동 중...</p>
      </div>
    </div>
  );
}
