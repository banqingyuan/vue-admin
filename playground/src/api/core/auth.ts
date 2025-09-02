import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 发送验证码接口参数 */
  export interface SendSMSCodeParams {
    phone_number: string;
  }

  /** 发送验证码接口返回值 */
  export interface SendSMSCodeResult {
    message: string;
  }

  /** 登录接口参数 */
  export interface LoginParams {
    code: string;
    phone_number: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    message: string;
    token: string;
    user: {
      admin_user_id: number;
      phone: string;
      role: string;
      status: string;
      username: string;
    };
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 发送短信验证码
 */
export async function sendSMSCodeApi(data: AuthApi.SendSMSCodeParams) {
  return baseRequestClient.post<AuthApi.SendSMSCodeResult>(
    '/admin/auth/send-code',
    data,
  );
}

/**
 * 验证码登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/admin/auth/login', data);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/admin/auth/logout', {
    withCredentials: true,
  });
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUserApi() {
  return requestClient.get('/admin/auth/me');
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/auth/codes');
}
