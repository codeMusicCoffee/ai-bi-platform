'use client';

import { SealedTable, SealedTableColumn } from '@/components/common/SealedTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal, Plus } from 'lucide-react';
import { useState } from 'react';
import { AddBoard } from './AddBoard';

interface BoardData {
  id: string;
  name: string;
  type: string;
  status: string;
  brand: string;
  variety: string;
  stage: string;
  category: string;
  series: string;
  updatedAt: string;
  recentPublishAt: string;
}

export function BoardTab({ productId }: { productId: string }) {
  const [loading] = useState(false);
  const [page, setPage] = useState(4); // Match the mock image's active page 4
  const [pageSize, setPageSize] = useState(10);
  const [isAddBoardModalOpen, setIsAddBoardModalOpen] = useState(false);

  // Mock data based on the image
  const [data] = useState<BoardData[]>([
    {
      id: '1',
      name: '中国劲酒健字号',
      type: '看板',
      status: '待发布',
      brand: '中国劲酒',
      variety: '保健酒',
      stage: '阶段1',
      category: '125ml-35度-中国劲酒',
      series: '劲酒系列',
      updatedAt: '2023-11-25 23:32:21',
      recentPublishAt: '',
    },
    {
      id: '2',
      name: '中国劲酒健字号',
      type: '概览',
      status: '已发布',
      brand: '中国劲酒',
      variety: '保健酒',
      stage: '阶段1',
      category: '125ml-35度-中国劲酒',
      series: '劲酒系列',
      updatedAt: '2023-11-25 23:32:21',
      recentPublishAt: '2024-11-25 23:32:21',
    },
    {
      id: '3',
      name: '中国劲酒健字号',
      type: '概览',
      status: '已发布有调整',
      brand: '中国劲酒',
      variety: '保健酒',
      stage: '阶段2',
      category: '125ml-35度-中国劲酒',
      series: '劲酒系列',
      updatedAt: '2023-11-25 23:32:21',
      recentPublishAt: '',
    },
    {
      id: '4',
      name: '中国劲酒健字号',
      type: '看板',
      status: '已发布',
      brand: '中国劲酒',
      variety: '保健酒',
      stage: '阶段2',
      category: '125ml-35度-中国劲酒',
      series: '劲酒系列',
      updatedAt: '2023-11-25 23:32:21',
      recentPublishAt: '2025-11-25 23:32:21',
    },
    {
      id: '5',
      name: '中国劲酒健字号中国劲酒健字...',
      type: '看板',
      status: '已发布',
      brand: '中国劲酒',
      variety: '保健酒',
      stage: '阶段4',
      category: '125ml-35度-中国劲酒',
      series: '劲酒系列',
      updatedAt: '2023-11-25 23:32:21',
      recentPublishAt: '2025-11-25 23:32:21',
    },
  ]);

  const columns: SealedTableColumn<BoardData>[] = [
    { title: '名称', dataIndex: 'name', ellipsis: true, width: 200 },
    { title: '类型', dataIndex: 'type', width: 80 },
    { title: '状态', dataIndex: 'status', width: 120 },
    { title: '品牌', dataIndex: 'brand', width: 100 },
    { title: '品种', dataIndex: 'variety', width: 100 },
    { title: '阶段', dataIndex: 'stage', width: 80 },
    { title: '品类', dataIndex: 'category', ellipsis: true },
    { title: '系列', dataIndex: 'series', width: 100 },
    { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
    { title: '最近发布时间', dataIndex: 'recentPublishAt', width: 180 },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <button className="text-[#306EFD] text-[13px] hover:opacity-80 cursor-pointer">
            预览
          </button>
          <button className="text-[#306EFD] text-[13px] hover:opacity-80 cursor-pointer">
            调整
          </button>
          <button className="text-[#306EFD] text-[13px] hover:opacity-80 cursor-pointer">
            发布
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer">复制分享链接</DropdownMenuItem>
              <DropdownMenuItem className="text-red-500 cursor-pointer">删除</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <Card className="border-none shadow-sm rounded-[12px] bg-white">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-[3px] h-4 bg-[#306EFD] rounded-full" />
            <h3 className="text-[16px] font-bold text-gray-800">看板列表</h3>
          </div>

          {/* Add Button */}
          <div className="mb-6">
            <Button onClick={() => setIsAddBoardModalOpen(true)}>
              <Plus size={16} />
              <span>新增看板</span>
            </Button>
          </div>

          {/* Search Form */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-gray-600 whitespace-nowrap">名称:</span>
              <Input placeholder="请输入名称" className="h-9 w-48 border-gray-200" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-gray-600 whitespace-nowrap">类型:</span>
              <div className="w-48">
                <Select>
                  <SelectTrigger className="h-9 border-gray-200">
                    <SelectValue placeholder="请选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="board">看板</SelectItem>
                    <SelectItem value="overview">概览</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-gray-600 whitespace-nowrap">状态:</span>
              <div className="w-48">
                <Select>
                  <SelectTrigger className="h-9 border-gray-200">
                    <SelectValue placeholder="请选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">待发布</SelectItem>
                    <SelectItem value="published">已发布</SelectItem>
                    <SelectItem value="updated">已发布有调整</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <Button className=" text-white  cursor-pointer">查询</Button>
              <Button variant="outline" className=" border-gray-200 text-gray-600  cursor-pointer">
                重置
              </Button>
            </div>
          </div>

          {/* Table with internal pagination */}
          <SealedTable
            columns={columns}
            data={loading ? [] : data}
            className="border-none shadow-none"
            headerClassName="bg-[#f8f9fb] border-none"
            pagination={{
              current: page,
              pageSize: pageSize,
              total: 800, // Matching the original "共80页" with 10/page
              onChange: (p, s) => {
                setPage(p);
                setPageSize(s);
              },
            }}
          />
        </CardContent>
      </Card>

      <AddBoard
        open={isAddBoardModalOpen}
        onOpenChange={setIsAddBoardModalOpen}
        productId={productId}
      />
    </div>
  );
}
