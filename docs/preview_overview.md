# 沙箱预览功能文档

## 1. 页面入口 `app/page.tsx`

- **职责**：渲染整体布局，包括左侧控制面板、右侧结果展示区以及顶部标题栏。
- **状态管理**：使用 `useState` / `useReducer` 维护会话、文件列表、生成进度等全局状态。
- **交互**：向后端发送用户请求（文件上传、清洗规则等），并接收流式返回的 `message.json`、`progress`、`artifact_delta` 等消息。

## 2. 聊天组件 `components/AiChat.tsx`

- **实时聊天窗口**：增量渲染后端返回的流式文本，支持 `delta`、`progress`、`artifact_delta` 三类消息。
- **消息处理**：
  - `message` → 追加到聊天记录。
  - `progress` → 更新生成进度 UI（当前/总组件数、阶段、组件名称）。
  - `artifact_delta` → 合并生成的代码文件到本地文件树。
- **UI 稳定性**：仅局部更新聊天内容，不触发页面整体刷新，避免 UI 抖动。

## 3. 预览组件 `components/DashboardPreview.tsx`

- **基于 Sandpack**：使用 `@codesandbox/sandpack-react` 渲染实时代码预览。
- **文件同步机制**：监听 `generatedFiles`（完整生成的文件）或 `streamingFiles`（生成过程中的临时文件），在 `onCodeEnd` 事件或手动刷新按钮触发时更新 Sandpack 的文件集合。
- **加载态**：代码生成期间显示全屏加载遮罩，展示进度信息，确保预览区保持挂载，不出现白屏或闪烁。
- **手动刷新**：提供 “刷新” 按钮，用户在编辑代码后可手动触发预览更新，避免自动全局刷新导致编辑内容丢失。

## 4. 整体交互流程

1. **用户在 `page` 发起请求** → `AiChat` 开始接收流式消息。
2. **`AiChat` 实时渲染聊天内容**，并将代码片段写入 `generatedFiles` / `streamingFiles`。
3. **`DashboardPreview` 监听文件变化**：
   - 当 `onCodeEnd`（代码生成完成）或用户点击刷新按钮时，调用 Sandpack 的 `updateFiles`/`reset`，刷新预览。
   - 生成期间显示加载层，防止 UI 抖动。
4. **完成后**，用户可在预览中查看最终渲染效果，或继续编辑代码并再次刷新。

## 5. 关键特性

- **实时聊天 + 增量代码展示**：`AiChat` 与后端流式协议无缝对接。
- **稳定预览**：通过加载遮罩和手动刷新机制，避免因频繁文件更新导致的白屏或闪烁。
- **分离生成与预览**：`streamingFiles` 与 `generatedFiles` 明确区分，保证预览只在完整代码生成后更新。
- **可手动控制**：用户可随时点击刷新按钮，强制重新渲染，适配编辑后即时预览需求。

---

_本文档采用 Markdown 格式，便于其他 AI 系统读取、解析并在需要时进行进一步修改。_
