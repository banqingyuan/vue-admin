<script setup lang="ts">
import { ref } from 'vue';

import { useAuthingClient } from '#/composables/useAuthingClient';

const authingClient = useAuthingClient();
const isRedirecting = ref(false);

const handleLoginClick = () => {
  isRedirecting.value = true;
  const loginUrl = authingClient.buildLoginUrl();
  window.location.href = loginUrl;
};

const handleCopyWechat = () => {
  navigator.clipboard.writeText('aijpq11');
  console.warn('微信号已复制到剪贴板');
};
</script>

<template>
  <div class="login-buffer">
    <div class="buffer-content">
      <div class="logo-container">
        <img
          alt="AI扑克记牌器"
          class="buffer-logo"
          src="/assets/poker-logo.png"
        />
      </div>

      <h2 class="agency-title">代理合作</h2>
      <p class="welcome-text">欢迎使用【AI扑克记牌器】代理合作平台</p>

      <button
        class="login-button"
        :disabled="isRedirecting"
        @click="handleLoginClick"
      >
        {{ isRedirecting ? '正在跳转...' : '立即登录' }}
      </button>

      <div class="qr-code-section">
        <img
          alt="合作微信二维码"
          class="agency-qrcode"
          src="/assets/agency-qr.png"
        />
        <p class="qr-code-hint">合作微信二维码</p>
      </div>
    </div>

    <div class="buffer-bottom">
      <div class="wechat-info" @click="handleCopyWechat">
        <img alt="微信" class="wechat-icon" src="/assets/wechat.svg" />
        <span>代理合作微信号: aijpq11</span>
        <div class="copy-indicator">
          <img alt="复制" src="/assets/copy.png" />
        </div>
      </div>

      <footer class="buffer-footer">
        <div class="footer-info">
          <span>杭州一目可科技有限公司</span>
          <span class="divider">|</span>
          <a
            class="beian"
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
</template>

<style scoped>
@import '../../styles/login-buffer.css';
</style>
