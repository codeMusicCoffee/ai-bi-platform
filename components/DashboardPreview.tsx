'use client';

import {
  SandpackCodeEditor,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { githubLight } from '@codesandbox/sandpack-themes';
import { FileCode, Loader2, Play, RefreshCw } from 'lucide-react';
import { Component, ErrorInfo, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
// 导入进度信息类型
import type { ProgressInfo } from './AiChat';

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

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path.replace(/^\.\//, '')}`;
}

function makeSignature(files: Record<string, string>) {
  const entries = Object.entries(files)
    .map(([p, c]) => [normalizePath(p), c] as const)
    .sort((a, b) => a[0].localeCompare(b[0]));
  return entries.map(([p, c]) => `${p}::${c.length}::${c}`).join('\n@@\n');
}

const SandpackFileSyncer = ({
  externalFiles,
  isLoading,
}: {
  externalFiles: Record<string, string>;
  isLoading?: boolean;
}) => {
  const { sandpack, dispatch } = useSandpack();

  const normalizedFiles = useMemo(() => {
    const out: Record<string, string> = {};
    for (const [path, code] of Object.entries(externalFiles)) {
      out[normalizePath(path)] = code;
    }
    return out;
  }, [externalFiles]);

  const signature = useMemo(() => makeSignature(externalFiles), [externalFiles]);

  const prevSignatureRef = useRef('');
  const prevIsLoadingRef = useRef<boolean>(!!isLoading);

  useEffect(() => {
    const prevLoading = prevIsLoadingRef.current;
    const currLoading = !!isLoading;

    // 先记录最新 loading
    prevIsLoadingRef.current = currLoading;

    // loading 时允许“积累外部变更”，但不写入 sandpack（避免频繁编译）
    if (currLoading) return;

    // 只有在内容真的变了才同步
    if (prevSignatureRef.current === signature) {
      // 但是：如果刚从 loading -> not loading，仍可选择 refresh 一次兜底
      // 这里先不做，避免无意义刷新
      return;
    }

    // 1) 写入变更文件
    const prevFiles = sandpack.files;
    let changed = 0;

    for (const [path, code] of Object.entries(normalizedFiles)) {
      const current = prevFiles?.[path]?.code;
      if (current !== code) {
        sandpack.updateFile(path, code);
        changed++;
      }
    }

    prevSignatureRef.current = signature;

    // 2) 关键：如果这是一次“生成结束”（loading -> false）后的同步，refresh 一次
    // 或者：只要 changed>0 就 refresh
    // 推荐：仅在 loading 边沿触发，避免你手动编辑 code 时每次都重启 iframe
    if (changed > 0 && prevLoading === true && currLoading === false) {
      // debounce 一下，给 updateFile 完成/编译器接收时间
      const t = setTimeout(() => {
        dispatch({ type: 'refresh' });
      }, 150);

      return () => clearTimeout(t);
    }
  }, [signature, isLoading, normalizedFiles, sandpack, dispatch]);

  return null;
};

// 支持多文件 artifact 和进度信息
export default function DashboardPreview({
  files,
  isLoading,
  refreshId,
  isFullScreen,
  progress,
}: {
  files: Record<string, string>;
  isLoading?: boolean;
  refreshId?: number | string;
  isFullScreen?: boolean;
  progress?: ProgressInfo | null;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [refreshKey, setRefreshKey] = useState(0);

  // 🔧 修复：filesKey 需要考虑文件内容变化，而不仅是文件名
  // 否则当 artifact_delta 更新文件内容时，filesKey 不变，sandpackFiles 不会重新计算
  const filesKey = useMemo(() => makeSignature(files ?? {}), [files]);

  const hasFiles = files && Object.keys(files).length > 0;

  // 🔍 调试日志：追踪接收到的文件
  console.log('🖼️ [DashboardPreview] Received props:', {
    fileCount: files ? Object.keys(files).length : 0,
    fileKeys: files ? Object.keys(files) : [],
    isLoading,
    hasFiles,
    filesKey,
  });

  const sandpackFiles = useMemo(() => {
    const defaultFiles: Record<string, string> = {
      // 默认 App.tsx - 仅作为占位符，当后端返回 App.tsx 时会被覆盖
      '/App.tsx': `import React from 'react';
// ⚡️ 性能优化：预加载重型依赖
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
      <div style={{ display: 'none' }}>
        <LineChart width={1} height={1} />
        <Camera />
        <motion.div />
      </div>
    </div>
  ) 
}`,
      '/index.tsx': `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById("root")!);
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
    };

    // 如果有文件传入，合并到 defaultFiles
    if (hasFiles && files) {
      // 将后端返回的文件路径转为 Sandpack 需要的格式
      // 后端返回的路径可能是 "./components/xxx.jsx" 或 "/components/xxx.jsx"
      Object.entries(files).forEach(([path, code]) => {
        // 确保路径以 / 开头
        const normalizedPath = path.startsWith('/') ? path : `/${path.replace(/^\.\//, '')}`;
        defaultFiles[normalizedPath] = code;
      });
    }

    // 🔍 调试日志：最终传递给 Sandpack 的文件
    console.log('🏗️ [DashboardPreview] sandpackFiles computed:', {
      totalFiles: Object.keys(defaultFiles).length,
      fileKeys: Object.keys(defaultFiles),
    });

    return defaultFiles;
  }, [hasFiles, filesKey]);

  const dependencies = {
    react: '18.3.1',
    'react-dom': '18.3.1',
    recharts: '3.6.0',
    'lucide-react': '0.400.0',
    'framer-motion': '11.0.3',
    clsx: '2.1.1',
    'tailwind-merge': '2.5.2',
    'react-is': '18.3.1',
    'date-fns': '3.6.0',
  };
  // 稳定 customSetup 对象
  const customSetup = useMemo(
    () => ({
      // 1. 强制配置 npm 镜像源为淘宝源
      // npmRegistries: [
      //   {
      //     // 移除 enabledScopes，使其全局生效，确保所有包都走镜像源
      //     enabledScopes: [],
      //     limitToScopes: false,
      //     registryUrl: 'https://registry.npmmirror.com/',
      //     proxyEnabled: false,
      //   },
      // ],
      dependencies,
    }),
    []
  );

  const options = useMemo(
    () => ({
      externalResources: ['https://cdn.tailwindcss.com'],
      recompileMode: 'delayed' as const,
      recompileDelay: 500,
      // 使用自定义 bundler URL 可以避免遥测请求（可选）
      // bundlerURL: 'https://sandpack-bundler.codesandbox.io',
    }),
    []
  );
  const [previewKey, setPreviewKey] = useState(0);
  const prevLoadingRef = useRef(!!isLoading);

  useEffect(() => {
    const prev = prevLoadingRef.current;
    const curr = !!isLoading;
    prevLoadingRef.current = curr;

    if (prev === true && curr === false) {
      setPreviewKey((k) => k + 1);
    }
  }, [isLoading, filesKey]);
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
        <ErrorBoundary
          key={`${refreshKey}-${filesKey}`}
          code={Object.values(files).join('\n\n---\n\n')}
        >
          {/*             key={previewKey} */}
          <SandpackProvider
            template="react-ts"
            theme={githubLight}
            files={sandpackFiles}
            customSetup={customSetup}
            options={options}
          >
            {/* ⚡️ 文件同步器：监听外部文件变化，使用官方 Hook 更新 Sandpack 内部状态 */}
            <SandpackFileSyncer externalFiles={files} isLoading={isLoading} />

            {/* 预览视图：始终显示，Loading 只是 Overlay */}
            <div
              className={`w-full h-full absolute inset-0 bg-white ${
                viewMode === 'preview' ? 'z-10' : 'z-0 opacity-0 pointer-events-none'
              }`}
            >
              <SandpackPreview
                showNavigator={false}
                showRefreshButton={true}
                showOpenInCodeSandbox={false}
                style={{ height: '100%' }}
              />

              {/* 统一 Loading 遮罩层：满足用户看到详细进度的需求，同时保持底层 Sandpack 不卸载 */}
              {isLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
                  <p className="text-sm font-medium text-gray-500">
                    AI 正在思考并生成代码...
                    {Object.keys(files).length > 0 && (
                      <span className="ml-2 font-mono text-xs opacity-70">
                        ({Object.keys(files).length} 个文件)
                      </span>
                    )}
                  </p>

                  {progress && progress.total > 0 && (
                    <p className="text-xs text-indigo-500 mt-2 font-medium">
                      正在生成第 {progress.current}/{progress.total} 个组件
                      {progress.component && (
                        <span className="ml-1 text-gray-400">({progress.component})</span>
                      )}
                    </p>
                  )}

                  <p className="text-xs text-gray-400 mt-1">您可以切换到 Code 标签查看实时进度</p>
                </div>
              )}
            </div>

            {/* 代码视图：始终显示编辑器，方便查看流式生成 */}
            <div
              className={`w-full h-full absolute inset-0 bg-white ${
                viewMode === 'code' ? 'z-10' : 'z-0 opacity-0 pointer-events-none'
              }`}
            >
              {isLoading ? (
                // 新实现：显示所有文件内容
                <div className="w-full h-full p-4 overflow-auto font-mono text-sm bg-gray-50 text-gray-800">
                  {Object.entries(files).map(([path, code]) => (
                    <div key={path} className="mb-4">
                      <div className="text-xs text-indigo-600 font-bold mb-1 bg-indigo-50 px-2 py-1 rounded inline-block">
                        {path}
                      </div>
                      <pre className="whitespace-pre-wrap mt-1">{code}</pre>
                    </div>
                  ))}
                  <span className="inline-block w-2 h-4 ml-1 bg-indigo-500 animate-pulse align-middle" />
                </div>
              ) : (
                <SandpackCodeEditor
                  showLineNumbers={true}
                  showTabs={true}
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
