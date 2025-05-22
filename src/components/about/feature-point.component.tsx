'use client';

import React, { ReactNode } from 'react';

interface FeaturePointProps {
  icon: ReactNode;
  iconClassName: string;
  title: string;
  description: string;
}

export const FeaturePoint: React.FC<FeaturePointProps> = ({
  icon,
  iconClassName,
  title,
  description,
}) => {
  return (
    <div className="flex items-start space-x-4">
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${iconClassName}`}
      >
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
      </div>
    </div>
  );
};
