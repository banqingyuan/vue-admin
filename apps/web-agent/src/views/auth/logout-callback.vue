<script setup lang="ts">
import { onMounted } from 'vue';

import { useAuthingClient } from '#/composables/useAuthingClient';

const authingClient = useAuthingClient();

onMounted(() => {
  // 记录退出登录操作
  console.warn('用户正在退出登录...');

  // 清除认证信息
  authingClient.clearAuth();
  console.warn('已清除本地认证信息');

  // 短暂延迟后跳转到登录缓冲页
  setTimeout(() => {
    window.location.href = '/login-buffer';
  }, 500);
});
</script>

<template>
  <div class="logout-callback">
    <div class="buffer-container">
      <div class="loading-spinner"></div>
      <p class="buffer-text">正在退出登录，请稍候...</p>
    </div>
  </div>
</template>

<style scoped>
@import '../../styles/logout-callback.css';
</style>
