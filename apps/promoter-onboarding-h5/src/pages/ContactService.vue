<template>
  <div class="contact-service-page">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="nav-left" @click="router.back()">
        <img src="/back-icon.svg" alt="返回" class="nav-icon" />
      </div>
      <div class="nav-title">联系客服</div>
      <div class="nav-right"></div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 标题和副标题 -->
      <div class="text-content">
        <h2 class="main-title">联系代理合作客服</h2>
        <p class="subtitle">长按识别/保存二维码后，到微信添加好友</p>
      </div>

      <!-- 二维码 -->
      <div class="qr-container">
        <img src="/qr.png" alt="客服二维码" class="qr-code" />
      </div>

      <!-- 联系客服按钮 -->
      <button class="contact-btn" @click="handleContactService">
        <img src="/wechat.png" alt="微信" class="wechat-icon" />
        <span class="btn-text">联系客服专员</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function handleContactService() {
  // 跳转到微信客服
  window.location.href = 'https://work.weixin.qq.com/kfid/kfc2f7022befdbcb9e2';
}
</script>

<style scoped>
.contact-service-page {
  min-height: 100vh;
  background: var(--basic-0);
  display: flex;
  flex-direction: column;
}

/* 导航栏 */
.nav-bar {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--basic-0);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-left,
.nav-right {
  width: 110px;
  display: flex;
  align-items: center;
}

.nav-left {
  cursor: pointer;
  padding: 10px;
  margin-left: -10px;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-family: var(--font-family-primary);
  font-size: 17px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.nav-icon {
  width: 24px;
  height: 24px;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  gap: 24px;
}

.text-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
  width: 100%;
}

.main-title {
  font-family: var(--font-family-primary);
  font-size: 24px;
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  color: var(--primary-4);
  margin: 0;
}

.subtitle {
  font-family: var(--font-family-primary);
  font-size: 18px;
  font-weight: var(--font-weight-regular);
  line-height: 1;
  color: var(--basic-6);
  margin: 0;
}

.qr-container {
  width: 160px;
  height: 160px;
  background: white;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-code {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.contact-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background: var(--basic-1);
  border: 1px solid var(--basic-3);
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.contact-btn:active {
  opacity: 0.8;
}

.wechat-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.btn-text {
  font-family: var(--font-family-primary);
  font-size: 16px;
  font-weight: var(--font-weight-regular);
  line-height: 24px;
  color: var(--basic-10);
}
</style>

