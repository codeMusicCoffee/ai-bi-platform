'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
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
import { MoreVertical, Plus } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { LifecycleNode, NodeFlowAreaProps, SortableNodeProps } from './types';

// ====================
// 节点内容渲染（可拖拽和拖拽预览共用）
// ====================
function NodeContent({
  node,
  isActive,
  isDragging = false,
  showMenu = false,
  onOpenDelete,
  onSetCurrent,
}: {
  node: LifecycleNode;
  isActive: boolean;
  isDragging?: boolean;
  showMenu?: boolean;
  onOpenDelete?: (id: string) => void;
  onSetCurrent?: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        'group relative flex items-center gap-2 px-3 bg-white rounded-[10px] shadow-sm w-[163px] h-[48px] cursor-pointer touch-none transition-colors duration-200',
        isActive
          ? 'ring-1 ring-inset ring-[#306EFD]'
          : 'ring-1 ring-inset ring-[#f0f0f0] hover:ring-gray-200',
        isDragging && 'shadow-xl cursor-grabbing'
      )}
    >
      {/* 节点图标 */}
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

      {/* 节点名称 */}
      <span
        className={cn(
          'font-bold text-[14px] select-none truncate w-[80px]',
          isActive ? 'text-[#262626]' : 'text-[#595959]'
        )}
      >
        {node.name}
      </span>

      {/* 操作菜单 */}
      {showMenu && isActive && onOpenDelete && onSetCurrent && (
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
              设为当前阶段
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-gray-600 focus:text-[#3b82f6] focus:bg-blue-50 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDelete(node.id);
              }}
            >
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* 拖拽时的菜单图标占位 */}
      {isDragging && isActive && (
        <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-gray-400">
          <MoreVertical className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
}

// ====================
// 可拖拽节点
// ====================
function SortableNode({
  node,
  isActive,
  onNodeClick,
  onOpenDelete,
  onSetCurrent,
}: SortableNodeProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center shrink-0 w-[163px] h-[48px]"
      onClick={() => onNodeClick(node.id)}
    >
      <div className={cn('w-full h-full', isDragging && 'opacity-0')}>
        <NodeContent
          node={node}
          isActive={isActive}
          showMenu
          onOpenDelete={onOpenDelete}
          onSetCurrent={onSetCurrent}
        />
      </div>
    </div>
  );
}

// ====================
// 节点流程可视化区域
// ====================
export function NodeFlowArea({
  nodes,
  activeNodeId,
  onNodeClick,
  onOpenDelete,
  onSetCurrent,
  onCreate,
  onReorder,
}: NodeFlowAreaProps) {
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);
  const isDragOccurred = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 2 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    isDragOccurred.current = true;
    setDragActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDragActiveId(null);

    // 延迟重置以过滤点击事件
    setTimeout(() => {
      isDragOccurred.current = false;
    }, 100);

    if (over && active.id !== over.id) {
      const oldIndex = nodes.findIndex((i) => i.id === active.id);
      const newIndex = nodes.findIndex((i) => i.id === over.id);
      const newNodes = arrayMove(nodes, oldIndex, newIndex);
      onReorder(newNodes);
    }
  };

  const handleNodeClick = (id: string) => {
    if (isDragOccurred.current) return;
    onNodeClick(id);
  };

  const dragNode = dragActiveId ? nodes.find((n) => n.id === dragActiveId) : null;

  return (
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
            {/* 可排序节点列表 */}
            <SortableContext items={nodes} strategy={horizontalListSortingStrategy}>
              {nodes.map((node, index) => (
                <React.Fragment key={node.id}>
                  <SortableNode
                    node={node}
                    isActive={node.id === activeNodeId}
                    onNodeClick={handleNodeClick}
                    onOpenDelete={onOpenDelete}
                    onSetCurrent={onSetCurrent}
                  />

                  {/* 节点间箭头 */}
                  {index < nodes.length - 1 && (
                    <div className="flex items-center shrink-0">
                      <img
                        src="/images/manage/product/arrow_line.svg"
                        alt="arrow"
                        width={120}
                        height={12}
                        className="pointer-events-none select-none"
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </SortableContext>

            {/* 右侧添加按钮 */}
            <div className="ml-1">
              <button
                className="w-4 h-4 rounded-full border border-[#306EFD] text-[#306EFD] flex items-center justify-center hover:bg-blue-50 transition-colors cursor-pointer"
                onClick={() => onCreate('right')}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* 拖拽预览 */}
          <DragOverlay adjustScale={false}>
            {dragNode && (
              <div className="w-[163px] h-[48px]">
                <NodeContent node={dragNode} isActive={dragNode.id === activeNodeId} isDragging />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
