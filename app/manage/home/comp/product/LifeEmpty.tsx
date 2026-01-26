'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronDown, Plus } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface LifeEmptyProps {
  onCreate?: () => void;
  onApplyTemplate?: (template: string) => void;
}

export function LifeEmpty({ onCreate, onApplyTemplate }: LifeEmptyProps) {
  const templates = [
    { name: '模板名称', steps: ['研发', '试销', '生产', '上市', '退市'] },
    { name: '模板名称', steps: ['阶段1', '阶段2', '阶段3', '阶段4', '阶段5'] },
    { name: '模板名称', steps: ['阶段1', '阶段2', '阶段3', '阶段4', '阶段5'] },
    { name: '模板名称', steps: ['阶段1', '阶段2', '阶段3', '阶段4', '阶段5'] },
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <Card className="border-none shadow-sm rounded-[12px] bg-white overflow-visible animate-in fade-in zoom-in-95 duration-500">
      {/* 1. Empty Illustration and Create Button Area */}
      <div
        className="relative flex flex-col items-center justify-center min-h-[480px] rounded-t-[12px] overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="relative w-[480px] h-[320px] mb-8">
          <Image
            src="/images/manage/product/lifecycleEmpty.svg"
            alt="No Life Circle"
            fill
            className="object-contain"
            priority
          />
        </div>

        <Button
          onClick={onCreate}
          className="h-10 px-8  text-white rounded-[6px] shadow-lg shadow-blue-100 flex items-center gap-2 cursor-pointer transition-transform relative z-10"
        >
          <Plus size={18} />
          <span>创建生命周期</span>
        </Button>
      </div>
      {/* Separator Line with Identifier Connector */}
      <div className="relative h-px bg-gray-100 z-20">
        <div className="absolute left-1/2  -translate-x-1/2 bottom-0 bg-white px-5 py-0.2 rounded-full border border-gray-100 shadow-sm flex items-center justify-center z-30">
          <ChevronDown size={16} className="text-[#94A3B8]" />
        </div>
      </div>
      {/* 2. Quick Create Section */}
      <div className="p-4 space-y-4">
        <h3 className="text-[15px] font-bold text-gray-800">快速创建</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((tpl, idx) => (
            <Card
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`p-5 border shadow-sm transition-all group cursor-pointer ${
                idx === selectedIndex
                  ? 'border-[#306EFD] ring-1 ring-blue-50'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-[14px] font-bold text-gray-700">{tpl.name}</span>
                {idx === selectedIndex && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApplyTemplate?.(tpl.name);
                    }}
                    className="text-[#306EFD] text-[12px] font-medium hover:underline cursor-pointer"
                  >
                    应用模板
                  </button>
                )}
              </div>

              {/* Mini Timeline */}
              <div className="relative px-2">
                <div className="absolute top-[4px] left-2 right-2 h-px bg-blue-100" />
                <div className="flex justify-between items-start">
                  {tpl.steps.map((step, sIdx) => (
                    <div key={sIdx} className="flex flex-col items-center gap-2 relative z-10">
                      <div className="w-2 h-2 rounded-full bg-[#306EFD] shadow-[0_0_0_2px_white,0_0_0_3px_#306efd1a]" />
                      <span className="text-[11px] text-[#8c8c8c] whitespace-nowrap">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  );
}
