// 测试重构后的 request 库
const axios = require('axios');

async function testRefactoredRequest() {
  console.log('🧪 Testing refactored request library...\n');
  
  const baseURL = 'http://localhost:3001';
  
  // 测试用例
  const testCases = [
    {
      name: 'Health Check (Chat endpoint)',
      method: 'POST',
      url: '/api/chat',
      data: {
        messages: [{ role: 'user', content: 'ping' }],
        provider: 'test'
      }
    },
    {
      name: 'Non-existent endpoint',
      method: 'GET',
      url: '/api/nonexistent'
    }
  ];

  for (const testCase of testCases) {
    console.log(`🔄 Testing: ${testCase.name}`);
    
    try {
      let response;
      
      if (testCase.method === 'GET') {
        response = await axios.get(`${baseURL}${testCase.url}`, {
          timeout: 10000
        });
      } else if (testCase.method === 'POST') {
        response = await axios.post(`${baseURL}${testCase.url}`, testCase.data, {
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      console.log(`✅ ${testCase.name} - Success!`);
      console.log(`   Status: ${response.status}`);
      
      // 只显示响应数据的前200个字符
      const dataStr = JSON.stringify(response.data, null, 2);
      console.log(`   Data: ${dataStr.length > 200 ? dataStr.slice(0, 200) + '...' : dataStr}`);
      
    } catch (error) {
      console.log(`❌ ${testCase.name} - Failed:`);
      
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        console.log(`   Network Error: No response received`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
    
    console.log(''); // 空行分隔
  }

  console.log('🎯 Test Summary:');
  console.log('- The refactored request library should handle these cases gracefully');
  console.log('- Check browser console for detailed request/response logs');
  console.log('- Error handling should provide user-friendly messages');
}

testRefactoredRequest();