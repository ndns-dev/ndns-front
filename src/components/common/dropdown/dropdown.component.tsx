'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  renderOption?: (option: DropdownOption) => React.ReactNode;
  renderTrigger?: (selectedOption: DropdownOption | undefined, isOpen: boolean) => React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = '선택하세요',
  className = '',
  disabled = false,
  renderOption,
  renderTrigger,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    const option = options.find(opt => opt.value === optionValue);
    if (option?.disabled) return;

    onChange(optionValue);
    setIsOpen(false);
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const defaultTrigger = (
    <Button
      variant="outline"
      onClick={() => !disabled && setIsOpen(!isOpen)}
      disabled={disabled}
      className="flex items-center gap-2 h-9 px-3 text-sm"
    >
      <span>{selectedOption?.label || placeholder}</span>
      <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </Button>
  );

  const defaultOptionRenderer = (option: DropdownOption) => (
    <button
      key={option.value}
      onClick={() => handleSelect(option.value)}
      disabled={option.disabled}
      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
        value === option.value
          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
          : option.disabled
          ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          : 'text-gray-700 dark:text-gray-300'
      }`}
    >
      {option.label}
    </button>
  );

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {renderTrigger ? renderTrigger(selectedOption, isOpen) : defaultTrigger}

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
          {options.map(option =>
            renderOption ? renderOption(option) : defaultOptionRenderer(option)
          )}
        </div>
      )}
    </div>
  );
};
