// 测试优化后的 request 库
const axios = require('axios');

async function testEndpoints() {
  console.log('🧪 Testing optimized request library...\n');
  
  const baseURL = 'http://localhost:3001';
  const endpoints = [
    { method: 'GET', path: '/api/health', description: 'Health check' },
    { method: 'POST', path: '/api/chat', description: 'Chat endpoint', data: { 
      messages: [{ role: 'user', content: 'test' }], 
      provider: 'deepseek' 
    }},
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 Testing ${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
      
      let response;
      if (endpoint.method === 'GET') {
        response = await axios.get(`${baseURL}${endpoint.path}`, { timeout: 10000 });
      } else if (endpoint.method === 'POST') {
        response = await axios.post(`${baseURL}${endpoint.path}`, endpoint.data, { 
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      console.log(`✅ ${endpoint.description} - Success!`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Data:`, JSON.stringify(response.data, null, 2).slice(0, 200) + '...');
      
    } catch (error) {
      console.log(`❌ ${endpoint.description} - Failed:`);
      
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data:`, error.response.data);
      } else if (error.request) {
        console.log(`   No response received`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
    
    console.log(''); // 空行分隔
  }
}

testEndpoints();