# AI 开发快速参考卡片

本文档是 AI 助手的速查手册，包含最常用的命令、模板和规则。

---

## 🎨 设计 Token 速查

### 颜色

```
品牌主色:      #306EFD
成功:          #22c55e
警告:          #facc15
危险/删除:     #f05252
标题:          #202224
次要文字:      #606266
辅助文字:      #909399 | #9EABC2
边框:          #ebeef5 (Table) | border-gray-200 (Form/Button)
背景:          #f8f9fb (Header) | #f5f7fa (Hover)
```

### 圆角与间距

```
容器圆角:      rounded-[12px]
组件圆角:      rounded-[6px]
模块间距:      gap-4 或 space-y-4
容器内边距:    p-4
```

### 字体大小

```
标题:          16px (font-bold)
正文:          14px
小字/按钮:     13px
操作文字:      text-[13px]
```

---

## 🔧 常用代码片段

### 1. 标题栏（蓝色装饰条）

```tsx
<div className="flex items-center gap-2 mb-4">
  <div className="w-[3px] h-4 bg-[#306EFD] rounded-full" />
  <h3 className="text-[16px] font-bold text-gray-800">标题</h3>
</div>
```

### 2. 取消按钮

```tsx
<Button
  type="button"
  variant="ghost"
  className="bg-gray-100 hover:bg-gray-200 text-gray-600"
  onClick={() => setDialogOpen(false)}
>
  取消
</Button>
```

### 3. 确定/提交按钮

```tsx
<Button type="submit" className="shadow-none">
  确认
</Button>
```

### 4. 删除按钮（危险操作）

```tsx
<Button className="bg-[#f05252] hover:bg-[#d94141] text-white" onClick={handleConfirmDelete}>
  确定
</Button>
```

### 5. 操作列（表格内）

```tsx
{
  title: '操作',
  key: 'actions',
  width: 200,
  render: (_, record) => (
    <div className="flex items-center gap-3">
      <button className="text-[#306EFD] text-[13px] hover:opacity-80 cursor-pointer">
        编辑
      </button>
      <button className="text-[#306EFD] text-[13px] hover:opacity-80 cursor-pointer">
        删除
      </button>
    </div>
  ),
}
```

### 6. DropdownMenu（更多操作）

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <div className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
      <MoreVertical className="h-3.5 w-3.5 text-gray-400 shrink-0 hover:text-gray-600" />
    </div>
  </DropdownMenuTrigger>
  <DropdownMenuContent side="bottom" align="end" className="w-[120px]">
    <DropdownMenuItem className="text-gray-600 focus:text-[#3b82f6] focus:bg-blue-50 cursor-pointer">
      编辑
    </DropdownMenuItem>
    <DropdownMenuItem className="text-gray-600 focus:text-[#3b82f6] focus:bg-blue-50 cursor-pointer">
      删除
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 📋 API 调用模板

### 列表查询（带分页）

```typescript
const [data, setData] = useState<Item[]>([]);
const [loading, setLoading] = useState(false);
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);
const [total, setTotal] = useState(0);

const loadData = async () => {
  try {
    setLoading(true);
    const res = await xxxService.getItems({ page, pageSize });
    setData(res.items);
    setTotal(res.total);
  } catch (error) {
    console.error('加载失败:', error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadData();
}, [page, pageSize]);
```

### 新增/编辑（Dialog + Form）

```typescript
const [dialogOpen, setDialogOpen] = useState(false);
const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
const [currentItem, setCurrentItem] = useState<Item | null>(null);

const handleSubmit = async (data: FormData) => {
  try {
    if (editMode === 'create') {
      await xxxService.createItem(data);
    } else {
      await xxxService.updateItem(currentItem!.id, data);
    }
    setDialogOpen(false);
    loadData(); // 刷新列表
  } catch (error) {
    // 错误已由 request 处理
  }
};
```

### 删除（二次确认）

```typescript
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [toDeleteId, setToDeleteId] = useState('');

const handleDelete = (id: string) => {
  setToDeleteId(id);
  setDeleteDialogOpen(true);
};

const handleConfirmDelete = async () => {
  try {
    await xxxService.deleteItem(toDeleteId);
    setDeleteDialogOpen(false);
    loadData();
  } catch (error) {
    // 错误已由 request 处理
  }
};
```

---

## 🚫 禁止清单

**样式禁止**:

- ❌ `text-blue-500` → ✅ `text-[#306EFD]`
- ❌ `rounded-lg` → ✅ `rounded-[12px]` (容器) 或 `rounded-[6px]` (组件)
- ❌ 随意设置 `h-[31px]` → ✅ 使用标准高度

**代码禁止**:

- ❌ 在组件中直接 `fetch('/api/xxx')`
- ❌ 删除"看起来没用"的代码
- ❌ 修改冻结区（`AGENT.md` 中明确标记）
- ❌ 一次性修改多个不相关的功能

**流程禁止**:

- ❌ 跳过 `view_file_outline` 直接修改文件
- ❌ Bug 修复时顺便"美化代码"
- ❌ 新增功能时改变原有 UI 外观

---

## 📁 文件命名速查

| 类型       | 命名规则             | 示例                        |
| ---------- | -------------------- | --------------------------- |
| React 组件 | PascalCase           | `UserList.tsx`              |
| 页面文件   | Next.js 约定         | `page.tsx`, `layout.tsx`    |
| Hook/工具  | camelCase            | `useProductData.ts`         |
| 目录       | kebab-case           | `app/manage/home/`          |
| 常量       | SCREAMING_SNAKE_CASE | `API_BASE_URL`              |
| 变量       | camelCase            | `isLoading`, `users`        |
| 函数       | 动词开头 + camelCase | `loadUsers`, `handleSubmit` |
| Props 接口 | 组件名 + Props       | `UserCardProps`             |

---

## 🔄 工作流速查

| 命令           | 用途         |
| -------------- | ------------ |
| `/add-page`    | 新增页面     |
| `/fix-bug`     | 修复 Bug     |
| `/add-feature` | 新增功能模块 |

---

## 📞 快速求助

遇到问题时，按优先级查阅：

1. **样式问题** → `.agent/instructions/component-rule.md`
2. **API 问题** → `.agent/instructions/api-rule.md`
3. **命名问题** → `.agent/instructions/naming-convention.md`
4. **组件使用** → `.agent/instructions/sealed-components.md`
5. **架构问题** → `.spec/pm-module.md` 或 `.spec/sandbox.md`
6. **冻结区** → `AGENT.md` 第 5-8 章节

---

_将此文件加入书签，随时查阅！_
