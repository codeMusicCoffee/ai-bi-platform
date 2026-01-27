'use client';

import { SealedTable, SealedTableColumn } from '@/components/SealedTable';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dataset, datasetService } from '@/services/dataset';
import { useEffect, useState } from 'react';

interface FieldItem {
  id: string;
  name: string;
  type: string;
  description: string;
}

interface AddKanbanConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (data: any) => void;
  mode?: 'create' | 'edit';
  initialData?: any;
}

export function AddKanbanConfig({
  open,
  onOpenChange,
  onConfirm,
  mode = 'create',
  initialData,
}: AddKanbanConfigProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [moduleName, setModuleName] = useState('');
  const [chartType, setChartType] = useState('chart-bar');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableData, setTableData] = useState<FieldItem[]>([]);

  useEffect(() => {
    if (open) {
      // 如果是编辑模式，初始化数据
      if (mode === 'edit' && initialData) {
        setSelectedDatasetId(initialData.dataset_id || '');
        setModuleName(initialData.module_name || '');
        setChartType(initialData.chart_style || 'chart-bar');
        setDescription(initialData.description || '');
        setSelectedRowKeys(initialData.dataset_fields || []);
      } else {
        // 创建模式，清空或重置
        setModuleName('');
        setChartType('chart-bar');
        setDescription('');
        setSelectedRowKeys([]);
      }

      const fetchDatasets = async () => {
        try {
          setLoading(true);
          const res = await datasetService.getDatasets();
          const data = res.data as any;
          const actualData = Array.isArray(data) ? data : data?.items || data?.list || [];
          setDatasets(actualData);

          // 默认选中第一项（仅在创建模式且没选过时）
          if (mode === 'create' && actualData.length > 0 && !selectedDatasetId) {
            setSelectedDatasetId(actualData[0].id);
          }
        } catch (error) {
          console.error('Failed to fetch datasets:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchDatasets();
    }
  }, [open, mode, initialData]);

  // 当数据集选中项改变时，获取数据集详情（字段信息）
  useEffect(() => {
    if (selectedDatasetId) {
      const fetchDatasetDetail = async () => {
        try {
          setTableLoading(true);
          const res = await datasetService.getDataset(selectedDatasetId);
          const detail = res.data;

          // 如果 detail.columns 存在，将其映射为 FieldItem[]
          if (detail && detail.columns && Array.isArray(detail.columns)) {
            const fields: FieldItem[] = detail.columns.map((col: any, index: number) => ({
              id: col.id || col.name || String(index),
              name: col.name || '',
              type: col.type || 'string',
              description: col.description || col.comment || '暂无描述',
            }));
            setTableData(fields);
          } else {
            setTableData([]);
          }
        } catch (error) {
          console.error('Failed to fetch dataset detail:', error);
          setTableData([]);
        } finally {
          setTableLoading(false);
        }
      };
      fetchDatasetDetail();
    }
  }, [selectedDatasetId]);

  const columns: SealedTableColumn<FieldItem>[] = [
    {
      title: '数据名称',
      dataIndex: 'name',
    },
    {
      title: '数据类型',
      dataIndex: 'type',
    },
    {
      title: '数据描述',
      dataIndex: 'description',
    },
  ];

  const handleConfirm = () => {
    onConfirm?.({
      dataset_id: selectedDatasetId,
      module_name: moduleName,
      chart_style: chartType,
      description: description,
      dataset_fields: selectedRowKeys,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] p-0 border-none rounded-[12px] overflow-hidden bg-white shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-gray-50 relative">
          <DialogTitle className="text-[16px] font-bold text-[#262626]">看板数据配置</DialogTitle>
        </DialogHeader>

        <div className="px-8 py-6 space-y-8">
          {/* Top Form Selects */}
          <div className="grid grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[14px] text-[#595959]">
                <span className="text-red-500 mr-1">*</span>数据集:
              </label>
              <Select value={selectedDatasetId} onValueChange={setSelectedDatasetId}>
                <SelectTrigger className="h-10 bg-white border-[#E8E8E8] rounded-[4px] focus:ring-1 focus:ring-blue-500 shadow-none">
                  <SelectValue placeholder={loading ? '加载中...' : '选择数据集'} />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(datasets) &&
                    datasets.map((ds) => (
                      <SelectItem key={ds.id} value={ds.id}>
                        {ds.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[14px] text-[#595959]">
                <span className="text-red-500 mr-1">*</span>模块名称:
              </label>
              <Input
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="请输入模块名称"
                className="h-10 bg-white border-[#E8E8E8] rounded-[4px] focus:ring-1 focus:ring-blue-500 shadow-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[14px] text-[#595959]">
                <span className="text-red-500 mr-1">*</span>图表类型:
              </label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="h-10 bg-white border-[#E8E8E8] rounded-[4px] focus:ring-1 focus:ring-blue-500 shadow-none">
                  <SelectValue placeholder="选择图表类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chart-bar">柱状图</SelectItem>
                  <SelectItem value="chart-line">折线图</SelectItem>
                  <SelectItem value="chart-pie">饼图</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[14px] text-[#595959]">
                <span className="text-red-500 mr-1">*</span>描述:
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="请输入描述内容"
                className="h-10 bg-white border-[#E8E8E8] rounded-[4px] focus:ring-1 focus:ring-blue-500 shadow-none"
              />
            </div>
          </div>

          {/* Data Fields Section */}
          <div className="space-y-4">
            <label className="text-[14px] font-medium text-[#262626]">
              <span className="text-red-500 mr-1">*</span>数据字段:
            </label>
            <div className="border border-[#F0F0F0] rounded-[4px] overflow-hidden">
              <SealedTable
                columns={columns}
                data={tableData}
                selectedRowKeys={selectedRowKeys}
                onSelectionChange={setSelectedRowKeys}
                className="border-none shadow-none"
                headerClassName="bg-[#f8f9fb] text-[#595959] border-none"
                containerClassName="max-h-[30vh] overflow-y-auto custom-scrollbar"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-8 py-6 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 px-6 border-[#D9D9D9] text-[#595959] rounded-[4px] hover:bg-gray-50 cursor-pointer"
          >
            取消
          </Button>
          <Button
            onClick={() => {
              console.log('--- Child Confirm Button Clicked ---');
              handleConfirm();
            }}
            className="h-9 px-6 bg-[#306EFD] hover:bg-[#285ad4] text-white rounded-[4px] shadow-sm cursor-pointer"
          >
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
