'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  // 스크롤 위치에 따라 버튼 표시 여부 결정
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      variant="outline"
      size="icon"
      className="fixed bottom-20 right-5 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none h-12 w-12"
      aria-label="맨 위로 이동"
    >
      <ArrowUp className="h-6 w-6" />
    </Button>
  );
};
