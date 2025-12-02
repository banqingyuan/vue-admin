<template>
  <div class="result-page">
    <!-- Header - Fixed -->
      <AppHeader />

    <!-- Main Content -->
    <div class="result-content">
      <!-- Error Icon -->
      <div class="icon-container">
        <img src="/error_circle.png" alt="失败" class="status-icon" />
      </div>

      <!-- Text Content -->
      <div class="text-content">
        <h2 class="result-title error">申请未通过</h2>
        <p class="result-subtitle">可联系下方专员，了解具体情况</p>
      </div>

      <!-- Contact Button -->
      <BaseButton
        type="secondary"
        size="medium"
        class="contact-btn"
        @click="contactService"
      >
        <template #icon-left>
          <img src="/wechat.png" alt="微信" class="wechat-icon" />
        </template>
        联系客服专员
      </BaseButton>

      <!-- QR Code -->
      <div class="qr-container">
        <img src="/qr.png" alt="二维码" class="qr-code" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from '#/components/ui/AppHeader.vue';
import BaseButton from '#/components/ui/BaseButton.vue';
import { getStatusApi } from '#/api/promoter';

const router = useRouter();

// 每次进入页面都检查状态
onMounted(async () => {
  try {
    const statusInfo = await getStatusApi();
    const status = statusInfo.status;
    
    // 如果状态变为 active，重定向到代理主页
    if (status === 'active' || status === 'pass') {
      router.replace('/agent/home');
      return;
    }
    
    // 如果状态变为 pending，重定向到成功页面
    if (status === 'pending') {
      router.replace('/result/success');
      return;
    }
    
    // reject 状态：留在当前页面
    // not_submitted 状态：重定向回申请页面
    if (status === 'not_submitted') {
      router.replace('/apply/personal');
      return;
    }
  } catch (error) {
    console.error('获取状态失败:', error);
  }
});

function contactService() {
  window.location.href = 'https://work.weixin.qq.com/kfid/kfc2f7022befdbcb9e2';
}
</script>

<style scoped>
.result-page {
  background: var(--basic-0);
  min-height: 100vh;
  width: 100%;
  max-width: 375px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding-top: 81px; /* AppHeader高度56px + margin 15px + 10px */
}

.result-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 24px;
}

.icon-container {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.text-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
  width: 100%;
}

.result-title {
  font-family: var(--font-family-primary);
  font-size: 24px;
  font-weight: var(--font-weight-regular);
  line-height: 1;
  margin: 0;
}

.result-title.error {
  color: var(--danger-6);
}

.result-subtitle {
  font-family: var(--font-family-primary);
  font-size: 18px;
  font-weight: var(--font-weight-regular);
  line-height: 1;
  color: var(--basic-6);
  margin: 0;
}

.contact-btn {
  padding: 7px 13px;
  border-radius: 10px;
}

.wechat-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
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
</style>
