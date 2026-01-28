'use client';

import { SealedForm, SealedFormFieldConfig } from '@/components/common/SealedForm';
import { SealedTable, SealedTableColumn } from '@/components/common/SealedTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { pmService } from '@/services/pm';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertCircle, Edit2, MoreVertical, Plus } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';
import { AddBoard } from './AddBoard';
import { AddKanbanConfig } from './AddKanbanConfig';
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
  dataset_id: string;
  dataset_name: string;
  module_name: string;
  chart_style: string;
  description: string;
  dataset_fields: string[];
}

function SortableItem({
  node,
  activeNodeId,
  onNodeClick,
  onOpenDelete,
  onSetCurrent,
}: {
  node: LifecycleNode;
  activeNodeId: string | null;
  onNodeClick: (id: string) => void;
  onOpenDelete: (id: string) => void;
  onSetCurrent: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const isActive = node.id === activeNodeId;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center shrink-0 w-[160px]"
      onClick={() => onNodeClick(node.id)}
    >
      <div
        className={cn(
          'group relative flex items-center gap-2 px-3 py-2 bg-white rounded-[10px] shadow-sm w-full cursor-pointer touch-none transition-colors duration-200',
          isActive
            ? 'ring-1 ring-inset ring-[#306EFD]'
            : 'ring-1 ring-inset ring-[#f0f0f0] hover:ring-gray-200',
          isDragging && 'opacity-0'
        )}
      >
        <div className="w-7 h-7 flex items-center justify-center shrink-0">
          <img
            src={
              node.active
                ? '/images/manage/product/activeNode.svg'
                : '/images/manage/product/node.svg'
            }
            alt="node-icon"
            className="w-full h-full object-contain"
          />
        </div>
        <span
          className={cn(
            'font-bold text-[14px] select-none flex-1 truncate',
            isActive ? 'text-[#262626]' : 'text-[#595959]'
          )}
        >
          {node.name}
        </span>

        {isActive && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className="ml-auto flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3.5 w-3.5 text-gray-400 shrink-0 hover:text-gray-600 transition-colors" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-[120px]">
              <DropdownMenuItem
                className="text-gray-600 focus:text-[#3b82f6] focus:bg-blue-50 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSetCurrent(node.id);
                }}
              >
                <span>设为当前阶段</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-600 focus:text-[#3b82f6] focus:bg-blue-50 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDelete(node.id);
                }}
              >
                <span>删除</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export function LifecycleTab({ productId }: { productId: string }) {
  const [nodes, setNodes] = useState<LifecycleNode[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);
  const isDragOccurred = React.useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2, // Minimal distance for immediate response
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    isDragOccurred.current = true;
    setDragActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // No live state update during over to prevent layout shift of arrows
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDragActiveId(null);

    // Give a small delay to allow onClick to be suppressed if it was a drag
    setTimeout(() => {
      isDragOccurred.current = false;
    }, 100);

    if (over && active.id !== over.id) {
      const oldIndex = nodes.findIndex((i) => i.id === active.id);
      const newIndex = nodes.findIndex((i) => i.id === over.id);
      const newNodes = arrayMove(nodes, oldIndex, newIndex);
      setNodes(newNodes);

      // Call reorder API
      try {
        await pmService.reorderLifecycles({
          product_id: productId,
          items: newNodes.map((node, index) => ({
            lifecycle_id: node.id,
            sort_order: index + 1,
          })),
        });
      } catch (error) {
        console.error('Failed to reorder lifecycles:', error);
        // Revert on error
        fetchData();
      }
    }
  };

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
        active: item.is_current || false,
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

  const [tableData, setTableData] = useState<DashboardItem[]>([]);
  const [kanbanLoading, setKanbanLoading] = useState(false);

  const fetchKanbans = useCallback(async (lifecycleId: string) => {
    try {
      setKanbanLoading(true);
      const res = await pmService.getKanbans(lifecycleId);
      const data = res.data as any;
      const rawData = Array.isArray(data) ? data : data?.items || data?.list || [];
      setTableData(
        rawData.map((item: any) => ({
          id: item.id,
          dataset_id: item.dataset_id,
          dataset_name: item.dataset_name || '数据集',
          module_name: item.module_name,
          chart_style: item.chart_style,
          description: item.description,
          dataset_fields: item.dataset_fields || [],
        }))
      );
    } catch (error) {
      console.error('Failed to fetch kanbans:', error);
    } finally {
      setKanbanLoading(false);
    }
  }, []);

  const columns: SealedTableColumn<DashboardItem>[] = [
    {
      title: '数据集',
      dataIndex: 'dataset_name',
    },
    { title: '模块名称', dataIndex: 'module_name', ellipsis: true },
    {
      title: '图表形式',
      dataIndex: 'chart_style',
      render: (val) => (val === 'chart-bar' ? '柱状图' : val === 'chart-line' ? '折线图' : '饼图'),
    },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      align: 'left',
      render: (_, record) => (
        <div className="flex items-center justify-start gap-4">
          <button
            onClick={() => handleEditKanban(record)}
            className="text-[#306EFD] text-[13px] hover:opacity-80 cursor-pointer"
          >
            编辑
          </button>
          <button
            onClick={() => handleDeleteKanban(record.id)}
            className="text-[#F56C6C] text-[13px] hover:opacity-80 cursor-pointer"
          >
            删除
          </button>
        </div>
      ),
    },
  ];

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [isKanbanConfigOpen, setIsKanbanConfigOpen] = useState(false);
  const [kanbanMode, setKanbanMode] = useState<'create' | 'edit'>('create');
  const [currentKanban, setCurrentKanban] = useState<DashboardItem | null>(null);
  const [isAddBoardOpen, setIsAddBoardOpen] = useState(false);

  useEffect(() => {
    if (activeNodeId) {
      fetchKanbans(activeNodeId);
    }
  }, [activeNodeId, fetchKanbans]);

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
    if (isDragOccurred.current) return;
    setActiveNodeId(id);
  };

  const handleOpenDelete = (id: string) => {
    setNodeToDelete(id);
    setIsDeleteOpen(true);
  };

  const handleSetCurrentStage = async (id: string) => {
    try {
      await pmService.updateProduct(productId, { current_lifecycle_id: id });
      toast.success('设置当前阶段成功');
      fetchData();
    } catch (error) {
      console.error('Failed to set current stage:', error);
    }
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

  const handleEditKanban = (kanban: DashboardItem) => {
    setKanbanMode('edit');
    setCurrentKanban(kanban);
    setIsKanbanConfigOpen(true);
  };

  const handleDeleteKanban = async (id: string) => {
    try {
      await pmService.deleteKanban(id);
      if (activeNodeId) {
        fetchKanbans(activeNodeId);
      }
    } catch (error) {
      console.error('Failed to delete kanban:', error);
    }
  };

  const handleKanbanConfirm = async (values: any) => {
    console.log('--- Kanban Confirm Triggered ---', { activeNodeId, kanbanMode, values });
    if (!activeNodeId) {
      toast.error('当前没有选中的节点，无法保存看板');
      return;
    }
    try {
      if (kanbanMode === 'create') {
        const createData = {
          lifecycle_id: activeNodeId,
          ...values,
        };
        console.log('Creating Kanban with data:', createData);
        await pmService.createKanban(createData);
      } else if (currentKanban) {
        console.log('Updating Kanban ID:', currentKanban.id, 'with data:', values);
        await pmService.updateKanban(currentKanban.id, values);
      }
      fetchKanbans(activeNodeId);
      setIsKanbanConfigOpen(false);
    } catch (error: any) {
      console.error('Failed to save kanban:', error);
      toast.error('保存看板失败: ' + (error.message || '未知错误'));
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

  const handleGenerateBoard = () => {
    if (tableData.length === 0) {
      toast.error('暂无数据，请先增加看板配置');
      return;
    }
    if (selectedRowKeys.length === 0) {
      toast.error('请勾选数据集模块');
      return;
    }
    setIsAddBoardOpen(true);
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
          className="relative bg-white/50 border-b border-gray-100 flex items-center justify-center overflow-hidden m-4"
          style={{
            backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
            backgroundSize: '10px 10px',
          }}
        >
          <div className="w-full overflow-x-auto overflow-y-hidden px-8 py-10 custom-scrollbar">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex items-center flex-nowrap justify-start lg:justify-center min-w-max mx-auto gap-0">
                <SortableContext items={nodes} strategy={horizontalListSortingStrategy}>
                  {nodes.map((node, index) => (
                    <React.Fragment key={node.id}>
                      <SortableItem
                        node={node}
                        activeNodeId={activeNodeId}
                        onNodeClick={handleNodeClick}
                        onOpenDelete={handleOpenDelete}
                        onSetCurrent={handleSetCurrentStage}
                      />

                      {/* Arrow between nodes - rendered outside sortable item */}
                      {index < nodes.length - 1 && (
                        <div className="px-4 flex items-center shrink-0">
                          <img
                            src="/images/manage/product/arrow_line.svg"
                            alt="arrow"
                            width={170}
                            height={12}
                            className="pointer-events-none select-none"
                          />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </SortableContext>

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

              <DragOverlay adjustScale={false}>
                {dragActiveId ? (
                  <div
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 bg-white rounded-[10px] shadow-xl w-[160px] cursor-grabbing',
                      dragActiveId === activeNodeId
                        ? 'ring-1 ring-inset ring-[#306EFD]'
                        : 'ring-1 ring-inset ring-gray-200'
                    )}
                  >
                    <div className="w-7 h-7 flex items-center justify-center shrink-0">
                      <img
                        src={
                          nodes.find((n) => n.id === dragActiveId)?.active
                            ? '/images/manage/product/activeNode.svg'
                            : '/images/manage/product/node.svg'
                        }
                        alt="node-icon"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span
                      className={cn(
                        'font-bold text-[14px] flex-1 truncate',
                        dragActiveId === activeNodeId ? 'text-[#262626]' : 'text-[#595959]'
                      )}
                    >
                      {nodes.find((n) => n.id === dragActiveId)?.name}
                    </span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
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
                        onClick={() => {
                          form.reset();
                          setIsEditingNodeInfo(false);
                        }}
                        type="button"
                        variant="outline"
                        className=" border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        取消
                      </Button>
                      <Button type="submit">确定</Button>
                    </div>
                  ) : (
                    <Button type="button" onClick={() => setIsEditingNodeInfo(true)}>
                      <Edit2 />
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
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setKanbanMode('create');
                setCurrentKanban(null);
                setIsKanbanConfigOpen(true);
              }}
            >
              看板配置
            </Button>
            <Button
              variant="outline"
              onClick={handleGenerateBoard}
              className="border-[#306EFD] text-[#306EFD] hover:bg-blue-50 hover:text-[#306EFD]"
            >
              生成看板
            </Button>
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

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 gap-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-[15px] font-medium text-gray-800">删除提示</DialogTitle>
          </DialogHeader>
          <div className="p-8 flex items-center gap-3">
            <div className="bg-[#fee2e2] rounded-full p-1.5 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-white fill-[#f05252]" />
            </div>

            <span className="text-[15px] text-gray-700 font-medium">确定删除吗？</span>
          </div>

          <DialogFooter className="p-4 pt-0 flex sm:justify-end gap-3">
            <Button
              onClick={() => setIsDeleteOpen(false)}
              type="button"
              variant="outline"
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 border-none"
            >
              取消
            </Button>
            <Button
              className="bg-[#f05252] hover:bg-[#d94141] text-white"
              onClick={handleConfirmDelete}
            >
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kanban Configuration Dialog */}
      <AddKanbanConfig
        open={isKanbanConfigOpen}
        onOpenChange={setIsKanbanConfigOpen}
        mode={kanbanMode}
        initialData={currentKanban}
        onConfirm={handleKanbanConfirm}
      />

      {/* Add Board Dialog */}
      <AddBoard open={isAddBoardOpen} onOpenChange={setIsAddBoardOpen} productId={productId} />
    </Card>
  );
}
