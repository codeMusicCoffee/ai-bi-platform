import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, ChevronRight, Loader2, ScrollText } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface BoardGenerationProgressProps {
  status: 'processing' | 'completed' | 'error';
  progress: {
    current: number;
    total: number;
    text: string;
    files: {
      path: string;
      status: 'generating' | 'success' | 'failed';
    }[];
    logs: string[];
    summary: string;
  };
  currentSessionId: string | null;
  titleName: string;
  onRetry: () => void;
}

export function BoardGenerationProgress({
  status,
  progress,
  currentSessionId,
  titleName,
  onRetry,
}: BoardGenerationProgressProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动日志
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [progress.logs]);

  return (
    <div className="flex-1 p-6 flex flex-col items-center justify-center">
      <div className="w-full h-full flex flex-col animate-in fade-in duration-500">
        {status === 'processing' && (
          <div className="flex flex-col h-full">
            {/* 顶部总体进度 */}
            <div className="flex items-center justify-between mb-8 px-4">
              <div className="flex flex-col">
                  <h4 className="text-[20px] font-bold text-gray-800">
                    正在生成看板
                    <span>
                      {' '}
                      {progress.total > 0 && (
                        <span className="text-primary font-medium">
                          [{progress.current}/{progress.total}]
                        </span>
                      )}
                    </span>
                    <Loader2 className="inline-block w-4 h-4 ml-2 text-primary animate-spin align-middle" />
                  </h4>
                <p className="text-[14px] text-gray-500 flex items-center gap-2">
                  {progress.text || '初始化环境...'}
                </p>
              </div>
              <div className="relative w-20 h-20">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-100 stroke-current"
                    strokeWidth="8"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-primary stroke-current transition-all duration-500 ease-out"
                    strokeWidth="8"
                    strokeDasharray={`${progress.total > 0 ? Math.round((Math.max(0, progress.current - 1) / progress.total) * 251.2) : 0}, 251.2`}
                    strokeLinecap="round"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[16px] font-bold text-primary">
                  {progress.total > 0
                    ? Math.round((Math.max(0, progress.current - 1) / progress.total) * 100)
                    : 0}
                  %
                </div>
              </div>
            </div>

            <div className="overflow-hidden">
              {/* 左侧日志区 */}
              <div className="h-[360px] flex flex-col bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-2 border-b border-gray-100 bg-white flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-gray-400" />
                  <span className="text-[12px] font-bold text-gray-600">思考过程与执行日志</span>
                </div>
                <div
                  ref={scrollRef}
                  className="flex-1 p-4 overflow-auto space-y-2 font-mono scrollbar-thin scrollbar-thumb-gray-200"
                >
                  {progress.logs.map((log, i) => (
                    <div
                      key={i}
                      className="text-[12px] text-gray-600 flex items-start gap-2 animate-in slide-in-from-left-2 fade-in duration-300"
                    >
                      <ChevronRight className="w-3 h-3 mt-1 text-gray-300 flex-none" />
                      <span className="leading-relaxed">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {status === 'completed' && (
          <div className="flex flex-col items-center text-center animate-in zoom-in duration-500 py-8">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h4 className="text-[20px] font-bold text-gray-800 mb-2">看板生成成功</h4>
            <div className="max-w-[400px] bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8">
              <p className="text-[13px] text-gray-600 text-left whitespace-pre-wrap leading-relaxed">
                {progress.summary || '看板已根据您的描述成功生成并保存，具体构建细节见执行日志。'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  if (currentSessionId) {
                    localStorage.setItem(`preview_name_${currentSessionId}`, titleName);
                    window.open(`/previewpage?sessionId=${currentSessionId}`, '_blank');
                  } else {
                    window.open('/previewpage', '_blank');
                  }
                }}
                className="w-[120px] bg-primary hover:bg-primary/90 text-white shadow-md transition-all active:scale-95 cursor-pointer"
              >
                去预览
              </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h4 className="text-[20px] font-bold text-gray-800 mb-2">生成失败</h4>
            <p className="text-[14px] text-gray-500 mb-8">抱歉，后端处理出现了一些问题，请重试</p>
            <Button onClick={onRetry} variant="outline" className="w-[120px] cursor-pointer">
              返回修改
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
