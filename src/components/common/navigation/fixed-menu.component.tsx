'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home as HomeIcon, Info, Mail } from 'lucide-react';
import { cn } from '@/utils/class-name.util';

export const FixedMenu = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<'home' | 'about' | 'contact'>('home');

  const handleMenuClick = (action: 'home' | 'about' | 'contact') => {
    if (pathname === '/') {
      // 메인페이지에 있으면 스크롤로 이동
      const event = new CustomEvent('scrollToSection', { detail: action });
      window.dispatchEvent(event);
    } else {
      // 다른 페이지에 있으면 메인페이지로 이동 후 스크롤
      router.push(`/?section=${action}`);
    }
  };

  // 스크롤 위치에 따라 활성 섹션 감지
  useEffect(() => {
    const handleScroll = () => {
      if (pathname !== '/') return;

      const homeSection = document.getElementById('home-section');
      const aboutSection = document.getElementById('about-section');
      const contactSection = document.getElementById('contact-section');

      if (!homeSection || !aboutSection || !contactSection) return;

      const scrollPosition = window.scrollY + window.innerHeight / 2;

      const aboutTop = aboutSection.offsetTop;
      const contactTop = contactSection.offsetTop;

      if (scrollPosition < aboutTop) {
        setActiveSection('home');
      } else if (scrollPosition < contactTop) {
        setActiveSection('about');
      } else {
        setActiveSection('contact');
      }
    };

    // URL 파라미터로 초기 섹션 설정
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    if (section === 'about' || section === 'contact') {
      setActiveSection(section);
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 실행

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  const isActive = (sectionName: string) => {
    return activeSection === sectionName;
  };

  return (
    <>
      {/* 데스크톱: 좌측 세로 메뉴 */}
      <div className="hidden md:block fixed top-1/2 left-4 transform -translate-y-1/2 z-50">
        <div className="flex flex-col space-y-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 shadow-lg">
          <button
            onClick={() => handleMenuClick('home')}
            className={cn(
              'p-3 rounded-md transition-colors',
              isActive('home')
                ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
            )}
            title="홈"
          >
            <HomeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleMenuClick('about')}
            className={cn(
              'p-3 rounded-md transition-colors',
              isActive('about')
                ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
            )}
            title="기능 소개"
          >
            <Info className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleMenuClick('contact')}
            className={cn(
              'p-3 rounded-md transition-colors',
              isActive('contact')
                ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
            )}
            title="문의하기"
          >
            <Mail className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 모바일: 하단 가로 메뉴 */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="flex justify-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 shadow-lg">
          <button
            onClick={() => handleMenuClick('home')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-md transition-colors text-sm font-medium',
              isActive('home')
                ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
            )}
          >
            <HomeIcon className="h-4 w-4" />
            <span>홈</span>
          </button>
          <button
            onClick={() => handleMenuClick('about')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-md transition-colors text-sm font-medium',
              isActive('about')
                ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
            )}
          >
            <Info className="h-4 w-4" />
            <span>기능 소개</span>
          </button>
          <button
            onClick={() => handleMenuClick('contact')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-md transition-colors text-sm font-medium',
              isActive('contact')
                ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
            )}
          >
            <Mail className="h-4 w-4" />
            <span>문의하기</span>
          </button>
        </div>
      </div>
    </>
  );
};
