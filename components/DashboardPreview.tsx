"use client";

import { SandpackCodeEditor, SandpackPreview, SandpackProvider } from "@codesandbox/sandpack-react";
import { githubLight } from "@codesandbox/sandpack-themes";
import { FileCode, Play } from "lucide-react";
import { useMemo, useState } from "react";


type ViewMode = "preview" | "code";

export default function DashboardPreview({ code }: { code: string }) {
  const [viewMode, setViewMode] = useState<ViewMode>("preview");

  // 使用 useMemo 稳定 files 对象，避免不必要的重新渲染
  const files = useMemo(() => ({
    "/App.js": code || "",
  }), [code]);

  // 稳定 customSetup 对象
  const customSetup = useMemo(() => ({
    dependencies: {
      "recharts": "latest",
      "lucide-react": "latest",
      "clsx": "latest",
      "tailwind-merge": "latest",
      "react-is": "latest", // recharts 的必需依赖
      "tailwindcss": "latest",
      "postcss": "latest",
      "autoprefixer": "latest",
    },
  }), []);

  const options = useMemo(() => ({
    externalResources: ["https://cdn.tailwindcss.com"]
  }), []);

  return (
    <div className="w-full h-full border rounded-xl overflow-hidden shadow-sm flex flex-col bg-white">
      {/* 自定义 Tab 切换按钮 */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setViewMode("preview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            viewMode === "preview"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Play className="w-4 h-4" />
          Preview
        </button>
        <button
          onClick={() => setViewMode("code")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            viewMode === "code"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          <FileCode className="w-4 h-4" />
          Code
        </button>
      </div>

      {/* 内容区域 - 同时渲染两个视图但只显示一个，避免切换时丢失状态 */}
      <div className="flex-1 min-h-0 relative">
        <SandpackProvider
          key={code} // 使用 code 作为 key，确保代码变化时重新创建
          template="react"
          theme={githubLight}
          files={files}
          customSetup={customSetup}
          options={options}
        >
          {/* 同时渲染两个视图，通过绝对定位和 z-index 控制显示 */}
          <div 
            className={`w-full h-full absolute inset-0 ${viewMode === "preview" ? "z-10" : "z-0 pointer-events-none opacity-0"}`}
            style={{ display: viewMode === "preview" ? "block" : "none" }}
          >
            <SandpackPreview
              showNavigator={true}
              showRefreshButton={true}
              style={{ height: "100%" }}
            />
          </div>
          <div 
            className={`w-full h-full absolute inset-0 ${viewMode === "code" ? "z-10" : "z-0 pointer-events-none opacity-0"}`}
            style={{ display: viewMode === "code" ? "block" : "none" }}
          >
            <SandpackCodeEditor
              showLineNumbers={true}
              showTabs={false}
              style={{ height: "100%" }}
            />
          </div>
        </SandpackProvider>
      </div>
    </div>
  );
}

