'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui';

// 구글 애드센스 타입 선언
declare global {
  interface Window {
    adsbygoogle: { [key: string]: unknown }[];
  }
}

interface AdBannerProps {
  position?: 'inline' | 'sidebar';
  adSlot: string; // 구글 애드센스 광고 단위 ID
}

export const AdBanner: React.FC<AdBannerProps> = ({ position = 'inline', adSlot }) => {
  const [isVisible, setIsVisible] = useState(true);
  const adRef = useRef<HTMLDivElement>(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  // 포지션에 따른 광고 설정 계산
  const adConfig = React.useMemo(() => {
    if (position === 'sidebar') {
      return {
        minWidth: '250px',
        minHeight: '250px',
        adFormat: 'rectangle',
        autoFormat: undefined,
        fullWidthResponsive: false,
      };
    } else {
      // inline 포지션 - 수평형 광고
      return {
        minWidth: '728px',
        minHeight: '320px',
        adFormat: 'horizontal',
        autoFormat: 'rspv',
        fullWidthResponsive: true,
      };
    }
  }, [position]);

  useEffect(() => {
    // 구글 애드센스 스크립트가 로드되었는지 확인
    if (typeof window !== 'undefined' && window.adsbygoogle && adRef.current && !isAdLoaded) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setIsAdLoaded(true);
      } catch (error) {
        console.error('Google AdSense error:', error);
      }
    }
  }, [isAdLoaded]);

  if (!isVisible) return null;

  return (
    <div
      className={`
        bg-gray-100 dark:bg-gray-800
        ${position === 'inline' ? 'w-full py-3 px-4 my-4' : 'w-full p-4 rounded-lg my-3'}
        border border-gray-200 dark:border-gray-700 relative
      `}
    >
      <Button
        onClick={() => setIsVisible(false)}
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
        aria-label="광고 닫기"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="flex flex-col items-center text-center">
        <span className="text-xs text-gray-500 dark:text-gray-400 mb-2">광고</span>

        {/* 구글 애드센스 광고 단위 */}
        <div ref={adRef}>
          <ins
            className="adsbygoogle"
            style={{
              display: 'block',
              minWidth: adConfig.minWidth,
              minHeight: adConfig.minHeight,
            }}
            data-ad-client="ca-pub-1928175513723696"
            data-ad-slot={adSlot}
            data-ad-format={adConfig.adFormat}
            data-full-width-responsive={adConfig.fullWidthResponsive.toString()}
            {...(adConfig.autoFormat && { 'data-auto-format': adConfig.autoFormat })}
          />
        </div>
      </div>
    </div>
  );
};
