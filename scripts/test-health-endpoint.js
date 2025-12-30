// 测试健康检查端点
const axios = require('axios');

async function testHealthEndpoint() {
  console.log('Testing health endpoint...');
  
  try {
    // 测试通过 Next.js 代理的健康检查
    const response = await axios.get('http://localhost:3001/api/health', {
      timeout: 10000
    });
    
    console.log('✅ Health check successful!');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    
  } catch (error) {
    console.log('❌ Health check failed:');
    
    if (error.response) {
      console.log('- Status:', error.response.status);
      console.log('- Data:', error.response.data);
    } else if (error.request) {
      console.log('- No response received');
      console.log('- This could mean:');
      console.log('  1. Next.js server is not running');
      console.log('  2. Backend server is not running');
      console.log('  3. Network connectivity issues');
    } else {
      console.log('- Error:', error.message);
    }
  }
}

testHealthEndpoint();