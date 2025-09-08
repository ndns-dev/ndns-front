'use client';

import React, { useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import { useLocationStore } from '@/store/location.store';
import { Button } from '@/components/ui';

interface LocationDisplayProps {
  className?: string;
  showPermissionGuide?: boolean;
}

export const LocationDisplay: React.FC<LocationDisplayProps> = ({
  className = '',
  showPermissionGuide = true,
}) => {
  const { location } = useLocationStore();
  const [showGuide, setShowGuide] = useState(false);

  // 사용자 기기 감지
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (!location) {
    if (!showPermissionGuide) {
      return null;
    }

    return (
      <div className={`flex flex-col gap-2 text-sm text-red-500 ${className}`}>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>위치 정보를 사용할 수 없습니다</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGuide(!showGuide)}
            className="h-auto p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            {showGuide ? '숨기기' : '자세히'}
          </Button>
        </div>

        {showGuide && (
          <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="font-medium mb-2">위치 권한을 허용하려면:</p>

            {/* 기기별 안내 */}
            <div className="mb-3">
              {isMobile ? (
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">📱 모바일:</p>

                  {/* Android */}
                  <div className="mb-2">
                    <p className="font-medium text-gray-600 dark:text-gray-400 mb-1">🤖 Android:</p>
                    <ul className="space-y-1 text-left pl-2">
                      <li>• Chrome: 설정 → 사이트 설정 → 위치 → 허용</li>
                      <li>• Samsung Internet: 설정 → 개인정보 보호 → 위치 → 허용</li>
                    </ul>
                  </div>

                  {/* iOS */}
                  <div className="mb-2">
                    <p className="font-medium text-gray-600 dark:text-gray-400 mb-1">🍎 iOS:</p>
                    <ul className="space-y-1 text-left pl-2">
                      <li>• Safari: 설정 → 개인정보 보호 → 위치 서비스 → 허용</li>
                      <li>• Chrome: 설정 → 사이트 설정 → 위치 → 허용</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">🖥️ 데스크탑:</p>
                  <ul className="space-y-1 text-left">
                    <li>• Chrome: 설정 → 개인정보 보호 → 사이트 설정 → 위치 → 허용</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ${className}`}
    >
      <MapPin className="h-4 w-4" />
      <span>현재 위치: {location.address}</span>
    </div>
  );
};
