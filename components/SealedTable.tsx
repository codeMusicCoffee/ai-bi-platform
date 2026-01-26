'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

/**
 * 分页配置接口
 */
export interface SealedTablePagination {
  /** 当前页码 (1-indexed) */
  current: number;
  /** 每页条数 */
  pageSize: number;
  /** 总条数 */
  total: number;
  /** 页码或分页大小改变回调 */
  onChange?: (page: number, pageSize: number) => void;
  /** 每页条数选项 */
  pageSizeOptions?: number[];
  /** 页码显示个数，默认为 5 */
  pagerCount?: number;
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
  /** 分页配置 */
  pagination?: SealedTablePagination | false;
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
  pagination,
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
        {pagination && (
          <div className="flex items-center justify-end gap-4 px-6 py-4 border-t border-[#ebeef5] bg-white">
            <span className="text-[13px] text-[#909399]">共{pagination.total}条</span>
            <span className="text-[13px] text-[#909399] mr-2">
              共{Math.ceil(pagination.total / pagination.pageSize)}页
            </span>

            {/* Page Size Selector */}
            <div className="w-24">
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(val) => pagination.onChange?.(1, Number(val))}
              >
                <SelectTrigger className="h-8 border-gray-200 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(pagination.pageSizeOptions || [10, 20, 50, 100]).map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}/页
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Shadcn Pagination Implementation */}
            <Pagination className="mx-0 w-auto">
              <PaginationContent className="gap-2">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      pagination.current > 1 &&
                      pagination.onChange?.(pagination.current - 1, pagination.pageSize)
                    }
                    className={cn(
                      'h-8 w-8 p-0 cursor-pointer border border-[#dcdfe6] text-[#606266] hover:bg-[#f5f7fa] hover:text-[#306EFD] transition-colors',
                      pagination.current <= 1 && 'pointer-events-none opacity-50'
                    )}
                  />
                </PaginationItem>

                {renderPaginationItems(pagination)}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      pagination.current < Math.ceil(pagination.total / pagination.pageSize) &&
                      pagination.onChange?.(pagination.current + 1, pagination.pageSize)
                    }
                    className={cn(
                      'h-8 w-8 p-0 cursor-pointer border border-[#dcdfe6] text-[#606266] hover:bg-[#f5f7fa] hover:text-[#306EFD] transition-colors',
                      pagination.current >= Math.ceil(pagination.total / pagination.pageSize) &&
                        'pointer-events-none opacity-50'
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            {/* Jump to Page */}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-[13px] text-[#606266]">到第</span>
              <Input
                className="h-8 w-12 text-center p-0 border-[#dcdfe6] focus-visible:ring-1 focus-visible:ring-[#306EFD]"
                defaultValue={pagination.current}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = Number((e.target as HTMLInputElement).value);
                    if (val > 0 && val <= Math.ceil(pagination.total / pagination.pageSize)) {
                      pagination.onChange?.(val, pagination.pageSize);
                    }
                  }
                }}
              />
              <span className="text-[13px] text-[#606266]">页</span>
              <Button
                onClick={(e) => {
                  const input = (e.currentTarget.parentElement as HTMLElement).querySelector(
                    'input'
                  );
                  const val = Number(input?.value);
                  if (val > 0 && val <= Math.ceil(pagination.total / pagination.pageSize)) {
                    pagination.onChange?.(val, pagination.pageSize);
                  }
                }}
                className="h-8 px-4  text-white rounded-[4px] text-[13px] cursor-pointer"
              >
                确定
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

/**
 * 渲染分页页码辅助函数
 */
function renderPaginationItems(pagination: SealedTablePagination) {
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const current = pagination.current;
  const items = [];

  // 简单的分页逻辑，适应 1 2 3 4 5 6 ... 尾页
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      items.push(renderItem(i, current, pagination));
    }
  } else {
    // 始终显示第一页
    items.push(renderItem(1, current, pagination));

    if (current > 4) {
      items.push(
        <PaginationItem key="start-ellipsis">
          <PaginationEllipsis className="h-8 w-8" />
        </PaginationItem>
      );
    }

    const start = Math.max(2, current - 2);
    const end = Math.min(totalPages - 1, current + 2);

    for (let i = start; i <= end; i++) {
      items.push(renderItem(i, current, pagination));
    }

    if (current < totalPages - 3) {
      items.push(
        <PaginationItem key="end-ellipsis">
          <PaginationEllipsis className="h-8 w-8" />
        </PaginationItem>
      );
    }

    // 始终显示最后一页或“尾页”文本
    items.push(
      <PaginationItem key={totalPages}>
        <PaginationLink
          onClick={() => pagination.onChange?.(totalPages, pagination.pageSize)}
          isActive={current === totalPages}
          className={cn(
            'h-8 min-w-[32px] px-2 text-[13px] border border-[#dcdfe6] rounded hover:bg-[#f5f7fa] cursor-pointer transition-colors',
            current === totalPages
              ? 'bg-[#306EFD] text-white border-[#306EFD] hover:bg-[#306EFD]'
              : 'text-[#606266]'
          )}
        >
          {totalPages === current ? totalPages : '尾页'}
        </PaginationLink>
      </PaginationItem>
    );
  }

  return items;
}

function renderItem(i: number, current: number, pagination: SealedTablePagination) {
  return (
    <PaginationItem key={i}>
      <PaginationLink
        onClick={() => pagination.onChange?.(i, pagination.pageSize)}
        isActive={current === i}
        className={cn(
          'h-8 w-8 p-0 text-[13px] border border-[#dcdfe6] rounded hover:bg-[#f5f7fa] cursor-pointer transition-colors',
          current === i
            ? 'bg-[#306EFD] text-white border-[#306EFD] hover:bg-[#306EFD]'
            : 'text-[#606266]'
        )}
      >
        {i}
      </PaginationLink>
    </PaginationItem>
  );
}
