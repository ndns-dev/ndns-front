'use client';

import React, { useState } from 'react';
import { MapPin, Info } from 'lucide-react';
import { Button } from '@/components/ui';
import { Dropdown, DropdownOption } from '@/components/common/dropdown';

export type SortOption = 'default' | 'distance';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  hasLocationData: boolean;
  className?: string;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  value,
  onChange,
  hasLocationData,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const options: DropdownOption[] = [
    { value: 'default', label: '기본순' },
    { value: 'distance', label: '거리순', disabled: !hasLocationData },
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* 거리순 선택 시 툴팁 */}
      {value === 'distance' && (
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <Info className="h-4 w-4 text-gray-400" />
          </Button>

          {showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg p-3 shadow-lg z-20">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">거리순 정렬 안내</p>
                  <p className="text-gray-300">
                    현재 위치와 지도상의 직선거리 기준으로 정렬됩니다. 실제 이동거리와는 다를 수
                    있습니다.
                  </p>
                </div>
              </div>
              {/* 화살표 */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
            </div>
          )}
        </div>
      )}

      <Dropdown
        options={options}
        value={value}
        onChange={value => onChange(value as SortOption)}
        className="w-32"
      />
    </div>
  );
};
