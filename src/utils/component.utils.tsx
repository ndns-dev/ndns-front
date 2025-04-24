import React from "react";

/**
 * 로딩 인디케이터 컴포넌트
 * @param size 크기 (px)
 * @param className 추가 스타일 클래스
 */
export const LoadingSpinner: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 8, className = "" }) => {
  return (
    <div
      className={`inline-block animate-spin rounded-full border-b-2 border-emerald-500 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    ></div>
  );
};

/**
 * 외부 링크로 이동하는 함수
 * @param url 이동할 URL
 * @param newTab 새 탭에서 열지 여부
 */
export const navigateToExternalUrl = (
  url: string,
  newTab: boolean = true
): void => {
  if (!url) return;

  if (newTab) {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    window.location.href = url;
  }
};
