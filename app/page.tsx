'use client';

import AiChat from '@/components/AiChat';
import DashboardPreview from '@/components/DashboardPreview';
import FullScreenToggle from '@/components/FullScreenToggle';
import { chatService } from '@/services/chat';
import { LayoutDashboard } from 'lucide-react';
import { useRef, useState } from 'react';

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

  // 使用 ref 来防止重复提交，因为 state 更新可能是异步的
  const isSubmittingRef = useRef(false);

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
