/**
 * 请求客户端配置
 * 使用 @vben/request 包
 */

import { RequestClient } from '@vben/request';

import { AGENT_API_BASE_URL, ERROR_MESSAGES, REQUEST_TIMEOUT } from './config';

/**
 * 创建 Agent API 请求客户端
 */
export const agentRequestClient = new RequestClient({
  baseURL: AGENT_API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
});

// 请求拦截器：添加认证头
agentRequestClient.addRequestInterceptor({
  fulfilled: async (config) => {
    // 从 localStorage 获取 token
    const tokensString = localStorage.getItem('authTokens');
    if (tokensString) {
      try {
        const tokens = JSON.parse(tokensString);
        const idToken = tokens.id_token || '';
        if (idToken) {
          config.headers.Authorization = `Bearer ${idToken}`;
        }
      } catch (error) {
        console.error('解析 token 失败:', error);
      }
    }
    return config;
  },
});

// 响应拦截器：处理错误
agentRequestClient.addResponseInterceptor({
  fulfilled: (response) => {
    return response;
  },
  rejected: (error) => {
    // 处理 401 未授权错误
    if (error.response?.status === 401) {
      console.error('认证失败，需要重新登录');
      // 清除认证信息
      localStorage.removeItem('authTokens');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userRole');
      // 跳转到登录页
      window.location.href = '/login-buffer';
    }

    // 处理其他错误
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      ERROR_MESSAGES.DEFAULT_ERROR;

    console.error('API 请求失败:', errorMessage);

    return Promise.reject(error);
  },
});
