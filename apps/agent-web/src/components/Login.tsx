import React, { useEffect } from 'react';

import { getLoginUrl } from '../services/authing';

const Login: React.FC = () => {
  useEffect(() => {
    // 自动重定向到 Authing 登录页
    const loginUrl = getLoginUrl();
    window.location.href = loginUrl;
  }, []);

  return (
    <div className="login-page">
      <h2>登录</h2>
      <p>正在跳转到登录页面，请稍候...</p>
      <button
        className="login-button"
        onClick={() => (window.location.href = getLoginUrl())}
      >
        立即登录
      </button>
    </div>
  );
};

export default Login;
