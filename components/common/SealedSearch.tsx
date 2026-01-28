'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export type SearchFieldType = 'input' | 'select';

export interface SearchFieldConfig {
  name: string;
  label: string;
  type: SearchFieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
  width?: string;
}

interface SealedSearchProps {
  /** 搜索字段配置 */
  fields: SearchFieldConfig[];
  /** 搜索回调 */
  onSearch: (values: Record<string, any>) => void;
  /** 重置回调 */
  onReset?: () => void;
  /** 自定义类名 */
  className?: string;
  /** 默认值 */
  initialValues?: Record<string, any>;
}

/**
 * 统一风格的表格上方搜索组件
 */
export function SealedSearch({
  fields,
  onSearch,
  onReset,
  className,
  initialValues = {},
}: SealedSearchProps) {
  const [values, setValues] = useState<Record<string, any>>(initialValues);

  const handleFieldChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    onSearch(values);
  };

  const handleReset = () => {
    const emptyValues = fields.reduce(
      (acc, field) => {
        acc[field.name] = '';
        return acc;
      },
      {} as Record<string, any>
    );
    setValues(emptyValues);
    onReset?.();
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-x-3', className)}>
      {fields.map((field) => (
        <div key={field.name} className="flex items-center gap-2">
          <span className="text-[14px] text-gray-600 whitespace-nowrap">{field.label}:</span>
          <div style={{ width: field.width || '192px' }}>
            {field.type === 'input' ? (
              <Input
                placeholder={field.placeholder}
                value={values[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                className=" border-gray-200 focus:border-[#306EFD] focus:ring-[#306EFD]/10"
              />
            ) : (
              <Select
                value={values[field.name] || ''}
                onValueChange={(val) => handleFieldChange(field.name, val)}
              >
                <SelectTrigger className=" border-gray-200 focus:border-[#306EFD] focus:ring-[#306EFD]/10">
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      ))}

      {/* 按钮组 */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSearch}>查询</Button>
        <Button
          variant="outline"
          onClick={handleReset}
          className="border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          重置
        </Button>
      </div>
    </div>
  );
}
