'use client';

import AiChat from '@/components/AiChat';
import FullScreenToggle from '@/components/FullScreenToggle';
import { chatService } from '@/services/chat';
import { LayoutDashboard, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';

// 动态导入组件
const DashboardPreview = dynamic(() => import('@/components/DashboardPreview'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full border rounded-xl overflow-hidden shadow-sm flex flex-col bg-white">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    </div>
  ),
});

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [refreshId, setRefreshId] = useState(0);
  const [generatedCode, setGeneratedCode] = useState('');
  const [streamingCode, setStreamingCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [error, setError] = useState<string>('');
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleTestHealth = async () => {
    setTestStatus('testing');
    setTestMessage('');
    try {
      const response = await chatService.testHealth();
      console.log('Health check response:', response);
      setTestStatus('success');
      setTestMessage('后端连接成功！');
    } catch (error) {
      console.error('Health check failed:', error);
      setTestStatus('error');
      setTestMessage(error instanceof Error ? error.message : '连接失败');
    }
  };

  // 自动下载 JSON 文件的辅助方法
  const downloadJson = (data: any, filename: string) => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      // 触发下载
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('下载文件失败:', e);
    }
  };

  // 使用 ref 来防止重复提交，因为 state 更新可能是异步的
  const isSubmittingRef = useRef(false);

  // 使用 EventSource 方式获取流式数据
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userInput.trim() || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsLoading(true);
    setError('');
    setGeneratedCode('');
    setStreamingCode('');

    try {
      console.log('🚀 开始调用流式 API');
      // const backendUrl = 'http://localhost:8000'; //、、||process.env.NEXT_PUBLIC_BACKEND_URL
      const backendUrl = 'http://192.168.151.201:8000'; //、、||process.env.NEXT_PUBLIC_BACKEND_URL
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: userInput,
            },
          ],
          provider: 'deepseek',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedCode = '';

      let isFinished = false;
      let lastUpdateTime = 0;

      while (!isFinished) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();

          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          const data = trimmedLine.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);

            // 按照需求：拼接 type 为 artifact_code 的内容
            if (parsed.type === 'artifact_code') {
              const content = parsed.content || parsed.text || '';
              accumulatedCode += content;

              // 节流更新：每 100ms 更新一次 UI，避免 "Maximum update depth exceeded"
              const now = Date.now();
              if (now - lastUpdateTime > 100) {
                setStreamingCode(accumulatedCode);
                lastUpdateTime = now;
              }
            } else if (parsed.type === 'artifact_end') {
              // 检测到结束标记，停止读取
              isFinished = true;
              break;
            }
          } catch (e) {
            console.warn('解析响应出错:', e);
          }
        }
      }

      if (accumulatedCode) {
        setGeneratedCode(accumulatedCode);
        console.log('accumulatedCode length:', accumulatedCode.length);
        setStreamingCode('');
        // 生成完成，强制给 Preview 一个新 ID
        setRefreshId((prev) => prev + 1);
      }
    } catch (error) {
      console.error('❌ 生成失败:', error);
      setError(error instanceof Error ? error.message : '生成失败');
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

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
            onCodeUpdate={(code) => {
              setGeneratedCode(code);
              setStreamingCode(code);
            }}
            onCodeEnd={() => {
              setStreamingCode('');
              setRefreshId((prev) => prev + 1);
            }}
            onStatusChange={(loading) => setIsChatLoading(loading)}
          />
        </div>
      </div>

      {/* 右侧预览区 */}
      <div className="flex-1 p-6 bg-slate-100 flex flex-col relative overflow-hidden">
        {!generatedCode && !streamingCode && !isLoading && !isChatLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 flex items-center justify-center mx-auto mb-6">
                <LayoutDashboard className="w-10 h-10 opacity-30" />
              </div>
              <h3 className="text-lg font-medium">准备就绪</h3>
              <p className="text-sm">在左侧输入需求，AI 将为你编写并运行 React 代码</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col" style={{ minHeight: 0 }}>
            {/* 显示流式进度 */}
            {(isLoading || isChatLoading) && streamingCode && (
              <div className="mb-2 text-xs text-gray-500 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                代码生成中... ({streamingCode.length} 字符)
              </div>
            )}

            {/* 渲染代码预览 - 优先使用完整代码，其次使用流式代码 */}
            <DashboardPreview
              code={generatedCode || streamingCode}
              isLoading={isLoading || isChatLoading}
              refreshId={refreshId}
              isFullScreen={isFullScreen}
            />
          </div>
        )}

        {/* 全屏切换按钮 - 仅在有内容时显示 */}
        {(generatedCode || streamingCode || isLoading || isChatLoading) && (
          <FullScreenToggle
            isFullScreen={isFullScreen}
            onToggle={() => setIsFullScreen(!isFullScreen)}
            className="absolute top-9 right-12"
          />
        )}

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
