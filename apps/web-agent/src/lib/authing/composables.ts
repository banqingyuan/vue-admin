import type { Ref } from 'vue';

import type { AuthingClient } from './authing-client';

import { computed, ref } from 'vue';

interface UseAuthingAuthOptions {
  authingClient: AuthingClient;
}

interface UserInfo {
  sub: string;
  phone_number?: string;
  email?: string;
  [key: string]: any;
}

/**
 * Authing 认证 Composable
 * 提供 Vue 组件中使用的认证功能
 */
export function useAuthingAuth(options: UseAuthingAuthOptions) {
  const { authingClient } = options;

  // 状态
  const userInfo = ref<null | UserInfo>(authingClient.getUserInfo());
  const loading = ref(false);
  const error = ref<null | string>(null);

  // 计算属性
  const isLoggedIn = computed(() => userInfo.value !== null);
  const userRole = computed(() => authingClient.getUserRole());

  /**
   * 跳转到登录页面
   */
  const login = () => {
    const loginUrl = authingClient.buildLoginUrl();
    window.location.href = loginUrl;
  };

  /**
   * 登出
   */
  const logout = () => {
    authingClient.clearAuth();
    const logoutUrl = authingClient.buildLogoutUrl();
    window.location.href = logoutUrl;
  };

  /**
   * 处理认证回调
   * @param code - 授权码
   */
  const handleCallback = async (code: string) => {
    loading.value = true;
    error.value = null;

    try {
      const user = await authingClient.handleAuthCallback(code);
      userInfo.value = user;
      return user;
    } catch (error_: any) {
      error.value = error_.message || '认证失败';
      throw error_;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 刷新令牌
   */
  const refreshToken = async () => {
    const tokens = authingClient.getStoredTokens();
    if (!tokens?.refresh_token) {
      throw new Error('没有可用的刷新令牌');
    }

    loading.value = true;
    error.value = null;

    try {
      await authingClient.refreshToken(tokens.refresh_token);
    } catch (error_: any) {
      error.value = error_.message || '刷新令牌失败';
      throw error_;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 检查登录状态
   */
  const checkLoginStatus = () => {
    userInfo.value = authingClient.getUserInfo();
    return userInfo.value;
  };

  /**
   * 获取访问令牌
   */
  const getAccessToken = (): null | string => {
    const tokens = authingClient.getStoredTokens();
    return tokens?.access_token || null;
  };

  /**
   * 获取 ID 令牌
   */
  const getIdToken = (): null | string => {
    const tokens = authingClient.getStoredTokens();
    return tokens?.id_token || null;
  };

  return {
    // 状态
    userInfo: userInfo as Ref<null | UserInfo>,
    loading: loading as Ref<boolean>,
    error: error as Ref<null | string>,
    isLoggedIn,
    userRole,

    // 方法
    login,
    logout,
    handleCallback,
    refreshToken,
    checkLoginStatus,
    getAccessToken,
    getIdToken,
  };
}
