'use client';

import { SealedTable, SealedTableColumn } from '@/components/common/SealedTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { BoardConfigSectionProps, DashboardItem } from './types';

export function BoardConfigSection({
  tableData,
  loading,
  selectedRowKeys,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onSelectionChange,
  onAddBoard,
  onEditBoard,
  onDeleteBoard,
  onGenerateBoard,
}: BoardConfigSectionProps) {
  const columns: SealedTableColumn<DashboardItem>[] = [
    {
      title: '数据集',
      dataIndex: 'dataset_name',
    },
    {
      title: '模块名称',
      dataIndex: 'module_name',
      ellipsis: true,
    },
    {
      title: '图表形式',
      dataIndex: 'chart_style',
      render: (val) => (val === 'chart-bar' ? '柱状图' : val === 'chart-line' ? '折线图' : '饼图'),
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: '关注指标',
      key: 'metrics_count',
      align: 'center',
      render: (_, record) => record.dataset_fields?.length || 0,
    },
    {
      title: '操作',
      key: 'action',
      align: 'left',
      render: (_, record) => (
        <div className="flex items-center justify-start gap-4">
          <button
            onClick={() => onEditBoard(record)}
            className="text-[#306EFD] text-[13px] hover:opacity-80 cursor-pointer"
          >
            编辑
          </button>
          <button
            onClick={() => onDeleteBoard(record.id)}
            className="text-[#F56C6C] text-[13px] hover:opacity-80 cursor-pointer"
          >
            删除
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="px-6 py-6 space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-[3px] h-4 bg-[#306EFD] rounded-full" />
          <span className="text-[16px] font-bold text-gray-800">节点看板数据配置</span>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-3">
        <Button onClick={onAddBoard}>
          <Plus />
          新增看板模块
        </Button>
        <Button
          variant="outline"
          onClick={onGenerateBoard}
          className="border-[#306EFD] text-[#306EFD] hover:bg-blue-50 hover:text-[#306EFD]"
        >
          生成看板
        </Button>
      </div>

      {/* 表格 */}
      <SealedTable
        columns={columns}
        data={tableData}
        loading={loading}
        className="border-none shadow-none min-h-[186px]"
        headerClassName="bg-[#f8f9fb] border-none"
        selectedRowKeys={selectedRowKeys}
        onSelectionChange={onSelectionChange}
        pagination={{
          current: page || 1,
          pageSize: pageSize || 10,
          total: total || 0,
          onChange: (p, ps) => {
            if (ps !== pageSize) {
              onPageSizeChange?.(ps);
            } else {
              onPageChange?.(p);
            }
          },
        }}
      />
    </div>
  );
}
