import { API_BASE_URL } from '@/constants';
import { ApiResponse } from '@/types';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 扩展请求配置接口
interface RequestOptions extends AxiosRequestConfig {
  skipAuth?: boolean; // 跳过认证
  skipErrorHandler?: boolean; // 跳过全局错误处理
}

// 请求元数据接口
interface RequestMetadata {
  startTime: number;
  requestKey: string;
}

class Request {
  private instance: AxiosInstance;
  private pendingRequests = new Map<string, AbortController>();

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 60 * 1000, // 60秒超时
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: any) => {
        const requestKey = this.getRequestKey(config);
        
        // 创建取消令牌
        const controller = new AbortController();
        config.signal = controller.signal;
        this.pendingRequests.set(requestKey, controller);

        // 添加请求元数据
        config.metadata = {
          startTime: Date.now(),
          requestKey,
        } as RequestMetadata;

        // 添加认证token
        const options = config as RequestOptions;
        if (!options.skipAuth && typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        // 开发环境日志
        if (process.env.NODE_ENV === 'development') {
          console.group(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
          console.log('📍 URL:', (config.baseURL || '') + config.url);
          console.log('📦 Data:', config.data);
          console.log('⚙️ Headers:', config.headers);
          console.groupEnd();
        }

        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(this.handleError(error));
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const config = response.config as any;
        const metadata = config.metadata as RequestMetadata;
        const duration = metadata ? Date.now() - metadata.startTime : 0;

        // 清理pending请求
        if (metadata?.requestKey) {
          this.pendingRequests.delete(metadata.requestKey);
        }

        // 开发环境日志
        if (process.env.NODE_ENV === 'development') {
          console.group(`✅ API Response: ${config.method?.toUpperCase()} ${config.url} (${duration}ms)`);
          console.log('📊 Status:', response.status, response.statusText);
          console.log('📦 Data:', response.data);
          console.log('⏱️ Duration:', `${duration}ms`);
          console.groupEnd();
        }

        // 返回标准化响应
        return this.normalizeResponse(response);
      },
      (error: AxiosError) => {
        const config = error.config as any;
        const metadata = config?.metadata as RequestMetadata;
        const duration = metadata ? Date.now() - metadata.startTime : 0;

        // 清理pending请求
        if (metadata?.requestKey) {
          this.pendingRequests.delete(metadata.requestKey);
        }

        // 开发环境错误日志
        if (process.env.NODE_ENV === 'development') {
          console.group(`❌ API Error: ${config?.method?.toUpperCase()} ${config?.url} (${duration}ms)`);
          console.error('🔥 Error:', error.message);
          console.error('📊 Status:', error.response?.status);
          console.error('� Responser:', error.response?.data);
          console.error('⏱️ Duration:', `${duration}ms`);
          console.groupEnd();
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  // 生成请求唯一标识
  private getRequestKey(config: AxiosRequestConfig): string {
    const { method = 'get', url = '', data } = config;
    let dataStr = '';
    
    try {
      if (data) {
        dataStr = JSON.stringify(data);
        // 安全的 base64 编码，支持 Unicode 字符
        dataStr = btoa(encodeURIComponent(dataStr)).slice(0, 10);
      }
    } catch (error) {
      // 如果编码失败，使用简单的哈希
      dataStr = Math.abs(JSON.stringify(data || '').split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0)).toString(36).slice(0, 10);
    }
    
    return `${method.toUpperCase()}_${url}_${dataStr}`;
  }

  // 标准化响应数据
  private normalizeResponse(response: AxiosResponse): any {
    const { data, status } = response;
    
    // 如果后端返回标准格式 { code, data, message }
    if (data && typeof data === 'object' && 'code' in data) {
      return data;
    }
    
    // 否则包装成标准格式
    return {
      code: status,
      success: status >= 200 && status < 300,
      data: data,
      message: 'Success',
      timestamp: Date.now(),
    };
  }

  // 统一错误处理
  private handleError(error: AxiosError): Error {
    let message = 'Unknown error occurred';
    let code = 'UNKNOWN_ERROR';

    if (error.code === 'ECONNABORTED') {
      message = 'Request timeout. Please check your network connection.';
      code = 'TIMEOUT_ERROR';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Network error. Please check your internet connection.';
      code = 'NETWORK_ERROR';
    } else if (error.code === 'ERR_CANCELED') {
      message = 'Request was cancelled.';
      code = 'CANCELLED_ERROR';
    } else if (error.response) {
      // 服务器响应错误
      const { status, data } = error.response;
      code = `HTTP_${status}`;
      
      if (data && typeof data === 'object') {
        const errorData = data as any;
        message = errorData.message || errorData.error || `HTTP ${status} Error`;
      } else {
        message = `HTTP ${status}: ${error.response.statusText}`;
      }

      // 特殊状态码处理
      switch (status) {
        case 401:
          message = 'Authentication failed. Please login again.';
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
          }
          break;
        case 403:
          message = 'Access denied. You don\'t have permission to perform this action.';
          break;
        case 404:
          message = 'Resource not found.';
          break;
        case 429:
          message = 'Too many requests. Please try again later.';
          break;
        case 500:
          message = 'Internal server error. Please try again later.';
          break;
        case 502:
        case 503:
        case 504:
          message = 'Service temporarily unavailable. Please try again later.';
          break;
      }
    } else if (error.request) {
      message = 'No response from server. Please check if the backend service is running.';
      code = 'NO_RESPONSE_ERROR';
    }

    const customError = new Error(message) as any;
    customError.code = code;
    customError.originalError = error;
    
    return customError;
  }

  // 取消请求
  public cancelRequest(requestKey?: string) {
    if (requestKey && this.pendingRequests.has(requestKey)) {
      this.pendingRequests.get(requestKey)?.abort();
      this.pendingRequests.delete(requestKey);
    }
  }

  // 取消所有请求
  public cancelAllRequests() {
    this.pendingRequests.forEach((controller) => {
      controller.abort();
    });
    this.pendingRequests.clear();
  }

  // 通用请求方法
  private async request<T = any>(
    method: string, 
    url: string, 
    data?: any, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const config: AxiosRequestConfig = {
        method: method.toLowerCase() as any,
        url,
        ...options,
      };

      // 根据请求方法设置数据
      if (['get', 'delete'].includes(method.toLowerCase())) {
        config.params = data;
      } else {
        config.data = data;
      }

      const response = await this.instance.request(config);
      return response as unknown as ApiResponse<T>;
    } catch (error) {
      throw error;
    }
  }

  // GET 请求
  public get<T = any>(url: string, params?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, params, options);
  }

  // POST 请求
  public post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, options);
  }

  // PUT 请求
  public put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, options);
  }

  // PATCH 请求
  public patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data, options);
  }

  // DELETE 请求
  public delete<T = any>(url: string, params?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, params, options);
  }

  // 文件上传
  public upload<T = any>(url: string, file: File | FormData, options?: RequestOptions): Promise<ApiResponse<T>> {
    const formData = file instanceof FormData ? file : new FormData();
    if (file instanceof File) {
      formData.append('file', file);
    }

    return this.request<T>('POST', url, formData, {
      ...options,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...options?.headers,
      },
    });
  }

  // 下载文件
  public async download(url: string, filename?: string, options?: RequestOptions): Promise<void> {
    try {
      const response = await this.instance.get(url, {
        ...options,
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // 获取实例（用于特殊需求）
  public getInstance(): AxiosInstance {
    return this.instance;
  }
}

// 创建默认实例
const request = new Request(API_BASE_URL);

// 开发环境日志
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Request library initialized with API_BASE_URL:', API_BASE_URL);
}

// 导出实例和类
export { Request };
export default request;