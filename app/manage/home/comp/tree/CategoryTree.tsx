'use client';

import { AlertDialog } from '@/components/common/AlertDialog';
import { Tree, TreeDataItem } from '@/components/common/SealedTree';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, MoreVertical, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface CategoryTreeProps {
  data: TreeDataItem[];
  selectedId: string;
  loading?: boolean;
  onSelect: (node: TreeDataItem, level: number) => void;
  onEdit: (item: TreeDataItem, level: number, parentItem?: TreeDataItem) => void;
  onCreate: (item: TreeDataItem, level: number) => void;
  onDelete: (item: TreeDataItem) => void;
  onAddRoot: () => void;
}

export function CategoryTree({
  data,
  selectedId,
  loading,
  onSelect,

  onEdit,
  onCreate,
  onDelete,
  onAddRoot,
}: CategoryTreeProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<TreeDataItem | null>(null);

  const handleDeleteClick = (item: TreeDataItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="p-4 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="输入搜索关键词"
            className="pl-9 bg-white border-gray-200 rounded-full h-9 text-[13px]"
          />
        </div>
        <Separator className="bg-gray-200" />

        <Button className="w-full h-9 rounded-[8px] cursor-pointer" onClick={onAddRoot}>
          <Plus /> 新建品类
        </Button>
      </div>

      <ScrollArea className="flex-1 w-full px-2 pb-4">
        <Tree
          data={data}
          selectedId={selectedId}
          loading={loading}
          className="flex-1 min-w-0 overflow-hidden"
          onNodeClick={(node) => {
            const findLevel = (
              nodes: TreeDataItem[],
              targetId: string,
              currentLevel = 0
            ): number => {
              for (const n of nodes) {
                if (n.id === targetId) return currentLevel;
                if (n.children) {
                  const lv = findLevel(n.children, targetId, currentLevel + 1);
                  if (lv !== -1) return lv;
                }
              }
              return -1;
            };
            const level = findLevel(data, node.id);
            onSelect(node, level);
          }}
          initialExpandedIds={[]}
          renderIcon={({ level }) => {
            if (level >= 3) return null;
            const iconPath = `/images/manage/home/level${level + 1}.svg`;
            return <img src={iconPath} alt={`level-${level}`} />;
          }}
          renderActions={({ item, level, parentItem }) =>
            level < 3 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 transition-colors">
                    <MoreVertical className="h-3.5 w-3.5 text-gray-400 shrink-0 cursor-pointer hover:text-gray-600 transition-colors" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-[120px]">
                  <DropdownMenuItem
                    className="text-gray-600 focus:text-[#3b82f6] focus:bg-blue-50 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item, level, parentItem);
                    }}
                  >
                    <ExternalLink className="mr-2 h-3.5 w-3.5" />
                    <span>编辑</span>
                  </DropdownMenuItem>
                  {level <= 2 && (
                    <DropdownMenuItem
                      className="text-gray-600 focus:text-[#3b82f6] focus:bg-blue-50 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreate(item, level);
                      }}
                    >
                      <Plus className="mr-2 h-3.5 w-3.5" />
                      <span>
                        {level === 0 ? '新建系列' : level === 1 ? '新建品牌' : '新建产品'}
                      </span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-gray-600 focus:text-[#3b82f6] focus:bg-blue-50 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(item);
                    }}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    <span>删除</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }
        />
      </ScrollArea>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </aside>
  );
}
