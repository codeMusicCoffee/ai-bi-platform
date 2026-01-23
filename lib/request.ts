import { API_BASE_URL } from '@/constants';
import { ApiResponse } from '@/types';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 请求配置接口
interface RequestOptions extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipErrorHandler?: boolean;
  successMsg?: string;
  showSuccessMsg?: boolean;
}

// 错误类型枚举
enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  CANCELLED = 'CANCELLED_ERROR',
  SERVER = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

class RequestClient {
  private instance: AxiosInstance;
  private requestCount = 0;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 3*60*1000, // 60秒超时
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
        const requestId = ++this.requestCount;
        
        // 添加请求ID和时间戳
        config.metadata = {
          requestId,
          startTime: Date.now(),
        };

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
        this.logRequest(config, requestId);

        return config;
      },
      (error) => {
        console.error('❌ Request setup failed:', error);
        return Promise.reject(this.createError(error, ErrorType.UNKNOWN));
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        const config = response.config as any;
        const duration = config.metadata ? Date.now() - config.metadata.startTime : 0;

        // 开发环境日志
        this.logResponse(response, config.metadata?.requestId, duration);

        // 标准化响应
        const options = response.config as RequestOptions;
        const normalized = this.normalizeResponse(response);
        
        // 成功提示处理
        if (normalized.success && (options.showSuccessMsg || options.successMsg )) {
          const message =  options.successMsg|| '操作成功'|| normalized.message ;
          // 延迟导入或者使用全局变量，避免循环依赖或在非浏览器环境报错
          import('sonner').then(({ toast }) => {
            toast.success(message);
          }).catch(() => {
            console.log('✅ ' + message);
          });
        }

        return normalized;
      },
      (error) => {
        const config = error.config as any;
        const duration = config?.metadata ? Date.now() - config.metadata.startTime : 0;

        // 开发环境错误日志
        this.logError(error, config?.metadata?.requestId, duration);

        return Promise.reject(this.handleError(error));
      }
    );
  }

  // 请求日志
  private logRequest(config: any, requestId: number) {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚀 [${requestId}] ${config.method?.toUpperCase()} ${config.url}`);
      console.log('📍 Full URL:', (config.baseURL || '') + config.url);
      if (config.data) {
        console.log('📦 Request Data:', config.data);
      }
      if (config.params) {
        console.log('🔍 Query Params:', config.params);
      }
      console.groupEnd();
    }
  }

  // 响应日志
  private logResponse(response: AxiosResponse, requestId: number, duration: number) {
    if (process.env.NODE_ENV === 'development') {
      console.group(`✅ [${requestId}] Response (${duration}ms)`);
      console.log('📊 Status:', response.status, response.statusText);
      console.log('📦 Data:', response.data);
      console.groupEnd();
    }
  }

  // 错误日志
  private logError(error: AxiosError, requestId: number, duration: number) {
    if (process.env.NODE_ENV === 'development') {
      console.group(`❌ [${requestId}] Error (${duration}ms)`);
      console.error('🔥 Message:', error.message);
      console.error('📊 Status:', error.response?.status);
      console.error('📦 Response:', error.response?.data);
      console.groupEnd();
    }
  }

  // 标准化响应数据
  private normalizeResponse(response: AxiosResponse): any {
    const { data, status } = response;
    
    // 如果后端已经返回标准格式
    if (data && typeof data === 'object' && 'code' in data) {
      // 补充 success 标识，兼容 code 为 0 或 2xx 的场景
      if (!('success' in data)) {
        data.success = data.code === 0 || (data.code >= 200 && data.code < 300);
      }
      return data;
    }

    
    // 包装成标准格式
    return {
      code: status,
      success: status >= 200 && status < 300,
      data: data,
      message: '操作成功',
      timestamp: Date.now(),
    };
  }

  // 创建标准错误
  private createError(originalError: any, type: ErrorType, message?: string): Error {
    const error = new Error(message || originalError.message) as any;
    error.type = type;
    error.originalError = originalError;
    return error;
  }

  // 错误处理
  private handleError(error: AxiosError): Error {
    let message = 'Request failed';
    let type = ErrorType.UNKNOWN;

    // 网络错误
    if (error.code === 'ERR_NETWORK') {
      message = 'Network connection failed. Please check your internet connection.';
      type = ErrorType.NETWORK;
    }
    // 超时错误
    else if (error.code === 'ECONNABORTED') {
      message = 'Request timeout. Please try again.';
      type = ErrorType.TIMEOUT;
    }
    // 取消错误
    else if (error.code === 'ERR_CANCELED') {
      message = 'Request was cancelled.';
      type = ErrorType.CANCELLED;
    }
    // 服务器响应错误
    else if (error.response) {
      const { status, data } = error.response;
      type = ErrorType.SERVER;

      // 从响应数据中提取错误信息
      if (data && typeof data === 'object') {
        const errorData = data as any;
        message = errorData.message || errorData.error || errorData.detail || `Server error (${status})`;
      } else {
        message = `Server error (${status}): ${error.response.statusText}`;
      }

      // 特殊状态码处理
      switch (status) {
        case 400:
          message = 'Bad request. Please check your input.';
          break;
        case 401:
          message = 'Authentication required. Please login.';
          // 清除过期token
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
          }
          break;
        case 403:
          message = 'Access denied. Insufficient permissions.';
          break;
        case 404:
          message = 'Resource not found.';
          break;
        case 422:
          message = 'Validation failed. Please check your input.';
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
          message = 'Service unavailable. Please try again later.';
          break;
      }
    }
    // 请求未发送
    else if (error.request) {
      message = 'Unable to connect to server. Please check if the service is running.';
      type = ErrorType.NETWORK;
    }

    return this.createError(error, type, message);
  }

  // 通用请求方法
  private async makeRequest<T = any>(
    method: string,
    url: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig = {
      method: method.toLowerCase() as any,
      url,
      ...options,
    };

    // 设置请求数据
    if (['get', 'delete'].includes(method.toLowerCase())) {
      config.params = data;
    } else {
      config.data = data;
    }

    const response = await this.instance.request(config);
    return response as unknown as ApiResponse<T>;
  }

  // GET 请求
  public async get<T = any>(
    url: string, 
    params?: any, 
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', url, params, options);
  }

  // POST 请求
  public async post<T = any>(
    url: string, 
    data?: any, 
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', url, data, options);
  }

  // PUT 请求
  public async put<T = any>(
    url: string, 
    data?: any, 
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', url, data, options);
  }

  // PATCH 请求
  public async patch<T = any>(
    url: string, 
    data?: any, 
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PATCH', url, data, options);
  }

  // DELETE 请求
  public async delete<T = any>(
    url: string, 
    params?: any, 
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', url, params, options);
  }

  // 文件上传
  public async upload<T = any>(
    url: string, 
    file: File | FormData, 
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const formData = file instanceof FormData ? file : new FormData();
    if (file instanceof File) {
      formData.append('file', file);
    }

    return this.makeRequest<T>('POST', url, formData, {
      ...options,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...options?.headers,
      },
    });
  }

  // 下载文件
  public async download(
    url: string, 
    filename?: string, 
    options?: RequestOptions
  ): Promise<void> {
    const response = await this.instance.get(url, {
      ...options,
      responseType: 'blob',
    });

    // 创建下载链接
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // 获取原始axios实例
  public getAxiosInstance(): AxiosInstance {
    return this.instance;
  }
}

// 创建默认实例
const request = new RequestClient(API_BASE_URL);

// 开发环境初始化日志
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Request client initialized');
  console.log('📍 Base URL:', API_BASE_URL);
}

// 导出
export { ErrorType, RequestClient };
export default request;