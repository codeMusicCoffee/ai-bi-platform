'use client';

import { pmService } from '@/services/pm';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LifecycleNode } from '../types';

interface UseLifecycleNodesOptions {
  productId: string;
  onEditModeEnter?: () => void;
}

type FetchDataOptions = {
  fallbackSelect?: 'first' | 'last';
  preferId?: string | null;
};

export function useLifecycleNodes({ productId, onEditModeEnter }: UseLifecycleNodesOptions) {
  const [nodes, setNodes] = useState<LifecycleNode[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);
  const isDragOccurred = useRef(false);

  // 获取节点数据
  const fetchData = useCallback(async (options?: FetchDataOptions) => {
    if (!productId) return;
    const { fallbackSelect = 'first', preferId } = options || {};
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

      // 保持当前选中，或按策略选择首/尾节点
      setActiveNodeId((prev) => {
        const targetId = preferId ?? prev;
        if (targetId && newNodes.some((n) => n.id === targetId)) {
          return targetId;
        }
        return fallbackSelect === 'last'
          ? newNodes[newNodes.length - 1]?.id || null
          : newNodes[0]?.id || null;
      });
    } catch (error) {
      console.error('Failed to fetch lifecycles:', error);
    } finally {
      setLoading(false);
      setInitialFetchDone(true);
    }
  }, [productId]);

  // 初始化加载
  useEffect(() => {
    setInitialFetchDone(false);
    setNodes([]);
    fetchData();
  }, [productId, fetchData]);

  // 创建节点
  const createNode = useCallback(
    async (position: 'left' | 'right' = 'right') => {
      try {
        const res = await pmService.createLifecycle({
          product_id: productId,
          name: `节点名称${nodes.length + 1}`,
          description: '',
        });

        const newId = typeof res.data === 'string' ? res.data : res.data?.id;
        if (newId) {
          setActiveNodeId(newId);
          onEditModeEnter?.();

          // 左侧插入需要重排序
          if (position === 'left' && nodes.length > 0) {
            const items = [
              { lifecycle_id: newId, sort_order: 1 },
              ...nodes.map((node, index) => ({
                lifecycle_id: node.id,
                sort_order: index + 2,
              })),
            ];
            await pmService.reorderLifecycles({ product_id: productId, items });
          }
        }

        await fetchData({ fallbackSelect: 'last', preferId: newId || null });
        return newId;
      } catch (error) {
        console.error('Failed to create node:', error);
        return null;
      }
    },
    [productId, nodes, fetchData, onEditModeEnter]
  );

  // 删除节点
  const deleteNode = useCallback(
    async (id: string) => {
      await pmService.deleteLifecycle(id);
      if (activeNodeId === id) {
        setActiveNodeId(null);
      }
      await fetchData();
    },
    [activeNodeId, fetchData]
  );

  // 更新节点信息
  const updateNode = useCallback(
    async (id: string, values: { name: string; description: string }) => {
      await pmService.updateLifecycle(id, values);
      await fetchData();
    },
    [fetchData]
  );

  // 设为当前阶段
  const setCurrentStage = useCallback(
    async (id: string) => {
      await pmService.setProductCurrentStage(productId, id);
      await fetchData();
    },
    [productId, fetchData]
  );

  // 重新排序
  const reorderNodes = useCallback(
    async (newNodes: LifecycleNode[]) => {
      setNodes(newNodes);
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
        await fetchData(); // 回滚
      }
    },
    [productId, fetchData]
  );

  // 应用模板
  const applyTemplate = useCallback(async () => {
    const steps = ['研发', '试销', '生产', '上市', '退市'];
    for (const step of steps) {
      await pmService.createLifecycle({
        product_id: productId,
        name: step,
        description: `这是${step}阶段的描述`,
      });
    }
    await fetchData();
    onEditModeEnter?.();
  }, [productId, fetchData, onEditModeEnter]);

  // 节点点击（过滤拖拽）
  const handleNodeClick = useCallback((id: string) => {
    if (isDragOccurred.current) return;
    setActiveNodeId(id);
  }, []);

  // 当前选中的节点
  const activeNode = nodes.find((n) => n.id === activeNodeId);

  return {
    // 状态
    nodes,
    activeNodeId,
    activeNode,
    loading,
    initialFetchDone,
    dragActiveId,
    isDragOccurred,

    // 操作
    setActiveNodeId,
    setDragActiveId,
    setNodes,
    fetchData,
    createNode,
    deleteNode,
    updateNode,
    setCurrentStage,
    reorderNodes,
    applyTemplate,
    handleNodeClick,
  };
}
