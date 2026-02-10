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
import { XCircle } from 'lucide-react';
import { useState } from 'react';

export type SearchFieldType = 'input' | 'select';

export interface SearchFieldConfig {
  name: string;
  label: string;
  type: SearchFieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
  width?: string;
  clearable?: boolean;
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
    const newValues = { ...values, [name]: value };
    setValues(newValues);
    return newValues;
  };

  const handleSearch = (currentValues = values) => {
    onSearch(currentValues);
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

  const handleClear = (name: string) => {
    const newValues = handleFieldChange(name, '');
    handleSearch(newValues);
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-x-3', className)}>
      {fields.map((field) => (
        <div key={field.name} className="flex items-center gap-2">
          <span className="text-[14px] text-gray-600 whitespace-nowrap">{field.label}:</span>
          <div style={{ width: field.width || '192px' }} className="relative group">
            {field.type === 'input' ? (
              <>
                <Input
                  placeholder={field.placeholder}
                  value={values[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className={cn(
                    'border-gray-200 focus:border-[#306EFD] focus:ring-[#306EFD]/10',
                    field.clearable && 'pr-8'
                  )}
                />
                {field.clearable && values[field.name] && (
                  <XCircle
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleClear(field.name)}
                  />
                )}
              </>
            ) : (
              <>
                <Select
                  value={values[field.name] || ''}
                  onValueChange={(val) => {
                    handleFieldChange(field.name, val);
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      'border-gray-200 focus:border-[#306EFD] focus:ring-[#306EFD]/10',
                      field.clearable && 'pr-11 [&>svg]:absolute [&>svg]:right-3'
                    )}
                  >
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
                {field.clearable && values[field.name] && (
                  <XCircle
                    className="absolute right-7 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear(field.name);
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      ))}

      {/* 按钮组 */}
      <div className="flex items-center gap-3">
        <Button onClick={() => handleSearch()}>查询</Button>
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
