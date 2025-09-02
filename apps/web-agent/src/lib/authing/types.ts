/**
 * Authing 配置接口
 */
export interface AuthingConfig {
  /**
   * 应用 ID
   */
  appId: string;

  /**
   * 应用域名
   */
  appHost: string;

  /**
   * 应用密钥（可选，某些场景需要）
   */
  appSecret?: string;

  /**
   * 认证完成后的重定向 URL
   */
  redirectUri: string;

  /**
   * 登出后的重定向 URL
   */
  logoutRedirectUri?: string;
}

/**
 * 认证令牌接口
 */
export interface AuthTokens {
  /**
   * 访问令牌
   */
  access_token: string;

  /**
   * ID 令牌
   */
  id_token: string;

  /**
   * 刷新令牌
   */
  refresh_token: string;
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  /**
   * 用户唯一标识
   */
  sub: string;

  /**
   * 手机号
   */
  phone_number?: string;

  /**
   * 邮箱
   */
  email?: string;

  /**
   * 用户名
   */
  username?: string;

  /**
   * 昵称
   */
  nickname?: string;

  /**
   * 头像
   */
  picture?: string;

  /**
   * 其他扩展字段
   */
  [key: string]: any;
}
