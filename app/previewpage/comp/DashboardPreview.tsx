'use client';

import {
  SandpackCodeEditor,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { githubLight } from '@codesandbox/sandpack-themes';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
// 导入进度信息类型
import type { ProgressInfo } from './AiChat';

// 新实现：监听沙箱加载完成的内部组件
function SandpackReadyListener({ onReady }: { onReady?: () => void }) {
  const { listen } = useSandpack();
  const hasTriggered = useRef(false);

  useEffect(() => {
    const stopListening = listen((msg) => {
      // 当 bundler 完成编译并渲染时触发
      if (msg.type === 'done' && !hasTriggered.current) {
        hasTriggered.current = true;
        console.log('🎉 [SandpackReadyListener] 沙箱加载完成');
        onReady?.();
      }
    });

    return () => stopListening();
  }, [listen, onReady]);

  return null;
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

// 支持多文件 artifact 和进度信息
export default function DashboardPreview({
  files,
  isLoading,
  refreshId,
  isFullScreen,
  progress,
  chatInit,
  onSandpackReady,
  viewMode = 'preview',
  setViewMode,
  onRefresh,
}: {
  files: Record<string, string>;
  isLoading?: boolean;
  refreshId?: number | string;
  isFullScreen?: boolean;
  progress?: ProgressInfo | null;
  chatInit?: boolean;
  // 新增：沙箱加载完成时的回调
  onSandpackReady?: () => void;
  viewMode?: ViewMode;
  setViewMode?: (mode: ViewMode) => void;
  onRefresh?: () => void;
}) {
  // 🔧 修复：filesKey 需要考虑文件内容变化，而不仅是文件名
  // 否则当 artifact_delta 更新文件内容时，filesKey 不变，sandpackFiles 不会重新计算
  const filesKey = useMemo(() => makeSignature(files ?? {}), [files]);

  const hasFiles = files && Object.keys(files).length > 0;

  // 还原正常的 sandpackFiles 逻辑
  const sandpackFiles = useMemo(() => {
    const defaultFiles: Record<string, string> = {
      '/App.tsx': `import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export default function App() { 
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#fafafa] text-slate-900 p-6 font-sans overflow-hidden">
      <div className="relative max-w-sm w-full">
        {/* 背景装饰光晕 */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-50 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-50 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-pulse delay-700" />
        
        <div className="relative bg-white/70 backdrop-blur-2xl p-12 rounded-[3rem] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] text-center">
          <div className="relative inline-flex mb-10">
            {/* 优雅的旋转光环 */}
            <div className="absolute inset-[-12px] border-[3px] border-slate-100 rounded-full" />
            <div className="absolute inset-[-12px] border-[3px] border-transparent border-t-indigo-600 rounded-full animate-[spin_1.2s_cubic-bezier(0.76,0,0.24,1)_infinite]" />
            
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-200 ring-8 ring-indigo-50">
              <Sparkles className="text-white w-12 h-12 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">
            沙箱环境就绪中
          </h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
            正在为您配置实时预览沙箱<br/>
            准备 UI 核心依赖与渲染引擎
          </p>
          
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-slate-900 rounded-2xl shadow-lg ring-1 ring-white/20">
             <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-600 border-t-white animate-spin" />
             <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/90">Initializing</span>
          </div>
        </div>
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
    <title>Preview</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
    };

    if (hasFiles && files) {
      Object.entries(files).forEach(([path, code]) => {
        const normalizedPath = path.startsWith('/') ? path : `/${path.replace(/^\.\//, '')}`;
        defaultFiles[normalizedPath] = code;
      });
    }
    // 🔍 调试日志：确认 sandpackFiles 是否正确包含了新文件
    console.log('🔍 [DashboardPreview] sandpackFiles computed:', {
      hasFiles,
      inputFileKeys: Object.keys(files ?? {}),
      outputFileKeys: Object.keys(defaultFiles),
      hasAppTsxOverride: files && Object.keys(files).includes('/App.tsx'),
    });
    return defaultFiles;
  }, [hasFiles, filesKey, files]);

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
      npmRegistries: [
        {
          // 移除 enabledScopes，使其全局生效，确保所有包都走镜像源
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
      recompileMode: 'delayed' as const,
      recompileDelay: 500,
      // 使用自定义 bundler URL 可以避免遥测请求（可选）
      // bundlerURL: 'https://sandpack-bundler.codesandbox.io',
    }),
    []
  );
  const [previewKey, setPreviewKey] = useState(0);
  const prevLoadingRef = useRef(!!isLoading);
  const prevRefreshIdRef = useRef(refreshId);

  useEffect(() => {
    const prev = prevLoadingRef.current;
    const curr = !!isLoading;
    prevLoadingRef.current = curr;

    if (prev === true && curr === false) {
      setPreviewKey((k) => k + 1);
    }
  }, [isLoading, filesKey]);

  // 🔧 关键修复：监听 refreshId 变化，触发 SandpackProvider 重新挂载
  useEffect(() => {
    // 跳过首次渲染（当前值与 ref 相同说明是首次）
    if (prevRefreshIdRef.current === refreshId) {
      return;
    }

    // 新实现：只要 refreshId 变化就触发刷新（包括从 0→1）
    // 原条件 `prevRefreshIdRef.current !== 0` 导致首次加载数据后不触发刷新
    console.log('🔄 [DashboardPreview] refreshId changed, incrementing previewKey');
    console.log('  - Previous refreshId:', prevRefreshIdRef.current);
    console.log('  - Current refreshId:', refreshId);
    setPreviewKey((k) => k + 1);

    prevRefreshIdRef.current = refreshId;
  }, [refreshId]);

  // 暴露给外部的刷新接口
  useEffect(() => {
    if (onRefresh) {
      setPreviewKey((k) => k + 1);
    }
  }, [onRefresh]);

  return (
    <div
      className={`w-full h-full border rounded-xl overflow-hidden shadow-sm flex flex-col bg-white transition-all duration-300 ${
        isFullScreen ? 'fixed inset-0 z-50 border-0 rounded-none' : ''
      }`}
    >
      <div className="flex-1 min-h-0 relative">
        {/* 关键修复：key 使用 previewKey、hasFiles 和文件数量的组合，确保文件变化时沙箱重新挂载 */}
        <SandpackProvider
          template="react-ts"
          theme={githubLight}
          files={sandpackFiles}
          customSetup={customSetup}
          options={options}
        >
          {/* 新增：监听沙箱加载完成事件 */}
          <SandpackReadyListener onReady={onSandpackReady} />

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

            {/* 新实现：暂时注释空状态遮罩层，无 sessionId 时直接展示沙箱默认预览页面
            {chatInit && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white">
                <DashboardEmptyState />
              </div>
            )}
            */}

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
      </div>
    </div>
  );
}
