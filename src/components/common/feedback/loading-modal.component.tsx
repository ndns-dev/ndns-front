'use client';

import { useLoadingMessage } from '@/hooks/use-loading-message.hook';
import React from 'react';

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen }) => {
  const { message: displayMessage, subMessage } = useLoadingMessage(isOpen, { type: 'modal' });

  if (!isOpen) return null;

  // 모달 컨텐츠
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-md w-[90%] sm:w-full flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-gray-700 dark:text-gray-300 text-center font-medium whitespace-pre-line">
          {displayMessage}
        </p>
        {subMessage && (
          <p className="text-gray-600 dark:text-gray-400 text-center text-sm mt-2 whitespace-pre-line">
            {subMessage}
          </p>
        )}
      </div>
    </div>
  );
};
