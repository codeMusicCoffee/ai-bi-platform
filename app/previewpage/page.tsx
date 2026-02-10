"use client";

import { ManageHeader } from "@/app/manage/_components/ManageHeader";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/use-chat-store";
import { FileCode, Maximize2, Minimize2, Play, RefreshCw, Save } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import AiChat, { ProgressInfo } from "./comp/AiChat";
import DashboardPreview from "./comp/DashboardPreview";

import { Suspense } from "react";

function AiChatPageContent() {
  const [userInput, setUserInput] = useState("");
  const [refreshId, setRefreshId] = useState(0);
  const [manualRefreshId, setManualRefreshId] = useState(0);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");

  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get("sessionId");
  const artifactIdParam = searchParams.get("artifactId");
  const [boardName, setBoardName] = useState("");
  const setSessionId = useChatStore((state) => state.setSessionId);

  useEffect(() => {
    if (sessionIdParam) {
      const cachedName = localStorage.getItem(`preview_name_${sessionIdParam}`);
      if (cachedName) {
        setBoardName(cachedName);
      }
    }
  }, [sessionIdParam]);

  useEffect(() => {
    if (sessionIdParam) {
      console.log("🔗 [page.tsx] session id from url:", sessionIdParam);
      setSessionId(sessionIdParam);
    }
  }, [sessionIdParam, setSessionId]);

  // 新实现：支持多文件 artifact
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string>>(
    {},
  );
  const [streamingFiles, setStreamingFiles] = useState<Record<string, string>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  // 新增：追踪 session 数据是否已获取完成，用于区分"初次进入未加载"和"加载完成但无数据"
  const [hasFetchedSession, setHasFetchedSession] = useState(false);

  const [error, setError] = useState<string>("");
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
      console.log("🚀 [page.tsx] 沙箱已就绪，开始渲染 artifact 内容");
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
    <div className="flex flex-col h-screen bg-[#F1F3F6] overflow-hidden font-sans text-slate-800">
      {/* 1. 头部组件 */}
      {!isFullScreen && <ManageHeader />}

      <main className="flex-1 flex flex-col overflow-hidden px-5 pb-5 pt-0 gap-0 relative">
        {/* 2. 看板标题区域 (仅非全屏显示) */}
        {!isFullScreen && (
          <div className="h-16 shrink-0 flex items-center justify-between px-6 bg-white rounded-[12px] shadow-sm">
            <div className="flex items-center gap-2">
              {/* <div
                className="p-1 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                onClick={() => window.history.back()}
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </div> */}
              <h2 className="text-[16px] font-bold text-gray-800">
                {boardName || ""}
              </h2>
            </div>
            <div className="flex items-center gap-6">
              {/* 新增：预览/代码切换按钮和刷新按钮 */}
              <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("preview")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium transition-all rounded-md cursor-pointer",
                    viewMode === "preview"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => setViewMode("code")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium transition-all rounded-md cursor-pointer",
                    viewMode === "code"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Code</span>
                </button>
              </div>

              <button
                className="flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                onClick={() => setManualRefreshId((prev) => prev + 1)}
                title="刷新预览"
              >
                <RefreshCw className="w-4 h-4" />
                <span>刷新预览</span>
              </button>

              <button
                className="flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-primary transition-colors cursor-pointer"
                onClick={() => setIsFullScreen(!isFullScreen)}
              >
                <Maximize2 className="w-4 h-4" />
                <span>全屏</span>
              </button>
              <button className="flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-primary transition-colors cursor-pointer">
                <Save className="w-4 h-4" />
                <span>保存</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. 下方内容区域：左右排列 */}
        <div
          className={cn(
            "flex flex-1 overflow-hidden gap-[20px]",
            isFullScreen && "p-0 gap-0",
          )}
        >
          {/* 左侧：代码预览区 */}
          <div
            className={cn(
              "flex-1 flex flex-col min-w-0 transition-all duration-300 mt-4",
              viewMode === "code" ? "w-full" : "relative",
              isFullScreen && "mt-0",
            )}
          >
            <div
              className={cn(
                "flex-1 bg-white rounded-[12px] shadow-sm overflow-hidden relative",
                isFullScreen && "rounded-0 shadow-none fixed inset-0 z-60",
              )}
            >
              <DashboardPreview
                files={
                  Object.keys(generatedFiles).length > 0
                    ? generatedFiles
                    : streamingFiles
                }
                isLoading={isLoading || isChatLoading}
                refreshId={refreshId}
                onRefresh={() => setManualRefreshId((prev) => prev + 1)}
                isFullScreen={isFullScreen}
                progress={progress}
                viewMode={viewMode}
                setViewMode={setViewMode}
                chatInit={
                  (!sessionIdParam || hasFetchedSession) &&
                  Object.keys(generatedFiles).length === 0 &&
                  Object.keys(streamingFiles).length === 0
                }
                onSandpackReady={() => {
                  console.log("🎉 [page.tsx] 沙箱已就绪");
                  setSandpackReady(true);
                }}
              />

              {/* 全屏退出按钮 (仅全屏时显示) */}
              {isFullScreen && (
                <button
                  className="absolute top-8 right-8 z-70 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all cursor-pointer"
                  onClick={() => setIsFullScreen(false)}
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* 右侧：聊天区 (仅非全屏显示) */}
          {!isFullScreen && (
            <div className="w-[376px] shrink-0 overflow-hidden flex flex-col border-none">
              <AiChat
                initialArtifactId={artifactIdParam}
                onCodeUpdate={(files) => {
                  setStreamingFiles(files);
                }}
                onCodeEnd={() => {
                  setStreamingFiles({});
                  setRefreshId((prev) => prev + 1);
                }}
                onStatusChange={(loading) => setIsChatLoading(loading)}
                onProgressUpdate={(p) => setProgress(p)}
                onFetchComplete={() => setHasFetchedSession(true)}
                onArtifactReady={(files) => {
                  pendingFilesRef.current = files;
                  if (sandpackReady) {
                    flushPendingFiles();
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="absolute top-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-2 rounded-lg shadow-lg z-100">
            <span className="text-sm font-medium">生成失败: {error}</span>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AiChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen flex-col items-center justify-center gap-3 bg-[#F1F3F6]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-[#306EFD]" />
          <span className="text-sm font-medium text-blue-600">Loading...</span>
        </div>
      }
    >
      <AiChatPageContent />
    </Suspense>
  );
}
