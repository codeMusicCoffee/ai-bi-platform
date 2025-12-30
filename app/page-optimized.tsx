"use client";

import { chatService } from "@/services/chat";
import { LayoutDashboard, Loader2, Send, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useRef } from "react";

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
  const eventSourceRef = useRef<EventSource | null>(null);
  
  // 用于拼接 artifact_code 内容
  const [artifactCodeBuffer, setArtifactCodeBuffer] = useState<string>('');
  const [isCollectingArtifact, setIsCollectingArtifact] = useState(false);

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

  // 提取代码的辅助函数
  const extractCode = (content: string): string => {
    if (!content) return '';
    
    // 尝试匹配代码块
    const codeBlockMatch = content.match(/```(?:jsx?|tsx?|javascript|typescript)?\n([\s\S]*?)(?:\n```|$)/);
    if (codeBlockMatch) {
      return codeBlockMatch[1];
    }
    
    // 如果没有代码块标记，检查是否看起来像 React 代码
    if (content.includes('import') && content.includes('export default')) {
      return content;
    }
    
    // 尝试从内容中提取 React 组件
    const componentMatch = content.match(/(import[\s\S]*?export default[\s\S]*?})/);
    if (componentMatch) {
      return componentMatch[1];
    }
    
    return '';
  };

  // 优化的 EventSource 流式数据处理
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim()) return;
    
    // 关闭之前的连接
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // 重置状态
    setIsLoading(true);
    setError('');
    setGeneratedCode("");
    setStreamingCode("");
    setArtifactCodeBuffer('');
    setIsCollectingArtifact(false);
    
    try {
      const prompt = `${userInput}`;
      console.log('🚀 开始流式生成');

      const requestData = {
        messages: [{ role: "user", content: prompt }],
        provider: "deepseek",
      };

      const response = await fetch('/api/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      await processEventStream(response);

    } catch (error) {
      console.error('❌ 生成失败:', error);
      setError(error instanceof Error ? error.message : '生成失败');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理 EventStream 的核心逻辑
  const processEventStream = async (response: Response) => {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法获取响应流');

    const decoder = new TextDecoder();
    let buffer = '';
    let artifactBuffer = '';
    let regularContent = '';
    let isCollectingArtifactLocal = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ 流读取完成');
          await finalizeContent(artifactBuffer, regularContent);
          break;
        }

        // 解码并处理数据块
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          const result = await processStreamLine(
            trimmedLine, 
            artifactBuffer, 
            regularContent, 
            isCollectingArtifactLocal
          );
          
          if (result) {
            artifactBuffer = result.artifactBuffer;
            regularContent = result.regularContent;
            isCollectingArtifactLocal = result.isCollectingArtifact;
            
            if (result.shouldReturn) return;
          }
        }
      }

      // 处理剩余缓冲区
      if (buffer.trim()) {
        await finalizeContent(artifactBuffer, regularContent + buffer);
      }

    } finally {
      reader.releaseLock();
    }
  };

  // 处理单行流数据
  const processStreamLine = async (
    line: string, 
    currentArtifactBuffer: string, 
    currentRegularContent: string, 
    isCollectingArtifactLocal: boolean
  ) => {
    if (!line.startsWith('data: ')) {
      // 忽略 SSE 元数据行
      if (line.startsWith('event:') || line.startsWith('id:')) return null;
      
      // 处理无前缀的纯文本
      const updatedContent = currentRegularContent + line + '\n';
      updateStreamingDisplay(currentArtifactBuffer, updatedContent, isCollectingArtifactLocal);
      return {
        artifactBuffer: currentArtifactBuffer,
        regularContent: updatedContent,
        isCollectingArtifact: isCollectingArtifactLocal,
        shouldReturn: false
      };
    }

    const data = line.slice(6);
    
    // 处理流结束标记
    if (data === '[DONE]') {
      console.log('🏁 流结束标记');
      await finalizeContent(currentArtifactBuffer, currentRegularContent);
      return { shouldReturn: true };
    }

    try {
      const parsed = JSON.parse(data);
      return await handleParsedData(
        parsed, 
        currentArtifactBuffer, 
        currentRegularContent, 
        isCollectingArtifactLocal
      );
    } catch (parseError) {
      console.warn('⚠️ 解析失败，作为纯文本处理:', data);
      const updatedContent = currentRegularContent + data;
      updateStreamingDisplay(currentArtifactBuffer, updatedContent, isCollectingArtifactLocal);
      return {
        artifactBuffer: currentArtifactBuffer,
        regularContent: updatedContent,
        isCollectingArtifact: isCollectingArtifactLocal,
        shouldReturn: false
      };
    }
  };

  // 处理解析后的数据
  const handleParsedData = async (
    parsed: any, 
    currentArtifactBuffer: string, 
    currentRegularContent: string, 
    isCollectingArtifactLocal: boolean
  ) => {
    // 处理 artifact_code 类型
    if (parsed.type === 'artifact_code') {
      console.log('🎨 收集 artifact_code');
      const codeContent = parsed.content || parsed.text || '';
      const newArtifactBuffer = currentArtifactBuffer + codeContent;
      
      setIsCollectingArtifact(true);
      setArtifactCodeBuffer(newArtifactBuffer);
      updateStreamingDisplay(newArtifactBuffer, currentRegularContent, true);
      
      return {
        artifactBuffer: newArtifactBuffer,
        regularContent: currentRegularContent,
        isCollectingArtifact: true,
        shouldReturn: false
      };
    }

    // 处理 artifact 结束标记
    if (parsed.type === 'artifact_end') {
      console.log('🏁 artifact 收集完成');
      setIsCollectingArtifact(false);
      
      if (currentArtifactBuffer) {
        setGeneratedCode(currentArtifactBuffer);
        setStreamingCode('');
      }
      
      return {
        artifactBuffer: currentArtifactBuffer,
        regularContent: currentRegularContent,
        isCollectingArtifact: false,
        shouldReturn: false
      };
    }

    // 如果正在收集 artifact，忽略其他内容
    if (isCollectingArtifactLocal) {
      return {
        artifactBuffer: currentArtifactBuffer,
        regularContent: currentRegularContent,
        isCollectingArtifact: isCollectingArtifactLocal,
        shouldReturn: false
      };
    }

    // 处理常规响应内容
    const content = extractContentFromParsed(parsed);
    if (content) {
      const updatedContent = currentRegularContent + content;
      updateStreamingDisplay(currentArtifactBuffer, updatedContent, isCollectingArtifactLocal);
      
      return {
        artifactBuffer: currentArtifactBuffer,
        regularContent: updatedContent,
        isCollectingArtifact: isCollectingArtifactLocal,
        shouldReturn: false
      };
    }

    return null;
  };

  // 从解析的数据中提取内容
  const extractContentFromParsed = (parsed: any): string => {
    if (parsed.choices?.[0]?.delta?.content) return parsed.choices[0].delta.content;
    if (parsed.choices?.[0]?.message?.content) return parsed.choices[0].message.content;
    if (parsed.content) return parsed.content;
    if (parsed.text) return parsed.text;
    if (typeof parsed === 'string') return parsed;
    return '';
  };

  // 更新流式显示
  const updateStreamingDisplay = (
    artifactBuffer: string, 
    regularContent: string, 
    isCollectingArtifactLocal: boolean
  ) => {
    if (artifactBuffer) {
      // 优先显示 artifact 代码
      setStreamingCode(artifactBuffer);
    } else if (regularContent) {
      // 尝试从常规内容中提取代码
      const extractedCode = extractCode(regularContent);
      setStreamingCode(extractedCode || regularContent);
    }
  };

  // 完成内容处理
  const finalizeContent = async (artifactBuffer: string, regularContent: string) => {
    if (artifactBuffer) {
      console.log('📋 使用 artifact 代码作为最终结果');
      setGeneratedCode(artifactBuffer);
      setStreamingCode('');
    } else if (regularContent) {
      console.log('📋 从常规内容提取代码');
      const finalCode = extractCode(regularContent);
      if (finalCode) {
        setGeneratedCode(finalCode);
        setStreamingCode('');
      }
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
            {isLoading && (streamingCode || isCollectingArtifact) && (
              <div className="mb-2 text-xs text-gray-500 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                {isCollectingArtifact 
                  ? `收集 artifact 代码中... (${artifactCodeBuffer.length} 字符)`
                  : `代码生成中... (${streamingCode.length} 字符)`
                }
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