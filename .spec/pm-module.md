# 产品管理模块架构说明

本文档深度解释产品管理 (PM) 模块的核心逻辑和设计决策。

---

## 一、架构概览

产品管理模块是本项目的核心功能，采用**四级树形结构**：

```
品类 (Category)
└── 系列 (Series)
    └── 品牌 (Brand)
        └── 产品 (Product)
```

### 数据流向

1. **CategoryTree**: 左侧树形导航，用于选择节点
2. **右侧详情区**: 根据选中节点类型展示不同组件
   - 选中品牌 → 显示 `BrandCard`
   - 选中产品 → 显示 `ProductCard`（包含 BasicInfoTab, LifecycleTab, BoardTab）

---

## 二、核心组件职责

### 1. CategoryTree (`app/manage/home/comp/product/CategoryTree.tsx`)

**职责**:

- 展示四级树形结构
- 提供节点的增删改操作（右键菜单）
- 节点选中后触发详情区更新

**关键状态**:

```typescript
const [selectedNode, setSelectedNode] = useState<ProductNode | null>(null);
const [treeData, setTreeData] = useState<ProductNode[]>([]);
```

**刷新机制**:

- 任何 CRUD 操作后，调用 `fetchTree()` 重新加载整棵树
- 使用 Zustand Store 管理全局选中状态（可选）

---

### 2. BrandCard (`app/manage/home/comp/product/BrandCard.tsx`)

**职责**:

- 展示品牌的详细信息（气味类型、功效、价格区间等）
- 支持编辑模式（使用 `SealedForm`）
- 展示该品牌下的产品列表

**编辑模式切换**:

```typescript
const [isEditing, setIsEditing] = useState(false);

// 只读模式: 显示文字 + "编辑"按钮
// 编辑模式: 显示输入框 + "取消" + "确认"按钮
```

---

### 3. ProductCard (`app/manage/home/comp/product/ProductCard.tsx`)

**职责**:

- 展示产品信息（基础信息、生命周期、看板）
- 使用 Tab 切换三个子模块

**Tab 结构**:

```tsx
<Tabs defaultValue="basic">
  <TabsList>
    <TabsTrigger value="basic">基础信息</TabsTrigger>
    <TabsTrigger value="lifecycle">生命周期</TabsTrigger>
    <TabsTrigger value="board">看板</TabsTrigger>
  </TabsList>

  <TabsContent value="basic">
    <BasicInfoTab productId={productId} />
  </TabsContent>

  <TabsContent value="lifecycle">
    <LifecycleTab productId={productId} />
  </TabsContent>

  <TabsContent value="board">
    <BoardTab productId={productId} />
  </TabsContent>
</Tabs>
```

---

### 4. LifecycleTab (`app/manage/home/comp/product/LifecycleTab.tsx`)

**职责**:

- 展示产品的生命周期阶段（节点式展示）
- 支持拖拽排序（基于 `@dnd-kit`）
- 节点可关联数据集

**拖拽实现**:

- 使用 `@dnd-kit/sortable` 的 `SortableContext`
- 拖拽完成后调用 `pmService.reorderLifecycles()`
- **重要**: 拖拽过程中不触发选中状态（只有点击-释放才选中）

**节点选中高亮**:

```css
/* 选中状态 */
.node-selected {
  border: 1px solid #306efd;
}

/* 普通状态 */
.node-normal {
  border: 1px solid transparent;
}
```

---

### 5. BoardTab (`app/manage/home/comp/product/BoardTab/index.tsx`)

**职责**:

- 展示某个生命周期阶段的看板配置
- 支持新增、编辑、删除看板
- 看板卡片展示（模块名称、图表样式、描述）

**搜索功能**:

- 使用 `SealedSearch` 组件
- 搜索字段：生命周期阶段、模块名称

**看板卡片示例**:

```tsx
{
  boards.map((board) => (
    <Card key={board.id}>
      <CardHeader>
        <h4>{board.module_name}</h4>
        <DropdownMenu>{/* 编辑/删除操作 */}</DropdownMenu>
      </CardHeader>
      <CardContent>
        <p>图表样式: {board.chart_style}</p>
        <p>描述: {board.description}</p>
      </CardContent>
    </Card>
  ));
}
```

---

## 三、API 调用规范

所有 PM 模块的 API 调用统一通过 `services/pm.ts` 进行。

### 常见操作示例

#### 1. 新增品牌

```typescript
const handleCreateBrand = async (data: BrandFormData) => {
  await pmService.createBrand({
    category_id: parentCategoryId,
    series_id: parentSeriesId,
    name: data.name,
    // ...其他字段
  });

  // 刷新树
  fetchTree();
};
```

#### 2. 更新产品

```typescript
const handleUpdateProduct = async (productId: string, data: ProductFormData) => {
  await pmService.updateProduct(productId, data);

  // 无感刷新 CategoryTree（通过 Zustand 或直接调用父组件回调）
  categoryTreeStore.refresh();
};
```

#### 3. 删除节点

```typescript
const handleDelete = async (nodeId: string, nodeType: string) => {
  if (nodeType === 'category') {
    await pmService.deleteCategory(nodeId);
  } else if (nodeType === 'series') {
    await pmService.deleteSeries(nodeId);
  } else if (nodeType === 'brand') {
    await pmService.deleteBrand(nodeId);
  } else if (nodeType === 'product') {
    await pmService.deleteProduct(nodeId);
  }

  fetchTree();
};
```

---

## 四、关键设计决策

### 1. 为什么使用四级树结构？

- **业务需求**: 产品分类层级清晰（品类 → 系列 → 品牌 → 产品）
- **扩展性**: 未来可能增加更多层级或自定义分类

### 2. 为什么 CategoryTree 不使用虚拟滚动？

- **当前数据量**: 预计节点总数不超过 1000，性能可接受
- **用户体验**: 完整树展示更符合业务习惯
- **优化计划**: 如果未来数据量增大，可使用懒加载或虚拟滚动

### 3. 为什么拖拽和点击选中要分开？

- **用户反馈**: 拖拽过程中节点被误选中，影响体验
- **解决方案**: 只有在 `pointerup` 事件中且未发生拖拽时，才触发选中

---

## 五、常见问题 (FAQ)

### Q: 编辑品牌信息后，树没有更新怎么办？

A: 检查是否在 `updateBrand` 成功后调用了 `fetchTree()` 或触发了 Zustand Store 的 `refresh()`。

### Q: 删除产品后，右侧详情区仍显示旧数据？

A: 删除后除了刷新树，还需要清空 `selectedNode` 状态：

```typescript
setSelectedNode(null);
```

### Q: 看板卡片如何关联数据集？

A: 在 `BoardTab` 中，用户选择数据集后，将 `dataset_id` 通过 API 保存到看板配置中。

---

## 六、冻结区说明

以下逻辑已确认稳定，禁止随意修改：

1. **CategoryTree 的 CRUD 逻辑** (已验证无误)
2. **LifecycleTab 的拖拽排序** (已解决选中冲突问题)
3. **BoardTab 的搜索和列表展示** (已重构为 SealedSearch)

如需修改，必须先在 `PROJECT_LOG.md` 中记录原因并获得确认。

---

_此文档应在模块重构或添加新功能时同步更新。_
