'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SealedForm, SealedFormFieldConfig } from '@/components/ui/sealed-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import * as z from 'zod';

const eventSchema = z.object({
  title: z.string().min(1, { message: '请输入标题' }),
  lifecycle_id: z.string().min(1, { message: '请选择阶段' }),
  event_date: z.string().min(1, { message: '请选择时间' }),
  content: z.string().min(1, { message: '请输入内容' }),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface AddBigEventProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: EventFormValues) => void;
  mode?: 'create' | 'edit';
  initialData?: Partial<EventFormValues>;
  lifecycleOptions: { id: string; name: string }[];
}

export function AddBigEvent({
  open,
  onOpenChange,
  onSubmit,
  mode = 'create',
  initialData,
  lifecycleOptions,
}: AddBigEventProps) {
  const fields: SealedFormFieldConfig<EventFormValues>[] = [
    {
      name: 'title',
      label: '标题',
      placeholder: '请输入标题',
      required: true,
    },
    {
      name: 'lifecycle_id',
      label: '阶段',
      placeholder: '请选择阶段',
      required: true,
      render: (field) => (
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger className="h-9 border-gray-200">
            <SelectValue placeholder="请选择阶段" />
          </SelectTrigger>
          <SelectContent>
            {lifecycleOptions.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      name: 'event_date',
      label: '大事纪时间',
      type: 'date',
      placeholder: '请选择大事纪时间',
      required: true,
    },
    {
      name: 'content',
      label: '内容',
      placeholder: '请输入大事纪内容',
      required: true,
      render: (field) => (
        <Textarea
          {...field}
          className="min-h-[120px] resize-none border-gray-200 focus:border-[#306EFD]/50"
        />
      ),
    },
  ];

  const handleFormSubmit = (values: EventFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-0 gap-0 overflow-hidden rounded-lg">
        <DialogHeader className="px-6 py-4 border-b border-gray-50 bg-white">
          <DialogTitle className="text-[16px] font-bold text-gray-800">
            {mode === 'create' ? '新增' : '编辑'}产品大事纪
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6 bg-white">
          <SealedForm
            schema={eventSchema}
            fields={fields}
            defaultValues={{
              title: initialData?.title || '',
              lifecycle_id: initialData?.lifecycle_id || '',
              event_date: (initialData as any)?.event_date || (initialData as any)?.date || '',
              content: initialData?.content || '',
            }}
            onSubmit={handleFormSubmit}
            fieldClassName="mb-4"
          >
            {({ form, fields }) => (
              <div className="space-y-1">
                {fields}
                <DialogFooter className="pt-6 flex gap-3 sm:justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="h-9 bg-[#f5f7fa] hover:bg-gray-100 text-gray-600 px-6 rounded-[4px] cursor-pointer"
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 bg-[#306EFD] hover:bg-[#285cd1] text-white px-8 rounded-[4px] shadow-sm shadow-blue-100 cursor-pointer"
                  >
                    确定
                  </Button>
                </DialogFooter>
              </div>
            )}
          </SealedForm>
        </div>
      </DialogContent>
    </Dialog>
  );
}
