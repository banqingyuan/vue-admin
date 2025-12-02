<template>
  <div class="account-status">

    <!-- 信息区 -->
    <div class="info">
      <div class="title-row">
        <p class="title">{{ displayName }}</p>
        <div class="badge-group">
          <div class="level-badge">{{ levelText }}</div>
          <img :src="typeIcon" class="type-icon" alt="类型" />
        </div>
      </div>
      <div class="details">
        <p>代理 ID：{{ formatPromoterID }}</p>
        <p>手机号：{{ formatPhone }}</p>
      </div>
    </div>


    <!-- 退出登录弹窗 -->
    <LogoutModal v-model:visible="isLogoutModalVisible" @logout="handleLogout" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '#/store/auth';
import { useAgentStore } from '#/store/agent';
import LogoutModal from '../LogoutModal.vue';

const router = useRouter();
const auth = useAuthStore();
const agent = useAgentStore();
const isLogoutModalVisible = ref(false);

// 格式化代理ID
const formatPromoterID = computed(() => {
  const id = agent.promoterInfo?.promoter_id || 0;
  return id.toString().padStart(7, '0');
});

// 格式化手机号（带空格）
const formatPhone = computed(() => {
  const phone = auth.user?.phone || '';
  if (phone.length === 11) {
    return `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7)}`;
  }
  return phone;
});

// 显示名称（姓名或企业名称）
const displayName = computed(() => {
  return agent.promoterInfo?.name || 'AI扑克记牌器';
});

// 代理等级文本
const levelText = computed(() => {
  const level = agent.promoterInfo?.level;
  return level === 1 ? '高级代理' : '代理';
});

// 代理类型图标
const typeIcon = computed(() => {
  const type = agent.promoterInfo?.type;
  return type === 'company' ? '/building.svg' : '/personal.svg';
});

function showLogoutModal() {
  isLogoutModalVisible.value = true;
}

function handleLogout() {
  auth.logout();
  agent.clearData();
  router.replace('/login');
}
</script>

<style scoped>
.account-status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--basic-0);
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--basic-2);
  border: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  overflow: hidden;
}

.avatar svg {
  width: 100%;
  height: 100%;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap; /* 允许换行 */
}

.title {
  font-family: 'DingTalk JinBuTi', sans-serif;
  font-size: 22px;
  font-weight: 400;
  line-height: 1.2;
  color: var(--basic-10);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.badge-group {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.level-badge {
  background: linear-gradient(135deg, #ffe395, #fff2cc);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'DingTalk JinBuTi', sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 1;
  color: #000;
  flex-shrink: 0;
}

.type-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.details {
  font-family: var(--font-family-primary);
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
  color: var(--basic-5);
  white-space: nowrap;
}

.details p {
  margin: 0;
  line-height: 1.2;
}

.details p + p {
  margin-top: 2px;
}

.settings-btn {
  padding: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--basic-10);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.settings-btn img {
  width: 24px;
  height: 24px;
}

.settings-btn:active {
  opacity: 0.8;
}

.settings-wrapper {
  position: relative;
}
</style>

