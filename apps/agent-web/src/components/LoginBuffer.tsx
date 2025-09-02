import React, { useState } from 'react';

import { getLoginUrl } from '../services/authing';

import '../styles/LoginBuffer.css';

const LoginBuffer: React.FC = () => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  // 处理登录按钮点击
  const handleLoginClick = () => {
    setIsRedirecting(true);
    const loginUrl = getLoginUrl();
    window.location.href = loginUrl;
  };

  // 处理复制微信号
  const handleCopyWechat = () => {
    navigator.clipboard.writeText('aijpq11');
    // 使用非阻塞通知或控制台提示替代 alert
    console.warn('微信号已复制到剪贴板');
  };

  return (
    <div className="login-buffer">
      <div className="buffer-content">
        <div className="logo-container">
          <img
            alt="AI扑克记牌器"
            className="buffer-logo"
            src="/assets/poker-logo.png"
          />
        </div>

        <h2 className="agency-title">代理合作</h2>
        <p className="welcome-text">欢迎使用【AI扑克记牌器】代理合作平台</p>

        <button
          className="login-button"
          disabled={isRedirecting}
          onClick={handleLoginClick}
        >
          {isRedirecting ? '正在跳转...' : '立即登录'}
        </button>

        <div className="qr-code-section">
          <img
            alt="合作微信二维码"
            className="agency-qrcode"
            src="/assets/agency-qr.png"
          />
          <p className="qr-code-hint">合作微信二维码</p>
        </div>
      </div>

      <div className="buffer-bottom">
        <div className="wechat-info" onClick={handleCopyWechat}>
          <img alt="微信" className="wechat-icon" src="/assets/wechat.svg" />
          <span>代理合作微信号: aijpq11</span>
          <div className="copy-indicator">
            <img alt="复制" src="/assets/copy.png" />
          </div>
        </div>

        <footer className="buffer-footer">
          <div className="footer-info">
            <span>杭州一目可科技有限公司</span>
            <span className="divider">|</span>
            <a
              className="beian"
              href="https://beian.miit.gov.cn/"
              rel="noopener noreferrer"
              target="_blank"
            >
              浙ICP备2025148163号
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LoginBuffer;
