<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthingClient } from '#/composables/useAuthingClient';

const router = useRouter();
const authingClient = useAuthingClient();
const userInfo = ref<any>(null);

onMounted(() => {
  userInfo.value = authingClient.getUserInfo();
  if (!userInfo.value) {
    router.push('/login-buffer');
  }
});

const handleLogout = () => {
  const logoutUrl = authingClient.buildLogoutUrl();
  window.location.href = logoutUrl;
};

const goBack = () => {
  router.push('/');
};
</script>

<template>
  <div v-if="userInfo" class="user-profile">
    <header class="profile-header">
      <button class="back-button" @click="goBack">返回</button>
      <h1>用户信息</h1>
    </header>

    <div class="profile-content">
      <div class="profile-item">
        <span class="label">用户 ID:</span>
        <span class="value">{{ userInfo.sub }}</span>
      </div>

      <div v-if="userInfo.phone_number" class="profile-item">
        <span class="label">手机号:</span>
        <span class="value">{{ userInfo.phone_number }}</span>
      </div>

      <div v-if="userInfo.email" class="profile-item">
        <span class="label">邮箱:</span>
        <span class="value">{{ userInfo.email }}</span>
      </div>

      <button class="logout-button" @click="handleLogout">退出登录</button>
    </div>
  </div>
</template>

<style scoped>
.user-profile {
  min-height: 100vh;
  padding: 20px;
  background-color: var(--basic-0);
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.back-button {
  padding: 8px 16px;
  margin-right: 20px;
  color: var(--basic-10);
  background-color: var(--basic-1);
  border: none;
  border-radius: 8px;
}

.profile-content {
  padding: 20px;
  background-color: var(--basic-1);
  border-radius: 12px;
}

.profile-item {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid var(--basic-3);
}

.label {
  color: var(--basic-5);
}

.value {
  color: var(--basic-10);
}

.logout-button {
  width: 100%;
  padding: 15px;
  margin-top: 30px;
  color: white;
  background-color: var(--error-color);
  border: none;
  border-radius: 12px;
}
</style>
