"use client";

import { chatService } from "@/services/chat";
import { LayoutDashboard, Loader2, Send, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

// 动态导入组件
const DashboardPreview = dynamic(
  () => import("@/components/DashboardPreview"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full border rounded-xl overflow-hidden shadow-sm flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">加载中...</div>
        </div>
      </div>
    )
  }
);

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [streamingCode, setStreamingCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState("");
  const [error, setError] = useState<string>('');


  const handleTestHealth = async () => {
    setTestStatus('testing');
    setTestMessage("");
    
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



  // 使用 EventSource 方式获取流式数据
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim()) return;
    
    setIsLoading(true);
    setError('');
    setGeneratedCode("");
    setStreamingCode("");
    
    try {
      console.log('🚀 开始调用流式 API');

      const response = await fetch('/api/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/event-stream',
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: userInput
            }
          ],
          provider: "deepseek",
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
              setStreamingCode(accumulatedCode);
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
        console.log('accumulatedCode',accumulatedCode)
        setStreamingCode('');
      }

    } catch (error) {
      console.error('❌ 生成失败:', error);
      setError(error instanceof Error ? error.message : '生成失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      {/* 左侧控制区 */}
      <div className="w-[400px] flex flex-col border-r border-gray-200 bg-white shadow-xl z-20">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-xl font-bold">Generative BI Local</h1>
          </div>
          <p className="text-xs text-gray-400">Powered by Gemini Pro & Sandpack</p>
        </div>

        <div className="flex-1 p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              描述你的需求
            </label>
            <textarea
              className="w-full h-48 p-4 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none outline-none"
              placeholder="例如：帮我画一个物流监控看板，要有深色主题，包含运输地图（散点图）和延迟率趋势..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
          </div>

          <div className="mt-auto space-y-3">
            <form onSubmit={handleGenerate}>
              <button
                type="submit"
                disabled={isLoading || !userInput.trim()}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-xl font-medium transition-all disabled:opacity-50 shadow-lg"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> 生成中...</>
                ) : (
                  <><Send className="w-5 h-5" /> 生成仪表板</>
                )}
              </button>
            </form>
            
            <button
              onClick={handleTestHealth}
              disabled={testStatus === 'testing'}
              className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all text-sm ${
                testStatus === 'success' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : testStatus === 'error'
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
              } disabled:opacity-50`}
            >
              {testStatus === 'testing' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 测试中...</>
              ) : testStatus === 'success' ? (
                <>✅ 连接成功</>
              ) : testStatus === 'error' ? (
                <>❌ 连接失败</>
              ) : (
                <>🔗 测试接口</> 
              )}
            </button>
            
            {testMessage && (
              <div className={`text-xs p-2 rounded-lg ${
                testStatus === 'success' 
                  ? 'bg-green-50 text-green-600 border border-green-200' 
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}>
                {testMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 右侧预览区 */}
      <div className="flex-1 p-6 bg-slate-100 flex flex-col relative overflow-hidden">
        {!generatedCode && !streamingCode && !isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 flex items-center justify-center mx-auto mb-6">
                <LayoutDashboard className="w-10 h-10 opacity-30" />
              </div>
              <h3 className="text-lg font-medium">准备就绪</h3>
              <p className="text-sm">在左侧输入需求，AI 将为你编写并运行 React 代码</p>
            </div>
          </div>
        ) : isLoading && !streamingCode ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-gray-500">AI 正在思考...</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col" style={{ minHeight: 0 }}>
            {/* 显示流式进度 */}
            {isLoading && streamingCode && (
              <div className="mb-2 text-xs text-gray-500 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                代码生成中... ({streamingCode.length} 字符)
              </div>
            )}
            
            {/* 渲染代码预览 - 优先使用完整代码，其次使用流式代码 */}
            <DashboardPreview code={generatedCode || streamingCode} />
          </div>
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