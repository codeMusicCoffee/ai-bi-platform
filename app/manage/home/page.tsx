'use client';

import { TreeDataItem } from '@/components/ui/tree';
import { pmService } from '@/services/pm';
import { useCallback, useEffect, useState } from 'react';
import { BrandCard } from './comp/brand/BrandCard';
import { ProductCard } from './comp/product/ProductCard';
import { AddDialog, CategoryFormType } from './comp/tree/AddDialog';
import { CategoryTree } from './comp/tree/CategoryTree';
import { EmptyStateType, ProductEmptyState, WelcomeEmptyState } from './EmptyState';

export default function ProductManagePage() {
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<number>(-1);
  const [selectedItem, setSelectedItem] = useState<TreeDataItem | null>(null);
  const [treeData, setTreeData] = useState<TreeDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 弹窗状态管理
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    mode: 'create' | 'edit';
    type: CategoryFormType;
    item?: TreeDataItem;
    parentItem?: TreeDataItem;
  }>({
    mode: 'create',
    type: '品类',
  });

  const fetchTree = useCallback(async (targetId?: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await pmService.getTree();
      console.log('Tree API Response:', res);
      if (res.success) {
        const rawData = res.data;
        const categories = rawData.categories || (Array.isArray(rawData) ? rawData : []);
        console.log('Extracted Categories:', categories);

        const mapNode = (
          node: any,
          type: CategoryFormType | '产品',
          parentId?: string
        ): TreeDataItem => {
          const subItems = node.series || node.brands || node.products || [];
          const nextTypeMap: Record<string, CategoryFormType | '产品'> = {
            品类: '系列',
            系列: '品牌',
            品牌: '产品',
          };
          const nextType = nextTypeMap[type] || '产品';

          return {
            id: node.id,
            label: node.name,
            children:
              Array.isArray(subItems) && subItems.length > 0
                ? subItems.map((child: any) => mapNode(child, nextType, node.id))
                : undefined,
            ...({ type, parentId } as any),
          };
        };

        const mappedData = categories.map((cat: any) => mapNode(cat, '品类'));
        console.log('Mapped Tree Data:', mappedData);
        setTreeData(mappedData);

        // 如果指定了 targetId，尝试选中它
        if (targetId) {
          const findNodeAndLevel = (
            nodes: TreeDataItem[],
            id: string,
            level = 0
          ): { item: TreeDataItem; level: number } | null => {
            for (const node of nodes) {
              if (node.id === id) return { item: node, level };
              if (node.children) {
                const found = findNodeAndLevel(node.children, id, level + 1);
                if (found) return found;
              }
            }
            return null;
          };

          const found = findNodeAndLevel(mappedData, targetId);
          if (found) {
            handleSelect(found.item, found.level);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch tree:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const handleSelect = (node: TreeDataItem, level: number) => {
    setSelectedId(node.id);
    setSelectedLevel(level);
    setSelectedItem(node);
  };

  const handleAdd = () => {
    // 根据选中层级判断弹窗配置
    if (selectedLevel === -1) {
      setDialogConfig({ mode: 'create', type: '品类' });
    } else if (selectedLevel === 0) {
      setDialogConfig({ mode: 'create', type: '系列', parentItem: selectedItem || undefined });
    } else if (selectedLevel === 1) {
      setDialogConfig({ mode: 'create', type: '品牌', parentItem: selectedItem || undefined });
    }
    setDialogOpen(true);
  };

  const handleEdit = (item: TreeDataItem, level: number, parentItem?: TreeDataItem) => {
    const type: CategoryFormType =
      level === 0 ? '品类' : level === 1 ? '系列' : level === 2 ? '品牌' : '产品';
    setDialogConfig({
      mode: 'edit',
      type,
      item,
      parentItem,
    });
    setDialogOpen(true);
  };

  const handleCreateInTree = (item: TreeDataItem, level: number) => {
    const type: CategoryFormType = level === 0 ? '系列' : level === 1 ? '品牌' : '产品';
    setDialogConfig({
      mode: 'create',
      type,
      parentItem: item,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (item: TreeDataItem) => {
    // 根据 item 的层级决定调用哪个接口比较麻烦，
    // 我们可以通过在 TreeDataItem 中存储元数据，或者根据选中的 level 决定。
    // 为了简单，我们可以在 mapNode 时给 label 附加一些元数据，或者在这里根据 id 查找。
    // 实际上更稳妥的方法是在 TreeDataItem 中包含类型信息。
    // 这里先简单通过 level 寻找（需要先找到该节点的 level）
    const findLevelAndParent = (
      nodes: TreeDataItem[],
      targetId: string,
      currentLevel = 0,
      currentParent: TreeDataItem | null = null
    ): { level: number; parentId: string | null } => {
      for (const n of nodes) {
        if (n.id === targetId) return { level: currentLevel, parentId: currentParent?.id || null };
        if (n.children) {
          const res = findLevelAndParent(n.children, targetId, currentLevel + 1, n);
          if (res.level !== -1) return res;
        }
      }
      return { level: -1, parentId: null };
    };
    const { level, parentId } = findLevelAndParent(treeData, item.id);

    try {
      if (level === 0) {
        await pmService.deleteCategory(item.id);
      } else if (level === 1) {
        await pmService.deleteSeries(item.id);
      } else if (level === 2) {
        await pmService.deleteBrand(item.id);
      } else if (level === 3) {
        await pmService.deleteProduct(item.id);
      }
      // 删除后选中父节点
      fetchTree(parentId || undefined);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleBack = () => {
    if (!selectedItem) return;
    const parentId = (selectedItem as any).parentId;
    if (parentId) {
      const findNodeAndLevel = (
        nodes: TreeDataItem[],
        id: string,
        level = 0
      ): { item: TreeDataItem; level: number } | null => {
        for (const node of nodes) {
          if (node.id === id) return { item: node, level };
          if (node.children) {
            const found = findNodeAndLevel(node.children, id, level + 1);
            if (found) return found;
          }
        }
        return null;
      };

      const found = findNodeAndLevel(treeData, parentId);
      if (found) {
        handleSelect(found.item, found.level);
      }
    }
  };

  // 根据选中层级判断展示内容
  const renderContent = () => {
    // 1. 完全没有数据时的空状态
    if (treeData.length === 0) {
      return <WelcomeEmptyState />;
    }

    // 2. 有数据但尚未选中任何节点时的欢迎页
    if (selectedLevel === -1) {
      return <WelcomeEmptyState showNoContent={false} />;
    }

    // 3. 选中具体层级后的展示逻辑
    if (selectedLevel === 3) {
      return (
        <ProductCard
          productId={selectedId}
          productName={selectedItem?.label || ''}
          onBack={handleBack}
          onRefreshTree={() => fetchTree(selectedId, true)}
        />
      );
    }

    if (selectedLevel === 2) {
      return (
        <BrandCard
          brandId={selectedId}
          onRefreshTree={() => fetchTree(selectedId, true)}
          onViewProduct={(productId: string) => {
            // Find the product node in the tree and select it
            const findNodeAndLevel = (
              nodes: TreeDataItem[],
              id: string,
              level = 0
            ): { item: TreeDataItem; level: number } | null => {
              for (const node of nodes) {
                if (node.id === id) return { item: node, level };
                if (node.children) {
                  const found = findNodeAndLevel(node.children, id, level + 1);
                  if (found) return found;
                }
              }
              return null;
            };

            const found = findNodeAndLevel(treeData, productId);
            if (found) {
              handleSelect(found.item, found.level);
            }
          }}
        />
      );
    }

    let emptyType: EmptyStateType = '品类';
    if (selectedLevel === 0) emptyType = '系列';
    else if (selectedLevel === 1) emptyType = '品牌';

    return (
      <ProductEmptyState type={emptyType} onAdd={handleAdd} selectedName={selectedItem?.label} />
    );
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#f0f2f5]">
      {/* 侧边栏作为页面内容的一部分 */}
      <CategoryTree
        data={treeData}
        selectedId={selectedId}
        loading={loading}
        onSelect={handleSelect}
        onEdit={handleEdit}
        onCreate={handleCreateInTree}
        onDelete={handleDelete}
        onAddRoot={() => {
          setDialogConfig({ mode: 'create', type: '品类' });
          setDialogOpen(true);
        }}
      />

      {/* 右侧业务内容区域 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">{renderContent()}</div>

      <AddDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogConfig.mode}
        type={dialogConfig.type}
        parentName={dialogConfig.parentItem?.label}
        initialData={
          dialogConfig.mode === 'edit' ? { name: dialogConfig.item?.label || '' } : undefined
        }
        onSubmit={async (data) => {
          try {
            let result;
            if (dialogConfig.mode === 'create') {
              if (dialogConfig.type === '品类') {
                result = await pmService.createCategory({ name: data.name });
              } else if (dialogConfig.type === '系列') {
                result = await pmService.createSeries({
                  category_id: dialogConfig.parentItem!.id,
                  name: data.name,
                });
              } else if (dialogConfig.type === '品牌') {
                result = await pmService.createBrand({
                  category_id: (dialogConfig.parentItem as any).parentId,
                  series_id: dialogConfig.parentItem!.id,
                  name: data.name,
                });
              } else if (dialogConfig.type === '产品') {
                result = await pmService.createProduct({
                  brand_id: dialogConfig.parentItem!.id,
                  name: data.name,
                  image_url: data.image_url,
                });
              }
            } else {
              // Edit mode
              const id = dialogConfig.item!.id;
              if (dialogConfig.type === '品类') {
                result = await pmService.updateCategory(id, { name: data.name });
              } else if (dialogConfig.type === '系列') {
                result = await pmService.updateSeries(id, { name: data.name });
              } else if (dialogConfig.type === '品牌') {
                result = await pmService.updateBrand(id, { name: data.name });
              } else if (dialogConfig.type === '产品') {
                result = await pmService.updateProduct(id, {
                  name: data.name,
                  image_url: data.image_url,
                });
              }
            }

            // 获取新创建或更新后的节点 ID
            const targetId = result?.data?.id || dialogConfig.item?.id;
            fetchTree(targetId);
            setDialogOpen(false);
          } catch (error) {
            console.error('Submit failed:', error);
          }
        }}
      />
    </div>
  );
}
