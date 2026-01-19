'use client';

import React from 'react';
import { ManageHeader } from './_components/ManageHeader';

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-[#f0f2f5] overflow-hidden font-sans">
      {/* 顶部标题栏区域 - 全局统一 */}
      <ManageHeader />

      {/* 主内容区域 - 由各子页面自由定义内部布局（如是否带侧边栏） */}
      <main className="flex-1 overflow-hidden min-w-0">{children}</main>
    </div>
  );
}
