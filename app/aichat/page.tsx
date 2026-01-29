'use client';

import { useChatStore } from '@/store/use-chat-store';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import AiChat, { ProgressInfo } from './comp/AiChat';
import DashboardPreview from './comp/DashboardPreview';
import FullScreenToggle from './comp/FullScreenToggle';

export default function AiChatPage() {
  const [userInput, setUserInput] = useState('');
  const [refreshId, setRefreshId] = useState(0);

  // 新实现：解析 URL 参数中的 sessionId 和 artifactId
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get('sessionId');
  const artifactIdParam = searchParams.get('artifactId');
  const setSessionId = useChatStore((state) => state.setSessionId);

  useEffect(() => {
    if (sessionIdParam) {
      console.log('🔗 [page.tsx] session id from url:', sessionIdParam);
      setSessionId(sessionIdParam);
    }
  }, [sessionIdParam, setSessionId]);

  // 新实现：支持多文件 artifact
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string>>({});
  const [streamingFiles, setStreamingFiles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  // 新增：追踪 session 数据是否已获取完成，用于区分"初次进入未加载"和"加载完成但无数据"
  const [hasFetchedSession, setHasFetchedSession] = useState(false);

  const [error, setError] = useState<string>('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  // 新增：组件生成进度信息
  const [progress, setProgress] = useState<ProgressInfo | null>(null);

  // 新实现：双条件逻辑 - 沙箱就绪 + 数据就绪才更新预览
  const [sandpackReady, setSandpackReady] = useState(false);
  // 待渲染的文件（数据已获取但等待沙箱就绪）
  const pendingFilesRef = useRef<Record<string, string> | null>(null);

  // 新实现：当沙箱就绪且有待渲染文件时，执行实际更新
  const flushPendingFiles = useCallback(() => {
    if (sandpackReady && pendingFilesRef.current) {
      console.log('🚀 [page.tsx] 沙箱已就绪，开始渲染 artifact 内容');
      setGeneratedFiles(pendingFilesRef.current);
      setRefreshId((prev) => prev + 1);
      pendingFilesRef.current = null;
    }
  }, [sandpackReady]);

  // 监听 sandpackReady 变化，尝试刷新待渲染文件
  useEffect(() => {
    flushPendingFiles();
  }, [sandpackReady, flushPendingFiles]);

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
            initialArtifactId={artifactIdParam}
            onCodeUpdate={(files) => {
              console.log('📦 [page.tsx] onCodeUpdate received:', {
                fileCount: Object.keys(files).length,
                fileKeys: Object.keys(files),
              });
              // 新实现：流式更新时直接显示（用户主动发起的对话）
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
            // 新增：session 数据获取完成后通知父组件
            onFetchComplete={() => setHasFetchedSession(true)}
            // 新实现：artifact 数据获取完成时，存入待渲染队列
            onArtifactReady={(files) => {
              console.log('📦 [page.tsx] onArtifactReady - 数据已获取，等待沙箱就绪');
              pendingFilesRef.current = files;
              // 如果沙箱已经就绪，立即刷新
              if (sandpackReady) {
                flushPendingFiles();
              }
            }}
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
              // 新实现：只有在「无 sessionId 或已完成加载」且「无文件」时才显示空状态
              // 当有 sessionId 但还未加载完成时，让沙箱显示默认的加载动画，而非空状态
              (!sessionIdParam || hasFetchedSession) &&
              Object.keys(generatedFiles).length === 0 &&
              Object.keys(streamingFiles).length === 0
            }
            // 新增：沙箱加载完成回调
            onSandpackReady={() => {
              console.log('🎉 [page.tsx] 沙箱已就绪');
              setSandpackReady(true);
            }}
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
