'use client';

import { SandpackCodeEditor, SandpackPreview, SandpackProvider } from '@codesandbox/sandpack-react';
import { githubLight } from '@codesandbox/sandpack-themes';
import { FileCode, Loader2, Play, RefreshCw } from 'lucide-react';
import { Component, ErrorInfo, ReactNode, useEffect, useMemo, useState } from 'react';

// 简单的错误边界组件
class ErrorBoundary extends Component<
  { children: ReactNode; code: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; code: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 避免在严格模式下修改 readonly 属性导致的二次报错
    console.error('Sandpack Error Caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col bg-red-50 p-4 overflow-hidden relative">
          <div className="flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100 max-w-md w-full">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4 mx-auto">
                <Loader2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">组件渲染遇到问题</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {this.state.error?.message || '生成的代码可能包含语法错误'}
              </p>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium mb-3"
              >
                <RefreshCw className="w-4 h-4" />
                尝试重新加载
              </button>
              <p className="text-xs text-gray-400">您可以在下方查看或复制原始代码</p>
            </div>
          </div>

          {/* 降级显示原始代码 */}
          <div className="flex-1 mt-4 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-inner relative opacity-75 grayscale">
            <pre className="w-full h-full p-4 text-xs font-mono text-gray-600 overflow-auto whitespace-pre-wrap">
              {this.props.code}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

type ViewMode = 'preview' | 'code';

export default function DashboardPreview({
  code,
  isLoading,
  refreshId,
  isFullScreen,
}: {
  code: string;
  isLoading?: boolean;
  refreshId?: number | string;
  isFullScreen?: boolean;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [refreshKey, setRefreshKey] = useState(0);

  // 🔒 1. Sandpack 失败自动重建
  const [retryKey, setRetryKey] = useState(0);

  // 当 loading 结束时，强制刷新一次沙箱
  // 3 秒还没出来，直接重建
  useEffect(() => {
    if (!isLoading) {
      // ⚡️ 优化：移除 200ms 的延迟刷新，防止与 refreshId 导致的重置发生冲突（避免二次重绘）。
      // 父组件传入的 refreshId 变化已经触发了 ErrorBoundary 的 Key 变化，足以重置沙箱。

      // 3 秒还没出来，直接重建作为兜底
      const t = setTimeout(() => {
        setRetryKey((k) => k + 1);
      }, 3000);

      return () => {
        clearTimeout(t);
      };
    }
  }, [isLoading]);

  // ⚡️ 性能极致优化：
  // 在 loading 期间，无论 code 怎么变，我们都希望 files 对象的引用保持完全不变。
  // 这样 Sandpack 就绝对不会感知到任何变化，彻底避免重渲染或编译尝试。
  const effectiveCode = !isLoading && code ? code : null;

  // 使用 useMemo 稳定 files 对象
  const files = useMemo(
    () => ({
      '/App.js':
        effectiveCode ||
        `import React from 'react';
import { createRoot } from 'react-dom/client';
// ⚡️ 性能优化：预加载重型依赖
// 即使在 Loading 状态，也导入这些包，强制 Sandpack 开始下载依赖
// 这样当 AI 代码生成完毕时，依赖可能已经准备好了
import { LineChart, BarChart, PieChart, AreaChart } from 'recharts';
import { Camera, Home, Settings, User, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as dateFns from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function App() { 
  return (
    <div className="h-full flex flex-col items-center justify-center text-gray-400 animate-pulse gap-3">
      <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      <p className="font-medium">正在准备开发环境...</p>
      <div className="text-xs opacity-50">预加载依赖库中</div>
      
      {/* 隐式引用，防止 Tree-shaking (虽然 Dev 模式通常不 Shake，但保险起见) */}
      <div style={{ display: 'none' }}>
        <LineChart width={1} height={1} />
        <Camera />
        <motion.div />
      </div>
    </div>
  ) 
}`,
      '/index.js': `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
      '/public/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
      '/styles.css': `
html, body, #root {
  height: 100%;
  margin: 0;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
`,
    }),
    [effectiveCode]
  );

  const dependencies = {
    react: '18.3.1',
    'react-dom': '18.3.1',
    recharts: '2.12.7',
    'lucide-react': '0.400.0',
    'framer-motion': '11.0.3',
    clsx: '2.1.1',
    'tailwind-merge': '2.5.2',
    'react-is': '18.3.1',
    'date-fns': 'latest',
  };
  // 稳定 customSetup 对象
  const customSetup = useMemo(
    () => ({
      // 1. 强制配置 npm 镜像源为淘宝源
      npmRegistries: [
        {
          // 移除 enabledScopes，使其全局生效，确保所有包都走镜像源
          // @ts-ignore: Sandpack 类型定义可能是旧版或不准确，兼容性处理
          enabledScopes: [],
          limitToScopes: false,
          registryUrl: 'https://registry.npmmirror.com/',
          proxyEnabled: false,
        },
      ],
      dependencies,
    }),
    []
  );

  const options = useMemo(
    () => ({
      externalResources: ['https://cdn.tailwindcss.com'],
      // 关键：禁用统计
      enableAnalytics: false,
      recompileMode: 'delayed' as const,
      recompileDelay: 500,
    }),
    []
  );

  return (
    <div
      className={`w-full h-full border rounded-xl overflow-hidden shadow-sm flex flex-col bg-white transition-all duration-300 ${
        isFullScreen ? 'fixed inset-0 z-50 border-0 rounded-none' : ''
      }`}
    >
      {/* 自定义 Tab 切换按钮 - 全屏模式下隐藏 */}
      {!isFullScreen && (
        <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              viewMode === 'preview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Play className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              viewMode === 'code'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Code
          </button>

          {/* 强制刷新按钮 - 给右侧的全屏按钮留出位置 (mr-12) */}
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="ml-auto mr-12 flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all text-sm border border-transparent hover:border-gray-200"
            title="强制重新加载预览"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">刷新预览</span>
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0 relative">
        <ErrorBoundary key={`${refreshKey}-${retryKey}`} code={code}>
          <SandpackProvider
            template="react"
            theme={githubLight}
            files={files}
            customSetup={customSetup}
            options={options}
          >
            {/* 预览视图：加载中显示 Loading，加载完显示 Preview */}
            <div
              className={`w-full h-full absolute inset-0 bg-white ${
                viewMode === 'preview' ? 'z-10' : 'z-0 opacity-0 pointer-events-none'
              }`}
            >
              {isLoading ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
                  <p className="text-sm font-medium text-gray-500">
                    AI 正在思考并生成代码...
                    {code && (
                      <span className="ml-2 font-mono text-xs opacity-70">
                        ({code.length} 字符)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">您可以切换到 Code 标签查看实时进度</p>
                </div>
              ) : (
                <SandpackPreview
                  showNavigator={false}
                  showRefreshButton={true}
                  showOpenInCodeSandbox={false}
                  style={{ height: '100%' }}
                />
              )}
            </div>

            {/* 代码视图：始终显示编辑器，方便查看流式生成 */}
            <div
              className={`w-full h-full absolute inset-0 bg-white ${
                viewMode === 'code' ? 'z-10' : 'z-0 opacity-0 pointer-events-none'
              }`}
            >
              {isLoading ? (
                // Loading 时显示原生 pre 以展示流式文本，避免 Sandpack 编译错误
                <pre className="w-full h-full p-4 overflow-auto font-mono text-sm bg-gray-50 text-gray-800 whitespace-pre-wrap">
                  {code}
                  <span className="inline-block w-2 h-4 ml-1 bg-indigo-500 animate-pulse align-middle" />
                </pre>
              ) : (
                <SandpackCodeEditor
                  showLineNumbers={true}
                  showTabs={false}
                  showInlineErrors={true}
                  wrapContent={true}
                  style={{ height: '100%' }}
                  readOnly={false}
                />
              )}
            </div>
          </SandpackProvider>
        </ErrorBoundary>
      </div>
    </div>
  );
}
