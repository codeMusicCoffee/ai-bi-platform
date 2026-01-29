'use client';

import { AlertDialog } from '@/components/common/AlertDialog';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { toast } from 'sonner';
import { AddBoard } from '../BoardTab/AddBoard';
import { AddBoardConfig } from './AddBoardConfig';
import { BoardConfigSection } from './BoardConfigSection';
import { useBoardConfig } from './hooks/useBoardConfig';
import { useLifecycleNodes } from './hooks/useLifecycleNodes';
import { LifeEmpty } from './LifeEmpty';
import { NodeFlowArea } from './NodeFlowArea';
import { NodeInfoSection } from './NodeInfoSection';

import { NodeInfoValues } from './types';

// 导出类型供外部使用
export type { DashboardItem, LifecycleNode } from './types';

interface LifeCycleTabProps {
  productId: string;
}

export function LifeCycleTab({ productId }: LifeCycleTabProps) {
  // 节点信息编辑状态
  const [isEditingNodeInfo, setIsEditingNodeInfo] = useState(false);

  // 节点数据管理
  const {
    nodes,
    activeNodeId,
    activeNode,
    loading,
    initialFetchDone,
    createNode,
    deleteNode,
    updateNode,
    setCurrentStage,
    reorderNodes,
    applyTemplate,
    handleNodeClick,
  } = useLifecycleNodes({
    productId,
    onEditModeEnter: () => setIsEditingNodeInfo(true),
  });

  // 看板配置管理
  const {
    tableData,
    loading: boardLoading,
    selectedRowKeys,
    currentBoard,
    mode: boardMode,
    isConfigOpen,
    isDeleteOpen: isBoardDeleteOpen,
    isAddBoardOpen,
    setSelectedRowKeys,
    setIsConfigOpen,
    setIsDeleteOpen: setIsBoardDeleteOpen,
    setIsAddBoardOpen,
    openCreate: openBoardCreate,
    openEdit: openBoardEdit,
    openDelete: openBoardDelete,
    confirmDelete: confirmBoardDelete,
    saveBoard,
  } = useBoardConfig({ activeNodeId });

  // 节点删除状态
  const [isNodeDeleteOpen, setIsNodeDeleteOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);

  // 节点信息提交
  const handleNodeInfoSubmit = async (values: NodeInfoValues) => {
    if (!activeNodeId) return;
    await updateNode(activeNodeId, values);
    setIsEditingNodeInfo(false);
  };

  // 打开节点删除确认
  const handleOpenNodeDelete = (id: string) => {
    setNodeToDelete(id);
    setIsNodeDeleteOpen(true);
  };

  // 确认删除节点
  const handleConfirmNodeDelete = async () => {
    if (nodeToDelete) {
      await deleteNode(nodeToDelete);
      setIsNodeDeleteOpen(false);
      setNodeToDelete(null);
    }
  };

  // 生成看板
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

  // 看板保存
  const handleBoardConfirm = async (values: any) => {
    if (!activeNodeId) {
      toast.error('当前没有选中的节点，无法保存看板');
      return;
    }
    try {
      await saveBoard(values);
    } catch (error: any) {
      toast.error('保存看板失败: ' + (error.message || '未知错误'));
    }
  };

  // 加载状态
  if (loading && !initialFetchDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-in fade-in duration-500">
        <div className="w-10 h-10 border-4 border-blue-50 border-t-[#306EFD] rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">正在加载生命周期数据...</p>
      </div>
    );
  }

  // 空状态
  if (initialFetchDone && nodes.length === 0) {
    return <LifeEmpty onCreate={() => createNode('right')} onApplyTemplate={applyTemplate} />;
  }

  return (
    <Card className="border-none shadow-sm rounded-[12px] bg-white overflow-hidden animate-in fade-in duration-500">
      <CardContent className="p-0">
        {/* 1. 节点流程可视化 */}
        <NodeFlowArea
          nodes={nodes}
          activeNodeId={activeNodeId}
          onNodeClick={handleNodeClick}
          onOpenDelete={handleOpenNodeDelete}
          onSetCurrent={setCurrentStage}
          onCreate={createNode}
          onReorder={reorderNodes}
        />
        {/* 2. 节点信息 */}
        <NodeInfoSection
          activeNode={activeNode}
          isEditing={isEditingNodeInfo}
          onEditToggle={setIsEditingNodeInfo}
          onSubmit={handleNodeInfoSubmit}
        />
        {/* 3. 看板配置 */}
        <BoardConfigSection
          tableData={tableData}
          loading={boardLoading}
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={setSelectedRowKeys}
          onAddBoard={openBoardCreate}
          onEditBoard={openBoardEdit}
          onDeleteBoard={openBoardDelete}
          onGenerateBoard={handleGenerateBoard}
        />
      </CardContent>

      {/* 节点删除确认 */}
      <AlertDialog
        open={isNodeDeleteOpen}
        onOpenChange={setIsNodeDeleteOpen}
        onConfirm={handleConfirmNodeDelete}
      />

      {/* 看板删除确认 */}
      <AlertDialog
        open={isBoardDeleteOpen}
        onOpenChange={setIsBoardDeleteOpen}
        onConfirm={confirmBoardDelete}
      />

      {/* 看板配置弹窗 */}
      <AddBoardConfig
        open={isConfigOpen}
        onOpenChange={setIsConfigOpen}
        mode={boardMode}
        initialData={currentBoard}
        onConfirm={handleBoardConfirm}
      />

      {/* 生成看板弹窗 */}
      <AddBoard
        open={isAddBoardOpen}
        onOpenChange={setIsAddBoardOpen}
        productId={productId}
        lifecycleId={activeNodeId || undefined}
        moduleConfigIds={selectedRowKeys}
      />
    </Card>
  );
}
