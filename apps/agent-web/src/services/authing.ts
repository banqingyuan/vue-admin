import process from 'node:process';

import { AuthenticationClient } from 'authing-js-sdk';

// 初始化 Authing 客户端
const authenticationClient = new AuthenticationClient({
  appId: process.env.REACT_APP_AUTHING_APP_ID || '', // 应用 ID
  secret: process.env.REACT_APP_AUTHING_APP_SECRET || '', // 应用 Secret
  appHost: process.env.REACT_APP_AUTHING_APP_HOST || '', // 应用对应的用户池域名
  redirectUri: process.env.REACT_APP_AUTHING_REDIRECT_URI || '', // 认证完成后的重定向目标 URL
});

// 检查用户是否已登录
export const checkLoginStatus = () => {
  // 从本地存储中获取用户信息
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

// 获取登录链接
export const getLoginUrl = () => {
  return authenticationClient.buildAuthorizeUrl({
    scope: 'openid profile offline_access extended_fields phone',
  });
};

export const getLogoutUrl = () => {
  return `${authenticationClient.buildLogoutUrl({
    redirectUri: process.env.REACT_APP_AUTHING_LOGOUT_REDIRECT_URI || '', // 登出后的重定向目标 URL
  })}&app_id=${process.env.REACT_APP_AUTHING_APP_ID}`;
};

// 处理认证回调
export const handleAuthCallback = async (code: string) => {
  try {
    console.warn('开始处理授权码:', `${code.slice(0, 5)}...`);

    // 检查是否已经处理过这个授权码
    const processedCodes = localStorage.getItem('processedAuthCodes');
    const processedCodesArray = processedCodes
      ? JSON.parse(processedCodes)
      : [];

    if (processedCodesArray.includes(code)) {
      console.warn('此授权码已被处理过，可能导致错误');
    }

    // 尝试获取访问令牌
    console.warn('正在获取访问令牌...');
    const tokenSet = await authenticationClient.getAccessTokenByCode(code);

    if (!tokenSet || !tokenSet.access_token) {
      console.error('获取访问令牌失败:', tokenSet);
      throw new Error('获取访问令牌失败');
    }

    console.warn('成功获取访问令牌，正在获取用户信息...');

    // 在控制台打印JWT token
    console.warn('JWT访问令牌:', tokenSet.access_token);
    if (tokenSet.id_token) {
      console.warn('JWT ID令牌:', tokenSet.id_token);
      try {
        // 尝试解析id_token以获取角色信息
        // 注意：这是一个简化的解析，生产环境应使用库并验证签名
        const decodedIdToken = JSON.parse(
          atob(tokenSet.id_token.split('.')[1]),
        );
        if (decodedIdToken && decodedIdToken.extended_fields.role) {
          localStorage.setItem(
            'userRole',
            JSON.stringify(decodedIdToken.extended_fields.role),
          );
          console.warn('用户角色已存储:', decodedIdToken.extended_fields.role);
        } else {
          console.warn('在id_token中未找到角色信息 (role 字段)');
        }
      } catch (error) {
        console.error('解析id_token失败:', error);
      }
    }
    if (tokenSet.refresh_token) {
      console.warn('刷新令牌:', tokenSet.refresh_token);
    }

    // 将token信息存储到localStorage中，以便在首页使用
    const tokensToStore = {
      access_token: tokenSet.access_token,
      id_token: tokenSet.id_token,
      refresh_token: tokenSet.refresh_token,
    };
    localStorage.setItem('authTokens', JSON.stringify(tokensToStore));

    // 使用访问令牌获取用户信息
    const userInfo = await authenticationClient.getUserInfoByAccessToken(
      tokenSet.access_token,
    );

    if (!userInfo || !userInfo.sub) {
      console.error('获取用户信息失败:', userInfo);
      throw new Error('获取用户信息失败');
    }

    console.warn('成功获取用户信息:', userInfo.sub);

    // 将用户信息存储在本地
    localStorage.setItem('userInfo', JSON.stringify(userInfo));

    // 记录已处理的授权码
    processedCodesArray.push(code);
    localStorage.setItem(
      'processedAuthCodes',
      JSON.stringify(processedCodesArray),
    );

    return userInfo;
  } catch (error: any) {
    console.error('认证回调处理失败:', error);

    // 提供更详细的错误信息
    if (error.response) {
      console.error('服务器响应:', error.response.status, error.response.data);
    }

    // 如果是 400 错误，可能是授权码已使用
    if (error.response && error.response.status === 400) {
      // 尝试从本地存储获取用户信息
      const cachedUserInfo = localStorage.getItem('userInfo');
      if (cachedUserInfo) {
        console.warn('授权码可能已被使用，但找到了缓存的用户信息');
        return JSON.parse(cachedUserInfo);
      }
    }

    throw error;
  }
};

// 获取用户角色
export const getUserRole = (): null | string | string[] => {
  const roleData = localStorage.getItem('userRole');
  return roleData ? JSON.parse(roleData) : null;
};

// 退出登录
export const logoutUrl = () => {
  // 跳转到 Authing 的登出端点
  window.location.href = authenticationClient.buildLogoutUrl();
};

export const logoutAction = () => {
  // 跳转到 Authing 的登出端点
  authenticationClient.logout();
};
