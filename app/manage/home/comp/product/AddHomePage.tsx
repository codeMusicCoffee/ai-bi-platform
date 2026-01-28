'use client';

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
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
  const [styleDescription, setStyleDescription] = useState('');
  const [otherDescription, setOtherDescription] = useState('');

  const [nodes, setNodes] = useState<NodeGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    if (open && productId) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const res = await pmService.getLifecycleKanbanTree(productId);
          if (res?.data?.items) {
            const mappedNodes: NodeGroup[] = res.data.items.map((item: any) => ({
              id: item.id,
              name: item.name,
              items: (item.kanbans || []).map((kb: any) => ({
                id: kb.id,
                dataset: kb.dataset_id, // 暂用 dataset_id，如果有 dataset_name 可替换
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

  const handleConfirm = () => {
    // Logic for confirmed generation
    console.log('Generated with:', {
      selectedKeys: selectedRowKeys,
      styleDescription,
      otherDescription,
    });
    onOpenChange(false);
    setStep(1);
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep(1);
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
      render: (_, record) => {
        if (record.items) return null; // 节点行不显示表单
        return (
          <div className="flex items-center gap-1">
            <span className="text-red-500">*</span>
            {record.name ? (
              <span className="text-gray-600 px-1">{record.name}</span>
            ) : (
              <Input
                placeholder="请输入"
                className="h-8 text-[13px] border-gray-200 focus:border-primary"
              />
            )}
          </div>
        );
      },
    },
    {
      title: '图表形式',
      key: 'chart_style',
      width: '140px',
      render: (_, record) => {
        if (record.items) return null;
        return (
          <div className="flex items-center gap-1">
            <span className="text-red-500">*</span>
            {record.chartType ? (
              <span className="text-gray-600 px-1">{record.chartType}</span>
            ) : (
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
            )}
          </div>
        );
      },
    },
    {
      title: '描述',
      key: 'description',
      render: (_, record) => {
        if (record.items) return null;
        return (
          <div className="flex items-center gap-1">
            <span className="text-red-500">*</span>
            {record.description ? (
              <span className="text-gray-600 px-1 truncate">{record.description}</span>
            ) : (
              <Input
                placeholder="请输入"
                className="h-8 text-[13px] border-gray-200 focus:border-primary"
              />
            )}
          </div>
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
        <div className="min-h-[400px]">
          {step === 1 ? (
            <div className="p-4">
              <SealedTable
                columns={columns}
                data={nodes}
                loading={loading}
                childrenColumnName="items"
                expandedRowKeys={expandedRowKeys}
                onExpand={(expanded, record) => {
                  setExpandedRowKeys((prev: string[]) =>
                    expanded ? [...prev, record.id] : prev.filter((k: string) => k !== record.id)
                  );
                }}
                selectedRowKeys={selectedRowKeys}
                onSelectionChange={setSelectedRowKeys}
                containerClassName="max-h-[450px]"
                stripe
              />
            </div>
          ) : (
            <div className="px-8 py-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[14px] font-medium text-gray-700">风格描述：</label>
                <Textarea
                  value={styleDescription}
                  onChange={(e) => setStyleDescription(e.target.value)}
                  placeholder="请输入"
                  className="min-h-[140px] resize-none border-gray-200 focus:border-primary text-[14px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[14px] font-medium text-gray-700">其他描述：</label>
                <Textarea
                  value={otherDescription}
                  onChange={(e) => setOtherDescription(e.target.value)}
                  placeholder="请输入"
                  className="min-h-[140px] resize-none border-gray-200 focus:border-primary text-[14px]"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 bg-white border-t border-gray-100 gap-3">
          <Button
            onClick={handleClose}
            type="button"
            variant="outline"
            className="h-9 px-6 border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            取消
          </Button>
          {step === 1 ? (
            <Button onClick={handleNext} className="h-9 px-6 text-white shadow-none">
              下一步
            </Button>
          ) : (
            <>
              <Button
                onClick={handlePrev}
                type="button"
                variant="outline"
                className="h-9 px-6 border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                上一步
              </Button>
              <Button onClick={handleConfirm} className="h-9 px-6 text-white shadow-none">
                确定
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
