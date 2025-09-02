import {
  clearAuthAndRedirect,
  handleUnauthorizedError,
} from '../services/authInterceptor';
import { BASE_URL, ERROR_MESSAGES, REQUEST_TIMEOUT } from './config';

/**
 * HTTP请求类
 * 封装基本的HTTP请求功能
 */
export class HttpClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = BASE_URL, timeout: number = REQUEST_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * DELETE请求
   */
  async delete<T>(endpoint: string): Promise<T> {
    const { controller, timeoutId } = this.createRequestController();

    try {
      const url = `${this.baseUrl}${endpoint}`;
      const request = new Request(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        signal: controller.signal,
      });

      const response = await fetch(request);
      return await this.handleResponse<T>(response, request);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * GET请求
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const { controller, timeoutId } = this.createRequestController();

    try {
      // 构建URL带查询参数
      let url = `${this.baseUrl}${endpoint}`;
      if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

      const request = new Request(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        signal: controller.signal,
      });

      const response = await fetch(request);
      return await this.handleResponse<T>(response, request);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * POST请求
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const { controller, timeoutId } = this.createRequestController();

    try {
      const url = `${this.baseUrl}${endpoint}`;
      const request = new Request(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : null,
        signal: controller.signal,
      });

      const response = await fetch(request);
      return await this.handleResponse<T>(response, request);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * PUT请求
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const { controller, timeoutId } = this.createRequestController();

    try {
      const url = `${this.baseUrl}${endpoint}`;
      const request = new Request(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : null,
        signal: controller.signal,
      });

      const response = await fetch(request);
      return await this.handleResponse<T>(response, request);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 创建请求控制器，用于超时处理
   */
  private createRequestController(): {
    controller: AbortController;
    timeoutId: NodeJS.Timeout;
  } {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    return { controller, timeoutId };
  }

  /**
   * 获取认证头部
   */
  private getAuthHeaders(): HeadersInit {
    const tokenString = localStorage.getItem('authTokens');
    let idToken = '';

    if (tokenString) {
      try {
        const tokens = JSON.parse(tokenString);
        idToken = tokens.id_token || '';
      } catch (error) {
        console.error('解析token失败:', error);
      }
    }

    return {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * 处理HTTP响应
   */
  private async handleResponse<T>(
    response: Response,
    request: Request,
  ): Promise<T> {
    if (!response.ok) {
      // 处理401未授权错误
      if (response.status === 401) {
        try {
          console.warn('检测到401错误，尝试刷新token...');
          // 尝试使用刷新token
          const newResponse = await handleUnauthorizedError(request);
          // 如果刷新成功并重新请求成功，解析响应
          return await this.parseSuccessResponse<T>(newResponse);
        } catch (error) {
          console.error('token刷新失败，需要重新登录:', error);
          // 如果刷新失败，清空认证信息并跳转到登录页
          clearAuthAndRedirect();
          throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        }
      }

      const errorText = await response.text().catch(() => null);

      switch (response.status) {
        case 403: {
          throw new Error(ERROR_MESSAGES.FORBIDDEN);
        }
        case 404: {
          throw new Error(ERROR_MESSAGES.NOT_FOUND);
        }
        case 500: {
          throw new Error(ERROR_MESSAGES.SERVER_ERROR);
        }
        default: {
          let errorMessage = ERROR_MESSAGES.DEFAULT_ERROR;

          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              // 优先检查error字段，支持{"error":"充值失败: 用户不存在"}格式
              errorMessage =
                errorData?.error ||
                errorData?.message ||
                ERROR_MESSAGES.DEFAULT_ERROR;
            } catch (error) {
              // JSON解析失败，使用默认错误消息
              console.error('解析错误消息失败:', error);
            }
          }

          throw new Error(errorMessage);
        }
      }
    }

    return await this.parseSuccessResponse<T>(response);
  }

  /**
   * 解析成功的响应
   */
  private async parseSuccessResponse<T>(response: Response): Promise<T> {
    try {
      return await response.json();
    } catch (error) {
      console.error('解析响应JSON失败:', error);
      throw new Error(ERROR_MESSAGES.DEFAULT_ERROR);
    }
  }
}
