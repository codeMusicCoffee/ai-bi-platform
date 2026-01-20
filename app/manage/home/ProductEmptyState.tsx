'use client';

import { Button } from '@/components/ui/button';
import { Boxes, Layers, Plus, Tag } from 'lucide-react';

export type EmptyStateType = '品类' | '系列' | '品牌';

interface ProductEmptyStateProps {
  type: EmptyStateType;
  onAdd: () => void;
  title?: string;
  description?: string;
}

export function ProductEmptyState({ type, onAdd, title, description }: ProductEmptyStateProps) {
  const Icon = type === '品类' ? Boxes : type === '系列' ? Layers : Tag;

  const defaultTitle = `暂无${type}信息`;
  const defaultDescription = `当前选择的节点下尚未配置${type}，您可以立即开始创建。`;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-white rounded-[16px] border border-gray-100 p-16 text-center transition-all animate-in fade-in duration-500">
      <div className="relative mb-8 group">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[32px] flex items-center justify-center text-[#306EFD] shadow-inner group-hover:scale-105 transition-transform duration-300">
          <Icon size={48} strokeWidth={1.5} />
        </div>
      </div>

      <div className="space-y-3 max-w-sm mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{title || defaultTitle}</h3>
        <p className="text-[15px] text-gray-500 leading-relaxed">
          {description || defaultDescription}
        </p>
      </div>

      <div className="mt-10">
        <Button
          onClick={onAdd}
          className="h-12 px-8 rounded-xl bg-[#306EFD] hover:bg-[#285cd1] text-white font-semibold shadow-lg shadow-blue-200/50 transition-all  active:translate-y-0 flex items-center gap-2 text-[15px] cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          新增{type}
        </Button>
      </div>

      <div className="mt-20 pt-10 border-t border-gray-50 w-full max-w-2xl">
        <div className="grid grid-cols-3 gap-12">
          <div className="flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-[#306EFD] transition-colors">
              <Boxes size={24} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-bold text-gray-700">标准化</span>
              <span className="text-[11px] text-gray-400">统一数据规范</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-[#306EFD] transition-colors">
              <Layers size={24} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-bold text-gray-700">体系化</span>
              <span className="text-[11px] text-gray-400">层级结构清晰</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-[#306EFD] transition-colors">
              <Tag size={24} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-bold text-gray-700">精细化</span>
              <span className="text-[11px] text-gray-400">属性管理完备</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
