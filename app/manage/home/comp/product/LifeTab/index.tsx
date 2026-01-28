'use client';

import { AlertDialog } from '@/components/common/AlertDialog';
import { SealedForm, SealedFormFieldConfig } from '@/components/common/SealedForm';
import { SealedTable, SealedTableColumn } from '@/components/common/SealedTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Edit2, MoreVertical, Plus } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';
import { AddBoard } from '../BoardTab/AddBoard';
import { AddBoardConfig } from './AddBoardConfig';
import { LifeEmpty } from './LifeEmpty';

export interface LifecycleNode {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

interface SortableItemProps {
  node: LifecycleNode;
  activeNodeId: string | null;
  onNodeClick: (id: string) => void;
  onOpenDelete: (id: string) => void;
  onSetCurrent: (id: string) => void;
}

function SortableItem({
  node,
  activeNodeId,
  onNodeClick,
  onOpenDelete,
  onSetCurrent,
}: SortableItemProps) {
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
      className="flex items-center shrink-0 w-[163px]"
      onClick={() => onNodeClick(node.id)}
    >
      <div
        className={cn(
          'group relative flex items-center gap-2 px-3 bg-white rounded-[10px] shadow-sm w-full h-12 cursor-pointer touch-none transition-colors duration-200',
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

const nodeInfoSchema = z.object({
  name: z.string().min(1, '请输入节点名称'),
  description: z.string().min(1, '请输入节点描述'),
});

type NodeInfoValues = z.infer<typeof nodeInfoSchema>;

interface DashboardItem {
  id: string;
  dataset_id: string;
  dataset_name: string;
  module_name: string;
  chart_style: string;
  description: string;
  dataset_fields: string[];
}

export function LifeCycleTab({ productId }: { productId: string }) {
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

      // Selection logic: maintain current selection if valid, otherwise select the first node
      setActiveNodeId((prev) => {
        if (prev && newNodes.some((n) => n.id === prev)) {
          return prev;
        }
        return newNodes[0]?.id || null;
      });
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
    fetchData();
  }, [productId]);

  const [isEditingNodeInfo, setIsEditingNodeInfo] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);

  const [tableData, setTableData] = useState<DashboardItem[]>([]);
  const [boardLoading, setBoardLoading] = useState(false);
  const [isBoardDeleteOpen, setIsBoardDeleteOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);

  const fetchBoards = useCallback(async (lifecycleId: string) => {
    try {
      setBoardLoading(true);
      const res = await pmService.getBoards(lifecycleId);
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
      console.error('Failed to fetch boards:', error);
    } finally {
      setBoardLoading(false);
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
      title: '关注指标',
      key: 'metrics_count',
      align: 'center',
      render: (_, record) => record.dataset_fields?.length || 0,
    },
    {
      title: '操作',
      key: 'action',
      align: 'left',
      render: (_, record) => (
        <div className="flex items-center justify-start gap-4">
          <button
            onClick={() => handleEditBoard(record)}
            className="text-[#306EFD] text-[13px] hover:opacity-80 cursor-pointer"
          >
            编辑
          </button>
          <button
            onClick={() => {
              setBoardToDelete(record.id);
              setIsBoardDeleteOpen(true);
            }}
            className="text-[#F56C6C] text-[13px] hover:opacity-80 cursor-pointer"
          >
            删除
          </button>
        </div>
      ),
    },
  ];

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [isBoardConfigOpen, setIsBoardConfigOpen] = useState(false);
  const [boardMode, setBoardMode] = useState<'create' | 'edit'>('create');
  const [currentBoard, setCurrentBoard] = useState<DashboardItem | null>(null);
  const [isAddBoardOpen, setIsAddBoardOpen] = useState(false);

  useEffect(() => {
    if (activeNodeId) {
      fetchBoards(activeNodeId);
    }
  }, [activeNodeId, fetchBoards]);

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
      await pmService.setProductCurrentStage(productId, id);
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

  const handleCreate = async (position: 'left' | 'right' = 'right') => {
    try {
      const res = await pmService.createLifecycle({
        product_id: productId,
        name: `节点名称${nodes.length + 1}`,
        description: '',
      });
      toast.success('创建节点成功');

      const newId = res.data;
      if (newId) {
        setActiveNodeId(newId);
        setIsEditingNodeInfo(true);

        // 如果是添加到左侧，则需要重新排序
        if (position === 'left' && nodes.length > 0) {
          const items = [
            { lifecycle_id: newId, sort_order: 1 },
            ...nodes.map((node, index) => ({
              lifecycle_id: node.id,
              sort_order: index + 2,
            })),
          ];
          await pmService.reorderLifecycles({
            product_id: productId,
            items,
          });
        }
      }

      await fetchData();
    } catch (error) {
      console.error('Failed to create node:', error);
    }
  };

  const handleEditBoard = (board: DashboardItem) => {
    setBoardMode('edit');
    setCurrentBoard(board);
    setIsBoardConfigOpen(true);
  };
  const handleConfirmDeleteBoard = async () => {
    if (!boardToDelete) return;
    try {
      await pmService.deleteBoard(boardToDelete);
      if (activeNodeId) {
        fetchBoards(activeNodeId);
      }
      setIsBoardDeleteOpen(false);
      setBoardToDelete(null);
    } catch (error) {
      console.error('Failed to delete board:', error);
    }
  };

  const handleBoardConfirm = async (values: any) => {
    console.log('--- Board Confirm Triggered ---', { activeNodeId, boardMode, values });
    if (!activeNodeId) {
      toast.error('当前没有选中的节点，无法保存看板');
      return;
    }
    try {
      if (boardMode === 'create') {
        const createData = {
          lifecycle_id: activeNodeId,
          ...values,
        };
        console.log('Creating Board with data:', createData);
        await pmService.createBoard(createData);
      } else if (currentBoard) {
        console.log('Updating Board ID:', currentBoard.id, 'with data:', values);
        await pmService.updateBoard(currentBoard.id, values);
      }
      fetchBoards(activeNodeId);
      setIsBoardConfigOpen(false);
    } catch (error: any) {
      console.error('Failed to save board:', error);
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
    await fetchData();
    setIsEditingNodeInfo(true);
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
          className="relative bg-white/50 border-b border-gray-100 flex items-center overflow-hidden m-4"
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
              <div className="flex items-center flex-nowrap justify-start min-w-max gap-0">
                {/* Left Add Button - only when exactly one node */}
                {nodes.length === 1 && (
                  <div className="mr-1">
                    <button
                      className="w-4 h-4 rounded-full border border-[#306EFD] text-[#306EFD] flex items-center justify-center hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => handleCreate('left')}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}
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
                    onClick={() => handleCreate('right')}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <DragOverlay adjustScale={false}>
                {dragActiveId
                  ? (() => {
                      const node = nodes.find((n) => n.id === dragActiveId);
                      if (!node) return null;
                      const isActive = node.id === activeNodeId;
                      return (
                        <div
                          className={cn(
                            'flex items-center gap-2 px-3 bg-white rounded-[10px] shadow-xl w-[163px] h-12 cursor-grabbing',
                            isActive
                              ? 'ring-1 ring-inset ring-[#306EFD]'
                              : 'ring-1 ring-inset ring-gray-200'
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
                            <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-gray-400">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>
                      );
                    })()
                  : null}
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
                setBoardMode('create');
                setCurrentBoard(null);
                setIsBoardConfigOpen(true);
              }}
            >
              <Plus />
              新增看板模块
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
            className="border-none shadow-none min-h-[186px]"
            headerClassName="bg-[#f8f9fb] border-none"
            selectedRowKeys={selectedRowKeys}
            onSelectionChange={setSelectedRowKeys}
          />
        </div>
      </CardContent>

      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
      />

      <AlertDialog
        open={isBoardDeleteOpen}
        onOpenChange={setIsBoardDeleteOpen}
        onConfirm={handleConfirmDeleteBoard}
      />

      {/* Board Configuration Dialog */}
      <AddBoardConfig
        open={isBoardConfigOpen}
        onOpenChange={setIsBoardConfigOpen}
        mode={boardMode}
        initialData={currentBoard}
        onConfirm={handleBoardConfirm}
      />

      {/* Add Board Dialog */}
      <AddBoard open={isAddBoardOpen} onOpenChange={setIsAddBoardOpen} productId={productId} />
    </Card>
  );
}
