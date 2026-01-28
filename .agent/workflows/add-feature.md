---
description: 新增功能模块（组件、API、页面联动）
---

# 新增功能工作流

当需要新增一个完整功能模块时（例如：新增"用户管理"模块），按照以下顺序操作。

## 步骤 1: 需求拆解

- 明确功能的**核心职责**（这个模块要解决什么问题？）
- 列出所需的 **UI 组件**（表格？表单？弹窗？）
- 列出所需的 **API 接口**（CRUD？批量操作？）
- 确定**数据流向**（从哪里获取数据？如何更新状态？）

示例：

```
功能：用户管理
- UI: 用户列表表格 + 新增/编辑弹窗
- API: GET /api/users, POST /api/users, PUT /api/users/:id, DELETE /api/users/:id
- 状态: 本地状态（useState）还是全局状态（Zustand）？
```

## 步骤 2: API 服务层（Backend First）

1. 在 `services/` 下创建对应的服务文件（例如 `user.ts`）
2. 定义 TypeScript 类型接口
3. 编写 API 调用函数

**模板**:

```typescript
import request from '@/lib/request';

export interface User {
  id: string;
  name: string;
  email: string;
}

export const userService = {
  getUsers: (params?: { page?: number; pageSize?: number }) =>
    request.get<{ items: User[]; total: number }>('/api/users', params),

  createUser: (data: { name: string; email: string }) =>
    request.post<User>('/api/users', data, { showSuccessMsg: true }),

  updateUser: (id: string, data: Partial<User>) =>
    request.put<User>(`/api/users/${id}`, data, { showSuccessMsg: true }),

  deleteUser: (id: string) => request.delete(`/api/users/${id}`, {}, { showSuccessMsg: true }),
};
```

## 步骤 3: UI 组件（复用优先）

1. 优先使用 `SealedTable`、`SealedForm`、`SealedSearch` 等现有组件
2. 如果需要自定义组件，必须遵循 `component-rule.md` 规范
3. 组件文件命名：大驼峰 + 功能描述（例如 `UserManagementPage.tsx`）

## 步骤 4: 页面集成

1. 在 `app/` 对应目录下创建页面文件
2. 引入 API 服务和 UI 组件
3. 实现数据加载、增删改查逻辑

## 步骤 5: 路由与导航

- 确认页面路由是否需要添加到侧边栏或顶部导航
- 如果是受保护的页面，检查权限控制逻辑

## 步骤 6: 测试验证

// turbo-all

```bash
pnpm dev
```

- 手动测试所有功能点（新增、编辑、删除、搜索、分页）
- 检查网络请求是否正常
- 验证错误处理（API 报错时是否有友好提示）

## 🎯 自检清单

- [ ] API 服务层已完成且类型定义准确
- [ ] UI 组件样式符合 `component-rule.md`
- [ ] 表单验证使用 Zod Schema
- [ ] 删除操作有二次确认弹窗
- [ ] 操作成功/失败有 Toast 提示
- [ ] 没有硬编码颜色或非标准间距
- [ ] 代码中添加了必要的中文注释

## 原子改动提醒

**重要**: 如果功能包含多个子模块（例如"用户管理"+"角色分配"），必须拆分为多轮改动，每次只完成一个子模块。
