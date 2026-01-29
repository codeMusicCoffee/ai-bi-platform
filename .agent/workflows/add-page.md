---
description: 新增一个页面
---

# 新增页面工作流

当需要为项目添加新页面时，按照以下步骤操作：

## 步骤 1: 确认需求

- 明确页面的功能定位（是管理页面还是展示页面？）
- 确定页面的路由路径（例如 `app/manage/analytics/page.tsx`）
- 确认是否需要布局（Layout）或使用现有布局

## 步骤 2: 创建页面文件

// turbo

```bash
# 在 app 目录下创建对应的页面文件
# 例如: app/manage/analytics/page.tsx
```

**页面模板**:

```tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <Card className="border-none shadow-sm rounded-[12px] bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-[3px] h-4 bg-[#306EFD] rounded-full" />
            <h3 className="text-[16px] font-bold text-gray-800">页面标题</h3>
          </div>

          {/* 页面内容 */}
        </CardContent>
      </Card>
    </div>
  );
}
```

## 步骤 3: 集成到路由 (如需要)

- 如果页面有侧边栏导航，更新导航配置
- 确保页面在开发服务器中可访问

## 步骤 4: 自检清单

- [ ] 页面使用了 `component-rule.md` 中的标准样式
- [ ] 容器使用 `rounded-[12px]`，组件使用 `rounded-[6px]`
- [ ] 标题栏包含蓝色装饰条（`bg-[#306EFD]`）
- [ ] 按钮样式符合规范（取消按钮用灰色边框）
- [ ] 没有硬编码非标准颜色（如 `blue-500`）
