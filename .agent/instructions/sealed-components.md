# Sealed 系列组件使用指南

本文档详细说明项目中自定义的高级组件的使用方法。

---

## 一、SealedForm（表单组件）

### 1. 功能特性

- 基于 React Hook Form + Zod 的类型安全表单
- 支持灵活的字段配置（Input, Textarea, Select, DatePicker 等）
- 自动错误提示
- 支持网格布局（`gridCols` 配置）

### 2. 基础用法

```tsx
import { SealedForm, SealedFormFieldConfig } from '@/components/ui/sealed-form';
import * as z from 'zod';

// 1. 定义 Zod Schema
const schema = z.object({
  name: z.string().min(1, { message: '请输入名称' }),
  email: z.string().email({ message: '邮箱格式不正确' }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// 2. 定义字段配置
const fields: SealedFormFieldConfig<FormValues>[] = [
  {
    name: 'name',
    label: '名称',
    placeholder: '请输入名称',
    required: true,
  },
  {
    name: 'email',
    label: '邮箱',
    placeholder: '请输入邮箱',
    required: true,
  },
  {
    name: 'description',
    label: '描述',
    type: 'textarea',
    placeholder: '请输入描述',
    colSpan: 2, // 跨 2 列
  },
];

// 3. 使用组件
export default function MyForm() {
  return (
    <SealedForm
      schema={schema}
      fields={fields}
      gridCols={2} // 2 列布局
      defaultValues={{ name: '', email: '', description: '' }}
      onSubmit={(data) => console.log(data)}
    >
      {({ form, fields }) => (
        <>
          <div className="grid grid-cols-2 gap-4">{fields}</div>
          <Button type="submit">提交</Button>
        </>
      )}
    </SealedForm>
  );
}
```

### 3. 字段类型支持

- `'input'` (默认): 普通文本输入
- `'textarea'`: 多行文本
- `'select'`: 下拉选择（需要提供 `options`）
- `'date'`: 日期选择器

---

## 二、SealedTable（表格组件）

### 1. 功能特性

- 基于 Radix UI Table 的数据表格
- 支持列配置（宽度、对齐、排序、省略号）
- 内置分页功能
- 自动加载状态和空状态
- 长文本自动 Tooltip

### 2. 基础用法

```tsx
import { SealedTable, SealedTableColumn } from '@/components/common/SealedTable';

interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

const columns: SealedTableColumn<User>[] = [
  {
    title: 'ID',
    key: 'id',
    width: 100,
  },
  {
    title: '名称',
    key: 'name',
    width: 150,
  },
  {
    title: '邮箱',
    key: 'email',
    ellipsis: true, // 长文本省略
  },
  {
    title: '创建时间',
    key: 'created_at',
    width: 180,
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (_, record) => (
      <div className="flex items-center gap-3">
        <button className="text-[#306EFD] text-[13px] hover:opacity-80">编辑</button>
        <button className="text-[#306EFD] text-[13px] hover:opacity-80">删除</button>
      </div>
    ),
  },
];

export default function UserList() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <SealedTable
      columns={columns}
      data={loading ? [] : data}
      loading={loading}
      className="border-none shadow-none"
      headerClassName="bg-[#f8f9fb] border-none"
      pagination={{
        current: 1,
        pageSize: 10,
        total: 100,
        onChange: (page, pageSize) => {
          console.log(page, pageSize);
        },
      }}
    />
  );
}
```

---

## 三、SealedSearch（搜索组件）

### 1. 功能特性

- 支持多字段搜索（Input, Select, DatePicker）
- 自动布局（网格）
- 内置"查询"和"重置"按钮

### 2. 基础用法

```tsx
import { SealedSearch, SealedSearchField } from '@/components/common/SealedSearch';

const searchFields: SealedSearchField[] = [
  {
    name: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '请输入关键词',
  },
  {
    name: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' },
    ],
  },
];

export default function UserSearch() {
  const handleSearch = (values: any) => {
    console.log('搜索参数:', values);
  };

  const handleReset = () => {
    console.log('重置搜索');
  };

  return (
    <SealedSearch
      fields={searchFields}
      onSearch={handleSearch}
      onReset={handleReset}
      className="mb-4"
    />
  );
}
```

---

## 四、ImageUploader（图片上传组件）

### 1. 功能特性

- 支持点击上传或拖拽上传
- 自动压缩和预览
- 返回图片 URL

### 2. 基础用法

```tsx
import ImageUploader from '@/components/ImageUploader';

export default function ProductForm() {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <div>
      <label>产品图片</label>
      <ImageUploader
        value={imageUrl}
        onChange={(url) => setImageUrl(url)}
        className="w-full h-[120px]"
      />
    </div>
  );
}
```

---

## 五、使用建议

1. **优先复用**: 在开发新功能时，优先考虑使用这些组件，避免重复造轮子。
2. **遵循规范**: 使用这些组件时，确保传入的 `className` 和样式符合 `component-rule.md`。
3. **扩展时需谨慎**: 如果需要修改这些组件的核心逻辑，先在团队中讨论，避免破坏稳定性。

---

_组件源码位于 `components/common/` 和 `components/ui/` 目录。_
