"use client";

import { Header } from "@/components/common/header.component";
import Link from "next/link";

export default function SponsorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-6">
              내돈내산 후원하기
            </h1>
            
            <div className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300">
                내돈내산은 사용자들이 진정한 소비자 리뷰를 찾을 수 있도록 도와주는 무료 서비스입니다. 
                서비스 운영과 개발을 지속하기 위해 여러분의 후원이 큰 힘이 됩니다.
              </p>
              
              <div className="bg-emerald-50 dark:bg-emerald-900/30 p-6 rounded-lg border border-emerald-100 dark:border-emerald-800">
                <h2 className="text-xl font-semibold text-emerald-700 dark:text-emerald-400 mb-4">
                  후원 방법
                </h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-gray-700 rounded-md shadow-sm">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">계좌 이체</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      신한은행: 110-123-456789 (예금주: 내돈내산)
                    </p>
                  </div>
                  
                  <div className="p-4 bg-white dark:bg-gray-700 rounded-md shadow-sm">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">정기 후원</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      매월 정기적으로 후원하고 싶으신 분들은 아래 버튼을 통해 등록해 주세요.
                    </p>
                    <button 
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded text-sm transition-colors"
                      onClick={() => window.open('mailto:ndns.dev@gmail.com?subject=정기후원%20문의')}
                    >
                      정기 후원 문의하기
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border border-blue-100 dark:border-blue-800 mt-8">
                <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-4">
                  광고 및 제휴 문의
                </h2>
                
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  내돈내산 서비스에 광고를 게재하거나 제휴를 맺고 싶으신 기업 및 개인은 아래 이메일로 문의해 주세요.
                </p>
                
                <div className="bg-white dark:bg-gray-700 p-3 rounded-md inline-block">
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    ndns.dev@gmail.com
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
                <p className="text-gray-600 dark:text-gray-400">
                  여러분의 소중한 후원 덕분에 더 나은 서비스를 제공할 수 있습니다. 감사합니다.
                </p>
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