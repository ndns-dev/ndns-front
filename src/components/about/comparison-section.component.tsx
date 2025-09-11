'use client';

import React from 'react';
import { X, Check } from 'lucide-react';
import { FeaturePoint } from './feature-point.component';
import { COMPARISON_TYPES, ComparisonType } from '@/types/about.type';

interface ComparisonSectionProps {
  type: ComparisonType;
  className?: string;
}

export const ComparisonSection: React.FC<ComparisonSectionProps> = ({ type, className = '' }) => {
  const isTraditional = type === COMPARISON_TYPES.TRADITIONAL;

  const features = isTraditional
    ? [
        {
          title: '협찬인지 실제 후기인지 구분이 어려움',
          description: '협찬 및 광고성 포스트와 진짜 후기를 일일이 확인해야 함',
        },
        {
          title: '많은 시간이 소요됨',
          description: '실제 사용 경험자의 후기를 찾으려면 많은 블로그 방문 필요',
        },
        {
          title: '구매 결정이 어려움',
          description: '광고성 콘텐츠로 인해 객관적인 판단이 어려움',
        },
      ]
    : [
        {
          title: '신뢰성 있는 후기',
          description: 'AI를 통해 분석하여 보다 정교하게 실제 사용자의 솔직한 후기를 분류',
        },
        {
          title: '시간 절약',
          description: '협찬 여부를 바로 확인하여 시간 절약',
        },
        {
          title: '현명한 소비 결정',
          description: '협찬을 걸러내고 사용자의 솔직한 후기를 확인하여 더 나은 구매 결정 가능',
        },
      ];

  return (
    <div
      className={`bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md p-8 relative comparison-card ${className}`}
    >
      <div
        className={`absolute top-4 right-4 ${isTraditional ? 'text-red-400' : 'text-emerald-400'}`}
      >
        {isTraditional ? <X size={24} /> : <Check size={24} />}
      </div>
      <h1
        className={`text-2xl font-bold ${
          isTraditional
            ? 'text-gray-800 dark:text-gray-100'
            : 'text-emerald-600 dark:text-emerald-400'
        } mb-8`}
      >
        {isTraditional ? '기존 검색 방식' : '내돈내산 검색'}
      </h1>

      <div className="space-y-6">
        {features.map((feature, index) => (
          <FeaturePoint
            key={index}
            icon={isTraditional ? <X size={18} /> : <Check size={18} />}
            iconClassName={
              isTraditional
                ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500'
            }
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </div>
  );
};
