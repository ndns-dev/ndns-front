'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { geocoding } from 'korea-sigungu-geocoding';
import { useLocationStore, LocationData } from '@/store/location.store';

interface LocationFetcherProps {
  onLocationUpdate?: (location: LocationData | null) => void;
  autoFetch?: boolean;
  onRefreshComplete?: () => void;
  forceRefresh?: boolean;
}

export const LocationFetcher: React.FC<LocationFetcherProps> = ({
  onLocationUpdate,
  autoFetch = true,
  onRefreshComplete,
  forceRefresh = false,
}) => {
  const { location, setLocation } = useLocationStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    setLoading(true);
    setError(null);

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
          setLoading(false);
          onLocationUpdate?.(finalLocationData);
          onRefreshComplete?.();
        } catch (error) {
          console.error('지역 조회 실패:', error);
          const finalLocationData = { ...locationData, address: '지역 조회 실패' };
          setLocation(finalLocationData);
          setLoading(false);
          onLocationUpdate?.(finalLocationData);
          onRefreshComplete?.();
        }
      },
      error => {
        let errorMessage = '위치 정보를 가져올 수 없습니다.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 권한이 거부되었습니다.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 요청 시간이 초과되었습니다.';
            break;
          default:
            errorMessage = '알 수 없는 위치 오류가 발생했습니다.';
        }

        setError(errorMessage);
        setLoading(false);
        setLocation(null);
        onLocationUpdate?.(null);
        onRefreshComplete?.();

        console.error('위치 오류:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5분간 캐시
      }
    );
  }, [setLocation, onLocationUpdate, reverseGeocode]);

  // 자동으로 위치 정보 가져오기
  useEffect(() => {
    if (forceRefresh) {
      // 강제 새로고침인 경우 즉시 실행
      getCurrentLocation();
    } else if (autoFetch && !location && !loading && !error) {
      // 일반적인 자동 가져오기
      getCurrentLocation();
    }
  }, [autoFetch, location, loading, error, getCurrentLocation, forceRefresh]);

  // 이 컴포넌트는 UI를 렌더링하지 않음 (백그라운드에서 위치 수집만)
  return null;
};
