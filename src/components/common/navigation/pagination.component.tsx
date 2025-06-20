import React from 'react';
import { Button } from '@/components/ui';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // 공통 스타일 정의
  const commonButtonStyles =
    'px-3 py-1 h-9 w-9 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:shadow-md transition-shadow duration-200 disabled:opacity-50 cursor-pointer';

  // 표시할 페이지 번호 (최대 5개)
  const getPageNumbers = () => {
    const pageNumbers = [];
    let startPage: number;
    let endPage: number;

    if (totalPages <= 5) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= 3) {
        startPage = 1;
        endPage = 5;
      } else if (currentPage + 2 >= totalPages) {
        startPage = totalPages - 4;
        endPage = totalPages;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center space-x-1">
      {/* 첫 페이지 버튼 */}
      <Button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        variant="outline"
        size="icon"
        className={commonButtonStyles}
      >
        <span className="sr-only">첫 페이지</span>
        <ChevronsLeft className="h-5 w-5" />
      </Button>

      {/* 이전 페이지 버튼 */}
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outline"
        size="icon"
        className={commonButtonStyles}
      >
        <span className="sr-only">이전 페이지</span>
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {/* 페이지 번호 버튼들 */}
      {pageNumbers.map(number => (
        <Button
          key={number}
          onClick={() => onPageChange(number)}
          variant={currentPage === number ? 'default' : 'outline'}
          className={`px-3 py-1 h-9 min-w-[36px] cursor-pointer ${
            currentPage === number
              ? 'bg-emerald-500 text-white hover:shadow-md transition-shadow duration-200'
              : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-800 hover:shadow-md transition-shadow duration-200'
          }`}
        >
          {number}
        </Button>
      ))}

      {/* 다음 페이지 버튼 */}
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outline"
        size="icon"
        className={commonButtonStyles}
      >
        <span className="sr-only">다음 페이지</span>
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* 마지막 페이지 버튼 */}
      <Button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        variant="outline"
        size="icon"
        className={commonButtonStyles}
      >
        <span className="sr-only">마지막 페이지</span>
        <ChevronsRight className="h-5 w-5" />
      </Button>
    </div>
  );
};
