import React, { useEffect } from 'react';

import { logoutAction } from '../services/authing';

import '../styles/LogoutCallback.css';

const LogoutCallback: React.FC = () => {
  useEffect(() => {
    // 记录退出登录操作
    console.warn('用户正在退出登录...');

    try {
      // 调用登出方法
      logoutAction();
      console.warn('成功调用 Authing 登出方法');
    } catch (error) {
      console.error('调用 Authing 登出方法失败:', error);
    }
    // 清除本地存储的登录信息
    localStorage.removeItem('userInfo');
    localStorage.removeItem('processedAuthCodes');
    localStorage.removeItem('authTokens');

    // 短暂延迟后跳转到登录缓冲页
    setTimeout(() => {
      window.location.href = '/login-buffer';
    }, 500);
  }, []);

  return (
    <div className="logout-callback">
      <div className="buffer-container">
        <div className="loading-spinner"></div>
        <p className="buffer-text">正在退出登录，请稍候...</p>
      </div>
    </div>
  );
};

export default LogoutCallback;
