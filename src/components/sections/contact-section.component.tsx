'use client';

import { forwardRef } from 'react';
import { Mail } from 'lucide-react';

export const ContactSection = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section id="contact-section" ref={ref} className="px-4 py-16 min-h-screen flex items-center">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">
            문의하기
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            내돈내산 서비스에 관한 문의, 제안, 피드백은 아래 이메일로 보내주세요.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm text-center">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 mb-6">
              <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                제안해주시는 내용이 반영될 경우 스타벅스 기프티콘을 드립니다.
              </p>
            </div>

            <a
              href="mailto:ndns.dev@gmail.com"
              className="inline-flex items-center gap-2 text-xl text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              <Mail className="h-5 w-5" />
              ndns.dev@gmail.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});

ContactSection.displayName = 'ContactSection';
