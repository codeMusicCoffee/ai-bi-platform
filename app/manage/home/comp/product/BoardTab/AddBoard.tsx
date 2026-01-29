'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useChatStore } from '@/store/use-chat-store';
import { AlertCircle, CheckCircle2, ChevronRight, ScrollText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface AddBoardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  lifecycleId?: string;
  moduleConfigIds?: string[]; // 新增：勾选的模块配置ID列表
}

export function AddBoard({
  open,
  onOpenChange,
  productId,
  lifecycleId,
  moduleConfigIds = [],
}: AddBoardProps) {
  const [styleDesc, setStyleDesc] = useState('');
  const [otherDesc, setOtherDesc] = useState('');
  const [status, setStatus] = useState<'editing' | 'processing' | 'completed' | 'error'>('editing');

  // 增强版进度状态
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    text: '准备中...',
    files: [] as { path: string; status: 'generating' | 'success' | 'failed' }[],
    logs: [] as string[],
    summary: '',
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const router = useRouter();

  const scrollRef = useRef<HTMLDivElement>(null);
  const { sessionId } = useChatStore();

  // 自动滚动日志
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [progress.logs]);

  const handleConfirm = async () => {
    // 原逻辑 onOpenChange(false);
    // 新实现 切换为展示进度的组件
    setStatus('processing');
    setProgress({
      current: 0,
      total: 0,
      text: '正在初始化...',
      files: [],
      logs: ['🚀 正在建立数据连接...'],
      summary: '',
    });

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const response = await fetch(
        `${baseUrl}/api/pm/lifecycles/${lifecycleId}/actions/generate-kanban`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({
            style_description: styleDesc,
            extra_description: otherDesc,
            module_config_ids: moduleConfigIds,
            session_id: sessionId || '',
            regenerate: false,
            locale: 'zh-CN',
            debug: false,
          }),
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          let jsonContent = trimmedLine;
          if (trimmedLine.startsWith('data: ')) {
            jsonContent = trimmedLine.slice(6);
          }

          if (jsonContent === '[DONE]') {
            setStatus('completed');
            continue;
          }

          try {
            const parsed = JSON.parse(jsonContent);

            // SSE 数据处理逻辑
            switch (parsed.type) {
              case 'session_id':
                if (parsed.content) {
                  setCurrentSessionId(parsed.content);
                }
                break;

              case 'thinking':
                if (parsed.content) {
                  const logMsg = parsed.content.trim();
                  if (logMsg) {
                    setProgress((prev) => ({
                      ...prev,
                      logs: [...prev.logs, logMsg],
                      text: logMsg.split('\n')[0], // 取第一行作为当前标题
                    }));
                  }
                }
                break;

              case 'progress':
                const pContent =
                  typeof parsed.content === 'string' ? JSON.parse(parsed.content) : parsed.content;
                if (pContent) {
                  setProgress((prev) => {
                    const existingFileIdx = prev.files.findIndex((f) => f.path === pContent.file);
                    let newFiles = [...prev.files];

                    if (pContent.file) {
                      if (existingFileIdx > -1) {
                        newFiles[existingFileIdx] = {
                          ...newFiles[existingFileIdx],
                          status: pContent.status || 'generating',
                        };
                      } else {
                        newFiles.push({
                          path: pContent.file,
                          status: pContent.status || 'generating',
                        });
                      }
                    }

                    return {
                      ...prev,
                      current: pContent.current || prev.current,
                      total: pContent.total || prev.total,
                      files: newFiles,
                    };
                  });
                }
                break;

              case 'artifact_file':
                const fContent =
                  typeof parsed.content === 'string' ? JSON.parse(parsed.content) : parsed.content;
                if (fContent) {
                  setProgress((prev) => ({
                    ...prev,
                    files: prev.files.map((f) =>
                      f.path === fContent.path ? { ...f, status: fContent.status || 'success' } : f
                    ),
                  }));
                }
                break;

              case 'message':
                setProgress((prev) => ({ ...prev, summary: parsed.content || '' }));
                break;

              case 'artifact_end':
                setProgress((prev) => ({ ...prev, current: prev.total, text: '生成任务已完成' }));
                break;
            }
          } catch (e) {
            console.warn('解析流数据失败:', e, jsonContent);
          }
        }
      }

      toast.success('生成完成');
      // 成功后由用户点击关闭或自动延迟关闭
    } catch (error: any) {
      console.error('Failed to generate kanban:', error);
      setStatus('error');
      toast.error('生成失败: ' + error.message);
    }
  };

  const resetAndClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStatus('editing');
      setProgress({
        current: 0,
        total: 0,
        text: '准备中...',
        files: [],
        logs: [],
        summary: '',
      });
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-[800px] p-0 overflow-hidden border-none rounded-[12px] min-h-[400px] flex flex-col">
        <DialogHeader className="px-6 py-4 flex flex-row items-center justify-between border-b border-gray-100">
          <DialogTitle className="text-[16px] font-bold text-gray-800">生成看板</DialogTitle>
        </DialogHeader>

        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          {status === 'editing' ? (
            <div className="w-full space-y-6">
              <div className="space-y-3">
                <label className="text-[14px] font-medium text-gray-800">风格描述：</label>
                <Textarea
                  value={styleDesc}
                  onChange={(e) => setStyleDesc(e.target.value)}
                  placeholder="请输入"
                  className="min-h-[120px] resize-none border-gray-200 focus:border-primary text-[14px]"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[14px] font-medium text-gray-800">其他描述：</label>
                <Textarea
                  value={otherDesc}
                  onChange={(e) => setOtherDesc(e.target.value)}
                  placeholder="请输入"
                  className="min-h-[120px] resize-none border-gray-200 focus:border-primary text-[14px]"
                />
              </div>
            </div>
          ) : (
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
                      </h4>
                      <p className="text-[14px] text-gray-500 flex items-center gap-2">
                        {progress.text || '初始化环境...'}
                        {/* 新增：显示 [current/total] 格式 */}
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
                          // 新实现：只有 total > 0 时才计算进度，否则显示为 0
                          strokeDasharray={`${progress.total > 0 ? Math.round((progress.current / progress.total) * 251.2) : 0}, 251.2`}
                          strokeLinecap="round"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-[16px] font-bold text-primary">
                        {/* 新实现：只有 total > 0 且 current === total 时才显示 100% */}
                        {progress.total > 0
                          ? Math.round((progress.current / progress.total) * 100)
                          : 0}
                        %
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {/* 左侧日志区 */}
                    <div className="col-span-3 flex flex-col bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                      <div className="px-4 py-2 border-b border-gray-100 bg-white flex items-center gap-2">
                        <ScrollText className="w-4 h-4 text-gray-400" />
                        <span className="text-[12px] font-bold text-gray-600">
                          思考过程与执行日志
                        </span>
                      </div>
                      <div
                        ref={scrollRef}
                        className="flex-1 p-4 overflow-y-auto space-y-2 font-mono scrollbar-thin scrollbar-thumb-gray-200"
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
                <div className="flex flex-col items-center text-center animate-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h4 className="text-[20px] font-bold text-gray-800 mb-2">看板生成成功</h4>
                  <div className="max-w-[400px] bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8">
                    <p className="text-[13px] text-gray-600 text-left whitespace-pre-wrap leading-relaxed">
                      {progress.summary ||
                        '看板已根据您的描述成功生成并保存，具体构建细节见执行日志。'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => {
                        // 新实现：在新窗口中打开预览页面
                        if (currentSessionId) {
                          window.open(`/aichat?sessionId=${currentSessionId}`, '_blank');
                        } else {
                          window.open('/aichat', '_blank');
                        }
                      }}
                      className="w-[120px] bg-primary hover:bg-primary/90 text-white shadow-md transition-all active:scale-95"
                    >
                      去预览
                    </Button>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <h4 className="text-[20px] font-bold text-gray-800 mb-2">生成失败</h4>
                  <p className="text-[14px] text-gray-500 mb-8">
                    抱歉，后端处理出现了一些问题，请重试
                  </p>
                  <Button
                    onClick={() => setStatus('editing')}
                    variant="outline"
                    className="w-[120px]"
                  >
                    返回修改
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {status === 'editing' && (
          <DialogFooter className="px-6 py-4 bg-[#F8F9FB] gap-3">
            <Button
              onClick={resetAndClose}
              type="button"
              variant="ghost"
              className="bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              取消
            </Button>
            <Button onClick={handleConfirm} className="text-white shadow-none">
              确定
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
