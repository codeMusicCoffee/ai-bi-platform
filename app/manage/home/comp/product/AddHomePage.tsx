'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

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
  expanded: boolean;
  selected: boolean;
  items: ChartItem[];
}

interface AddHomePageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
}

export function AddHomePage({ open, onOpenChange, productId }: AddHomePageProps) {
  const [nodes, setNodes] = useState<NodeGroup[]>([
    {
      id: 'node-1',
      name: '节点1',
      expanded: true,
      selected: true,
      items: [
        {
          id: 'item-1-1',
          dataset: '数据集名称数据集名称',
          name: '这是名称这是名称...',
          chartType: '柱状图',
          description: '这是描述内...',
          metric: 3,
        },
        {
          id: 'item-1-2',
          dataset: '数据集名称数据集名称',
          name: '',
          chartType: '',
          description: '',
          metric: 4,
        },
      ],
    },
    {
      id: 'node-2',
      name: '节点2',
      expanded: true,
      selected: true,
      items: [
        {
          id: 'item-2-1',
          dataset: '数据集名称数据集名称',
          name: '这是名称这是名称...',
          chartType: '柱状图',
          description: '这是描述内...',
          metric: 3,
        },
        {
          id: 'item-2-2',
          dataset: '数据集名称数据集名称',
          name: '这是名称这是名称...',
          chartType: '柱状图',
          description: '这是描述内...',
          metric: 4,
        },
      ],
    },
    {
      id: 'node-3',
      name: '节点3',
      expanded: false,
      selected: true,
      items: [],
    },
    {
      id: 'node-4',
      name: '节点4',
      expanded: false,
      selected: false,
      items: [],
    },
    {
      id: 'node-5',
      name: '节点5',
      expanded: false,
      selected: false,
      items: [],
    },
  ]);

  const toggleExpand = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, expanded: !node.expanded } : node))
    );
  };

  const handleConfirm = () => {
    // Logic for confirmed generation
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1000px] p-0 overflow-hidden border-none rounded-[12px]">
        <DialogHeader className="px-6 py-4 flex flex-row items-center justify-between border-b border-gray-100">
          <DialogTitle className="text-[16px] font-bold text-gray-800">生成首页</DialogTitle>
        </DialogHeader>

        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
          {/* Table Header */}
          <div className="grid grid-cols-[50px_1.5fr_1.5fr_1.2fr_1.8fr_1fr] bg-[#F8F9FB] px-4 py-3 border-b border-gray-100 sticky top-0 z-10">
            <div className="flex items-center justify-center">
              <Checkbox className="border-gray-200" />
            </div>
            <div className="text-[14px] font-bold text-gray-800 px-2">名称</div>
            <div className="text-[14px] font-bold text-gray-800 px-2">
              <span className="text-red-500 mr-1">*</span>名称
            </div>
            <div className="text-[14px] font-bold text-gray-800 px-2">
              <span className="text-red-500 mr-1">*</span>图表形式
            </div>
            <div className="text-[14px] font-bold text-gray-800 px-2">
              <span className="text-red-500 mr-1">*</span>描述
            </div>
            <div className="text-[14px] font-bold text-gray-800 px-2 text-center">关注指标</div>
          </div>

          {/* Table Content */}
          <div className="divide-y divide-gray-50">
            {nodes.map((node) => (
              <div key={node.id} className="flex flex-col">
                {/* Node Row */}
                <div className="grid grid-cols-[50px_1fr] hover:bg-gray-50/50 transition-colors py-3 px-4">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={node.selected}
                      onCheckedChange={(val) => {
                        setNodes((prev) =>
                          prev.map((n) => (n.id === node.id ? { ...n, selected: !!val } : n))
                        );
                      }}
                      className="border-gray-200"
                    />
                  </div>
                  <div
                    className="flex items-center gap-2 cursor-pointer select-none"
                    onClick={() => toggleExpand(node.id)}
                  >
                    {node.expanded ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                    <span className="text-[14px] text-gray-800 font-medium">{node.name}</span>
                  </div>
                </div>

                {/* Items Group */}
                {node.expanded && node.items.length > 0 && (
                  <div className="bg-white">
                    {node.items.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-[50px_1.5fr_1.5fr_1.2fr_1.8fr_1fr] px-4 py-3 border-t border-gray-50"
                      >
                        <div className="flex items-center justify-center">
                          <Checkbox checked={node.selected} className="border-gray-200" />
                        </div>
                        <div className="px-2 text-[13px] text-gray-600 flex items-center truncate">
                          {item.dataset}
                        </div>
                        <div className="px-2">
                          {item.name ? (
                            <div className="text-[13px] text-gray-600 truncate flex items-center h-8">
                              {item.name}
                            </div>
                          ) : (
                            <Input
                              placeholder="请输入"
                              className="h-8 text-[13px] border-gray-200 focus:border-primary"
                            />
                          )}
                        </div>
                        <div className="px-2">
                          {item.chartType ? (
                            <div className="text-[13px] text-gray-600 truncate flex items-center h-8">
                              {item.chartType}
                            </div>
                          ) : (
                            <Select>
                              <SelectTrigger className="h-8 text-[13px] border-gray-200 focus:border-primary">
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
                        <div className="px-2">
                          {item.description ? (
                            <div className="text-[13px] text-gray-600 truncate flex items-center h-8">
                              {item.description}
                            </div>
                          ) : (
                            <Input
                              placeholder="请输入"
                              className="h-8 text-[13px] border-gray-200 focus:border-primary"
                            />
                          )}
                        </div>
                        <div className="px-2 text-[13px] text-gray-600 flex items-center justify-center">
                          {item.metric}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-[#F8F9FB] gap-3">
          <Button
            onClick={() => onOpenChange(false)}
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
      </DialogContent>
    </Dialog>
  );
}
