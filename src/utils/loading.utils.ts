import { useState, useEffect } from "react";

/**
 * 로딩 메시지를 시간에 따라 자동으로 변경해주는 커스텀 훅
 * @param isLoading 로딩 상태
 * @param initialMessage 초기 메시지
 * @param delayedMessage 지연 후 표시할 메시지
 * @param delayMs 메시지 변경까지의 지연 시간 (밀리초)
 * @returns 현재 표시할 로딩 메시지
 */
export const useLoadingMessage = (
  isLoading: boolean,
  initialMessage: string = "로딩 중...",
  delayedMessage: string = "잠시만 기다려주세요...",
  delayMs: number = 1500
): string => {
  const [message, setMessage] = useState<string>(initialMessage);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      // 초기 메시지 설정
      setMessage(initialMessage);

      // 지정된 시간 후 메시지 변경
      timeoutId = setTimeout(() => {
        setMessage(delayedMessage);
      }, delayMs);
    }

    // 컴포넌트 언마운트 또는 로딩 상태 변경 시 타이머 정리
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, initialMessage, delayedMessage, delayMs]);

  return message;
};
