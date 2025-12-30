// Request 库使用示例

import request, { RequestClient, ErrorType } from '@/lib/request';

// 基本使用示例
export const requestExamples = {
  
  // 1. 基本 GET 请求
  async getUsers() {
    try {
      const response = await request.get('/api/users');
      console.log('Users:', response.data);
      return response;
    } catch (error: any) {
      console.error('Failed to get users:', error.message);
      throw error;
    }
  },

  // 2. 带参数的 GET 请求
  async getUserById(id: number) {
    try {
      const response = await request.get(`/api/users/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.type === ErrorType.SERVER && error.originalError?.response?.status === 404) {
        console.log('User not found');
        return null;
      }
      throw error;
    }
  },

  // 3. POST 请求创建用户
  async createUser(userData: { name: string; email: string }) {
    try {
      const response = await request.post('/api/users', userData);
      console.log('User created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create user:', error.message);
      throw error;
    }
  },

  // 4. PUT 请求更新用户
  async updateUser(id: number, userData: Partial<{ name: string; email: string }>) {
    try {
      const response = await request.put(`/api/users/${id}`, userData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update user:', error.message);
      throw error;
    }
  },

  // 5. DELETE 请求
  async deleteUser(id: number) {
    try {
      await request.delete(`/api/users/${id}`);
      console.log('User deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete user:', error.message);
      throw error;
    }
  },

  // 6. 文件上传
  async uploadAvatar(file: File) {
    try {
      const response = await request.upload('/api/upload/avatar', file);
      console.log('Avatar uploaded:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to upload avatar:', error.message);
      throw error;
    }
  },

  // 7. 文件下载
  async downloadReport() {
    try {
      await request.download('/api/reports/monthly', 'monthly-report.pdf');
      console.log('Report downloaded successfully');
    } catch (error: any) {
      console.error('Failed to download report:', error.message);
      throw error;
    }
  },

  // 8. 跳过认证的请求
  async getPublicData() {
    try {
      const response = await request.get('/api/public/stats', null, {
        skipAuth: true
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to get public data:', error.message);
      throw error;
    }
  },

  // 9. 自定义超时
  async getLargeDataset() {
    try {
      const response = await request.get('/api/large-dataset', null, {
        timeout: 120000 // 2分钟超时
      });
      return response.data;
    } catch (error: any) {
      if (error.type === ErrorType.TIMEOUT) {
        console.log('Request timed out, dataset is too large');
      }
      throw error;
    }
  },

  // 10. 聊天接口示例
  async sendChatMessage(message: string) {
    try {
      const response = await request.post('/api/chat', {
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        provider: 'deepseek'
      });
      return response.data;
    } catch (error: any) {
      console.error('Chat request failed:', error.message);
      
      // 根据错误类型处理
      switch (error.type) {
        case ErrorType.NETWORK:
          console.log('Network issue, please check your connection');
          break;
        case ErrorType.TIMEOUT:
          console.log('Request timed out, please try again');
          break;
        case ErrorType.SERVER:
          console.log('Server error, please try again later');
          break;
        default:
          console.log('Unknown error occurred');
      }
      
      throw error;
    }
  }
};

// 错误处理示例
export const errorHandlingExamples = {
  
  // 统一错误处理函数
  handleApiError(error: any) {
    console.error('API Error:', {
      message: error.message,
      type: error.type,
      originalError: error.originalError
    });

    // 根据错误类型显示不同的用户提示
    switch (error.type) {
      case ErrorType.NETWORK:
        return 'Network connection failed. Please check your internet connection.';
      case ErrorType.TIMEOUT:
        return 'Request timed out. Please try again.';
      case ErrorType.SERVER:
        return error.message || 'Server error occurred.';
      case ErrorType.CANCELLED:
        return 'Request was cancelled.';
      default:
        return 'An unexpected error occurred.';
    }
  },

  // React 组件中的使用示例
  async fetchDataWithErrorHandling() {
    try {
      const data = await request.get('/api/data');
      return { success: true, data: data.data };
    } catch (error: any) {
      const userMessage = this.handleApiError(error);
      return { success: false, error: userMessage };
    }
  }
};

// 自定义 Request 实例示例
export const customRequestExample = {
  
  // 创建带有不同配置的请求实例
  createCustomClient() {
    const customRequest = new RequestClient('https://api.example.com');
    
    // 可以进一步自定义这个实例
    const axiosInstance = customRequest.getAxiosInstance();
    
    // 添加自定义拦截器
    axiosInstance.interceptors.request.use((config) => {
      // 添加自定义头部
      config.headers['X-Custom-Header'] = 'custom-value';
      return config;
    });
    
    return customRequest;
  }
};