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
import { ChevronDown, ChevronUp } from 'lucide-react';
import * as React from 'react';

// ====================
// 样式常量
// ====================
const STYLES = {
  // 边框颜色
  border: '#ebeef5',
  borderGray: '#dcdfe6',
  // 背景颜色
  headerBg: '#f8f9fb',
  hoverBg: '#f5f7fa',
  stripeBg: '#fafafa',
  // 主题色
  primary: '#306EFD',
  // 文字颜色
  textPrimary: '#202224',
  textSecondary: '#606266',
  textMuted: '#909399',
  textPlaceholder: '#9EABC2',
} as const;

// Checkbox 通用样式
const CHECKBOX_CLASS = cn(
  'w-4 h-4 shrink-0 cursor-pointer transition-none shadow-none',
  'border-[#dcdfe6] data-[state=checked]:border-[#306EFD] data-[state=checked]:bg-[#306EFD] data-[state=indeterminate]:border-[#306EFD] data-[state=indeterminate]:bg-[#306EFD] hover:border-[#306EFD]'
);

// ====================
// 类型定义
// ====================

/** 表格列配置 */
export interface SealedTableColumn<T> {
  /** 列标题 */
  title: string;
  /** 数据字段 */
  dataIndex?: keyof T;
  /** 唯一标识 */
  key?: string;
  /** 列宽度 */
  width?: string | number;
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 自定义渲染 */
  render?: (value: any, record: T, index: number) => React.ReactNode;
  /** 列类型（扩展用） */
  type?: string;
  /** 溢出省略 */
  ellipsis?: boolean;
  /** 是否必填（在标题前显示 *） */
  required?: boolean;
}

/** 分页配置 */
export interface SealedTablePagination {
  current: number;
  pageSize: number;
  total: number;
  onChange?: (page: number, pageSize: number) => void;
  pageSizeOptions?: number[];
  pagerCount?: number;
}

/** 表格 Props */
interface SealedTableProps<T> {
  columns: SealedTableColumn<T>[];
  data: T[];
  className?: string;
  headerClassName?: string;
  rowClassName?: string;
  onRowClick?: (record: T, index: number) => void;
  stripe?: boolean;
  selectedRowKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  rowKey?: string;
  pagination?: SealedTablePagination | false;
  containerClassName?: string;
  loading?: boolean;
  // 树形结构配置
  childrenColumnName?: string;
  expandedRowKeys?: string[];
  onExpand?: (expanded: boolean, record: T) => void;
  indentSize?: number;
  treeDataIndex?: keyof T;
}

// ====================
// 自定义 Hooks
// ====================

/** 树形选择逻辑 Hook */
function useTreeSelection<T>(
  data: T[],
  rowKey: string,
  childrenColumnName: string,
  selectedRowKeys?: string[],
  onSelectionChange?: (keys: string[]) => void
) {
  // 递归获取所有节点 Key
  const getAllKeys = React.useCallback(
    (items: any[]): string[] => {
      const keys: string[] = [];
      const traverse = (list: any[]) => {
        if (!Array.isArray(list)) return;
        list.forEach((item) => {
          if (!item) return;
          keys.push(String(item[rowKey]));
          const children = item[childrenColumnName];
          if (children && Array.isArray(children)) {
            traverse(children);
          }
        });
      };
      traverse(items);
      return keys;
    },
    [rowKey, childrenColumnName]
  );

  // 所有节点 Key（去重）
  const allTreeKeys = React.useMemo(() => {
    return Array.from(new Set(getAllKeys(data)));
  }, [data, getAllKeys]);

  // 全选状态
  const isAllSelected =
    allTreeKeys.length > 0 && allTreeKeys.every((k) => selectedRowKeys?.includes(k));

  // 部分选中状态
  const isPartiallySelected =
    !isAllSelected && allTreeKeys.some((k) => selectedRowKeys?.includes(k));

  // 全选/取消全选
  const handleSelectAll = React.useCallback(
    (checked: boolean) => {
      onSelectionChange?.(checked ? allTreeKeys : []);
    },
    [allTreeKeys, onSelectionChange]
  );

  // 行选择
  const handleSelectRow = React.useCallback(
    (record: any, checked: boolean) => {
      const key = String(record[rowKey]);
      const descendants = getAllKeys(record[childrenColumnName] || []);
      const affected = [key, ...descendants];

      let nextKeys = [...(selectedRowKeys || [])];
      if (checked) {
        nextKeys = Array.from(new Set([...nextKeys, ...affected]));
      } else {
        nextKeys = nextKeys.filter((k) => !affected.includes(k));
      }
      onSelectionChange?.(nextKeys);
    },
    [rowKey, childrenColumnName, selectedRowKeys, getAllKeys, onSelectionChange]
  );

  // 计算节点勾选状态
  const getCheckState = React.useCallback(
    (record: any): boolean | 'indeterminate' => {
      const key = String(record[rowKey]);
      const children = record[childrenColumnName];
      const hasChildren = children && Array.isArray(children) && children.length > 0;
      const isSelected = selectedRowKeys?.includes(key);

      if (!hasChildren) return isSelected || false;

      const descendantKeys = getAllKeys(children);
      if (descendantKeys.length === 0) return isSelected || false;

      const selectedCount = descendantKeys.filter((k) => selectedRowKeys?.includes(k)).length;
      if (selectedCount === descendantKeys.length) return true;
      if (selectedCount > 0 || isSelected) return 'indeterminate';
      return false;
    },
    [rowKey, childrenColumnName, selectedRowKeys, getAllKeys]
  );

  return {
    allTreeKeys,
    isAllSelected,
    isPartiallySelected,
    handleSelectAll,
    handleSelectRow,
    getCheckState,
    getAllKeys,
  };
}

// ====================
// 子组件
// ====================

/** 加载状态 */
function TableLoadingState({ colSpan }: { colSpan: number }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="h-[300px] text-center border-none">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className={`w-8 h-8 border-2 border-blue-50 border-t-[${STYLES.primary}] rounded-full animate-spin`}
          />
          <span className={`text-[${STYLES.textMuted}] text-[13px]`}>数据加载中...</span>
        </div>
      </TableCell>
    </TableRow>
  );
}

/** 空状态 */
function TableEmptyState({ colSpan }: { colSpan: number }) {
  return (
    <TableRow className="hover:bg-transparent border-none">
      <TableCell colSpan={colSpan} className="h-[146px] text-center border-none">
        <div className="flex flex-col items-center justify-center space-y-4">
          <img src="/images/empty.svg" alt="暂无数据" className="w-[88px] h-[88px]" />
          <span className={`text-[${STYLES.textPlaceholder}] text-[14px]`}>暂无数据</span>
        </div>
      </TableCell>
    </TableRow>
  );
}

/** 单元格内容（支持溢出提示） */
function CellContent<T>({
  column,
  value,
  record,
  index,
}: {
  column: SealedTableColumn<T>;
  value: any;
  record: T;
  index: number;
}) {
  const content = column.render ? column.render(value, record, index) : (value as React.ReactNode);

  if (!column.ellipsis) return <>{content}</>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="truncate w-full cursor-default">{content}</div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px] break-all">{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** 树形展开图标 */
function TreeExpandIcon({
  isExpanded,
  onClick,
}: {
  isExpanded: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className="mr-1 cursor-pointer p-1 hover:bg-gray-100 rounded transition-colors"
      onClick={onClick}
    >
      {isExpanded ? (
        <ChevronUp className="w-4 h-4 text-gray-400" />
      ) : (
        <ChevronDown className="w-4 h-4 text-gray-400" />
      )}
    </div>
  );
}

/** 分页组件 */
function TablePaginationSection({ pagination }: { pagination: SealedTablePagination }) {
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const { current, pageSize, onChange } = pagination;

  const handleJumpTo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = Number((e.target as HTMLInputElement).value);
      if (val > 0 && val <= totalPages) {
        onChange?.(val, pageSize);
      }
    }
  };

  const handleJumpClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const input = (e.currentTarget.parentElement as HTMLElement).querySelector('input');
    const val = Number(input?.value);
    if (val > 0 && val <= totalPages) {
      onChange?.(val, pageSize);
    }
  };

  return (
    <div
      className={`flex items-center justify-end gap-4 px-6 py-4 border-t border-[${STYLES.border}] bg-white`}
    >
      {/* 统计信息 */}
      <span className={`text-[13px] text-[${STYLES.textMuted}]`}>共{pagination.total}条</span>
      <span className={`text-[13px] text-[${STYLES.textMuted}] mr-2`}>共{totalPages}页</span>

      {/* 每页条数 */}
      <div className="w-24">
        <Select value={String(pageSize)} onValueChange={(val) => onChange?.(1, Number(val))}>
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

      {/* 页码 */}
      <Pagination className="mx-0 w-auto">
        <PaginationContent className="gap-2">
          <PaginationItem>
            <PaginationPrevious
              onClick={() => current > 1 && onChange?.(current - 1, pageSize)}
              className={cn(
                `h-8 w-8 p-0 cursor-pointer border border-[${STYLES.borderGray}] text-[${STYLES.textSecondary}] hover:bg-[${STYLES.hoverBg}] hover:text-[${STYLES.primary}] transition-colors`,
                current <= 1 && 'pointer-events-none opacity-50'
              )}
            />
          </PaginationItem>

          {renderPaginationItems(pagination)}

          <PaginationItem>
            <PaginationNext
              onClick={() => current < totalPages && onChange?.(current + 1, pageSize)}
              className={cn(
                `h-8 w-8 p-0 cursor-pointer border border-[${STYLES.borderGray}] text-[${STYLES.textSecondary}] hover:bg-[${STYLES.hoverBg}] hover:text-[${STYLES.primary}] transition-colors`,
                current >= totalPages && 'pointer-events-none opacity-50'
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* 跳转 */}
      <div className="flex items-center gap-2 ml-2">
        <span className={`text-[13px] text-[${STYLES.textSecondary}]`}>到第</span>
        <Input
          type="number"
          className={`h-8 w-14 text-center p-0 border-[${STYLES.borderGray}] focus-visible:ring-1 focus-visible:ring-[${STYLES.primary}] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
          defaultValue={current}
          onKeyDown={handleJumpTo}
        />
        <span className={`text-[13px] text-[${STYLES.textSecondary}]`}>页</span>
        <Button
          variant="outline"
          onClick={handleJumpClick}
          className={`h-8 px-3 border-[${STYLES.borderGray}] text-[${STYLES.textSecondary}] hover:bg-[${STYLES.hoverBg}] hover:text-[${STYLES.primary}] text-[13px] cursor-pointer ml-1`}
        >
          确定
        </Button>
      </div>
    </div>
  );
}

// ====================
// 主组件
// ====================

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
  containerClassName,
  loading = false,
  childrenColumnName = 'children',
  expandedRowKeys,
  onExpand,
  indentSize = 24,
  treeDataIndex,
}: SealedTableProps<T>) {
  const hasSelection = !!onSelectionChange;
  const colSpan = hasSelection ? columns.length + 1 : columns.length;

  // 树形选择逻辑
  const { isAllSelected, isPartiallySelected, handleSelectAll, handleSelectRow, getCheckState } =
    useTreeSelection(data, rowKey, childrenColumnName, selectedRowKeys, onSelectionChange);

  // 渲染行
  const renderRows = React.useCallback(
    (items: T[], level = 0): React.ReactNode[] => {
      return items.flatMap((record, rowIndex) => {
        const key = String((record as any)[rowKey]);
        const children = (record as any)[childrenColumnName] as T[] | undefined;
        const isExpanded = expandedRowKeys?.includes(key);
        const hasChildren = children && Array.isArray(children) && children.length > 0;
        const checkState = getCheckState(record);

        const row = (
          <TableRow
            key={key}
            onClick={() => onRowClick?.(record, rowIndex)}
            className={cn(
              `transition-colors hover:bg-[${STYLES.hoverBg}] group`,
              stripe && rowIndex % 2 === 1 && `bg-[${STYLES.stripeBg}]`,
              onRowClick && 'cursor-pointer',
              rowClassName
            )}
          >
            {/* 选择框 */}
            {hasSelection && (
              <TableCell
                className={`w-[50px] px-2 py-0 text-center align-middle border-b border-[${STYLES.border}] group-last:border-0`}
              >
                <Checkbox
                  checked={checkState}
                  onCheckedChange={(checked) => handleSelectRow(record, !!checked)}
                  onClick={(e) => e.stopPropagation()}
                  className={CHECKBOX_CLASS}
                />
              </TableCell>
            )}

            {/* 数据列 */}
            {columns.map((col, colIndex) => {
              const value = col.dataIndex ? record[col.dataIndex] : undefined;
              const isTreeCol = treeDataIndex ? col.dataIndex === treeDataIndex : colIndex === 0;

              return (
                <TableCell
                  key={col.key || (col.dataIndex as string) || colIndex}
                  style={{ textAlign: col.align || 'left' }}
                  className={cn(
                    `h-10 px-2 py-0 text-[14px] text-[${STYLES.textPrimary}] align-middle border-b border-[${STYLES.border}] group-last:border-0`,
                    col.align === 'center'
                      ? 'text-center'
                      : col.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                  )}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: isTreeCol ? level * indentSize : 0,
                    }}
                  >
                    {/* 树形展开图标 */}
                    {isTreeCol && hasChildren && (
                      <TreeExpandIcon
                        isExpanded={!!isExpanded}
                        onClick={(e) => {
                          e.stopPropagation();
                          onExpand?.(!isExpanded, record);
                        }}
                      />
                    )}
                    {/* 占位符（无子节点但非顶层） */}
                    {isTreeCol && !hasChildren && level > 0 && <div className="w-6" />}

                    {/* 内容 */}
                    <div className="flex-1 truncate">
                      <CellContent column={col} value={value} record={record} index={rowIndex} />
                    </div>
                  </div>
                </TableCell>
              );
            })}
          </TableRow>
        );

        const childRows = isExpanded && children ? renderRows(children, level + 1) : [];
        return [row, ...childRows];
      });
    },
    [
      rowKey,
      childrenColumnName,
      expandedRowKeys,
      selectedRowKeys,
      columns,
      treeDataIndex,
      indentSize,
      stripe,
      rowClassName,
      onRowClick,
      onExpand,
      hasSelection,
      handleSelectRow,
      getCheckState,
    ]
  );

  return (
    <TooltipProvider>
      <div
        className={cn(
          `w-full border border-[${STYLES.border}] rounded-[4px] overflow-hidden bg-white`,
          className
        )}
      >
        <Table className="border-separate border-spacing-0" containerClassName={containerClassName}>
          {/* 表头 */}
          <TableHeader className={cn(`bg-[${STYLES.headerBg}]`, headerClassName)}>
            <TableRow className={`hover:bg-transparent bg-[${STYLES.headerBg}] h-10`}>
              {/* 全选框 */}
              {hasSelection && (
                <TableHead
                  className={`w-[50px] px-2 py-0 text-center align-middle sticky top-0 z-10 bg-[${STYLES.headerBg}] border-b border-[${STYLES.border}] h-10 bg-clip-padding`}
                >
                  <Checkbox
                    checked={isAllSelected || (isPartiallySelected ? 'indeterminate' : false)}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    className={CHECKBOX_CLASS}
                  />
                </TableHead>
              )}

              {/* 列头 */}
              {columns.map((col, idx) => (
                <TableHead
                  key={col.key || (col.dataIndex as string) || idx}
                  style={{ width: col.width, textAlign: col.align || 'left' }}
                  className={cn(
                    `h-10 px-2 py-0 text-[14px] font-bold text-[${STYLES.textPrimary}] align-middle sticky top-0 z-10 bg-[${STYLES.headerBg}] border-b border-[${STYLES.border}] bg-clip-padding`,
                    col.align === 'center'
                      ? 'text-center'
                      : col.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                  )}
                >
                  {col.required && <span className="text-red-500 mr-1">*</span>}
                  {col.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          {/* 表体 */}
          <TableBody>
            {loading ? (
              <TableLoadingState colSpan={colSpan} />
            ) : data && data.length > 0 ? (
              renderRows(data)
            ) : (
              <TableEmptyState colSpan={colSpan} />
            )}
          </TableBody>
        </Table>

        {/* 分页 */}
        {pagination && <TablePaginationSection pagination={pagination} />}
      </div>
    </TooltipProvider>
  );
}

// ====================
// 分页辅助函数
// ====================

function renderPaginationItems(pagination: SealedTablePagination) {
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const { current, pageSize, onChange } = pagination;
  const items: React.ReactNode[] = [];

  const renderPageLink = (page: number, label?: string) => (
    <PaginationItem key={page}>
      <PaginationLink
        onClick={() => onChange?.(page, pageSize)}
        isActive={current === page}
        className={cn(
          `h-8 min-w-[32px] px-2 text-[13px] border border-[${STYLES.borderGray}] rounded hover:bg-[${STYLES.hoverBg}] cursor-pointer transition-colors`,
          current === page
            ? `bg-[${STYLES.primary}] text-white border-[${STYLES.primary}] hover:bg-[${STYLES.primary}]`
            : `text-[${STYLES.textSecondary}]`
        )}
      >
        {label || page}
      </PaginationLink>
    </PaginationItem>
  );

  const renderEllipsis = (key: string) => (
    <PaginationItem key={key}>
      <PaginationEllipsis className="h-8 w-8" />
    </PaginationItem>
  );

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      items.push(renderPageLink(i));
    }
  } else {
    // 第一页
    items.push(renderPageLink(1));

    // 前省略号
    if (current > 4) {
      items.push(renderEllipsis('start-ellipsis'));
    }

    // 中间页码
    const start = Math.max(2, current - 2);
    const end = Math.min(totalPages - 1, current + 2);
    for (let i = start; i <= end; i++) {
      items.push(renderPageLink(i));
    }

    // 后省略号
    if (current < totalPages - 3) {
      items.push(renderEllipsis('end-ellipsis'));
    }

    // 尾页
    items.push(renderPageLink(totalPages, current === totalPages ? String(totalPages) : '尾页'));
  }

  return items;
}
