# API 开发规范

本文档规定了项目中所有前端 API 调用的标准写法和约定。

---

## 一、服务层结构

所有 API 调用必须封装在 `services/` 目录下，禁止在组件中直接使用 `fetch` 或 `axios`。

### 1. 文件命名规则

- 按功能模块划分，使用小写 + 连字符（例如 `pm.ts`, `user.ts`, `dataset.ts`）
- 每个文件导出一个 `xxxService` 对象

### 2. 类型定义

每个服务文件必须包含：

- **接口响应类型**（TypeScript Interface）
- **请求参数类型**（如有）

示例：

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role?: string;
}
```

---

## 二、API 调用规范

### 1. 使用统一的 `request` 工具

所有 API 调用必须通过 `@/lib/request` 进行，该工具已封装：

- 基础 URL 配置
- Token 自动注入
- 错误统一处理
- Toast 提示（可选）

### 2. 标准写法

#### GET 请求（列表/分页）

```typescript
getUsers: (params?: { page?: number; pageSize?: number; keyword?: string }) =>
  request.get<{ items: User[]; total: number }>('/api/users', params),
```

#### GET 请求（单条数据）

```typescript
getUser: (id: string) =>
  request.get<User>(`/api/users/${id}`),
```

#### POST 请求（新增）

```typescript
createUser: (data: CreateUserRequest) =>
  request.post<User>('/api/users', data, { showSuccessMsg: true }),
```

#### PUT 请求（更新）

```typescript
updateUser: (id: string, data: Partial<User>) =>
  request.put<User>(`/api/users/${id}`, data, { showSuccessMsg: true }),
```

#### DELETE 请求（删除）

```typescript
deleteUser: (id: string) =>
  request.delete(`/api/users/${id}`, {}, { showSuccessMsg: true }),
```

### 3. 配置项说明

`request` 工具的第三个参数支持：

- `showSuccessMsg: true` — 操作成功后自动显示 Toast 提示
- `showErrorMsg: false` — 禁用自动错误提示（默认为 true）

---

## 三、组件中的调用方式

### 1. 数据加载（列表/详情）

```typescript
'use client';

import { userService, User } from '@/services/user';
import { useEffect, useState } from 'react';

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getUsers();
      setUsers(res.items);
    } catch (error) {
      console.error('加载用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // ...
}
```

### 2. 新增/编辑操作

```typescript
const handleSubmit = async (data: CreateUserRequest) => {
  try {
    await userService.createUser(data);
    // showSuccessMsg: true 已自动显示提示，无需手动 toast
    loadUsers(); // 刷新列表
  } catch (error) {
    // 错误已由 request 统一处理，无需额外处理
  }
};
```

### 3. 删除操作（需二次确认）

```typescript
const handleDelete = async (id: string) => {
  // 先显示确认弹窗（参考 component-rule.md 中的删除弹窗）
  setDeleteDialogOpen(true);
  setToDeleteId(id);
};

const handleConfirmDelete = async () => {
  try {
    await userService.deleteUser(toDeleteId);
    setDeleteDialogOpen(false);
    loadUsers(); // 刷新列表
  } catch (error) {
    // 错误处理已由 request 完成
  }
};
```

---

## 四、错误处理原则

1. **不要手动捕获后静默处理**：`request` 工具已自动处理网络错误和 HTTP 状态码错误。
2. **特殊场景手动处理**：如果需要针对某个 API 的错误做特殊处理（例如 404 跳转到首页），在 `catch` 块中编写。
3. **避免重复提示**：已配置 `showSuccessMsg: true` 的 API，不需要再手动调用 `toast.success()`。

---

## 五、禁止事项

- ❌ 禁止在组件中直接写 `fetch('/api/xxx')`
- ❌ 禁止硬编码后端域名（必须使用 `lib/request` 中的配置）
- ❌ 禁止在非 `services/` 目录定义 API 调用函数
- ❌ 禁止跳过类型定义（必须使用 TypeScript Interface）

---

**遵循本规范，可确保 API 调用的一致性、可维护性和类型安全。**
