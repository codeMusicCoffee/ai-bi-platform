// 测试前端配置的脚本
const axios = require('axios');

// 模拟前端环境变量
process.env.NEXT_PUBLIC_API_URL = 'http://192.168.151.201:8000';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.151.201:8000';

console.log('Testing frontend configuration...');
console.log('API_BASE_URL:', API_BASE_URL);

// 创建 axios 实例（模拟前端 request.ts）
const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 增加超时时间
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
});

// 测试请求
async function testRequest() {
  try {
    console.log('\n🔄 Testing POST /api/chat...');
    console.log('Full URL:', API_BASE_URL + '/api/chat');
    
    const requestData = {
      messages: [
        {
          role: "user",
          content: "测试连接"
        }
      ],
      provider: "deepseek"
    };
    
    console.log('Request data:', JSON.stringify(requestData, null, 2));
    
    const response = await instance.post('/api/chat', requestData);
    
    console.log('✅ Success! Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error details:');
    console.log('- Message:', error.message);
    console.log('- Code:', error.code);
    
    if (error.response) {
      console.log('- Status:', error.response.status);
      console.log('- Status Text:', error.response.statusText);
      console.log('- Headers:', error.response.headers);
      console.log('- Data:', error.response.data);
    } else if (error.request) {
      console.log('- Request was made but no response received');
      console.log('- Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout
      });
    }
  }
}

// 先测试简单的 GET 请求
async function testSimpleRequest() {
  try {
    console.log('\n🔄 Testing simple GET request...');
    const response = await axios.get('http://192.168.151.201:8000/api/chat', {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ GET Success!', response.status);
  } catch (error) {
    console.log('❌ GET Error:', error.message);
    if (error.response) {
      console.log('- GET Status:', error.response.status);
    }
  }
}

async function runTests() {
  await testSimpleRequest();
  await testRequest();
}

runTests();