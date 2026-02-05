import { AlertDialog } from '@/components/common/AlertDialog';
import { SealedSearch, SearchFieldConfig } from '@/components/common/SealedSearch';
import { SealedTable, SealedTableColumn } from '@/components/common/SealedTable';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { pmService } from '@/services/pm';
import { MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
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
  session_id?: string;
}

const statusMap: Record<string, string> = {
  DRAFT: '待发布',
  PUBLISHED: '已发布',
  UPDATED: '已发布有调整',
};

const typeMap: Record<string, string> = {
  OVERALL: '概览',
  NODE: '看板',
};

const searchFields: SearchFieldConfig[] = [
  {
    name: 'name',
    label: '名称',
    type: 'input',
    placeholder: '请输入名称',
    clearable: true,
  },
  {
    name: 'type',
    label: '类型',
    type: 'select',
    placeholder: '请选择类型',
    clearable: true,
    options: [
      { label: '看板', value: 'NODE' },
      { label: '概览', value: 'OVERALL' },
    ],
  },
  {
    name: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    clearable: true,
    options: [
      { label: '待发布', value: 'DRAFT' },
      { label: '已发布', value: 'PUBLISHED' },
      { label: '已发布有调整', value: 'UPDATED' },
    ],
  },
];

export function BoardTab({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // 初始化页码为 1
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0); // 数据总条数
  const [data, setData] = useState<BoardData[]>([]); // 列表数据
  const [searchParams, setSearchParams] = useState<any>({}); // 搜索参数
  const router = useRouter();

  const [isAddBoardModalOpen, setIsAddBoardModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // 获取看板列表数据
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 过滤掉空字符串和 undefined/null
      const cleanParams = Object.fromEntries(
        Object.entries(searchParams).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      );

      const res = await pmService.getBoardsByProduct(productId, {
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...cleanParams,
      });
      if (res.success) {
        // 新实现 处理后端返回的数组结构并映射字段
        const rawList = Array.isArray(res.data) ? res.data : res.data?.list || [];
        const list = rawList.map((item: any) => ({
          ...item,
          type: typeMap[item.type] || item.type,
          status: statusMap[item.status] || item.status,
          stage: item.lifecycle_name || '-',
          updatedAt: item.updated_at
            ? new Date(item.updated_at)
                .toLocaleString('zh-CN', { hour12: false })
                .replace(/\//g, '-')
            : '-',
          recentPublishAt: '-',
        }));
        setData(list);
        setTotal(res.data?.total || list.length);
      }
    } catch (error) {
      console.error('获取看板列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, productId, searchParams]);

  // 当分页或查询参数变化时重新获取数据
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      console.log('Deleting item:', itemToDelete);
      // Actual delete logic would go here
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  const handleSearch = (values: any) => {
    console.log('Search criteria:', values);
    setSearchParams(values);
    setPage(1); // 搜索时重置页码到第一页
  };

  const handleReset = () => {
    console.log('Search reset');
    setSearchParams({});
    setPage(1);
  };

  const columns: SealedTableColumn<BoardData>[] = [
    { title: '名称', dataIndex: 'name', ellipsis: true, width: 200 },
    { title: '类型', dataIndex: 'type', width: 80 },
    { title: '状态', dataIndex: 'status', width: 120 },
    { title: '阶段', dataIndex: 'stage', width: 80 },
    { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
    { title: '最近发布时间', dataIndex: 'recentPublishAt', width: 180 },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (record.session_id) {
                localStorage.setItem(`preview_name_${record.session_id}`, record.name);
                window.open(`/previewpage?sessionId=${record.session_id}`, '_blank');
              }
            }}
            className="text-[#306EFD] text-[13px] hover:opacity-80 cursor-pointer"
          >
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
              <div className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
                <MoreVertical className="h-3.5 w-3.5 text-gray-400 shrink-0 hover:text-gray-600 transition-colors" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" className="w-[120px]">
              <DropdownMenuItem className="text-gray-600 focus:text-[#3b82f6] focus:bg-blue-50 cursor-pointer">
                复制分享链接
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-gray-600 focus:text-[#3b82f6] focus:bg-blue-50 cursor-pointer"
                onClick={() => handleOpenDelete(record.id)}
              >
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <Card className="border-none shadow-sm rounded-[12px] bg-white">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-[3px] h-4 bg-[#306EFD] rounded-full" />
            <h3 className="text-[16px] font-bold text-gray-800">看板列表</h3>
          </div>

          {/* Search Form */}
          <SealedSearch
            fields={searchFields}
            onSearch={handleSearch}
            onReset={handleReset}
            className="mb-4"
          />
          {/* Table with internal pagination */}
          <SealedTable
            columns={columns}
            data={loading ? [] : data}
            className="border-none shadow-none"
            headerClassName="bg-[#f8f9fb] border-none"
            pagination={{
              current: page,
              pageSize: pageSize,
              total: total, // 使用接口返回的总数
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

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
