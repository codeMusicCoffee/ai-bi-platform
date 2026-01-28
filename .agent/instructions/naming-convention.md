# 命名规范

本文档定义了项目中所有文件、变量、函数、组件的命名标准。

---

## 一、文件与目录命名

### 1. 组件文件

- **React 组件**: 大驼峰命名（PascalCase），例如 `UserList.tsx`, `SealedForm.tsx`
- **页面文件**: Next.js 约定，使用 `page.tsx`, `layout.tsx`, `loading.tsx`

### 2. 工具函数/Hook 文件

- 小驼峰命名（camelCase），例如 `request.ts`, `useProductData.ts`

### 3. 目录

- 小写 + 连字符（kebab-case），例如 `app/manage/home/`, `.agent/workflows/`
- 特殊约定：Next.js 路由分组使用 `(auth)`, `(dashboard)` 形式

---

## 二、变量与函数命名

### 1. 状态变量（useState）

- 使用 **名词** + 驼峰命名
- 示例：
  ```typescript
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  ```

### 2. 函数

- 使用 **动词** 开头 + 驼峰命名
- 示例：
  ```typescript
  const loadUsers = async () => {
    /* ... */
  };
  const handleSubmit = (data: FormData) => {
    /* ... */
  };
  const handleDelete = (id: string) => {
    /* ... */
  };
  ```

### 3. 事件处理函数

- 统一使用 `handle` 前缀
- 示例：`handleClick`, `handleChange`, `handleSubmit`

### 4. 布尔值变量

- 使用 `is`, `has`, `should` 等前缀
- 示例：
  ```typescript
  const isLoading = false;
  const hasPermission = true;
  const shouldShowDialog = false;
  ```

---

## 三、组件命名

### 1. 组件名称

- 大驼峰命名，名称应体现功能
- 示例：
  - ✅ `UserManagementPage`
  - ✅ `ProductCard`
  - ✅ `SealedTable`
  - ❌ `Comp1`, `MyComponent`

### 2. Props 接口

- 组件名 + `Props` 后缀
- 示例：
  ```typescript
  interface UserCardProps {
    user: User;
    onEdit: (id: string) => void;
  }
  ```

---

## 四、TypeScript 类型/接口命名

### 1. 接口（Interface）

- 大驼峰命名，无需 `I` 前缀（与 TypeScript 官方风格一致）
- 示例：

  ```typescript
  export interface User {
    id: string;
    name: string;
  }

  export interface CreateUserRequest {
    name: string;
    email: string;
  }
  ```

### 2. 类型别名（Type）

- 同样使用大驼峰命名
- 示例：
  ```typescript
  export type CategoryFormType = '品类' | '系列' | '品牌' | '产品';
  ```

---

## 五、CSS 类名

### 1. Tailwind CSS

- 项目主要使用 Tailwind，避免自定义 CSS 类名
- 如需自定义，使用 BEM 规范：
  ```css
  .user-card {
  }
  .user-card__header {
  }
  .user-card__body {
  }
  .user-card--active {
  }
  ```

### 2. 避免随意命名

- ❌ 不要使用 `div1`, `wrapper`, `container` 等无意义名称
- ✅ 使用描述性类名：`user-list-container`, `product-card-header`

---

## 六、常量命名

### 1. 全局常量

- 全大写 + 下划线分隔（SCREAMING_SNAKE_CASE）
- 存放位置：`constants/` 目录
- 示例：
  ```typescript
  export const API_BASE_URL = 'http://192.168.110.29:8000';
  export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  ```

### 2. 枚举（Enum）

- 大驼峰命名
- 示例：
  ```typescript
  enum UserRole {
    Admin = 'admin',
    User = 'user',
    Guest = 'guest',
  }
  ```

---

## 七、注释规范

### 1. 单行注释

- 使用中文，简洁明了
- 示例：
  ```typescript
  // 加载用户列表数据
  const loadUsers = async () => {
    /* ... */
  };
  ```

### 2. 函数注释（复杂逻辑）

```typescript
/**
 * 处理拖拽排序后的数据更新
 * @param items 新的排序结果
 * @param productId 当前产品 ID
 */
const handleReorder = async (items: LifecycleNode[], productId: string) => {
  // ...
};
```

### 3. TODO 注释

```typescript
// TODO: 优化性能 - 使用虚拟滚动处理大量数据
// FIXME: 修复删除后列表未刷新的问题
```

---

## 八、Git 提交信息

虽然不强制，但建议遵循以下格式：

```
feat: 新增用户管理页面
fix: 修复产品删除后树未刷新的问题
refactor: 重构 SealedTable 组件
docs: 更新 API 文档
style: 调整按钮样式符合规范
```

---

**遵循本规范，可确保代码的一致性和可读性，便于团队协作和 AI 理解。**
