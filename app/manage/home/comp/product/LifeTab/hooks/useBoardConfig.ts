'use client';

import { pmService } from '@/services/pm';
import { useCallback, useEffect, useState } from 'react';
import { DashboardItem } from '../types';

interface UseBoardConfigOptions {
  activeNodeId: string | null;
}

export function useBoardConfig({ activeNodeId }: UseBoardConfigOptions) {
  const [tableData, setTableData] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 弹窗状态
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddBoardOpen, setIsAddBoardOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  const [currentBoard, setCurrentBoard] = useState<DashboardItem | null>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');

  // 获取看板数据
  const fetchBoards = useCallback(async (lifecycleId: string, currentPage = page) => {
    try {
      setLoading(true);
      const res = await pmService.getNodeDatasets(lifecycleId, {
        page: currentPage,
        pageSize: pageSize,
      });
      const data = res.data as any;
      const rawData = Array.isArray(data) ? data : data?.items || data?.list || [];
      const totalCount = data?.total || rawData.length;

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
      setTotal(totalCount);
      setPage(currentPage);
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // 监听节点或分页变化
  useEffect(() => {
    if (activeNodeId) {
      fetchBoards(activeNodeId, page);
    }
  }, [activeNodeId, page, pageSize, fetchBoards]);

  // 打开新增弹窗
  const openCreate = useCallback(() => {
    setMode('create');
    setCurrentBoard(null);
    setIsConfigOpen(true);
  }, []);

  // 打开编辑弹窗
  const openEdit = useCallback((board: DashboardItem) => {
    setMode('edit');
    setCurrentBoard(board);
    setIsConfigOpen(true);
  }, []);

  // 打开删除确认
  const openDelete = useCallback((id: string) => {
    setBoardToDelete(id);
    setIsDeleteOpen(true);
  }, []);

  // 确认删除
  const confirmDelete = useCallback(async () => {
    if (!boardToDelete || !activeNodeId) return;
    try {
      await pmService.deleteNodeDataset(boardToDelete);
      await fetchBoards(activeNodeId);
      setIsDeleteOpen(false);
      setBoardToDelete(null);
    } catch (error) {
      console.error('Failed to delete board:', error);
    }
  }, [boardToDelete, activeNodeId, fetchBoards]);

  // 保存看板
  const saveBoard = useCallback(
    async (values: any) => {
      if (!activeNodeId) return;
      try {
        if (mode === 'create') {
          await pmService.createNodeDataset({
            lifecycle_id: activeNodeId,
            ...values,
          });
        } else if (currentBoard) {
          await pmService.updateNodeDataset(currentBoard.id, values);
        }
        await fetchBoards(activeNodeId);
        setIsConfigOpen(false);
      } catch (error) {
        console.error('Failed to save board:', error);
        throw error;
      }
    },
    [mode, currentBoard, activeNodeId, fetchBoards]
  );

  return {
    // 数据
    tableData,
    loading,
    selectedRowKeys,
    currentBoard,
    mode,
    page,
    pageSize,
    total,

    // 弹窗状态
    isConfigOpen,
    isDeleteOpen,
    isAddBoardOpen,

    // 操作
    setPage,
    setPageSize,
    setSelectedRowKeys,
    setIsConfigOpen,
    setIsDeleteOpen,
    setIsAddBoardOpen,
    fetchBoards,
    openCreate,
    openEdit,
    openDelete,
    confirmDelete,
    saveBoard,
  };
}
