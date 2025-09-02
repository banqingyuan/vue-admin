import React, { useEffect, useState } from 'react';

import { handleAuthCallback } from '../services/authing';

const Callback: React.FC = () => {
  const [status, setStatus] = useState<'error' | 'loading' | 'success'>(
    'loading',
  );
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // 从 URL 中获取授权码
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (!code) {
          console.error('未找到授权码');
          setStatus('error');
          setErrorMessage('未找到授权码，请重新登录');
          return;
        }

        console.warn('获取到授权码，开始处理回调...');

        // 处理认证回调
        const userInfo = await handleAuthCallback(code);

        if (!userInfo) {
          console.error('获取用户信息失败');
          setStatus('error');
          setErrorMessage('获取用户信息失败，请重新登录');
          return;
        }

        console.warn('认证成功，即将跳转到首页');
        setStatus('success');

        // 认证成功后延迟一小段时间再跳转，以便用户看到成功信息
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } catch (error) {
        console.error('认证回调处理失败:', error);
        setStatus('error');
        setErrorMessage('登录失败，请重试');
      }
    };

    processCallback();
  }, []);

  if (status === 'error') {
    return (
      <div className="callback-error">
        <h2>登录失败</h2>
        <p>{errorMessage || '未知错误'}</p>
        <button onClick={() => (window.location.href = '/')}>返回首页</button>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="callback-success">
        <h2>登录成功</h2>
        <p>即将跳转到首页...</p>
      </div>
    );
  }

  return (
    <div className="callback-loading">
      <h2>登录中...</h2>
      <p>正在处理认证信息，请稍候...</p>
    </div>
  );
};

export default Callback;
