import React, { FormEvent } from 'react';
import { Input, Button } from '@/components/ui';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/utils/class-name.util';

export interface SearchFormProps {
  onSubmit: (e: FormEvent) => void;
  query: string;
  setQuery: (query: string) => void;
  isLoading: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  buttonSize?: 'default' | 'small';
  formRef?: React.RefObject<HTMLFormElement>;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  onSubmit,
  query,
  setQuery,
  isLoading,
  placeholder = '검색어를 입력하세요',
  className = '',
  inputClassName = 'w-full px-4 py-3 pr-12 text-base rounded-full',
  buttonSize = 'small',
  formRef,
}) => {
  // 버튼 사이즈에 따라 클래스와 아이콘 크기 설정
  const buttonClasses = buttonSize === 'default' ? 'h-11 w-11' : 'h-8 w-8';

  const iconSize = buttonSize === 'default' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <form ref={formRef} onSubmit={onSubmit} className={className}>
      <div className="relative">
        <Input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(inputClassName, 'dark:text-white dark:placeholder:text-gray-400')}
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          className={cn(
            'absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
            buttonClasses
          )}
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? (
            <Loader2 className={cn(iconSize, 'animate-spin text-emerald-500')} />
          ) : (
            <Search className={cn(iconSize, 'text-emerald-500')} />
          )}
        </Button>
      </div>
    </form>
  );
};
