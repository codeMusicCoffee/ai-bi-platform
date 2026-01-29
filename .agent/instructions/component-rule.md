# 组件规则

## 零、基础设计规范 (Design Tokens)

所有组件开发必须遵循以下视觉规范，严禁随意定义 ad-hoc 的数值。

### 1、颜色系统 (Colors)

- **品牌主色 (Primary)**: `#306EFD` (用于主按钮、文字高亮、装饰条)
- **功能辅助色**:
  - 成功 (Success): `#22c55e`
  - 警告 (Warning): `#facc15`
  - 危险 (Danger/Delete): `#f05252`
- **中性色 (Grays)**:
  - 标题/正文: `#202224`
  - 次要文字: `#606266`
  - 辅助/禁用文字: `#909399` | `#9EABC2`
  - 边框: `#ebeef5` (Table) | `border-gray-200` (Form/Button)
  - 背景: `#f8f9fb` (Header) | `#f5f7fa` (Hover)

### 2、圆角与间距 (Radius & Spacing)

- **圆角 (Radius)**:
  - 容器 (Card/Dialog/Popovers): `rounded-[12px]`
  - 组件 (Button/Input/Select): `rounded-[6px]`
- **标准间距 (Gap/Padding)**:
  - 模块间距离: `gap-4` 或 `space-y-4`
  - 容器内边距: `p-4` (CardContent/DialogContent)

### 3、字体规范 (Typography)

- **标题 (Title)**: `16px` (font-bold)
- **正文 (Body)**: `14px`
- **小字/按钮 (Small)**: `13px`

---

## 🚫 样式避坑指南 (Negative Constraints)

1. **禁止硬编码颜色**：优先查找组件库或 Token 表，不要使用 `text-blue-500` 等 Tailwind 默认蓝，必须精确使用 `#306EFD`。
2. **禁止随意缩放**：组件高度统一使用标准值（如 Button 默认高度），不要手动设置 `h-[31px]` 这种非标数值。
3. **保持原子性**：优先使用 `Sealed` 系列组件的 props（如 `className`, `fields` 等），不要随意包裹多层透明 `div` 来调整偏移。

---

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

# 四、表格样式规则

表格是业务系统的核心组件。为了保证样式一致，必须遵循以下结构和外观规则。

### 1、基础布局

表格通常包裹在一个 `Card` 容器中，包含：标题栏（左侧蓝色装饰条）、操作按钮、搜索表单、表格主体、分页。

```tsx
<Card className="border-none shadow-sm rounded-[12px] bg-white">
  <CardContent className="p-4">
    {/* 1. 标题栏：包含蓝色装饰条和标题文字 */}
    <div className="flex items-center gap-2 mb-4">
      <div className="w-[3px] h-4 bg-[#306EFD] rounded-full" />
      <h3 className="text-[16px] font-bold text-gray-800">列表标题</h3>
    </div>

    {/* 2. 操作按钮：如“新增”等 */}
    <div className="mb-4">
      <Button onClick={() => setIsAddOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        <span>新增记录</span>
      </Button>
    </div>

    {/* 3. 搜索表单：使用 SealedSearch 组件 */}
    <SealedSearch
      fields={searchFields}
      onSearch={handleSearch}
      onReset={handleReset}
      className="mb-4"
    />

    {/* 4. 列表内容：使用 SealedTable 组件 */}
    <SealedTable
      columns={columns}
      data={data}
      className="border-none shadow-none"
      headerClassName="bg-[#f8f9fb] border-none"
      pagination={{
        current: page,
        pageSize: pageSize,
        total: total,
        onChange: (p, s) => {
          setPage(p);
          setPageSize(s);
        },
      }}
    />
  </CardContent>
</Card>
```

### 2、操作列样式规则

行内操作按钮统一使用 **蓝色文字按钮**，字体大小固定为 `13px`。

```tsx
{
  title: '操作',
  key: 'actions',
  width: 200, // 根据按钮数量设定宽度
  render: (_, record) => (
    <div className="flex items-center gap-3">
      {/* 蓝色文字按钮 */}
      <button className="text-[#306EFD] text-[13px] hover:opacity-80 cursor-pointer">
        编辑/预览
      </button>
      <button className="text-[#306EFD] text-[13px] hover:opacity-80 cursor-pointer">
        发布/调整
      </button>

      {/* 如果操作超过3个，使用更多标识（DropdownMenu） */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
            <MoreVertical className="h-3.5 w-3.5 text-gray-400 shrink-0 hover:text-gray-600" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="w-[120px]">
          <DropdownMenuItem className="text-gray-600 focus:text-[#3b82f6] focus:bg-blue-50 cursor-pointer">
            更多操作...
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-gray-600 focus:text-[#3b82f6] focus:bg-blue-50 cursor-pointer"
            onClick={() => handleDelete(record.id)}
          >
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
}
```

### 3、列配置最佳实践

- **宽度控制**：关键列（如名称、ID）应设置 `width`；不确定宽度的列（如描述、备注）设置 `ellipsis: true`。
- **文字截断**：长文本字段必须开启 `ellipsis: true`，`SealedTable` 会自动处理 Tooltip 提示。
- **对齐规则**：字段对齐方式默认为 `left`。数字、状态标签建议设置 `align: 'center'`。
- **表头样式**：默认使用 `bg-[#f8f9fb]` 背景色，字体加粗。
- **无数据/加载中**：`SealedTable` 已内置空状态（空图标）和加载状态（Spin），直接传递 `data={loading ? [] : list}` 即可。
