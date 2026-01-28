'use client';

import { SealedForm, SealedFormFieldConfig } from '@/components/common/SealedForm';
import { SealedTable, SealedTableColumn } from '@/components/common/SealedTable';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dataset, datasetService } from '@/services/dataset';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';

interface FieldItem {
  id: string;
  name: string;
  type: string;
  description: string;
}

// 表单验证 Schema
const boardConfigSchema = z.object({
  dataset_id: z.string().min(1, '请选择数据集'),
  module_name: z.string().min(1, '请输入模块名称'),
  chart_style: z.string().min(1, '请选择图表类型'),
  description: z.string().min(1, '请输入描述'),
});

type BoardConfigFormValues = z.infer<typeof boardConfigSchema>;

interface AddBoardConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (data: any) => void;
  mode?: 'create' | 'edit';
  initialData?: any;
}

export function AddBoardConfig({
  open,
  onOpenChange,
  onConfirm,
  mode = 'create',
  initialData,
}: AddBoardConfigProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableData, setTableData] = useState<FieldItem[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');

  const [formData, setFormData] = useState<BoardConfigFormValues>({
    dataset_id: '',
    module_name: '',
    chart_style: 'chart-bar',
    description: '',
  });

  useEffect(() => {
    if (open) {
      // 如果是编辑模式，初始化数据
      if (mode === 'edit' && initialData) {
        const newFormData = {
          dataset_id: initialData.dataset_id || '',
          module_name: initialData.module_name || '',
          chart_style: initialData.chart_style || 'chart-bar',
          description: initialData.description || '',
        };
        setFormData(newFormData);
        setSelectedDatasetId(initialData.dataset_id || '');
        setSelectedRowKeys(initialData.dataset_fields || []);
      } else {
        // 创建模式，清空或重置
        setFormData({
          dataset_id: '',
          module_name: '',
          chart_style: 'chart-bar',
          description: '',
        });
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
          if (mode === 'create' && actualData.length > 0) {
            setFormData((prev) => ({ ...prev, dataset_id: actualData[0].id }));
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

  const formFields: SealedFormFieldConfig<BoardConfigFormValues>[] = [
    {
      name: 'dataset_id',
      label: '数据集',
      placeholder: '选择数据集',
      required: true,
      render: (field) => (
        <Select
          value={field.value}
          onValueChange={(val) => {
            field.onChange(val);
            setSelectedDatasetId(val);
          }}
        >
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
      ),
    },
    {
      name: 'module_name',
      label: '模块名称',
      placeholder: '请输入模块名称',
      required: true,
    },
    {
      name: 'chart_style',
      label: '图表类型',
      placeholder: '选择图表类型',
      required: true,
      render: (field) => (
        <Select value={field.value} onValueChange={field.onChange}>
          <SelectTrigger className="h-10 bg-white border-[#E8E8E8] rounded-[4px] focus:ring-1 focus:ring-blue-500 shadow-none">
            <SelectValue placeholder="选择图表类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chart-bar">柱状图</SelectItem>
            <SelectItem value="chart-line">折线图</SelectItem>
            <SelectItem value="chart-pie">饼图</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      name: 'description',
      label: '描述',
      placeholder: '请输入描述内容',
      required: true,
    },
  ];

  const tableColumns: SealedTableColumn<FieldItem>[] = [
    { title: '数据名称', dataIndex: 'name' },
    { title: '数据类型', dataIndex: 'type' },
    { title: '数据描述', dataIndex: 'description' },
  ];

  const handleFormSubmit = (values: BoardConfigFormValues) => {
    // 验证是否选择了数据字段
    if (selectedRowKeys.length === 0) {
      toast.error('请至少选择一个数据字段');
      return;
    }

    onConfirm?.({
      ...values,
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

        <SealedForm
          schema={boardConfigSchema}
          fields={formFields}
          defaultValues={formData}
          onSubmit={handleFormSubmit}
          gridClassName="grid grid-cols-4 gap-6"
          className="space-y-0"
        >
          {({ form, fields }) => (
            <>
              <div className="px-8 py-6 space-y-8">
                {/* 表单字段 */}
                {fields}

                {/* 数据字段表格 */}
                <div className="space-y-4">
                  <label className="text-[14px] font-medium text-[#262626]">
                    <span className="text-red-500 mr-1">*</span>数据字段:
                  </label>
                  <div className="border border-[#F0F0F0] rounded-[4px] overflow-hidden">
                    <SealedTable
                      columns={tableColumns}
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
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="h-9 px-6 border-[#D9D9D9] text-[#595959] rounded-[4px] hover:bg-gray-50 cursor-pointer"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  className="h-9 px-6 bg-[#306EFD] hover:bg-[#285ad4] text-white rounded-[4px] shadow-sm cursor-pointer"
                >
                  确定
                </Button>
              </DialogFooter>
            </>
          )}
        </SealedForm>
      </DialogContent>
    </Dialog>
  );
}
