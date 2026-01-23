'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft } from 'lucide-react';
import { BasicInfoTab } from './BasicInfoTab';
import { LifecycleTab } from './LifecycleTab';

export function ProductCard({
  productId,
  productName,
  onBack,
  onRefreshTree,
}: {
  productId: string;
  productName: string;
  onBack?: () => void;
  onRefreshTree?: () => void;
}) {
  return (
    <Tabs defaultValue="base" className="w-full animate-in fade-in duration-500">
      <div className="space-y-6">
        {/* Header with Title and TabsList */}
        <div className="bg-white px-6 pt-6 pb-0 rounded-[12px] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-1  rounded-md transition-colors cursor-pointer text-gray-400 hover:text-gray-600 flex items-center justify-center -ml-2"
              >
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">{productName}</h2>
            </div>
            <Button className="h-9 px-6 bg-[#306EFD] hover:bg-[#285cd1] text-white shadow-sm cursor-pointer">
              生成首页
            </Button>
          </div>
          <TabsList className="bg-transparent h-auto p-0 gap-8 -mb-px">
            <TabsTrigger
              value="base"
              className="px-0 py-3 rounded-none border-b-[3px] border-transparent data-[state=active]:border-[#306EFD] data-[state=active]:text-[#306EFD] data-[state=active]:shadow-none font-medium transition-all"
            >
              基础信息管理
            </TabsTrigger>
            <TabsTrigger
              value="lifecycle"
              className="px-0 py-3 rounded-none border-b-[3px] border-transparent data-[state=active]:border-[#306EFD] data-[state=active]:text-[#306EFD] data-[state=active]:shadow-none font-medium transition-all text-gray-500 hover:text-gray-700"
            >
              生命周期管理
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="px-0 py-3 rounded-none border-b-[3px] border-transparent data-[state=active]:border-[#306EFD] data-[state=active]:text-[#306EFD] data-[state=active]:shadow-none font-medium transition-all text-gray-500 hover:text-gray-700"
            >
              看板管理
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Contents - Outside the header div to keep cards separate */}
        <TabsContent value="base" className="mt-0 outline-none">
          <BasicInfoTab productId={productId} onRefreshTree={onRefreshTree} />
        </TabsContent>

        <TabsContent value="lifecycle" className="mt-0 outline-none">
          <LifecycleTab productId={productId} />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-0 outline-none">
          <div className="bg-white p-12 rounded-[12px] text-center text-gray-400 border border-dashed">
            看板管理模块开发中...
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
