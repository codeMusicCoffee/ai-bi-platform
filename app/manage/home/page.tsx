'use client';

import { TreeDataItem } from '@/components/ui/tree';
import { useState } from 'react';
import { CategoryFormDialog, CategoryFormType } from './CategoryFormDialog';
import { CategoryTree } from './CategoryTree';
import { ProductCard } from './ProductCard';
import { ProductDetailView } from './ProductDetailView';
import { EmptyStateType, ProductEmptyState } from './ProductEmptyState';

export default function ProductManagePage() {
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<number>(-1);
  const [selectedItem, setSelectedItem] = useState<TreeDataItem | null>(null);

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
    const type: CategoryFormType = level === 0 ? '品类' : level === 1 ? '系列' : '品牌';
    setDialogConfig({
      mode: 'edit',
      type,
      item,
      parentItem,
    });
    setDialogOpen(true);
  };

  const handleCreateInTree = (item: TreeDataItem, level: number) => {
    const type: CategoryFormType = level === 0 ? '系列' : '品牌';
    setDialogConfig({
      mode: 'create',
      type,
      parentItem: item,
    });
    setDialogOpen(true);
  };

  // 根据选中层级判断展示内容
  const renderContent = () => {
    if (selectedLevel === 3) {
      return <ProductDetailView productName={selectedItem?.label || ''} />;
    }

    if (selectedLevel === 2) {
      return <ProductCard />;
    }

    let emptyType: EmptyStateType = '品类';
    if (selectedLevel === 0) emptyType = '系列';
    else if (selectedLevel === 1) emptyType = '品牌';

    return <ProductEmptyState type={emptyType} onAdd={handleAdd} />;
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#f0f2f5]">
      {/* 侧边栏作为页面内容的一部分 */}
      <CategoryTree
        selectedId={selectedId}
        onSelect={handleSelect}
        onEdit={handleEdit}
        onCreate={handleCreateInTree}
        onAddRoot={() => {
          setDialogConfig({ mode: 'create', type: '品类' });
          setDialogOpen(true);
        }}
      />

      {/* 右侧业务内容区域 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">{renderContent()}</div>

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogConfig.mode}
        type={dialogConfig.type}
        parentName={dialogConfig.parentItem?.label}
        initialData={
          dialogConfig.mode === 'edit' ? { name: dialogConfig.item?.label || '' } : undefined
        }
        onSubmit={(data) => {
          console.log('Submit Success:', data);
        }}
      />
    </div>
  );
}
