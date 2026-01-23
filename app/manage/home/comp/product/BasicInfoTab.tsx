'use client';

import ImageUploader from '@/components/ImageUploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SealedForm, SealedFormFieldConfig } from '@/components/ui/sealed-form';
import { pmService } from '@/services/pm';
import { AlertCircle, Edit2, Package, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import * as z from 'zod';
import { AddBigEvent } from './AddBigEvent';

const productSchema = z.object({
  name: z.coerce.string().min(1, '请输入名称'),
  abv: z.coerce.string().min(1, '请输入酒度'),
  capacity: z.coerce.string().min(1, '请输入容量'),
  price: z.coerce.string().optional(),
  packaging: z.coerce.string().optional(),
  channels: z.coerce.string().optional(),
  techLeader: z.coerce.string().min(1, '请输入责任人'),
  rdLeader: z.coerce.string().min(1, '请输入责任人'),
  pkgLeader: z.coerce.string().min(1, '请输入责任人'),
  delistingDate: z.coerce.string().optional(),
  image_url: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface BasicInfoTabProps {
  productId: string;
  onRefreshTree?: () => void;
}

export function BasicInfoTab({ productId, onRefreshTree }: BasicInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isBigEventModalOpen, setIsBigEventModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [lifecycles, setLifecycles] = useState<any[]>([]);
  const [milestoneMode, setMilestoneMode] = useState<'create' | 'edit'>('create');
  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [formData, setFormData] = useState<ProductFormValues>({
    name: '',
    abv: '',
    capacity: '',
    price: '',
    packaging: '',
    channels: '',
    techLeader: '',
    rdLeader: '',
    pkgLeader: '',
    delistingDate: '',
    image_url: '',
  });

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await pmService.getProduct(productId);
        if (res.success && res.data) {
          const p = res.data;
          setFormData({
            name: p.name || '',
            abv: p.alcohol_degree?.toString() || '',
            capacity: p.volume_ml?.toString() || '',
            price: p.price?.toString() || '',
            packaging: p.packaging_type || '',
            channels: p.main_channel || '',
            techLeader: p.tech_manager || '',
            rdLeader: p.rd_manager || '',
            pkgLeader: p.packaging_manager || '',
            delistingDate: p.delisting_date || '',
            image_url: p.image_url || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    fetchMilestones();
    fetchLifecycles();
  }, [productId]);

  const fetchMilestones = async () => {
    try {
      const res = await pmService.getMilestones(productId);
      if (res.success) {
        const data = res.data as any;
        const items = data?.items || (Array.isArray(data) ? data : []);
        setMilestones(items);
      }
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
    }
  };

  const fetchLifecycles = async () => {
    try {
      const res = await pmService.getLifecycles(productId);
      if (res.success) {
        const data = res.data as any;
        const items = data?.items || (Array.isArray(data) ? data : []);
        setLifecycles(items);
      }
    } catch (error) {
      console.error('Failed to fetch lifecycles:', error);
    }
  };

  const fields: SealedFormFieldConfig<ProductFormValues>[] = [
    { name: 'name', label: '名称', placeholder: '请输入名称', required: true },
    { name: 'abv', label: '酒度', placeholder: '请输入酒度', required: true },
    { name: 'capacity', label: '容量 (ml)', placeholder: '请输入容量', required: true },
    { name: 'price', label: '产品价格', placeholder: '请输入产品价格' },
    { name: 'packaging', label: '包装形式', placeholder: '请输入包装形式' },
    { name: 'channels', label: '主要渠道', placeholder: '请输入主要渠道' },
    { name: 'techLeader', label: '产品技术责任人', placeholder: '请输入责任人', required: true },
    { name: 'rdLeader', label: '产品研发责任人', placeholder: '请输入责任人', required: true },
    { name: 'pkgLeader', label: '包装开发责任人', placeholder: '请输入责任人', required: true },
    { name: 'delistingDate', label: '退市时间', type: 'date' },
  ];

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      const res = await pmService.updateProduct(productId, {
        name: values.name,
        alcohol_degree: values.abv,
        volume_ml: values.capacity,
        price: values.price,
        packaging_type: values.packaging,
        main_channel: values.channels,
        tech_manager: values.techLeader,
        rd_manager: values.rdLeader,
        packaging_manager: values.pkgLeader,
        delisting_date: values.delistingDate,
        image_url: values.image_url,
      });

      if (res.success) {
        setFormData(values);
        setIsEditing(false);
        onRefreshTree?.();
      }
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleMilestoneSubmit = async (values: any) => {
    try {
      let res;
      if (milestoneMode === 'create') {
        res = await pmService.createMilestone({
          product_id: productId,
          ...values,
        });
      } else {
        res = await pmService.updateMilestone(editingMilestone.id, values);
      }

      if (res.success) {
        fetchMilestones();
        setIsBigEventModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to save milestone:', error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setItemToDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDeleteId) return;
    try {
      const res = await pmService.deleteMilestone(itemToDeleteId);
      if (res.success) {
        fetchMilestones();
      }
    } catch (error) {
      console.error('Failed to delete milestone:', error);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Product Info Card */}
      <Card className="border-none shadow-sm rounded-[12px] overflow-hidden">
        <SealedForm
          schema={productSchema}
          fields={fields}
          defaultValues={formData}
          onSubmit={handleSubmit}
          readonly={!isEditing}
          gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-12 gap-y-6"
        >
          {({ form, fields }) => (
            <>
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 mx-6 px-0 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-[3px] h-4 bg-[#306EFD] rounded-full" />
                  <CardTitle className="text-lg font-bold text-gray-800">产品信息</CardTitle>
                </div>
                <div className="flex items-center gap-3 shrink-0 justify-end min-w-[140px]">
                  {isEditing ? (
                    <div className="flex items-center gap-3 animate-in fade-in duration-200">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          form.reset(formData);
                          setIsEditing(false);
                        }}
                        className="h-8 border-gray-200 text-gray-600 rounded-[6px] px-4 cursor-pointer"
                      >
                        取消
                      </Button>
                      <Button
                        type="submit"
                        className="h-8 bg-[#306EFD] hover:bg-[#285cd1] text-white rounded-[6px] px-6 shadow-sm shadow-blue-100 cursor-pointer"
                      >
                        确定
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="h-8 bg-[#306EFD] hover:bg-[#285cd1] text-white rounded-[6px] px-4 shadow-sm shadow-blue-100 flex items-center gap-2 cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>编辑</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-2 min-h-[200px] relative">
                {loading && (
                  <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-[#306EFD] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-500">加载中...</span>
                    </div>
                  </div>
                )}
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Product Image */}
                  <ImageUploader
                    value={form.watch('image_url')}
                    onChange={(url) => form.setValue('image_url', url)}
                    defaultIcon={<Package size={40} strokeWidth={1} />}
                    readonly={!isEditing}
                    className="w-full lg:w-36 h-36 shrink-0"
                  />

                  {/* Form Fields Grid */}
                  <div className="flex-1">{fields}</div>
                </div>
              </CardContent>
            </>
          )}
        </SealedForm>
      </Card>

      {/* Timeline Section */}
      <Card className="border-none shadow-sm rounded-[12px]">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100 mx-6 px-0 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-[3px] h-4 bg-[#306EFD] rounded-full" />
            <CardTitle className="text-lg font-bold text-gray-800">产品大事纪</CardTitle>
          </div>
          <Button
            className="h-8 bg-[#306EFD] hover:bg-[#285cd1] text-white rounded-[6px] cursor-pointer"
            onClick={() => {
              setMilestoneMode('create');
              setEditingMilestone(null);
              setIsBigEventModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> 新增
          </Button>
        </CardHeader>
        <CardContent className="pt-4 pb-12">
          {milestones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative w-48 h-32 mb-4">
                <Image
                  src="/images/manage/product/empty.png"
                  alt="暂无数据"
                  fill
                  className="object-contain opacity-80"
                />
              </div>
              <p className="text-[#8c8c8c] text-[13px]">暂无大事纪</p>
            </div>
          ) : (
            <div className="pl-2 relative">
              {(Array.isArray(milestones) ? [...milestones] : [])
                .sort(
                  (a, b) =>
                    new Date(b.event_date || b.date).getTime() -
                    new Date(a.event_date || a.date).getTime()
                )
                .map((item, idx, array) => (
                  <div key={item.id || idx} className="relative pb-8 last:pb-2 group">
                    {/* Connecting Line */}
                    {idx !== array.length - 1 && (
                      <div className="absolute left-[3px] top-[14px] bottom-[-14px] w-0 border-l border-dashed border-[#306EFD]/30" />
                    )}

                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-[8px] w-2 h-2 rounded-full bg-[#306EFD] z-10 shadow-[0_0_0_3.5px_white,0_2px_8px_rgba(48,110,253,0.15)]" />

                    <div className="ml-7">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-4">
                          <span
                            className={`px-2 py-0.5 rounded-[10px] text-[12px] font-medium ${
                              (lifecycles.find((l) => l.id === item.lifecycle_id)?.name || '') ===
                              '试销'
                                ? 'bg-[#FFF7E6] text-[#FF9E1B]'
                                : 'bg-[#E6F4FF] text-[#306EFD]'
                            }`}
                          >
                            {lifecycles.find((l) => l.id === item.lifecycle_id)?.name || '阶段'}
                          </span>
                          <span className="text-[#202224] text-[14px] font-bold">
                            {item.event_date || item.date}
                          </span>
                          <span className="text-[#202224] text-[14px] font-bold">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() => {
                              setMilestoneMode('edit');
                              setEditingMilestone(item);
                              setIsBigEventModalOpen(true);
                            }}
                            className="text-[#306EFD] flex items-center gap-1 text-[13px] font-medium cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <Edit2 size={14} className="stroke-[2.5px]" />
                            <span>编辑</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            className="text-[#F56C6C] flex items-center gap-1 text-[13px] font-medium cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <Trash2 size={14} className="stroke-[2.5px]" />
                            <span>删除</span>
                          </button>
                        </div>
                      </div>

                      {/* Content Box */}
                      <div className="bg-[#F5F7FA] p-2 rounded-[6px] text-[13px] text-[#595959] border border-transparent h-[80px] overflow-hidden line-clamp-3">
                        {item.content || '暂无内容'}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddBigEvent
        open={isBigEventModalOpen}
        onOpenChange={setIsBigEventModalOpen}
        onSubmit={handleMilestoneSubmit}
        mode={milestoneMode}
        initialData={milestoneMode === 'edit' ? editingMilestone : undefined}
        lifecycleOptions={lifecycles}
      />

      {/* 删除确认弹窗 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden rounded-lg">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-[15px] font-medium text-gray-800">删除提示</DialogTitle>
          </DialogHeader>
          <div className="p-8 flex items-center gap-3 bg-white">
            <div className="bg-[#fee2e2] rounded-full p-1.5 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-white fill-[#f05252]" />
            </div>
            <span className="text-[15px] text-gray-700 font-medium">确定删除吗？</span>
          </div>

          <DialogFooter className="p-4 pt-0 flex sm:justify-end gap-3 bg-white">
            <Button
              variant="ghost"
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 h-9 px-6 rounded-[4px] cursor-pointer"
              onClick={() => setDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              className="bg-[#f05252] hover:bg-[#d94141] text-white h-9 px-6 rounded-[4px] cursor-pointer"
              onClick={handleConfirmDelete}
            >
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
