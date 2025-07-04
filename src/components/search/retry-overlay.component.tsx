import { RefreshCw } from 'lucide-react';

interface RetryOverlayProps {
  onRetry: () => void;
}

export const RetryOverlay: React.FC<RetryOverlayProps> = ({ onRetry }) => {
  return (
    <div
      className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center cursor-pointer"
      onClick={e => {
        e.stopPropagation();
        onRetry();
      }}
    >
      <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-600 transition-colors">
        <RefreshCw className="w-4 h-4" />
        <span>재시도하기</span>
      </div>
    </div>
  );
};
