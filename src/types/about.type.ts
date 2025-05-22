export const COMPARISON_TYPES = {
  TRADITIONAL: 'traditional',
  NDNS: 'ndns',
} as const;

export type ComparisonType = (typeof COMPARISON_TYPES)[keyof typeof COMPARISON_TYPES];
