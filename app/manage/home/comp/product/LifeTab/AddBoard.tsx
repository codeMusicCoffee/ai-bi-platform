'use client';

import { SealedForm, SealedFormFieldConfig } from '@/components/common/SealedForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { API_BASE_URL } from '@/constants';
import { useChatStore } from '@/store/use-chat-store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';
import { BoardGenerationProgress } from '../BoardTab/BoardGenerationProgress';

const generateSchema = z.object({
  name: z.string().min(1, '请输入看板名称'),
  style_description: z.string().optional(),
  extra_description: z.string().optional(),
});

type GenerateFormValues = z.infer<typeof generateSchema>;

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
  const [status, setStatus] = useState<'editing' | 'processing' | 'completed' | 'error'>('editing');
  const [titleName, setTitleName] = useState('');

  // 增强版进度状态
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    text: '准备中...',
    files: [] as {
      path: string;
      status: 'generating' | 'success' | 'failed';
    }[],
    logs: [] as string[],
    summary: '',
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const router = useRouter();

  const { sessionId } = useChatStore();

  // 新实现：保存表单数据，以便返回修改时回显
  const [formValues, setFormValues] = useState<GenerateFormValues>({
    name: '',
    style_description: '',
    extra_description: '',
  });

  const handleConfirm = async (values: GenerateFormValues) => {
    // 新实现：保存当前输入的值
    setFormValues(values);
    setTitleName(values.name || '');
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
      const baseUrl = API_BASE_URL;
      const response = await fetch(
        `${baseUrl}/api/pm/lifecycles/${lifecycleId}/actions/generate-kanban`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({
            name: values.name,
            style_description: values.style_description,
            extra_description: values.extra_description,
            node_dataset_ids: moduleConfigIds,
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
                setProgress((prev) => ({
                  ...prev,
                  summary: parsed.content || '',
                }));
                break;

              case 'artifact_end':
                setProgress((prev) => ({
                  ...prev,
                  current: prev.total,
                  text: '生成任务已完成',
                }));
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
      setTitleName('');
      // 新实现：重置表单数据
      setFormValues({
        name: '',
        style_description: '',
        extra_description: '',
      });
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

  const formFields: SealedFormFieldConfig<GenerateFormValues>[] = [
    {
      name: 'name',
      label: '看板名称',
      placeholder: '请输入看板名称',
      required: true,
      render: (field) => (
        <Textarea
          {...field}
          placeholder="请输入看板名称"
          className="min-h-[40px] h-[40px] resize-none border-gray-200 focus:border-primary text-[14px]"
        />
      ),
    },
    {
      name: 'style_description',
      label: '风格描述',
      placeholder: '请输入风格描述',
      render: (field) => (
        <Textarea
          {...field}
          placeholder="请输入风格描述"
          className="min-h-[120px] resize-none border-gray-200 focus:border-primary text-[14px]"
        />
      ),
    },
    {
      name: 'extra_description',
      label: '其他描述',
      placeholder: '请输入其他需求描述',
      render: (field) => (
        <Textarea
          {...field}
          placeholder="请输入其他需求描述"
          className="min-h-[120px] resize-none border-gray-200 focus:border-primary text-[14px]"
        />
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-[800px] p-0 overflow-hidden border-none rounded-[12px] min-h-[400px] flex flex-col">
        <DialogHeader className="px-6 py-4 flex flex-row items-center justify-between border-b border-gray-100">
          <DialogTitle className="text-[16px] font-bold text-gray-800">生成看板</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {status === 'editing' ? (
            <SealedForm
              schema={generateSchema}
              fields={formFields}
              onSubmit={handleConfirm}
              defaultValues={formValues}
              className="flex-1 flex flex-col h-full"
            >
              {({ fields }) => (
                <>
                  <div className="flex-1 p-8 overflow-y-auto">{fields}</div>
                  <DialogFooter className="px-8 py-4 gap-3 shrink-0">
                    <Button
                      onClick={resetAndClose}
                      type="button"
                      variant="ghost"
                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer"
                    >
                      取消
                    </Button>
                    <Button type="submit" className="text-white shadow-none cursor-pointer">
                      确定
                    </Button>
                  </DialogFooter>
                </>
              )}
            </SealedForm>
          ) : (
            <BoardGenerationProgress
              status={status as any}
              progress={progress}
              currentSessionId={currentSessionId}
              titleName={titleName}
              onRetry={() => setStatus('editing')}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
