'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui';

export const MenuButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="icon"
        className="flex items-center text-gray-800 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors p-0 h-auto w-auto"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
          <Link
            href="/about"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            기능 소개
          </Link>
          <Link
            href="/contact"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            문의하기
          </Link>
        </div>
      )}
    </div>
  );
};
