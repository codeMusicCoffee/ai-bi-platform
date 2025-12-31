# Sandpack 配置文档

本文档记录了 `components/DashboardPreview.tsx` 中用于配置 `@codesandbox/sandpack-react` 的相关设置。这些配置对于确保 React 预览环境的稳定性和性能至关重要。

## 1. 核心依赖配置 (`customSetup.dependencies`)

我们手动指定了项目运行所需的核心依赖及其版本，以避免版本冲突和运行时错误。

```javascript
const dependencies = {
  react: '18.3.1',
  'react-dom': '18.3.1',
  recharts: '2.12.7',
  'lucide-react': '0.400.0',
  'framer-motion': '11.0.3',
  clsx: '2.1.1',
  'tailwind-merge': '2.5.2',
  'react-is': '18.3.1',
  'date-fns': 'latest',
};
```

## 2. NPM 镜像源配置 (`customSetup.npmRegistries`)

为了提高依赖包的下载速度并解决网络问题，我们强制将 NPM 镜像源配置为淘宝镜像源 (`https://registry.npmmirror.com/`)。

- **enabledScopes**: 显式设置为 `Object.keys(dependencies)`，即所有在 dependencies 中列出的包都将走此镜像源。
- **registryUrl**: `https://registry.npmmirror.com/`
- **proxyEnabled**: `false` (禁用代理，直接连接)

```javascript
npmRegistries: [
  {
    enabledScopes: Object.keys(dependencies),
    limitToScopes: [],
    registryUrl: 'https://registry.npmmirror.com/',
    proxyEnabled: false,
  },
],
```

## 3. Tailwind CSS 集成 (`options.externalResources`)

我们通过 CDN 引入 Tailwind CSS，而不是在沙箱内编译 PostCSS。这是为了显著提升编译速度和减少沙箱内存占用。

```javascript
externalResources: ['https://cdn.tailwindcss.com'];
```

## 4. 性能优化配置 (`options`)

- **enableAnalytics**: `false` - 禁用代码沙盒的统计收集，减少网络请求。
- **recompileMode**: `'delayed'` - 延迟编译模式，避免用户输入时的频繁重编译。
- **recompileDelay**: `500` - 延迟 500ms 执行编译。

```javascript
const options = useMemo(
  () => ({
    externalResources: ['https://cdn.tailwindcss.com'],
    enableAnalytics: false,
    recompileMode: 'delayed',
    recompileDelay: 500,
  }),
  []
);
```

## 5. 文件系统结构 (`files`)

我们构建了一个标准的 React 运行环境结构：

- `/App.js`: 核心组件代码。
  - **Loading 状态**: 如果 `isLoading` 为 true，提供一个带有动画的占位组件，防止 Sandpack 尝试编译不完整的流式代码。
  - **Done 状态**: 如果 `!isLoading`，注入完整的生成代码。
- `/index.js`: 入口文件，负责挂载 React 应用 (`createRoot`)。
- `/public/index.html`: 提供 `#root` 挂载节点。
- `/styles.css`: 基础样式重置，确保全屏显示。

## 6. 刷新与重试机制

为了解决偶发的沙箱加载失败或白屏问题，我们实现了多层刷新机制：

1.  **自动重建**: 当 `isLoading` 从 true 变为 false 时（代码生成结束），延迟 200ms 触发一次 `refreshKey` 更新。
2.  **超时兜底**: 如果 3 秒后还没加载出来，触发 `retryKey` 更新，尝试再次重建。
3.  **强制刷新**: 父组件传递 `refreshId`，当生成完全结束后强制子组件销毁重建。
4.  **手动按钮**: UI 右上角提供手动的“刷新预览”按钮。
5.  **ErrorBoundary**: 全局捕获渲染错误，并提供由内的重试按钮。

---

_文档生成时间: 2025-12-31_
