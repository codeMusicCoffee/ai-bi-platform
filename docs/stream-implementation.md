# 流式数据处理实现

## 🚀 功能概述

我们已经成功实现了基于 `fetch` API 的流式数据处理功能，支持：

1. **真实流式响应**：Server-Sent Events (SSE) 和分块传输
2. **回退机制**：JSON 响应 + 模拟流式效果
3. **智能检测**：自动识别响应类型并选择合适的处理方式
4. **错误处理**：完善的错误处理和用户反馈

## 📋 实现细节

### 1. 流式请求创建

```typescript
const response = await createStreamRequest('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [{ role: "user", content: input }],
    provider: "deepseek",
    stream: true
  }),
  stream: true
});
```

### 2. 响应类型检测

```typescript
if (isStreamResponse(response)) {
  // 处理真实流式响应
  await processStreamResponse(response, {
    onChunk: (chunk) => setStreamedCode(prev => prev + chunk),
    onComplete: (content) => setCode(content),
    onError: (error) => throw error
  });
} else {
  // 处理 JSON 响应 + 模拟流式效果
  const data = await response.json();
  const fullCode = data.data?.code || data.code || '';
  
  simulateStream(fullCode, {
    onChunk: (chunk) => setStreamedCode(prev => prev + chunk),
    onComplete: () => setStatus('ready')
  });
}
```

### 3. 支持的流式格式

#### Server-Sent Events (SSE)
```
data: {"content": "import React from 'react';"}
data: {"content": "\n\nfunction Dashboard() {"}
data: [DONE]
```

#### 纯文本流
```
import React from 'react';

function Dashboard() {
  return <div>Hello</div>;
}
```

#### JSON 分块
```
{"delta": "import React"}
{"delta": " from 'react';"}
{"delta": "\n\nfunction"}
```

## 🛠️ 辅助工具

### `utils/stream-helpers.ts`

1. **`processStreamResponse`**：处理流式响应的核心函数
2. **`simulateStream`**：模拟流式效果，用于非流式响应
3. **`isStreamResponse`**：检测响应是否为流式
4. **`createStreamRequest`**：创建流式请求

## 🎯 使用场景

### 1. 真实流式 API
当后端支持 SSE 或分块传输时：
- 实时显示生成的代码
- 减少用户等待时间
- 提供更好的用户体验

### 2. 非流式 API 回退
当后端只返回完整 JSON 时：
- 自动模拟流式效果
- 保持一致的用户体验
- 无需修改后端代码

## 📊 状态管理

```typescript
const [status, setStatus] = useState<'idle' | 'loading' | 'streaming' | 'ready'>('idle');
const [streamedCode, setStreamedCode] = useState("");
const [code, setCode] = useState("");
```

- **idle**：初始状态
- **loading**：请求发送中
- **streaming**：正在接收流式数据
- **ready**：数据接收完成

## 🔧 配置选项

### 流式处理选项
```typescript
{
  onChunk: (chunk: string) => void,     // 接收到数据块时调用
  onComplete: (content: string) => void, // 流式完成时调用
  onError: (error: Error) => void       // 发生错误时调用
}
```

### 模拟流式选项
```typescript
{
  chunkSize: 50,                        // 每次显示的字符数
  delay: 50,                           // 每次更新的间隔（毫秒）
  onChunk: (chunk: string) => void,     // 数据块回调
  onComplete: () => void               // 完成回调
}
```

## 🧪 测试方法

### 1. 浏览器测试
1. 访问 `http://localhost:3001`
2. 输入需求并点击"生成看板"
3. 观察控制台日志和流式效果

### 2. 脚本测试
```bash
node scripts/test-stream-api.js
```

### 3. 控制台日志
```
🚀 Starting request to /api/chat
📦 Response received, content-type: application/json
📄 Processing as JSON
✅ Simulation completed
```

## 🎉 优势

1. **兼容性强**：支持流式和非流式后端
2. **用户体验好**：实时反馈，减少等待感
3. **错误处理完善**：详细的错误信息和恢复机制
4. **代码简洁**：使用辅助函数，逻辑清晰
5. **类型安全**：完整的 TypeScript 支持

## 🔮 未来扩展

1. **断点续传**：支持网络中断后的恢复
2. **进度显示**：显示具体的传输进度
3. **多路复用**：同时处理多个流式请求
4. **压缩支持**：支持 gzip 压缩的流式数据