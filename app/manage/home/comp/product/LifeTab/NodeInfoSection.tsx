'use client';

import { SealedForm, SealedFormFieldConfig } from '@/components/common/SealedForm';
import { Button } from '@/components/ui/button';
import { Edit2 } from 'lucide-react';
import { nodeInfoSchema, NodeInfoSectionProps, NodeInfoValues } from './types';

// ====================
// 节点信息表单配置
// ====================
const nodeFields: SealedFormFieldConfig<NodeInfoValues>[] = [
  {
    name: 'name',
    label: '节点名称',
    placeholder: '请输入节点名称',
    required: true,
    className: 'col-span-1',
  },
  {
    name: 'description',
    label: '节点描述',
    placeholder: '请输入节点描述',
    required: true,
    className: 'col-span-4',
  },
];

// ====================
// 节点信息表单区域
// ====================
export function NodeInfoSection({
  activeNode,
  isEditing,
  onEditToggle,
  onSubmit,
}: NodeInfoSectionProps) {
  return (
    <SealedForm
      schema={nodeInfoSchema}
      fields={nodeFields}
      defaultValues={{
        name: activeNode?.name || '',
        description: activeNode?.description || '',
      }}
      onSubmit={onSubmit}
      readonly={!isEditing}
      gridClassName="grid grid-cols-5 gap-x-12 gap-y-6"
      className="space-y-0"
    >
      {({ form, fields }) => (
        <div className="border-b border-gray-100 px-6 py-6">
          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-[3px] h-4 bg-[#306EFD] rounded-full" />
              <span className="text-[16px] font-bold text-gray-800">节点信息</span>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-3 shrink-0 justify-end min-w-[160px]">
              {isEditing ? (
                <div className="flex items-center gap-3 animate-in fade-in duration-200">
                  <Button
                    onClick={() => {
                      form.reset();
                      onEditToggle(false);
                    }}
                    type="button"
                    variant="outline"
                    className="border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    取消
                  </Button>
                  <Button type="submit">确定</Button>
                </div>
              ) : (
                <Button type="button" onClick={() => onEditToggle(true)}>
                  <Edit2 />
                  <span>编辑</span>
                </Button>
              )}
            </div>
          </div>

          {/* 表单字段 */}
          <div>{fields}</div>
        </div>
      )}
    </SealedForm>
  );
}
