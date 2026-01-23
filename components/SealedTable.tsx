'use client';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import * as React from 'react';

/**
 * 密封表格列配置接口
 */
export interface SealedTableColumn<T> {
  /** 列标题 */
  title: string;
  /** 对应数据的键名 */
  dataIndex?: keyof T;
  /** 唯一标识，如果没定义 dataIndex 则必须提供 key */
  key?: string;
  /** 列宽度，支持数字或字符串（如 '100px', '20%'） */
  width?: string | number;
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 自定义渲染函数 */
  render?: (value: any, record: T, index: number) => React.ReactNode;
  type?: string;
  /** 是否开启溢出省略号及 Tooltip 提示 */
  ellipsis?: boolean;
}

interface SealedTableProps<T> {
  /** 列配置数组 */
  columns: SealedTableColumn<T>[];
  /** 数据源 */
  data: T[];
  /** 表格外部容器类名 */
  className?: string;
  /** 表头类名 */
  headerClassName?: string;
  /** 行类名 */
  rowClassName?: string;
  /** 行点击回调 */
  onRowClick?: (record: T, index: number) => void;
  /** 是否开启斑马纹 */
  stripe?: boolean;
  /** 选中的行 Key 集合 */
  selectedRowKeys?: string[];
  /** 选择状态改变回调 */
  onSelectionChange?: (selectedRowKeys: string[]) => void;
  /** 行数据的唯一标识字段 */
  rowKey?: string;
}

export function SealedTable<T>({
  columns,
  data,
  className,
  headerClassName,
  rowClassName,
  onRowClick,
  stripe = false,
  selectedRowKeys,
  onSelectionChange,
  rowKey = 'id',
}: SealedTableProps<T>) {
  const isAllSelected = data.length > 0 && selectedRowKeys?.length === data.length;
  const isPartiallySelected =
    (selectedRowKeys?.length ?? 0) > 0 && (selectedRowKeys?.length ?? 0) < data.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allKeys = data.map((item: any) => String(item[rowKey]));
      onSelectionChange?.(allKeys);
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (record: any, checked: boolean) => {
    const key = String(record[rowKey]);
    const nextKeys = checked
      ? [...(selectedRowKeys || []), key]
      : (selectedRowKeys || []).filter((k) => k !== key);
    onSelectionChange?.(nextKeys);
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          'w-full border border-[#ebeef5] rounded-[4px] overflow-hidden bg-white',
          className
        )}
      >
        <Table className="border-collapse">
          <TableHeader className={cn('bg-[#f5f7fa]', headerClassName)}>
            <TableRow className="hover:bg-transparent border-b border-[#ebeef5]">
              {onSelectionChange && (
                <TableHead className="w-[50px] px-4 py-0 text-center align-middle">
                  <Checkbox
                    checked={isAllSelected || (isPartiallySelected ? 'indeterminate' : false)}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  />
                </TableHead>
              )}
              {columns.map((col, idx) => (
                <TableHead
                  key={col.key || (col.dataIndex as string) || idx}
                  style={{
                    width: col.width,
                    textAlign: col.align || 'left',
                  }}
                  className={cn(
                    'h-12 px-4 py-0 text-[14px] font-bold text-[#202224] align-middle',
                    col.align === 'center'
                      ? 'text-center'
                      : col.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                  )}
                >
                  {col.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((record, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  onClick={() => onRowClick?.(record, rowIndex)}
                  className={cn(
                    'border-b border-[#ebeef5] transition-colors hover:bg-[#f5f7fa] group last:border-0',
                    stripe && rowIndex % 2 === 1 && 'bg-[#fafafa]',
                    onRowClick && 'cursor-pointer',
                    rowClassName
                  )}
                >
                  {onSelectionChange && (
                    <TableCell className="w-[50px] px-4 py-0 text-center align-middle">
                      <Checkbox
                        checked={selectedRowKeys?.includes(String((record as any)[rowKey]))}
                        onCheckedChange={(checked) => handleSelectRow(record, !!checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {columns.map((col, colIndex) => {
                    const value = col.dataIndex ? record[col.dataIndex] : undefined;
                    return (
                      <TableCell
                        key={col.key || (col.dataIndex as string) || colIndex}
                        style={{
                          textAlign: col.align || 'left',
                        }}
                        className={cn(
                          'h-12 px-4 py-0 text-[14px] text-[#202224] align-middle',
                          col.align === 'center'
                            ? 'text-center'
                            : col.align === 'right'
                              ? 'text-right'
                              : 'text-left'
                        )}
                      >
                        {col.ellipsis ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="truncate w-full cursor-default">
                                {col.render
                                  ? col.render(value, record, rowIndex)
                                  : (value as React.ReactNode)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[300px] break-all">
                              {col.render
                                ? col.render(value, record, rowIndex)
                                : (value as React.ReactNode)}
                            </TooltipContent>
                          </Tooltip>
                        ) : col.render ? (
                          col.render(value, record, rowIndex)
                        ) : (
                          (value as React.ReactNode)
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={onSelectionChange ? columns.length + 1 : columns.length}
                  className="h-40 text-center text-[#909399] text-[14px]"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
