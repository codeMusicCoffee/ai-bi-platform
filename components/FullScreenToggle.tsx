'use client';

import { Expand, Shrink } from 'lucide-react';

interface FullScreenToggleProps {
  isFullScreen: boolean;
  onToggle: () => void;
  className?: string; // 允许从外部传入定位样式
}

export default function FullScreenToggle({
  isFullScreen,
  onToggle,
  className = '',
}: FullScreenToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center justify-center p-2.5 rounded-full transition-all duration-200 
        bg-white/90 backdrop-blur-sm text-gray-500 hover:text-indigo-600 
        shadow-sm hover:shadow-md border border-gray-200/60 hover:border-indigo-100 
        z-[60] active:scale-95 ${className}`}
      title={isFullScreen ? '退出全屏' : '全屏预览'}
    >
      {isFullScreen ? <Shrink className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
    </button>
  );
}
