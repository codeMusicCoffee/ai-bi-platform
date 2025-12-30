# 优化后的 Request 库使用指南

## 🚀 主要特性

### 1. 智能错误处理
- 自动重试机制
- 详细的错误分类和消息
- 网络错误、超时错误的友好提示

### 2. 请求/响应拦截器
- 自动添加认证 token
- 请求和响应的详细日志（开发环境）
- 请求时间统计

### 3. 请求取消功能
- 自动生成请求唯一标识
- 支持取消单个或所有请求
- 防止重复请求

### 4. 标准化响应格式
- 统一的 ApiResponse 格式
- 自动处理不同后端响应结构

## 📖 使用示例

### 基本用法

```typescript
import request from '@/lib/request';

// GET 请求
const users = await request.get('/api/users');

// POST 请求
const newUser = await request.post('/api/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT 请求
const updatedUser = await request.put('/api/users/1', {
  name: 'Jane Doe'
});

// DELETE 请求
await request.delete('/api/users/1');
```

### 高级用法

```typescript
// 跳过认证
const publicData = await request.get('/api/public', null, {
  skipAuth: true
});

// 自定义超时
const slowRequest = await request.post('/api/slow-endpoint', data, {
  timeout: 120000 // 2分钟
});

// 文件上传
const file = document.getElementById('file').files[0];
const uploadResult = await request.upload('/api/upload', file);

// 文件下载
await request.download('/api/download/report.pdf', 'monthly-report.pdf');
```

### 错误处理

```typescript
try {
  const data = await request.get('/api/data');
  console.log(data);
} catch (error) {
  console.error('Request failed:', error.message);
  console.error('Error code:', error.code);
  
  // 根据错误类型处理
  switch (error.code) {
    case 'TIMEOUT_ERROR':
      // 处理超时
      break;
    case 'NETWORK_ERROR':
      // 处理网络错误
      break;
    case 'HTTP_401':
      // 处理认证失败
      break;
    default:
      // 处理其他错误
  }
}
```

### 请求取消

```typescript
// 取消特定请求（需要在拦截器中获取 requestKey）
request.cancelRequest('GET_/api/users_abc123');

// 取消所有请求
request.cancelAllRequests();
```

## 🔧 配置选项

### 环境变量
- `API_BASE_URL`: API 基础 URL（从 constants 导入）
- `NODE_ENV`: 环境模式（development 时显示详细日志）

### 请求选项
- `skipAuth`: 跳过自动添加认证 token
- `skipErrorHandler`: 跳过全局错误处理
- `timeout`: 自定义超时时间
- 其他标准 axios 配置选项

## 📊 日志输出

在开发环境下，request 库会输出详细的日志：

```
🚀 API Request: POST /api/chat
📍 URL: /api/chat
📦 Data: { messages: [...], provider: "deepseek" }
⚙️ Headers: { "Content-Type": "application/json", ... }

✅ API Response: POST /api/chat (1234ms)
📊 Status: 200 OK
📦 Data: { code: 200, data: {...}, message: "Success" }
⏱️ Duration: 1234ms
```

## 🛡️ 安全特性

1. **自动 Token 管理**: 从 localStorage 读取 `auth_token`
2. **请求取消**: 防止内存泄漏和重复请求
3. **错误边界**: 统一的错误处理和用户友好的错误消息
4. **类型安全**: 完整的 TypeScript 支持

## 🎯 最佳实践

1. **使用类型泛型**:
   ```typescript
   interface User { id: number; name: string; }
   const user = await request.get<User>('/api/users/1');
   ```

2. **错误处理**:
   ```typescript
   try {
     const data = await request.post('/api/data', payload);
   } catch (error) {
     // 总是处理错误
     handleApiError(error);
   }
   ```

3. **请求取消**:
   ```typescript
   useEffect(() => {
     return () => {
       // 组件卸载时取消请求
       request.cancelAllRequests();
     };
   }, []);
   ```