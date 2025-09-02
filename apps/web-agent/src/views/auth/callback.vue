<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { useAuthingClient } from '#/composables/useAuthingClient';

type Status = 'error' | 'loading' | 'success';

const authingClient = useAuthingClient();
const status = ref<Status>('loading');
const errorMessage = ref<null | string>(null);

onMounted(async () => {
  try {
    // 从 URL 中获取授权码
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (!code) {
      console.error('未找到授权码');
      status.value = 'error';
      errorMessage.value = '未找到授权码，请重新登录';
      return;
    }

    console.warn('获取到授权码，开始处理回调...');

    // 处理认证回调
    const userInfo = await authingClient.handleAuthCallback(code);

    if (!userInfo) {
      console.error('获取用户信息失败');
      status.value = 'error';
      errorMessage.value = '获取用户信息失败，请重新登录';
      return;
    }

    console.warn('认证成功，即将跳转到首页');
    status.value = 'success';

    // 认证成功后延迟一小段时间再跳转
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  } catch (error) {
    console.error('认证回调处理失败:', error);
    status.value = 'error';
    errorMessage.value = '登录失败，请重试';
  }
});

const goHome = () => {
  window.location.href = '/';
};
</script>

<template>
  <div v-if="status === 'error'" class="callback-error">
    <h2>登录失败</h2>
    <p>{{ errorMessage || '未知错误' }}</p>
    <button @click="goHome">返回首页</button>
  </div>

  <div v-else-if="status === 'success'" class="callback-success">
    <h2>登录成功</h2>
    <p>即将跳转到首页...</p>
  </div>

  <div v-else class="callback-loading">
    <h2>登录中...</h2>
    <p>正在处理认证信息，请稍候...</p>
  </div>
</template>

<style scoped>
.callback-error,
.callback-success,
.callback-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

button {
  padding: 12px 24px;
  font-size: 16px;
  color: white;
  cursor: pointer;
  background-color: #1890ff;
  border: none;
  border-radius: 4px;
}

button:hover {
  background-color: #40a9ff;
}
</style>
