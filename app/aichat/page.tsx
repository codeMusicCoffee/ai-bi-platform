'use client';

import AiChat, { ProgressInfo } from '@/components/AiChat';
import DashboardPreview from '@/components/DashboardPreview';
import FullScreenToggle from '@/components/FullScreenToggle';
import { useState } from 'react';

export default function AiChatPage() {
  const [userInput, setUserInput] = useState('');
  const [refreshId, setRefreshId] = useState(0);

  // 新实现：支持多文件 artifact
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string>>({});
  const [streamingFiles, setStreamingFiles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [error, setError] = useState<string>('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  // 新增：组件生成进度信息
  const [progress, setProgress] = useState<ProgressInfo | null>(null);

  return (
    <main className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      {/* 左侧控制区 - 全屏时隐藏 */}
      <div
        className={`w-[400px] flex flex-col border-r border-gray-200 bg-white shadow-xl z-20 transition-all duration-300 ${
          isFullScreen ? 'hidden' : ''
        }`}
      >
        <div className="h-full w-full">
          <AiChat
            onCodeUpdate={(files) => {
              console.log('📦 [page.tsx] onCodeUpdate received:', {
                fileCount: Object.keys(files).length,
                fileKeys: Object.keys(files),
              });
              setGeneratedFiles(files);
              setStreamingFiles(files);
            }}
            onCodeEnd={() => {
              setStreamingFiles({});
              // 🔧 关键修复：代码生成完成后，增加 refreshId 触发 DashboardPreview 刷新
              setRefreshId((prev) => prev + 1);
              console.log('📦 [page.tsx] onCodeEnd - incrementing refreshId');
            }}
            onStatusChange={(loading) => setIsChatLoading(loading)}
            onProgressUpdate={(p) => setProgress(p)}
          />
        </div>
      </div>

      {/* 右侧预览区 */}
      <div className="flex-1 p-6 bg-slate-100 flex flex-col relative overflow-hidden">
        <div className="w-full h-full flex flex-col" style={{ minHeight: 0 }}>
          {/* 渲染代码预览 - 始终挂载，内部处理空状态 */}
          <DashboardPreview
            files={Object.keys(generatedFiles).length > 0 ? generatedFiles : streamingFiles}
            isLoading={isLoading || isChatLoading}
            refreshId={refreshId}
            isFullScreen={isFullScreen}
            progress={progress}
            chatInit={
              Object.keys(generatedFiles).length === 0 && Object.keys(streamingFiles).length === 0
            }
          />
        </div>

        <FullScreenToggle
          isFullScreen={isFullScreen}
          onToggle={() => setIsFullScreen(!isFullScreen)}
          className="absolute top-9 right-12"
        />

        {/* 错误提示 */}
        {error && (
          <div className="absolute top-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">生成失败: {error}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
