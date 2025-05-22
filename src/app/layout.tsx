import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/common/theme';
import { ThemeToggle } from '@/components/common/theme';
import { StateLoader } from '@/components/common/feedback';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '내돈내산 - 협찬 포스트 필터링 서비스',
  description: '네이버 블로그 협찬 리뷰를 필터링하고 실제 내돈내산 리뷰만 찾아보세요',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 min-h-screen`}>
        <ThemeProvider>
          <StateLoader>{children}</StateLoader>
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
