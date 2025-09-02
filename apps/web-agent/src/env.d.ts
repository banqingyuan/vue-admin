// / <reference types="vite/client" />

/**
 * 环境变量类型定义
 */
interface ImportMetaEnv {
  /** Authing 应用 ID */
  readonly VITE_AUTHING_APP_ID: string;
  /** Authing 应用密钥 */
  readonly VITE_AUTHING_APP_SECRET: string;
  /** Authing 用户池域名 */
  readonly VITE_AUTHING_APP_HOST: string;
  /** 登录成功回调地址 */
  readonly VITE_AUTHING_REDIRECT_URI: string;
  /** 登出成功回调地址 */
  readonly VITE_AUTHING_LOGOUT_REDIRECT_URI: string;
  /** API 基础路径 */
  readonly VITE_API_BASE_URL: string;
  /** 应用标题 */
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
