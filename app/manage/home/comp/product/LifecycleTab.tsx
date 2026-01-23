'use client';

import { SealedTable, SealedTableColumn } from '@/components/SealedTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SealedForm, SealedFormFieldConfig } from '@/components/ui/sealed-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { pmService } from '@/services/pm';
import { Edit2, Home, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';
import { LifeEmpty } from './LifeEmpty';

const nodeInfoSchema = z.object({
  name: z.string().min(1, '请输入节点名称'),
  description: z.string().min(1, '请输入节点描述'),
});

type NodeInfoValues = z.infer<typeof nodeInfoSchema>;

interface LifecycleNode {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

interface DashboardItem {
  id: string;
  dataset: string;
  name: string;
  chartType: string;
  description: string;
  metric: number;
}

export function LifecycleTab({ productId }: { productId: string }) {
  const [nodes, setNodes] = useState<LifecycleNode[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  const fetchData = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const res = await pmService.getLifecycles(productId);
      const data = res.data as any;
      const rawData: any[] = Array.isArray(data) ? data : data?.items || data?.list || [];

      const newNodes = rawData.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        active: false,
      }));
      setNodes(newNodes);

      // Auto-select first node if none selected or current selection is invalid
      if (newNodes.length > 0) {
        if (!activeNodeId || !newNodes.find((n) => n.id === activeNodeId)) {
          setActiveNodeId(newNodes[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch lifecycles:', error);
    } finally {
      setLoading(false);
      setInitialFetchDone(true);
    }
  }, [productId]);

  useEffect(() => {
    setInitialFetchDone(false);
    setNodes([]);
    setActiveNodeId(null);
    fetchData();
  }, [productId, fetchData]);

  const [isEditingNodeInfo, setIsEditingNodeInfo] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);

  const [tableData, setTableData] = useState<DashboardItem[]>([
    {
      id: '1',
      dataset: '数据集名称数据集名称',
      name: '这是名称',
      chartType: '柱状图',
      description: '这是描述内容',
      metric: 5,
    },
    {
      id: '2',
      dataset: '数据集名称数据集名称',
      name: '这是名称这是名称...',
      chartType: '柱状图',
      description: '这是描述内...',
      metric: 3,
    },
  ]);

  const columns: SealedTableColumn<DashboardItem>[] = [
    {
      title: '数据集',
      dataIndex: 'dataset',
    },
    { title: '名称', dataIndex: 'name', ellipsis: true },
    { title: '图表形式', dataIndex: 'chartType' },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '关注指标', dataIndex: 'metric', align: 'center' },
    {
      title: '操作',
      key: 'action',
      align: 'left',
      render: () => (
        <div className="flex items-center justify-start gap-4">
          <button className="text-[#306EFD] text-[13px] hover:opacity-80">编辑</button>
          <button className="text-[#F56C6C] text-[13px] hover:opacity-80">删除</button>
        </div>
      ),
    },
  ];

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const activeNode = nodes.find((n) => n.id === activeNodeId) || nodes[0];

  const nodeFields: SealedFormFieldConfig<NodeInfoValues>[] = [
    {
      name: 'name',
      label: '节点名称',
      placeholder: '请输入节点名称',
      required: true,
      className: 'col-span-1',
    },
    {
      name: 'description',
      label: '节点描述',
      placeholder: '请输入节点描述',
      required: true,
      className: 'col-span-4',
    },
  ];

  const handleNodeInfoSubmit = async (values: NodeInfoValues) => {
    if (!activeNodeId) return;
    await pmService.updateLifecycle(activeNodeId, values);
    fetchData();
    setIsEditingNodeInfo(false);
  };

  const handleNodeClick = (id: string) => {
    setActiveNodeId(id);
  };

  const handleOpenDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNodeToDelete(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (nodeToDelete) {
      await pmService.deleteLifecycle(nodeToDelete);
      if (activeNodeId === nodeToDelete) {
        setActiveNodeId(null);
      }
      fetchData();
      setIsDeleteOpen(false);
      setNodeToDelete(null);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await pmService.createLifecycle({
        product_id: productId,
        name: `节点名称${nodes.length + 1}`,
        description: '',
      });
      toast.success('创建节点成功');

      // If this is the first node or no active node, select the new one
      if (res.data && (!activeNodeId || nodes.length === 0)) {
        setActiveNodeId(res.data);
      }

      fetchData();
    } catch (error) {
      console.error('Failed to create node:', error);
    }
  };

  const handleApplyTemplate = async (name: string) => {
    const steps = ['研发', '试销', '生产', '上市', '退市'];
    for (const step of steps) {
      await pmService.createLifecycle({
        product_id: productId,
        name: step,
        description: `这是${step}阶段的描述`,
      });
    }
    fetchData();
  };

  if (loading && !initialFetchDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-in fade-in duration-500">
        <div className="w-10 h-10 border-4 border-blue-50 border-t-[#306EFD] rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">正在加载生命周期数据...</p>
      </div>
    );
  }

  if (initialFetchDone && nodes.length === 0) {
    return <LifeEmpty onCreate={handleCreate} onApplyTemplate={handleApplyTemplate} />;
  }

  return (
    <Card className="border-none shadow-sm rounded-[12px] bg-white overflow-hidden animate-in fade-in duration-500">
      <CardContent className="p-0">
        {/* 1. 节点流程可视化区域 - 压缩高度 */}
        <div
          className="relative py-6 bg-white/50 border-b border-gray-100 flex items-center justify-center overflow-hidden m-4"
          style={{
            backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
            backgroundSize: '10px 10px',
          }}
        >
          <div className="w-full overflow-x-auto overflow-y-visible px-8 pb-4 custom-scrollbar">
            <div className="flex items-center flex-nowrap justify-start lg:justify-center min-w-max mx-auto gap-0">
              {nodes.map((node, index) => (
                <div key={node.id} className="flex items-center">
                  {/* Node Item */}
                  <div
                    className={cn(
                      'group relative flex items-center gap-2 px-4 py-2 bg-white border-2 rounded-[10px] shadow-sm transition-all min-w-[140px] cursor-pointer',
                      node.id === activeNodeId
                        ? 'border-[#306EFD] ring-4 ring-blue-50/50'
                        : 'border-transparent hover:border-gray-100'
                    )}
                    onClick={() => handleNodeClick(node.id)}
                  >
                    <div
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center',
                        node.id === activeNodeId
                          ? 'bg-[#306EFD] text-white'
                          : 'bg-[#f5f7fa] text-[#306EFD]'
                      )}
                    >
                      <Home size={16} />
                    </div>
                    <span
                      className={cn(
                        'font-bold text-[14px]',
                        node.id === activeNodeId ? 'text-[#262626]' : 'text-[#595959]'
                      )}
                    >
                      {node.name}
                    </span>

                    <button
                      className={cn(
                        'ml-auto text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100',
                        node.id === activeNodeId && 'opacity-100'
                      )}
                      onClick={(e) => handleOpenDelete(e, node.id)}
                    >
                      <X size={14} className="rounded-full bg-gray-100 p-0.5" />
                    </button>
                  </div>

                  {/* Arrow between nodes */}
                  {index < nodes.length - 1 && (
                    <div className="px-4 flex items-center">
                      {/* 新实现：将内联 SVG 替换为图片资源 */}
                      <img
                        src="/images/manage/product/arrow_line.svg"
                        alt="arrow"
                        width={170}
                        height={12}
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Add Button */}
              <div className="ml-1">
                <button
                  className="w-4 h-4 rounded-full border border-[#306EFD] text-[#306EFD] flex items-center justify-center hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={handleCreate}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 节点信息区域 */}
        <SealedForm
          schema={nodeInfoSchema}
          fields={nodeFields}
          defaultValues={{
            name: activeNode?.name || '',
            description: activeNode?.description || '',
          }}
          onSubmit={handleNodeInfoSubmit}
          readonly={!isEditingNodeInfo}
          gridClassName="grid grid-cols-5 gap-x-12 gap-y-6"
          className="space-y-0"
        >
          {({ form, fields }) => (
            <div className="border-b border-gray-100 px-6 py-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-[3px] h-4 bg-[#306EFD] rounded-full" />
                  <span className="text-[16px] font-bold text-gray-800">节点信息</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 justify-end min-w-[160px]">
                  {isEditingNodeInfo ? (
                    <div className="flex items-center gap-3 animate-in fade-in duration-200">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          form.reset();
                          setIsEditingNodeInfo(false);
                        }}
                        className="h-[32px] px-6 bg-gray-50 border-none text-gray-500 hover:bg-gray-100 cursor-pointer"
                      >
                        取消
                      </Button>
                      <Button
                        type="submit"
                        className="h-[32px] bg-[#306EFD] hover:bg-[#285cd1] text-white rounded-[4px] px-8 shadow-sm cursor-pointer"
                      >
                        确定
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setIsEditingNodeInfo(true)}
                      className="h-[32px] px-6 bg-[#306EFD] hover:bg-[#285cd1] text-white rounded-[4px] shadow-sm flex items-center gap-2 cursor-pointer animate-in fade-in duration-200"
                    >
                      <Edit2 size={14} />
                      <span>编辑</span>
                    </Button>
                  )}
                </div>
              </div>
              <div>{fields}</div>
            </div>
          )}
        </SealedForm>

        {/* 3. 看板数据配置区域 */}
        <div className="px-6 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-[3px] h-4 bg-[#306EFD] rounded-full" />
              <span className="text-[16px] font-bold text-gray-800">节点看板数据配置</span>
            </div>
            <Button className="h-[32px] px-6 bg-[#306EFD] hover:bg-[#285cd1] text-white rounded-[4px] shadow-sm cursor-pointer">
              生成看板
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-[14px] text-gray-600 whitespace-nowrap">
              <span className="text-red-500 font-bold">*</span> 数据集:
            </label>
            <div className="w-64">
              <Select>
                <SelectTrigger className="h-8 bg-white border-gray-100">
                  <SelectValue placeholder="选择数据集" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ds1">数据集 A</SelectItem>
                  <SelectItem value="ds2">数据集 B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SealedTable
            columns={columns}
            data={tableData}
            className="border-none shadow-none"
            headerClassName="bg-[#f8f9fb] border-none"
            selectedRowKeys={selectedRowKeys}
            onSelectionChange={setSelectedRowKeys}
          />
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[442px] p-0 border-none rounded-[12px] overflow-hidden">
          <DialogHeader className="px-6 pt-8 pb-4">
            <DialogTitle className="text-lg font-bold text-gray-800">确认删除</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-2">
            <DialogDescription className="text-[14px] text-gray-600 leading-relaxed">
              您确定要删除该节点吗？删除后将无法恢复，且与之关联的配置信息也将一并移除。
            </DialogDescription>
          </div>
          <DialogFooter className="px-6 py-6 bg-gray-50/50 mt-4 gap-3 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="h-9 px-6 border-gray-100 text-gray-600 rounded-[6px] cursor-pointer"
            >
              取消
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="h-9 px-6 bg-[#F56C6C] hover:bg-[#e45d5d] text-white rounded-[6px] shadow-sm cursor-pointer ml-3"
            >
              确定删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
