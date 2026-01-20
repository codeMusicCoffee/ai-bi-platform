'use client';

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

export type CategoryFormType = '品类' | '系列' | '品牌';

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  type: CategoryFormType;
  parentName?: string;
  initialData?: {
    name: string;
  };
  onSubmit: (data: { name: string }) => void;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  mode,
  type,
  parentName,
  initialData,
  onSubmit,
}: CategoryFormDialogProps) {
  const title = mode === 'create' ? `新建${type}` : `编辑${type}`;

  const schema = z.object({
    name: z.string().min(1, { message: `请输入${type}名称` }),
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
                {type === '系列' ? '所属品类' : '所属系列'}
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
            defaultValues={{ name: initialData?.name || '' }}
            onSubmit={(data) => {
              onSubmit(data);
              onOpenChange(false);
            }}
          >
            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-9 px-4 rounded-md"
              >
                取消
              </Button>
              <Button
                type="submit"
                className="h-9 px-4 rounded-md bg-primary text-primary-foreground"
              >
                确认
              </Button>
            </DialogFooter>
          </SealedForm>
        </div>
      </DialogContent>
    </Dialog>
  );
}
