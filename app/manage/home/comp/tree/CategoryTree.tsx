'use client';

import { Tree, TreeDataItem } from '@/components/common/SealedTree';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ExternalLink, MoreVertical, Plus, Search, Trash2 } from 'lucide-react';
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
          <Plus className="mr-2 h-4 w-4" /> 新建品类
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4 flex flex-col">
        {/* 新实现 */}
        <Tree
          data={data}
          selectedId={selectedId}
          loading={loading}
          className="flex-1"
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
            return <img src={iconPath} alt={`level-${level}`} className="w-4 h-4 shrink-0" />;
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
      </nav>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
              onClick={() => setDeleteDialogOpen(false)}
              type="button"
              variant="ghost"
              className="bg-gray-100 hover:bg-gray-200 text-gray-600"
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
    </aside>
  );
}
