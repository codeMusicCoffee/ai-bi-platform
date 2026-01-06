'use client';

import { Expand, Shrink } from 'lucide-react';
import { useCallback, useEffect } from 'react';

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
  // 处理全屏逻辑
  const handleToggle = useCallback(async () => {
    try {
      if (!isFullScreen) {
        // 进入全屏
        await document.documentElement.requestFullscreen();
      } else {
        // 退出全屏
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error('全屏切换失败:', err);
    } finally {
      // 无论原生全屏是否成功，都切换 UI 状态
      onToggle();
    }
  }, [isFullScreen, onToggle]);

  // 监听原生全屏变化（例如用户按 ESC 退出），保持状态同步
  useEffect(() => {
    const handleFullScreenChange = () => {
      // 如果当前没有全屏元素，但 React 状态认为是全屏 -> 说明用户按了 ESC 退出 -> 需要同步状态
      if (!document.fullscreenElement && isFullScreen) {
        onToggle();
      }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [isFullScreen, onToggle]);

  return (
    <button
      onClick={handleToggle}
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
