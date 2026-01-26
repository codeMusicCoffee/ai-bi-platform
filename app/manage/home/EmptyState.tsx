'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Image from 'next/image';

export type EmptyStateType = '品类' | '系列' | '品牌';

interface ProductEmptyStateProps {
  type: EmptyStateType;
  onAdd: () => void;
  title?: string;
  description?: string;
  selectedName?: string;
}

export function ProductEmptyState({
  type,
  onAdd,
  title,
  description,
  selectedName,
}: ProductEmptyStateProps) {
  // 计算父级类型名称
  const parentTypeName = type === '系列' ? '品类' : type === '品牌' ? '系列' : '';

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-white rounded-[16px] border border-gray-100 p-8 text-center transition-all animate-in fade-in duration-500">
      {/* 顶部插画 */}
      <div className="relative w-full max-w-[480px] aspect-video mb-8">
        <Image
          src="/images/manage/home/welcome.svg"
          alt="Welcome"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* 主标题 */}
      <h2 className="text-[22px] font-bold text-[#262626] mb-4">欢迎使用产品生命周期驾驶舱系统</h2>

      {/* 上下文信息与描述 */}
      <div className="flex flex-col items-center gap-2 mb-10 overflow-hidden w-full max-w-[500px]">
        {selectedName && parentTypeName && (
          <div className="flex items-center text-[15px] text-[#8C8C8C] whitespace-nowrap">
            <span>当前{parentTypeName}：</span>
            <span
              className="text-[#262626] font-semibold truncate max-w-[300px]"
              title={selectedName}
            >
              {selectedName}
            </span>
          </div>
        )}
        {description && (
          <p className="text-[14px] text-[#9EABC2] leading-relaxed px-10">{description}</p>
        )}
      </div>

      {/* 操作按钮 */}
      <Button
        onClick={onAdd}
        className="h-11 px-12 rounded-lg  text-white font-medium shadow-md shadow-blue-100 transition-all active:translate-y-0.5 flex items-center gap-2 text-[15px] cursor-pointer"
      >
        <Plus className="h-4.5 w-4.5" />
        新增{type}
      </Button>
    </div>
  );
}

/**
 * 欢迎页空状态组件
 */
export function WelcomeEmptyState({ showNoContent = true }: { showNoContent?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-white rounded-[16px] border border-gray-100 p-8 text-center animate-in fade-in duration-700">
      <div className="relative w-full max-w-[480px] aspect-video mb-8">
        <Image
          src="/images/manage/home/welcome.svg"
          alt="Welcome"
          fill
          className="object-contain"
          priority
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-[20px] font-bold text-[#262626]">欢迎使用产品生命周期驾驶舱系统</h2>
        <p className="text-[14px] leading-relaxed" style={{ color: '#9EABC2' }}>
          {showNoContent && '暂无内容，'}请先在左侧完成{' '}
          <span className="text-[#306EFD] font-medium">“创建品类-新建系列-新建品牌”</span>
          ，再开始您的工作之旅。
        </p>
      </div>
    </div>
  );
}
