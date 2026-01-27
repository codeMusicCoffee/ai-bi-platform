/*
 * @Author: 'txy' '841067099@qq.com'
 * @Date: 2026-01-21 16:11:18
 * @LastEditors: 'txy' '841067099@qq.com'
 * @LastEditTime: 2026-01-27 16:40:52
 * @FilePath: \ai-bi-platform\app\manage\home\EmptyState.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Image from 'next/image';

export type EmptyStateType = '品类' | '系列' | '品牌';

interface EmptyStateProps {
  type?: EmptyStateType;
  onAdd?: () => void;
  showNoContent?: boolean;
}

function EmptyState({ type, onAdd, showNoContent = false }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-white rounded-[16px] border border-gray-100 p-8 text-center animate-in fade-in duration-500">
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
          <span className="text-[#306EFD] font-medium">"创建品类-新建系列-新建品牌"</span>
          ，再开始您的工作之旅。
        </p>
      </div>

      {type && onAdd && (
        <Button
          onClick={onAdd}
          className="mt-6 h-[32px] w-[112px] flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          新增{type}
        </Button>
      )}
    </div>
  );
}

export function ProductEmptyState({
  type,
  onAdd,
}: {
  type: EmptyStateType;
  onAdd: () => void;
}) {
  return <EmptyState type={type} onAdd={onAdd} />;
}

export function WelcomeEmptyState({ showNoContent = true }: { showNoContent?: boolean }) {
  return <EmptyState showNoContent={showNoContent} />;
}
