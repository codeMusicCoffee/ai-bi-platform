// 测试流式 API 调用
const fetch = require('node-fetch');

async function testStreamAPI() {
  console.log('🧪 Testing stream API...\n');
  
  const url = 'http://localhost:3001/api/chat';
  const payload = {
    messages: [
      {
        role: 'user',
        content: '创建一个简单的销售看板'
      }
    ],
    provider: 'deepseek',
    stream: true
  };

  try {
    console.log('🚀 Sending stream request...');
    console.log('📍 URL:', url);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream, application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('📊 Response Status:', response.status, response.statusText);
    console.log('📋 Response Headers:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    const contentType = response.headers.get('content-type') || '';
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error Response:', errorText);
      return;
    }

    if (contentType.includes('text/event-stream') || contentType.includes('text/plain')) {
      console.log('\n📡 Processing as stream...');
      await processStream(response);
    } else if (contentType.includes('application/json')) {
      console.log('\n📄 Processing as JSON...');
      const data = await response.json();
      console.log('✅ JSON Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('\n🔄 Unknown content type, trying as text...');
      const text = await response.text();
      console.log('📝 Text Response:', text);
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

async function processStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let chunkCount = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('\n✅ Stream completed');
        console.log(`📊 Total chunks received: ${chunkCount}`);
        break;
      }
      
      chunkCount++;
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      console.log(`📦 Chunk ${chunkCount}:`, chunk.slice(0, 100) + (chunk.length > 100 ? '...' : ''));
      
      // 处理 Server-Sent Events
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            console.log('🏁 Stream finished signal received');
            return;
          }
          console.log('📨 SSE Data:', data.slice(0, 100) + (data.length > 100 ? '...' : ''));
        }
      }
    }
  } catch (error) {
    console.error('❌ Stream processing error:', error.message);
  } finally {
    reader.releaseLock();
  }
}

testStreamAPI();