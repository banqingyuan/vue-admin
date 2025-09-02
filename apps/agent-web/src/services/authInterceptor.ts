import process from 'node:process';

import { AuthenticationClient } from 'authing-js-sdk';

// 初始化 Authing 客户端
const authenticationClient = new AuthenticationClient({
  appId: process.env.REACT_APP_AUTHING_APP_ID || '',
  secret: process.env.REACT_APP_AUTHING_APP_SECRET || '',
  appHost: process.env.REACT_APP_AUTHING_APP_HOST || '',
  redirectUri: process.env.REACT_APP_AUTHING_REDIRECT_URI || '',
});

// 用于记录是否正在刷新token，防止多个请求同时触发刷新
let isRefreshing = false;
// 存储等待token刷新的请求
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * 将请求添加到订阅者队列中
 * @param callback 获取新token后执行的回调
 */
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

/**
 * 刷新token完成后，执行队列中所有等待的请求
 * @param token 新的token
 */
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * 清除所有等待的请求
 */
const rejectRefreshSubscribers = (_error: any) => {
  refreshSubscribers.forEach((callback) => callback(''));
  refreshSubscribers = [];
};

/**
 * 刷新token
 * @returns 新的token集合
 */
const refreshToken = async (): Promise<null | {
  access_token: string;
  id_token: string;
  refresh_token: string;
}> => {
  try {
    const tokenString = localStorage.getItem('authTokens');
    if (!tokenString) {
      return null;
    }

    const tokens = JSON.parse(tokenString);
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      return null;
    }

    // 调用Authing API刷新token
    const newTokens =
      await authenticationClient.getNewAccessTokenByRefreshToken(refreshToken);

    if (!newTokens || !newTokens.access_token) {
      throw new Error('刷新token失败');
    }

    // 保存新token
    const tokensToStore = {
      access_token: newTokens.access_token,
      id_token: newTokens.id_token,
      refresh_token: newTokens.refresh_token || refreshToken, // 如果没有返回新的refresh_token，则使用原来的
    };
    console.warn('Token刷新成功');

    localStorage.setItem('authTokens', JSON.stringify(tokensToStore));

    return tokensToStore;
  } catch (error) {
    console.error('刷新token失败:', error);
    return null;
  }
};

/**
 * 处理401未授权错误
 * @param originalRequest 原始请求对象
 * @returns 处理结果，成功返回新的响应，失败则抛出异常
 */
export const handleUnauthorizedError = async (
  originalRequest: Request,
): Promise<Response> => {
  // 如果不是401错误，则不处理
  if (!originalRequest || !originalRequest.headers) {
    throw new Error('无效的请求');
  }

  // 创建一个新请求的Promise（避免使用 async Promise executor）
  const retryOriginalRequest = new Promise<Response>((resolve, reject) => {
    (async () => {
      try {
        let idToken = '';

        // 如果正在刷新token，则将请求加入队列
        if (isRefreshing) {
          subscribeTokenRefresh((token) => {
            if (!token) {
              reject(new Error('获取新token失败'));
              return;
            }

            // 使用新token重试请求
            const newHeaders = new Headers(originalRequest.headers);
            newHeaders.set('Authorization', `Bearer ${token}`);

            const newRequest = new Request(originalRequest, {
              headers: newHeaders,
            });

            fetch(newRequest)
              .then((response) => resolve(response))
              .catch((error) => reject(error));
          });
        } else {
          // 标记正在刷新token
          isRefreshing = true;

          // 尝试刷新token
          const newTokens = await refreshToken();

          if (newTokens && newTokens.id_token) {
            // 刷新成功，使用新token
            idToken = newTokens.id_token;
            onTokenRefreshed(idToken);

            // 使用新token重试请求
            const newHeaders = new Headers(originalRequest.headers);
            newHeaders.set('Authorization', `Bearer ${idToken}`);

            const newRequest = new Request(originalRequest, {
              headers: newHeaders,
            });

            fetch(newRequest)
              .then((response) => resolve(response))
              .catch((error) => reject(error));
          } else {
            // 刷新失败，清空认证信息并跳转到登录页
            rejectRefreshSubscribers(new Error('刷新token失败'));
            clearAuthAndRedirect();
            reject(new Error('认证失败，请重新登录'));
          }

          // 重置刷新状态
          isRefreshing = false;
        }
      } catch (error) {
        // 发生异常，清空认证信息并跳转到登录页
        rejectRefreshSubscribers(error);
        clearAuthAndRedirect();
        reject(error);
      }
    })();
  });

  return retryOriginalRequest;
};

/**
 * 清除认证信息并跳转到登录缓冲页
 */
export const clearAuthAndRedirect = () => {
  // 清空所有认证相关信息
  localStorage.removeItem('userInfo');
  localStorage.removeItem('processedAuthCodes');
  localStorage.removeItem('authTokens');

  // 跳转到登录缓冲页
  window.location.href = '/login-buffer';
};

// 导出默认对象
export default {
  handleUnauthorizedError,
  clearAuthAndRedirect,
};
