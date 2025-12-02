<template>
  <div class="app-header">
    <div class="logo-container">
      <div class="app-logo">
        <img
          alt="AI扑克记牌器"
          class="logo-image"
          src="/poker-logo.png"
        />
        <span class="title">AI扑克记牌器</span>
        <img
          alt="代理合作"
          class="agency-tag-img"
          src="/agency-tag.png"
        />
      </div>
    </div>
    <div class="header-right">
      <div class="headphone-icon" @click="handleContactService">
        <img alt="客服" src="/headphone.png" />
      </div>
      <div class="profile-icon" @click="handleShowProfile">
        <img alt="用户头像" src="/profile-placeholder.png" />
      </div>
    </div>
    
    <!-- 退出登录弹窗 -->
    <LogoutModal v-model:visible="isLogoutModalVisible" @logout="handleLogout" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '#/store/auth';
import { useAgentStore } from '#/store/agent';
import LogoutModal from '../LogoutModal.vue';

const router = useRouter();
const auth = useAuthStore();
const agent = useAgentStore();
const isLogoutModalVisible = ref(false);

function handleContactService() {
  router.push('/contact-service');
}

function handleShowProfile() {
  isLogoutModalVisible.value = true;
}

function handleLogout() {
  auth.logout();
  agent.clearData();
  router.replace('/login');
}
</script>

<style scoped>
/* 头部样式 - 精准复现web-agent，吸顶模式 */
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 20px;
  margin: 15px 15px 10px;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid #9999995b;
  border-radius: 20px;
}

.logo-container {
  display: flex;
  align-items: center;
}

.app-logo {
  display: flex;
  align-items: center;
}

.logo-image {
  height: 32px;
  margin-right: 10px;
}

.title {
  margin-right: 10px;
  font-size: 16px;
  font-weight: bold;
  color: var(--primary-6);
}

.agency-tag-img {
  height: 16px;
}

.header-right {
  display: flex;
  gap: 15px;
  align-items: center;
}

.headphone-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.headphone-icon img {
  width: 100%;
  height: 100%;
}

.profile-icon {
  width: 36px;
  height: 36px;
  overflow: hidden;
  cursor: pointer;
  background-color: var(--primary-11);
  border-radius: 50%;
}

.profile-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
