'use client';

import React, { useState, useCallback } from 'react';
import { MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { useLocationStore } from '@/store/location.store';
import { Button } from '@/components/ui';
import { geocoding } from 'korea-sigungu-geocoding';
import { LocationData } from '@/store/location.store';

interface LocationDisplayProps {
  className?: string;
  showPermissionGuide?: boolean;
  showRefreshButton?: boolean;
}

export const LocationDisplay: React.FC<LocationDisplayProps> = ({
  className = '',
  showPermissionGuide = true,
  showRefreshButton = true,
}) => {
  const { location, setLocation } = useLocationStore();
  const [showGuide, setShowGuide] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 사용자 기기 감지
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // korea-sigungu-geocoding을 사용한 주소 변환
  const reverseGeocode = useCallback((lat: number, lng: number): string => {
    try {
      const result = geocoding.geocode(lng, lat); // 경도, 위도 순서

      if (result.sigungu) {
        const { sido_nm, sig_kor_nm } = result.sigungu;
        return `${sido_nm} ${sig_kor_nm}`;
      }

      return '알 수 없는 지역';
    } catch (error) {
      console.error('지역 조회 오류:', error);
      return '지역 조회 실패';
    }
  }, []);

  // 위치 새로고침 함수
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    if (!navigator.geolocation) {
      setIsRefreshing(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude, accuracy } = position.coords;
        const locationData: LocationData = {
          lat: latitude,
          lng: longitude,
          accuracy: accuracy,
        };

        // 주소 조회 (동기적으로 즉시 처리)
        try {
          const address = reverseGeocode(latitude, longitude);

          const finalLocationData = { ...locationData, address };
          setLocation(finalLocationData);
          setIsRefreshing(false);
        } catch (error) {
          console.error('지역 조회 실패:', error);
          const finalLocationData = { ...locationData, address: '지역 조회 실패' };
          setLocation(finalLocationData);
          setIsRefreshing(false);
        }
      },
      error => {
        setIsRefreshing(false);
        console.error('위치 오류:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // 캐시 사용 안함 (새로고침이므로)
      }
    );
  }, [setLocation, reverseGeocode]);

  // 새로고침 중일 때는 로딩 상태 표시
  if (isRefreshing) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}>
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>위치 정보를 새로고침하는 중...</span>
      </div>
    );
  }

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
      {showRefreshButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </div>
  );
};
