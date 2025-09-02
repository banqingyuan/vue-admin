import type { AuthingConfig, AuthTokens, UserInfo } from './types';

// eslint-disable-next-line n/no-extraneous-import -- 由宿主应用或根依赖提供 authing-js-sdk，此处作为外部依赖使用
import { AuthenticationClient } from 'authing-js-sdk';

/**
 * Authing 认证客户端封装
 * 提供统一的认证接口
 */
export class AuthingClient {
  private static readonly STORAGE_KEYS = {
    AUTH_TOKENS: 'authTokens',
    PROCESSED_CODES: 'processedAuthCodes',
    USER_INFO: 'userInfo',
    USER_ROLE: 'userRole',
  };
  private client: AuthenticationClient;
  private config: AuthingConfig;

  constructor(config: AuthingConfig) {
    this.config = config;
    this.client = new AuthenticationClient({
      appId: config.appId,
      appHost: config.appHost,
      secret: config.appSecret,
      redirectUri: config.redirectUri,
    });
  }

  /**
   * 构建登录 URL
   * @param scope - 授权范围
   * @returns 登录 URL
   */
  buildLoginUrl(
    scope: string = 'openid profile offline_access extended_fields phone',
  ): string {
    return this.client.buildAuthorizeUrl({ scope });
  }

  /**
   * 构建登出 URL
   * @returns 登出 URL
   */
  buildLogoutUrl(): string {
    const logoutUrl = this.client.buildLogoutUrl({
      redirectUri:
        this.config.logoutRedirectUri || `${window.location.origin}/`,
    });
    return `${logoutUrl}&app_id=${this.config.appId}`;
  }

  /**
   * 清除所有认证数据
   */
  clearAuth(): void {
    localStorage.removeItem(AuthingClient.STORAGE_KEYS.AUTH_TOKENS);
    localStorage.removeItem(AuthingClient.STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(AuthingClient.STORAGE_KEYS.USER_ROLE);
    localStorage.removeItem(AuthingClient.STORAGE_KEYS.PROCESSED_CODES);
  }

  /**
   * 获取存储的令牌
   * @returns 令牌集合或 null
   */
  getStoredTokens(): AuthTokens | null {
    const tokensString = localStorage.getItem(
      AuthingClient.STORAGE_KEYS.AUTH_TOKENS,
    );
    if (!tokensString) return null;

    try {
      return JSON.parse(tokensString);
    } catch {
      return null;
    }
  }

  /**
   * 获取存储的用户信息
   * @returns 用户信息或 null
   */
  getUserInfo(): null | UserInfo {
    const userInfoString = localStorage.getItem(
      AuthingClient.STORAGE_KEYS.USER_INFO,
    );
    if (!userInfoString) return null;

    try {
      return JSON.parse(userInfoString);
    } catch {
      return null;
    }
  }

  /**
   * 获取用户角色
   * @returns 角色或 null
   */
  getUserRole(): null | string | string[] {
    const roleString = localStorage.getItem(
      AuthingClient.STORAGE_KEYS.USER_ROLE,
    );
    if (!roleString) return null;

    try {
      return JSON.parse(roleString);
    } catch {
      return null;
    }
  }

  /**
   * 处理认证回调
   * @param code - 授权码
   * @returns 用户信息
   */
  async handleAuthCallback(code: string): Promise<UserInfo> {
    try {
      console.warn('开始处理授权码:', `${code.slice(0, 5)}...`);

      // 检查是否已经处理过这个授权码
      const processedCodes = this.getProcessedCodes();
      if (processedCodes.includes(code)) {
        console.warn('此授权码已被处理过，尝试从缓存获取用户信息');
        const cachedUserInfo = this.getUserInfo();
        if (cachedUserInfo) {
          return cachedUserInfo;
        }
      }

      // 获取访问令牌
      console.warn('正在获取访问令牌...');
      const tokenSet = await this.client.getAccessTokenByCode(code);

      if (!tokenSet || !tokenSet.access_token) {
        console.error('获取访问令牌失败:', tokenSet);
        throw new Error('获取访问令牌失败');
      }

      console.warn('成功获取访问令牌，正在获取用户信息...');

      // 存储 tokens
      this.storeTokens({
        access_token: tokenSet.access_token,
        id_token: tokenSet.id_token || '',
        refresh_token: tokenSet.refresh_token || '',
      });

      // 解析 ID Token 获取角色信息
      if (tokenSet.id_token) {
        try {
          const decodedIdToken = JSON.parse(
            atob(tokenSet.id_token.split('.')[1]),
          );
          if (decodedIdToken?.extended_fields?.role) {
            this.storeUserRole(decodedIdToken.extended_fields.role);
            console.warn(
              '用户角色已存储:',
              decodedIdToken.extended_fields.role,
            );
          }
        } catch (error) {
          console.error('解析 id_token 失败:', error);
        }
      }

      // 获取用户信息
      const userInfo = await this.client.getUserInfoByAccessToken(
        tokenSet.access_token,
      );

      if (!userInfo || !userInfo.sub) {
        console.error('获取用户信息失败:', userInfo);
        throw new Error('获取用户信息失败');
      }

      console.warn('成功获取用户信息:', userInfo.sub);

      // 存储用户信息
      this.storeUserInfo(userInfo);

      // 记录已处理的授权码
      this.markCodeAsProcessed(code);

      return userInfo;
    } catch (error: any) {
      console.error('认证回调处理失败:', error);

      // 如果是 400 错误，可能是授权码已使用，尝试从缓存获取
      if (error.response?.status === 400) {
        const cachedUserInfo = this.getUserInfo();
        if (cachedUserInfo) {
          console.warn('授权码可能已被使用，但找到了缓存的用户信息');
          return cachedUserInfo;
        }
      }

      throw error;
    }
  }

  /**
   * 检查用户是否已登录
   * @returns 是否已登录
   */
  isLoggedIn(): boolean {
    return this.getUserInfo() !== null;
  }

  /**
   * 刷新访问令牌
   * @param refreshToken - 刷新令牌
   * @returns 新的令牌集
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const tokenSet =
        await this.client.getNewAccessTokenByRefreshToken(refreshToken);

      if (!tokenSet || !tokenSet.access_token) {
        throw new Error('刷新令牌失败');
      }

      const newTokens: AuthTokens = {
        access_token: tokenSet.access_token,
        id_token: tokenSet.id_token || '',
        refresh_token: tokenSet.refresh_token || refreshToken,
      };

      this.storeTokens(newTokens);
      return newTokens;
    } catch (error) {
      console.error('刷新令牌失败:', error);
      throw error;
    }
  }

  /**
   * 获取已处理的授权码列表
   */
  private getProcessedCodes(): string[] {
    const codesString = localStorage.getItem(
      AuthingClient.STORAGE_KEYS.PROCESSED_CODES,
    );
    if (!codesString) return [];

    try {
      return JSON.parse(codesString);
    } catch {
      return [];
    }
  }

  /**
   * 标记授权码为已处理
   */
  private markCodeAsProcessed(code: string): void {
    const codes = this.getProcessedCodes();
    codes.push(code);
    localStorage.setItem(
      AuthingClient.STORAGE_KEYS.PROCESSED_CODES,
      JSON.stringify(codes),
    );
  }

  /**
   * 存储令牌
   */
  private storeTokens(tokens: AuthTokens): void {
    localStorage.setItem(
      AuthingClient.STORAGE_KEYS.AUTH_TOKENS,
      JSON.stringify(tokens),
    );
  }

  /**
   * 存储用户信息
   */
  private storeUserInfo(userInfo: UserInfo): void {
    localStorage.setItem(
      AuthingClient.STORAGE_KEYS.USER_INFO,
      JSON.stringify(userInfo),
    );
  }

  /**
   * 存储用户角色
   */
  private storeUserRole(role: string | string[]): void {
    localStorage.setItem(
      AuthingClient.STORAGE_KEYS.USER_ROLE,
      JSON.stringify(role),
    );
  }
}
