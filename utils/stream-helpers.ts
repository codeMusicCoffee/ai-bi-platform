// 流式处理辅助函数

export interface StreamOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
}

// 处理流式响应的通用函数
export async function processStreamResponse(
  response: Response,
  options: StreamOptions = {}
): Promise<string> {
  const { onChunk, onComplete, onError } = options;
  
  if (!response.body) {
    throw new Error('Response body is not available');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      // 处理完整的行
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 保留不完整的行
      
      for (const line of lines) {
        let content = '';
        
        if (line.startsWith('data: ')) {
          // Server-Sent Events 格式
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            onComplete?.(fullContent);
            return fullContent;
          }
          
          try {
            const parsed = JSON.parse(data);
            content = parsed.content || parsed.code || parsed.delta || '';
          } catch {
            content = data;
          }
        } else if (line.trim()) {
          // 纯文本行
          content = line;
        }
        
        if (content) {
          fullContent += content;
          onChunk?.(content);
        }
      }
    }
    
    // 处理剩余的 buffer
    if (buffer.trim()) {
      fullContent += buffer;
      onChunk?.(buffer);
    }
    
    onComplete?.(fullContent);
    return fullContent;
    
  } catch (error) {
    const streamError = error instanceof Error ? error : new Error('Stream processing failed');
    onError?.(streamError);
    throw streamError;
  } finally {
    reader.releaseLock();
  }
}

// 模拟流式效果的函数
export function simulateStream(
  content: string,
  options: {
    chunkSize?: number;
    delay?: number;
    onChunk?: (chunk: string) => void;
    onComplete?: () => void;
  } = {}
): () => void {
  const { chunkSize = 50, delay = 50, onChunk, onComplete } = options;
  
  let index = 0;
  let intervalId: NodeJS.Timeout;
  
  const processChunk = () => {
    if (index >= content.length) {
      clearInterval(intervalId);
      onComplete?.();
      return;
    }
    
    const chunk = content.slice(index, index + chunkSize);
    index += chunkSize;
    onChunk?.(chunk);
  };
  
  intervalId = setInterval(processChunk, delay);
  
  // 返回取消函数
  return () => clearInterval(intervalId);
}

// 检测响应是否为流式
export function isStreamResponse(response: Response): boolean {
  const contentType = response.headers.get('content-type') || '';
  return (
    contentType.includes('text/event-stream') ||
    contentType.includes('text/plain') ||
    contentType.includes('application/x-ndjson') ||
    response.headers.get('transfer-encoding') === 'chunked'
  );
}

// 创建流式请求
export async function createStreamRequest(
  url: string,
  options: RequestInit & { stream?: boolean } = {}
): Promise<Response> {
  const { stream = true, ...fetchOptions } = options;
  
  const headers = new Headers(fetchOptions.headers);
  
  if (stream) {
    headers.set('Accept', 'text/event-stream, application/json');
    headers.set('Cache-Control', 'no-cache');
  }
  
  return fetch(url, {
    ...fetchOptions,
    headers,
  });
}