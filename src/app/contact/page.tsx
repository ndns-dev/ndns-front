'use client';

import { Header, Footer } from '@/components/common/navigation';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-6">
              문의하기
            </h1>

            <div className="space-y-8">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  문의 및 피드백
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  내돈내산 서비스에 관한 문의, 제안, 피드백은 아래 이메일로 보내주세요.
                  <br />
                  <br />
                  제안해주시는 내용이 반영될 경우 스타벅스 기프티콘을 드립니다.
                </p>
                <button
                  className="bg-white dark:bg-gray-700 p-3 rounded-md inline-block 
                    hover:bg-gray-100 dark:hover:bg-gray-600 
                    transition-colors duration-200 cursor-pointer"
                  onClick={() => window.open('mailto:ndns.dev@gmail.com')}
                >
                  <p className="font-medium text-gray-800 dark:text-gray-200">ndns.dev@gmail.com</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
