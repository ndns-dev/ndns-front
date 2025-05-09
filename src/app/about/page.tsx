"use client";

import { Header } from "@/components/common/header.component";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-6">
              문의하기
            </h1>
            
            <div className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300">
                내돈내산 서비스에 관한 문의, 제안, 피드백은 아래 이메일로 보내주세요.
              </p>
              
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <p className="font-medium text-lg text-gray-800 dark:text-gray-200">
                  ndns.dev@gmail.com
                </p>
              </div>
              
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  문의 시 포함해 주세요
                </h2>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                  <li>문의 유형 (기능 제안, 오류 신고, 협업 제안 등)</li>
                  <li>사용 환경 (기기, 브라우저 등)</li>
                  <li>자세한 내용 및 필요시 스크린샷</li>
                </ul>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
                <p className="text-gray-600 dark:text-gray-400">
                  빠른 시일 내에 답변 드리겠습니다. 감사합니다.
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