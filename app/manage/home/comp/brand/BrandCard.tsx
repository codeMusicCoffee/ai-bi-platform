'use client';

import { SealedForm, SealedFormFieldConfig } from '@/components/common/SealedForm';
import { SealedTable, SealedTableColumn } from '@/components/common/SealedTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { pmService } from '@/services/pm';
import { AlertCircle, Edit2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import * as z from 'zod';
import { AddDialog } from '../tree/AddDialog';

interface ProductData {
  id: number;
  name: string;
  abv: string;
  capacity: string;
  listingDate: string;
  price: string;
  packaging: string;
  channels: string;
  stage: string;
  type?: string;
}

const brandSchema = z.object({
  category: z.string().min(1, '请输入品类'),
  series: z.string().min(1, '请输入系列'),
  brand: z.string().min(1, '请输入品牌'),
  flavor: z.string().min(1, '请选择香型'),
  ancestry: z.string().min(1, '请输入祖方'),
  effect: z.string().min(1, '请输入功效'),
  ingredients: z.string().min(1, '请输入功效成分'),
  listingDate: z.string().optional(),
  priceRange: z.string().optional(),
  suitablePeople: z.string().optional(),
  drinkingMethod: z.string().optional(),
  reputation: z.string().optional(),
  review: z.string().optional(),
});

type BrandFormValues = z.infer<typeof brandSchema>;

interface BrandCardProps {
  brandId: string;
  onRefreshTree?: () => void;
  onViewProduct?: (productId: string) => void;
}

export function BrandCard({ brandId, onRefreshTree, onViewProduct }: BrandCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [formData, setFormData] = useState<BrandFormValues>({
    category: '',
    series: '',
    brand: '',
    flavor: 'nongxiang',
    ancestry: '',
    effect: '',
    ingredients: '',
    listingDate: '',
    priceRange: '',
    suitablePeople: '',
    drinkingMethod: '',
    reputation: '',
    review: '',
  });
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await pmService.getProducts(brandId);
      // 后端返回格式为 { items: [], total: ... }
      const data = res.data as any;
      const items = data?.items || (Array.isArray(data) ? data : []);

      if (res.success && Array.isArray(items)) {
        setProducts(
          items.map((p: any) => ({
            id: p.id,
            name: p.name,
            abv: p.alcohol_degree || '-',
            capacity: p.volume_ml || '-',
            listingDate: (p.launch_date || p.created_at || '').substring(0, 10) || '-',
            price: p.price || '-',
            packaging: p.packaging_type || '-',
            channels: p.main_channel || '-',
            stage: Array.isArray(p.stage)
              ? p.stage.find((s: any) => s.is_current)?.stage_name || '-'
              : '-',
            image_url: p.image_url || '',
          }))
        );
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  useEffect(() => {
    if (!brandId) return;

    const fetchBrandData = async () => {
      setLoading(true);
      try {
        const res = await pmService.getBrand(brandId);
        if (res.success && res.data) {
          const b = res.data as any;
          setFormData({
            category: b.category_name || '',
            series: b.series_name || '',
            brand: b.name || '',
            flavor: b.aroma_type || '',
            ancestry: '', // 数据库暂无此字段
            effect: b.efficacy || '',
            ingredients: b.efficacy_ingredients || '',
            listingDate: b.launch_date || '',
            priceRange: b.price_range || '',
            suitablePeople: b.target_audience || '',
            drinkingMethod: b.drinking_method || '',
            reputation: b.reputation_statement || '',
            review: b.tasting_notes || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch brand data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandData();
    fetchProducts();
  }, [brandId]);

  const fields: SealedFormFieldConfig<BrandFormValues>[] = [
    { name: 'category', label: '品类', required: true, disabled: true },
    { name: 'series', label: '系列', required: true, disabled: true },
    { name: 'brand', label: '品牌', required: true },
    {
      name: 'flavor',
      label: '香型',
      required: true,
      render: (field) => (
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger className="h-8 border-gray-200">
            <SelectValue placeholder="请选择香型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="浓香型">浓香型</SelectItem>
            <SelectItem value="酱香型">酱香型</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    { name: 'ancestry', label: '祖方', required: true },
    { name: 'effect', label: '功效', required: true },
    { name: 'ingredients', label: '功效成分', required: true },
    { name: 'listingDate', label: '上市时间', type: 'date' },
    { name: 'priceRange', label: '价格带' },
    {
      name: 'suitablePeople',
      label: '适饮人群',
      className: 'lg:col-span-2',
      render: (field) => (
        <Textarea {...field} className="min-h-[100px] resize-none border-gray-200" />
      ),
    },
    {
      name: 'drinkingMethod',
      label: '饮用方法',
      className: 'lg:col-span-2',
      render: (field) => (
        <Textarea {...field} className="min-h-[100px] resize-none border-gray-200" />
      ),
    },
    {
      name: 'reputation',
      label: '口碑说辞',
      className: 'lg:col-span-2',
      render: (field) => (
        <Textarea {...field} className="min-h-[100px] resize-none border-gray-200" />
      ),
    },
    {
      name: 'review',
      label: '品评',
      className: 'lg:col-span-2',
      render: (field) => (
        <Textarea {...field} className="min-h-[100px] resize-none border-gray-200" />
      ),
    },
  ];

  const columns: SealedTableColumn<ProductData>[] = [
    { title: '序号', key: 'index', width: 60, align: 'left', render: (_, __, index) => index + 1 },
    { title: '产品名称', dataIndex: 'name', width: 200, ellipsis: true },
    { title: '酒度 (%vol)', dataIndex: 'abv', align: 'left' },
    { title: '容量 (ml)', dataIndex: 'capacity', align: 'left' },
    { title: '上市时间', dataIndex: 'listingDate', type: 'date', width: 120 },
    { title: '产品价格 (元/瓶)', dataIndex: 'price', align: 'left' },
    { title: '包装形式', dataIndex: 'packaging' },
    { title: '主要渠道', dataIndex: 'channels', width: 180 },
    { title: '当前阶段', dataIndex: 'stage' },
    {
      title: '操作',
      key: 'actions',
      align: 'left',
      width: 140,
      render: (_, record) => (
        <div className="flex justify-start space-x-4">
          <button
            className="text-[#306EFD] hover:text-blue-700 transition-colors font-medium cursor-pointer"
            onClick={() => onViewProduct?.(record.id.toString())}
          >
            查看
          </button>
          <button
            className="text-[#F56C6C] hover:text-red-700 transition-colors font-medium cursor-pointer"
            onClick={() => {
              setProductIdToDelete(record.id.toString());
              setDeleteDialogOpen(true);
            }}
          >
            删除
          </button>
        </div>
      ),
    },
  ];

  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await pmService.deleteProduct(productId);
      if (res.success) {
        fetchProducts();
        onRefreshTree?.();
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleConfirmDelete = () => {
    if (productIdToDelete) {
      handleDeleteProduct(productIdToDelete);
    }
    setDeleteDialogOpen(false);
    setProductIdToDelete(null);
  };

  const handleSubmit = async (values: BrandFormValues) => {
    try {
      const res = await pmService.updateBrand(brandId, {
        name: values.brand,
        aroma_type: values.flavor,
        efficacy: values.effect,
        efficacy_ingredients: values.ingredients,
        launch_date: values.listingDate,
        price_range: values.priceRange,
        target_audience: values.suitablePeople,
        drinking_method: values.drinkingMethod,
        reputation_statement: values.reputation,
        tasting_notes: values.review,
      });

      if (res.success) {
        setFormData(values);
        setIsEditing(false);
        onRefreshTree?.();
      }
    } catch (error) {
      console.error('Failed to update brand:', error);
    }
  };

  const handleCreateProduct = async (data: { name: string; image_url?: string }) => {
    try {
      const res = await pmService.createProduct({
        brand_id: brandId,
        name: data.name,
        image_url: data.image_url,
      });
      if (res.success) {
        fetchProducts();
        onRefreshTree?.();
      }
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  return (
    <>
      <Card className="border-none shadow-sm rounded-[12px] overflow-hidden">
        <SealedForm
          schema={brandSchema}
          fields={fields}
          defaultValues={formData}
          onSubmit={handleSubmit}
          readonly={!isEditing}
          gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-12"
        >
          {({ form, fields }) => (
            <>
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 mx-6 px-0 mb-6 sticky top-0 bg-white z-20">
                <div className="flex items-center space-x-2">
                  <div className="w-[3px] h-4 bg-[#306EFD] rounded-full" />
                  <CardTitle className="text-lg font-bold text-gray-800">品牌信息</CardTitle>
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
                        className=" border-gray-200 text-gray-600 hover:bg-gray-50  cursor-pointer"
                      >
                        取消
                      </Button>
                      <Button
                        type="submit"
                        className=" text-white  shadow-sm shadow-blue-100 cursor-pointer"
                      >
                        确定
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit2 />
                      <span>编辑</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-8">{fields}</CardContent>
            </>
          )}
        </SealedForm>
      </Card>

      <Card className="border-none shadow-sm rounded-[12px]">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100 mx-6 px-0 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-[3px] h-4 rounded-full" />
            <CardTitle className="text-lg font-bold text-gray-800">产品列表</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button
              className=" text-white rounded-[6px] cursor-pointer"
              onClick={() => setIsProductModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> 新增
            </Button>
          </div>
          <SealedTable columns={columns} data={products} stripe />
        </CardContent>
      </Card>

      <AddDialog
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        mode="create"
        type="产品"
        parentName={formData.brand}
        onSubmit={handleCreateProduct}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 gap-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-[15px] font-medium text-gray-800">删除提示</DialogTitle>
          </DialogHeader>
          <div className="p-8 flex items-center gap-3">
            <div className="bg-[#fee2e2] rounded-full p-1.5 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-white fill-[#f05252]" />
            </div>
            <span className="text-[15px] text-gray-700 font-medium">确定删除此产品吗？</span>
          </div>

          <DialogFooter className="p-4 pt-0 flex sm:justify-end gap-3">
            <Button
              variant="ghost"
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 h-9 px-6 rounded-[4px]"
              onClick={() => setDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              className="bg-[#f05252] hover:bg-[#d94141] text-white"
              onClick={handleConfirmDelete}
            >
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
