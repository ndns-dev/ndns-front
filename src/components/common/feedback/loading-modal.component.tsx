'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  message = '검색 중입니다. 잠시만 기다려주세요.',
}) => {
  const [displayMessage, setDisplayMessage] = useState(message);
  const [subMessage, setSubMessage] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // 초기 메시지 설정
    setDisplayMessage(message);
    setSubMessage('');

    const timer1 = setTimeout(() => {
      setDisplayMessage(prev => (prev === message ? `${message}.` : prev));
    }, 3000);

    const timer2 = setTimeout(() => {
      setDisplayMessage(prev => (prev === `${message}.` ? `${message}..` : prev));
    }, 5000);

    const timer3 = setTimeout(() => {
      setDisplayMessage('혹시 협찬인지 다시 한 번 꼼꼼히 확인하고 있어요.');
    }, 7000);

    const timer4 = setTimeout(() => {
      setSubMessage('거의 다 왔어요. 조금만 더 기다려 주세요.');
    }, 10000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isOpen, message]);

  // 모달이 열려있지 않으면 아무것도 렌더링하지 않음
  if (!isOpen || !isMounted) return null;

  // 모달 컨텐츠
  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black/5 backdrop-blur-[1px] flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-md w-[90%] sm:w-full flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-gray-700 dark:text-gray-300 text-center font-medium">{displayMessage}</p>
        {subMessage && (
          <p className="text-gray-600 dark:text-gray-400 text-center text-sm mt-2">{subMessage}</p>
        )}
      </div>
    </div>
  );

  // document.body에 모달을 포털로 렌더링
  return createPortal(modalContent, document.body);
};
