'use client';

import ImageUploader from '@/components/ImageUploader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { SealedForm, SealedFormFieldConfig } from '@/components/ui/sealed-form';
import * as z from 'zod';

export type CategoryFormType = '品类' | '系列' | '品牌' | '产品';

interface AddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  type: CategoryFormType;
  parentName?: string;
  initialData?: {
    name: string;
    image_url?: string;
  };
  onSubmit: (data: { name: string; image_url?: string }) => void;
}

export function AddDialog({
  open,
  onOpenChange,
  mode,
  type,
  parentName,
  initialData,
  onSubmit,
}: AddDialogProps) {
  const title = mode === 'create' ? `新建${type}` : `编辑${type}`;

  const schema = z.object({
    name: z.string().min(1, { message: `请输入${type}名称` }),
    image_url: z.string().optional(),
  });

  type FormValues = z.infer<typeof schema>;

  const fields: SealedFormFieldConfig<FormValues>[] = [
    {
      name: 'name',
      label: `${type}名称`,
      placeholder: `请输入${type}名称`,
      required: true,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {parentName && (
            <div className="grid gap-2 mb-4">
              <label className="text-[13px] font-medium text-gray-400">
                {type === '系列' ? '品类名称' : type === '品牌' ? '系列名称' : '品牌名称'}
              </label>
              <Input
                value={parentName}
                disabled
                className="h-10 bg-gray-50 text-gray-400 border-gray-100 rounded-[6px]"
              />
            </div>
          )}

          <SealedForm
            schema={schema}
            fields={fields}
            defaultValues={{
              name: initialData?.name || '',
              image_url: initialData?.image_url || '',
            }}
            onSubmit={(data) => {
              onSubmit(data);
              onOpenChange(false);
            }}
          >
            {({ form, fields }) => (
              <>
                <div className="grid gap-4">
                  {fields}
                  {type === '产品' && (
                    <div className="grid gap-2">
                      <label className="text-[14px] font-medium text-gray-700">产品图片</label>
                      <ImageUploader
                        value={form.watch('image_url')}
                        onChange={(url) => form.setValue('image_url', url)}
                        className="w-full h-[120px]"
                      />
                    </div>
                  )}
                </div>
                <DialogFooter className="mt-6">
                  <Button
                    onClick={() => onOpenChange(false)}
                    type="button"
                    variant="ghost"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600"
                  >
                    取消
                  </Button>
                  <Button type="submit" className="shadow-none">
                    确认
                  </Button>
                </DialogFooter>
              </>
            )}
          </SealedForm>
        </div>
      </DialogContent>
    </Dialog>
  );
}
