'use client';

import { SealedForm, SealedFormFieldConfig } from '@/components/common/SealedForm';
import { SealedTable, SealedTableColumn } from '@/components/common/SealedTable';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { pmService } from '@/services/pm';
import { useChatStore } from '@/store/use-chat-store';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';
import { BoardGenerationProgress } from './BoardTab/BoardGenerationProgress';

const homePageSchema = z.object({
  name: z.string().min(1, '请输入首页名称'),
  style_description: z.string().optional(),
  extra_description: z.string().optional(),
});

type HomePageFormValues = z.infer<typeof homePageSchema>;

interface ChartItem {
  id: string;
  dataset: string;
  name: string;
  chartType: string;
  description: string;
  metric: number;
}

interface NodeGroup {
  id: string;
  name: string;
  items?: ChartItem[];
}

interface AddHomePageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
}

export function AddHomePage({ open, onOpenChange, productId }: AddHomePageProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState<'editing' | 'processing' | 'completed' | 'error'>('editing');

  // 进度状态
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    text: '准备中...',
    files: [] as { path: string; status: 'generating' | 'success' | 'failed' }[],
    logs: [] as string[],
    summary: '',
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { sessionId } = useChatStore();

  const [nodes, setNodes] = useState<NodeGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setStep(1);
      setStatus('editing');
      setSelectedRowKeys([]);
      setCurrentSessionId(null);
      setProgress({
        current: 0,
        total: 0,
        text: '准备中...',
        files: [],
        logs: [],
        summary: '',
      });
    }

    if (open && productId) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const res = await pmService.getLifecycleKanbanTree(productId);
          if (res?.data?.items) {
            const mappedNodes: NodeGroup[] = res.data.items.map((item: any) => ({
              id: item.id,
              name: item.name,
              items: (item.node_datasets || []).map((kb: any) => ({
                id: kb.id,
                dataset: kb.dataset_id,
                name: kb.module_name,
                chartType: kb.chart_style,
                description: kb.description || '',
                metric: kb.dataset_fields?.length || 0,
              })),
            }));
            setNodes(mappedNodes);
            // 默认展开所有节点
            setExpandedRowKeys(mappedNodes.map((n) => n.id));
          }
        } catch (error) {
          console.error('Failed to fetch lifecycle kanban tree:', error);
          toast.error('获取列表数据失败');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [open, productId]);

  const handleNext = () => {
    if (selectedRowKeys.length === 0) {
      toast.warning('先勾选看板模块');
      return;
    }
    setStep(2);
  };

  const handlePrev = () => {
    setStep(1);
  };

  const handleConfirm = async (values: HomePageFormValues) => {
    // 从 selectedRowKeys 中分离生命周期ID和数据集ID
    const lifecycle_ids = nodes
      .filter((node) => selectedRowKeys.includes(node.id))
      .map((node) => node.id);

    const node_dataset_ids = nodes
      .flatMap((node) => node.items || [])
      .filter((item) => selectedRowKeys.includes(item.id))
      .map((item) => item.id);

    setStatus('processing');
    setProgress({
      current: 0,
      total: 0,
      text: '正在初始化...',
      files: [],
      logs: ['🚀 正在同步站点配置...'],
      summary: '',
    });

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const response = await fetch(
        `${baseUrl}/api/pm/products/${productId}/actions/generate-overall-kanban`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({
            name: values.name,
            lifecycle_ids,
            node_dataset_ids,
            style_description: values.style_description,
            extra_description: values.extra_description,
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

            switch (parsed.type) {
              case 'session_id':
                if (parsed.content) setCurrentSessionId(parsed.content);
                break;
              case 'thinking':
                if (parsed.content) {
                  const logMsg = parsed.content.trim();
                  if (logMsg) {
                    setProgress((prev) => ({
                      ...prev,
                      logs: [...prev.logs, logMsg],
                      text: logMsg.split('\n')[0],
                    }));
                  }
                }
                break;
              case 'progress':
                const pContent =
                  typeof parsed.content === 'string' ? JSON.parse(parsed.content) : parsed.content;
                if (pContent) {
                  setProgress((prev) => ({
                    ...prev,
                    current: pContent.current || prev.current,
                    total: pContent.total || prev.total,
                  }));
                }
                break;
              case 'message':
                setProgress((prev) => ({ ...prev, summary: parsed.content || '' }));
                break;
              case 'artifact_end':
                setProgress((prev) => ({ ...prev, current: prev.total, text: '首页生成已完成' }));
                break;
            }
          } catch (e) {
            console.warn('解析流数据失败:', e, jsonContent);
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to generate overall kanban:', error);
      setStatus('error');
      toast.error('生成失败: ' + error.message);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setStatus('editing');
      setSelectedRowKeys([]);
      setCurrentSessionId(null);
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

  const columns: SealedTableColumn<any>[] = [
    {
      title: '名称',
      key: 'name_display',
      width: '180px',
      render: (_, record) => {
        // 如果有 items 说明是节点行，否则是子项
        return <span className="font-medium">{record.items ? record.name : record.dataset}</span>;
      },
    },
    {
      title: '名称',
      key: 'input_name',
      required: true,
      render: (_, record) => {
        if (record.items) return null; // 节点行不显示表单
        if (record.name) {
          return <span className="text-gray-600 px-1">{record.name}</span>;
        }
        return (
          <Input
            placeholder="请输入"
            className="h-8 text-[13px] border-gray-200 focus:border-primary"
          />
        );
      },
    },

    {
      title: '图表形式',
      key: 'chart_style',
      width: '140px',
      required: true,
      render: (_, record) => {
        if (record.items) return null;
        if (record.chartType) {
          return <span className="text-gray-600 px-1">{record.chartType}</span>;
        }
        return (
          <Select>
            <SelectTrigger className="h-8 text-[13px] border-gray-200">
              <SelectValue placeholder="请选择" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">柱状图</SelectItem>
              <SelectItem value="line">折线图</SelectItem>
              <SelectItem value="pie">饼图</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },

    {
      title: '描述',
      key: 'description',
      required: true,
      render: (_, record) => {
        if (record.items) return null;
        if (record.description) {
          return <span className="text-gray-600 px-1 truncate">{record.description}</span>;
        }
        return (
          <Input
            placeholder="请输入"
            className="h-8 text-[13px] border-gray-200 focus:border-primary"
          />
        );
      },
    },

    {
      title: '关注指标',
      dataIndex: 'metric',
      align: 'center',
      width: '100px',
      render: (val, record) => (record.items ? null : val),
    },
  ];

  const formFields: SealedFormFieldConfig<HomePageFormValues>[] = [
    {
      name: 'name',
      label: '首页名称',
      placeholder: '请输入首页名称',
      required: true,
      render: (field) => (
        <Textarea
          {...field}
          placeholder="请输入首页名称"
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[1020px] p-0 overflow-hidden border-none rounded-[12px]">
        <DialogHeader className="px-6 py-4 flex flex-row items-center justify-between border-b border-gray-100">
          <DialogTitle className="text-[16px] font-bold text-gray-800">生成首页</DialogTitle>
        </DialogHeader>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center py-6 bg-[#F8F9FB]">
          <div className="flex items-center gap-0">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[13px] font-medium',
                  step >= 1 ? 'bg-[#306EFD] text-white' : 'bg-gray-200 text-gray-500'
                )}
              >
                {step === 2 ? <Check size={14} /> : '1'}
              </div>
              <span
                className={cn(
                  'text-[14px] font-medium',
                  step >= 1 ? 'text-[#306EFD]' : 'text-gray-400'
                )}
              >
                数据配置
              </span>
            </div>

            {/* Connector Line */}
            <div className="w-40 h-[2px] bg-gray-200 mx-4" />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[13px] font-medium',
                  step === 2 ? 'bg-[#306EFD] text-white' : 'bg-gray-200 text-gray-500'
                )}
              >
                2
              </div>
              <span
                className={cn(
                  'text-[14px] font-medium',
                  step === 2 ? 'text-[#306EFD]' : 'text-gray-400'
                )}
              >
                风格描述
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[450px] flex flex-col overflow-hidden">
          {status === 'editing' ? (
            step === 1 ? (
              <>
                <div className="flex-1 p-4 overflow-y-auto">
                  <SealedTable
                    columns={columns}
                    data={nodes}
                    loading={loading}
                    childrenColumnName="items"
                    expandedRowKeys={expandedRowKeys}
                    onExpand={(expanded, record) => {
                      setExpandedRowKeys((prev: string[]) =>
                        expanded
                          ? [...prev, record.id]
                          : prev.filter((k: string) => k !== record.id)
                      );
                    }}
                    selectedRowKeys={selectedRowKeys}
                    onSelectionChange={setSelectedRowKeys}
                    containerClassName="max-h-[450px]"
                    stripe
                  />
                </div>
                <DialogFooter className="px-6 py-4 bg-white border-t border-gray-100 gap-3">
                  <Button
                    onClick={handleClose}
                    type="button"
                    variant="outline"
                    className="h-9 px-6 border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="h-9 px-6 text-white shadow-none cursor-pointer"
                  >
                    下一步
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <SealedForm
                schema={homePageSchema}
                fields={formFields}
                onSubmit={handleConfirm}
                defaultValues={{
                  name: '',
                  style_description: '',
                  extra_description: '',
                }}
                className="flex-1 flex flex-col h-full overflow-hidden"
              >
                {({ fields }) => (
                  <>
                    <div className="flex-1 px-8 py-6 overflow-y-auto">{fields}</div>
                    <DialogFooter className="px-6 py-4 bg-white border-t border-gray-100 gap-3">
                      <Button
                        onClick={handlePrev}
                        type="button"
                        variant="outline"
                        className="h-9 px-6 border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                      >
                        上一步
                      </Button>
                      <Button
                        type="submit"
                        className="h-9 px-6 text-white shadow-none cursor-pointer"
                      >
                        确定
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </SealedForm>
            )
          ) : (
            <BoardGenerationProgress
              status={status as 'processing' | 'completed' | 'error'}
              progress={progress}
              currentSessionId={currentSessionId}
              onRetry={() => setStatus('editing')}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

