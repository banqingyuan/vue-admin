/**
 * Authing 客户端 Composable
 */
import { AuthingClient } from '#/lib/authing';

// 创建 Authing 客户端单例
let authingClient: AuthingClient | null = null;

export function useAuthingClient() {
  if (!authingClient) {
    authingClient = new AuthingClient({
      appId: import.meta.env.VITE_AUTHING_APP_ID || '',
      appHost: import.meta.env.VITE_AUTHING_APP_HOST || '',
      appSecret: import.meta.env.VITE_AUTHING_APP_SECRET || '',
      redirectUri: import.meta.env.VITE_AUTHING_REDIRECT_URI || '',
      logoutRedirectUri: import.meta.env.VITE_AUTHING_LOGOUT_REDIRECT_URI || '',
    });
  }

  return authingClient;
}
