# 组件规则

## 一、按钮

常规按钮，基于默认创建即可，不额外增加其他的样式。保持最简样式。
示范例子：

### 1、默认按钮

```tsx
<Button>确定</Button>
```

### 2、取消按钮

```tsx
<Button type="button" variant="outline" className=" border-gray-200 text-gray-600 hover:bg-gray-50">
  取消
</Button>
```

### 3、确定按钮

```tsx
<Button>确定</Button>
```

### 4、编辑按钮

```tsx
<Button>
  <Edit2 />
  <span>编辑</span>
</Button>
```

### 5、新增按钮

```tsx
<Button>
  <Plus />
  <span>新增</span>
</Button>
```

# 二、弹窗规则

## 1、添加/编辑的基础表单弹窗

```tsx
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
import \* as z from 'zod';

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
```

## 2、删除弹窗

```tsx
<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
  <DialogContent className="sm:max-w-[400px] p-0 gap-0">
    <DialogHeader className="p-4 border-b">
      <DialogTitle className="text-[15px] font-medium text-gray-800">删除提示</DialogTitle>
    </DialogHeader>
    <div className="p-8 flex items-center gap-3">
      <div className="bg-[#fee2e2] rounded-full p-1.5 flex items-center justify-center">
        <AlertCircle className="h-5 w-5 text-white fill-[#f05252]" />
      </div>

      <span className="text-[15px] text-gray-700 font-medium">确定删除吗？</span>
    </div>

    <DialogFooter className="p-4 pt-0 flex sm:justify-end gap-3">
      <Button
        onClick={() => setDeleteDialogOpen(false)}
        type="button"
        variant="ghost"
        className="bg-gray-100 hover:bg-gray-200 text-gray-600"
      >
        取消
      </Button>
      <Button className="bg-[#f05252] hover:bg-[#d94141] text-white" onClick={handleConfirmDelete}>
        确定
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

# 三、“更多”标识的下拉菜单

每个下拉选项，都必须有`className="text-gray-600 focus:text-[#3b82f6] focus:bg-blue-50 cursor-pointer"`属性，如果是删除，也是一样。

````tsx
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 transition-colors">
                    <MoreVertical className="h-3.5 w-3.5 text-gray-400 shrink-0 cursor-pointer hover:text-gray-600 transition-colors" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-[120px]">
                  <DropdownMenuItem
                    className="text-gray-600 focus:text-[#3b82f6] focus:bg-blue-50 cursor-pointer"
                  >
                    <ExternalLink/>
                    <span>编辑</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-gray-600 focus:text-[#3b82f6] focus:bg-blue-50 cursor-pointer"

                  >
                    <Trash2 />
                    <span>删除</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              ```
````
