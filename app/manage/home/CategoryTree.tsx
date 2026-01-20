'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tree, TreeDataItem } from '@/components/ui/tree';
import { ExternalLink, MoreVertical, Plus, Search } from 'lucide-react';
export const MOCK_DATA: TreeDataItem[] = [
  {
    id: '1',
    label: '星木自然',
    children: [
      {
        id: '1-1',
        label: '草本系列',
        children: [
          { id: '1-1-1', label: '毛铺草本酒' },
          { id: '1-1-2', label: '草本荞调' },
          { id: '1-1-3', label: '单本年份酒' },
        ],
      },
    ],
  },
  {
    id: '2',
    label: '劲牌酒',
    children: [
      {
        id: '2-1',
        label: '劲酒系列',
        children: [
          {
            id: '2-1-1',
            label: '中国劲酒数字号',
            children: [{ id: '2-1-1-1', label: '125ml-35度酒' }],
          },
        ],
      },
    ],
  },
  { id: '3', label: '金标系列' },
  { id: '4', label: '蓝标系列' },
];

interface CategoryTreeProps {
  selectedId: string;
  onSelect: (node: TreeDataItem, level: number) => void;
  onEdit: (item: TreeDataItem, level: number, parentItem?: TreeDataItem) => void;
  onCreate: (item: TreeDataItem, level: number) => void;
  onAddRoot: () => void;
}

export function CategoryTree({
  selectedId,
  onSelect,
  onEdit,
  onCreate,
  onAddRoot,
}: CategoryTreeProps) {
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

        <Button
          className="w-full bg-primary text-primary-foreground h-9 rounded-[8px] cursor-pointer"
          onClick={onAddRoot}
        >
          <Plus className="mr-2 h-4 w-4" /> 新建品类
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {/* 新实现 */}
        <Tree
          data={MOCK_DATA}
          selectedId={selectedId}
          onNodeClick={(node) => {
            // 需要一个方式来计算 level
            // 简单处理：在 TreeDataItem 中存储或者在这里递归寻找
            // 为了简单，我们只在 CategoryTree 内部处理点击，然后传出去
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
            const level = findLevel(MOCK_DATA, node.id);
            onSelect(node, level);
          }}
          initialExpandedIds={['1', '2', '2-1']}
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
                  {level <= 1 && (
                    <DropdownMenuItem
                      className="text-gray-600 focus:text-[#3b82f6] focus:bg-blue-50 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreate(item, level);
                      }}
                    >
                      <Plus className="mr-2 h-3.5 w-3.5" />
                      <span>{level === 0 ? '新建系列' : '新建品牌'}</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }
        />
      </nav>
    </aside>
  );
}
