'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ChevronRight, MoreVertical, Plus, Search } from 'lucide-react';
import React from 'react';

export function ManageSidebar() {
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

        {/* 新实现 */}
        <Button className="w-full bg-primary text-primary-foreground h-9 rounded-[8px] cursor-pointer">
          <Plus className="mr-2 h-4 w-4" /> 新建品类
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2">
        {/* Mock Navigation Tree */}
        <div className="space-y-1">
          <NavItem label="星木自然" icon={<ChevronRight className="h-3.5 w-3.5" />} expanded>
            <NavItem label="毛铺草本酒" depth={1} />
            <NavItem label="草本荞调" depth={1} />
            <NavItem label="单本年份酒" depth={1} />
          </NavItem>
          <NavItem label="劲牌酒" icon={<ChevronRight className="h-3.5 w-3.5" />} expanded>
            <NavItem label="劲酒系列" depth={1} expanded>
              <NavItem label="中国劲酒数字号" depth={2} active />
            </NavItem>
          </NavItem>
          <NavItem label="金标系列" icon={<ChevronRight className="h-3.5 w-3.5" />} />
          <NavItem label="蓝标系列" icon={<ChevronRight className="h-3.5 w-3.5" />} />
        </div>
      </nav>
    </aside>
  );
}

function NavItem({
  label,
  children,
  depth = 0,
  active = false,
  expanded = false,
  icon,
}: {
  label: string;
  children?: React.ReactNode;
  depth?: number;
  active?: boolean;
  expanded?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <div
        className={cn(
          'flex items-center justify-between px-3 py-1.5 text-[13px] rounded-md cursor-pointer hover:bg-gray-100 group transition-colors mb-0.5',
          active && 'text-[#3b82f6] font-medium bg-blue-50/80',
          depth === 1 && 'ml-4',
          depth === 2 && 'ml-8'
        )}
      >
        <div className="flex items-center space-x-2 truncate">
          {icon ? (
            <span className={cn('transition-transform', expanded && 'rotate-90')}>{icon}</span>
          ) : (
            <div className="w-4" />
          )}
          <span className="truncate">{label}</span>
        </div>
        <MoreVertical className="h-3.5 w-3.5 text-gray-400 shrink-0" />
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}
