"use client";

import { useState } from "react";
import { Header } from "@/components/common/navigation";
import { RandomSearchChips } from "@/components/common/chip";
import { Button } from "@/components/ui";
import { RefreshCw } from "lucide-react";

export default function AboutPage() {
  const [refreshChips, setRefreshChips] = useState(false);

  // 새로고침 트리거 함수
  const triggerRefresh = () => {
    setRefreshChips((prev) => !prev);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-6">
              내돈내산 소개
            </h1>

            <div className="space-y-6">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  내돈내산은 대가를 제공받지 않고 진짜 만족스러운 서비스의
                  후기를 찾아주는 서비스입니다.
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  특정 지역의 맛집, 구매를 원하는 기기 / 물품 등의 후기성
                  포스트를 직접 확인하지 않고 미리 내돈내산 솔직 후기를 구분할
                  수 있습니다.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 dark:bg-emerald-900/30 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-emerald-700 dark:text-emerald-400 mb-3">
                    진정성 있는 리뷰
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    광고나 홍보가 아닌 실제 사용자들의 솔직한 후기만을
                    제공합니다.
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg">
                  <div className="flex items-center mb-3">
                    <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400">
                      이렇게 검색해보세요
                    </h2>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 ml-2 bg-white dark:bg-gray-700 text-blue-500 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-200"
                      onClick={triggerRefresh}
                      aria-label="검색어 새로고침"
                      title="다른 검색어 보기"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <RandomSearchChips
                    count={5}
                    className="mt-2"
                    searchable={true}
                    showRefreshButton={false}
                    key={`search-chips-${refreshChips}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          © 2025 내돈내산. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
