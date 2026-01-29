# AI Agent Operational Guidelines

This document serves as the **supreme instruction set** for any AI agent working on this project. You must adhere to these rules strictly to ensure project stability and consistency.

## 🚨 CRITICAL: Configuration Locking

### 1. Sandpack Configuration is FROZEN

The configuration for the Sandpack environment in `components/DashboardPreview.tsx` is considered **STABLE and FROZEN**.

- **DO NOT** modify the `customSetup`, `npmRegistries`, `dependencies`, or `options` objects in this file without explicit user permission.
- **DO NOT** change the refresh/retry logic (`refreshKey`, `retryKey`, `refreshId`, `isLoading` handling). This logic has been carefully tuned to handle stream timing and initialization race conditions.
- **Reference**: Always consult `.spec/sandbox.md` to understand the rationale behind the current configuration before even _thinking_ about suggesting changes.

## 📜 Workflow & Knowledge Base

### 2. Mandatory Spec Reading

Before starting any task involving core architecture, UI components, or configuration, you **MUST** check the `.spec/` directory.

- Files in `.spec/` contain source-of-truth documentation for critical modules.
- Current Specs:
  - `.spec/sandbox.md`: Definitive guide for Sandpack configuration.

### 3. Modification Protocol

If you believe a modification to a "frozen" configuration is absolutely necessary (e.g., to fix a critical bug or support a user-requested feature that strictly requires it):

1.  **Read** the relevant `.spec` file first.
2.  **Explain** why the current configuration (as documented) prevents the task.
3.  **Propose** the change explicitly and ask for confirmation.
4.  **Update** the corresponding `.spec` file immediately after the change is applied.

## 🛠 Project Context

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS (Loaded via CDN in Sandpack, local otherwise)
- **State Management**: React Hooks (useState, useMemo, useEffect, useRef)
- **API Pattern**: Streaming responses handled via `EventSource`/`ReadableStream`.

---

## 🎨 UI & Styling Rules

### 4. Component & Style Protocol

You **MUST** strictly follow the UI patterns and styling rules defined in:

- **`.agent/instructions/component-rule.md`** (组件样式规范)
- **`.agent/instructions/api-rule.md`** (API 调用规范)
- **`.agent/instructions/naming-convention.md`** (命名规范)
- **`.agent/instructions/sealed-components.md`** (自定义组件使用指南)
- **`.agent/CHEAT_SHEET.md`** (快速参考卡片)

**Core Requirements:**

- **No Out-of-Spec Styles**: Do not use inline styles or Tailwind classes that deviate from the examples in `component-rule.md` (e.g., custom shadows, specific hex colors not listed, or complex border-radius).
- **Atomic Consistency**: Every button, dialog, and dropdown must look and behave exactly like the reference examples.
- **Stability First**: Refer to the "UI 与功能稳定性" sections in the global rules, but prioritize the specific examples in `component-rule.md` for visual implementation.
- **API Layer Enforcement**: All API calls must go through `services/`, never use `fetch()` directly in components.
- **Naming Standards**: Follow `naming-convention.md` for all files, variables, functions, and components.

### 4.1 Quick Reference

For rapid lookup of common patterns, consult `.agent/CHEAT_SHEET.md` which contains:

- Design Token values (colors, spacing, typography)
- Code snippets (buttons, dropdowns, tables)
- API call templates
- File naming rules
- Common pitfalls to avoid

---

## 📦 项目架构与模块划分

### 5. 核心功能模块

本项目是一个 **AI 驱动的商业智能分析平台**，主要包含以下核心模块：

#### 5.1 产品管理 (PM - Product Management)

- **路径**: `app/manage/home/comp/product/`
- **功能**:
  - **分类树 (CategoryTree)**: 四级树形结构（品类 → 系列 → 品牌 → 产品）
  - **品牌卡片 (BrandCard)**: 品牌详细信息展示与编辑
  - **产品卡片 (ProductCard)**: 产品基础信息、生命周期、关键事件
  - **生命周期管理 (LifecycleTab)**: 拖拽排序、阶段节点、数据集关联
  - **看板配置 (BoardTab)**: 看板卡片的 CRUD、图表样式选择
- **API 服务**: `services/pm.ts`
- **核心组件**: `SealedForm`, `SealedTable`, `SealedSearch`, `ImageUploader`

#### 5.2 AI 对话分析 (AI Chat)

- **路径**: `app/aichat/`
- **功能**: 基于 AI SDK 的流式对话、图表生成、Sandpack 在线预览
- **关键文件**: `components/DashboardPreview.tsx` (Sandpack 配置已冻结)
- **Spec 文档**: `.spec/sandbox.md`

#### 5.3 数据集管理 (Dataset)

- **API 服务**: `services/dataset.ts`
- **功能**: 数据集的查询与关联

### 6. 技术栈与工具链

- **核心框架**: Next.js 16.1.1 (App Router)
- **UI 组件库**: Radix UI + shadcn/ui
- **样式方案**: Tailwind CSS 4.x
- **表单处理**: React Hook Form + Zod (类型安全校验)
- **状态管理**: Zustand (轻量级全局状态)
- **拖拽功能**: @dnd-kit
- **AI 能力**: Vercel AI SDK + Google Generative AI
- **图表展示**: Recharts
- **包管理器**: pnpm
- **Node 版本**: 20.19.6 (Volta 管理)

### 7. 目录结构约定

```
ai-bi-platform/
├── .agent/                   # AI 指令中心
│   ├── instructions/         # 各领域开发规范
│   └── workflows/           # 标准工作流 (即将创建)
├── .spec/                    # 复杂模块的深度说明
├── app/                      # Next.js 页面 (App Router)
│   ├── (auth)/              # 认证相关
│   ├── manage/              # 管理后台
│   │   └── home/            # 产品管理主页
│   └── aichat/              # AI 对话分析
├── components/               # 组件库
│   ├── ui/                  # shadcn 原子组件
│   └── common/              # 自定义 Sealed 系列组件
├── services/                 # API 服务层
├── lib/                      # 工具函数 (request, utils)
├── store/                    # Zustand 全局状态
└── AGENT.md                  # 本文件 (AI 行为准则)
```

### 8. 关键约定与红线

- **禁止擅自修改 `components/DashboardPreview.tsx`**：Sandpack 配置已冻结，需先阅读 `.spec/sandbox.md`。
- **所有 UI 必须符合 `component-rule.md`**：颜色、圆角、间距、按钮样式必须一一对应。
- **API 域名**: 后端接口位于 `http://192.168.110.29:8000`，请勿硬编码其他地址。
- **最小侵入原则**: 修改代码时必须保留原逻辑，禁止"顺手重构"。

---

_Failure to follow these instructions will result in broken previews and unstable application states._
