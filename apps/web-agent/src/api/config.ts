/**
 * API 配置文件
 */

// API 基础 URL
export const AGENT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 请求超时时间(ms)
export const REQUEST_TIMEOUT = 30_000;

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络错误，请检查您的网络连接',
  TIMEOUT_ERROR: '请求超时，请稍后重试',
  UNAUTHORIZED: '用户未授权或登录已过期',
  FORBIDDEN: '没有权限访问该资源',
  NOT_FOUND: '请求的资源不存在',
  SERVER_ERROR: '服务器错误，请稍后重试',
  DEFAULT_ERROR: '请求失败，请稍后重试',
};
