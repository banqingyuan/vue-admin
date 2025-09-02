<script setup lang="ts">
import { onMounted } from 'vue';

import { useAuthingClient } from '#/composables/useAuthingClient';

const authingClient = useAuthingClient();

onMounted(() => {
  // 自动重定向到 Authing 登录页
  const loginUrl = authingClient.buildLoginUrl();
  window.location.href = loginUrl;
});

const handleLogin = () => {
  const loginUrl = authingClient.buildLoginUrl();
  window.location.href = loginUrl;
};
</script>

<template>
  <div class="login-page">
    <h2>登录</h2>
    <p>正在跳转到登录页面，请稍候...</p>
    <button class="login-button" @click="handleLogin">立即登录</button>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

.login-button {
  padding: 12px 24px;
  font-size: 16px;
  color: white;
  cursor: pointer;
  background-color: #1890ff;
  border: none;
  border-radius: 4px;
}

.login-button:hover {
  background-color: #40a9ff;
}
</style>
