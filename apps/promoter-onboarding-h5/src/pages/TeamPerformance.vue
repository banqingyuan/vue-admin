<template>
  <div class="team-performance-page">
    <!-- Header -->
    <div class="header">
      <div class="header-left" @click="goBack">
        <img src="/back-icon.svg" alt="返回" class="back-icon" />
      </div>
      <div class="header-title">下级代理</div>
      <div class="header-right" @click="handleInviteAgent">
        <img src="/user-add-icon.svg" alt="添加" class="user-add-icon" />
      </div>
    </div>

    <!-- Info Banner -->
    <div class="info-banner">
      <p class="info-text">
        已有 {{ children.length }} 位下级代理，将为你带来收益
      </p>
      <img
        src="/info-circle.svg"
        alt="信息"
        class="info-icon"
        @click="openCommissionModal"
      />
    </div>

    <!-- Children List -->
    <div class="agent-list-wrapper">
      <ChildAgentList />
    </div>
    <!-- 下级分成说明弹窗 -->
    <CommissionInfoModal
      v-model:visible="showCommissionModal"
      :level="agent.promoterInfo?.level || 1"
      :android-rate="childRates.android"
      :ios-rate="childRates.ios"
      title="下级分成计算方式"
      :show-level-info="false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '#/store/auth';
import { useAgentStore } from '#/store/agent';
import { useToast } from '#/composables/useToast';
import CommissionInfoModal from '#/components/common/CommissionInfoModal.vue';
import ChildAgentList from '#/components/agent/ChildAgentList.vue';

const router = useRouter();
const auth = useAuthStore();
const agent = useAgentStore();
const toast = useToast();

const loading = ref(false);
const showCommissionModal = ref(false);

// 下级代理列表（用于顶部数量展示）
const children = computed(() => agent.childrenStats || []);

// 下级分成比例（父级从下级获得的分成）
const childRates = computed(() => {
  const rates = agent.commissionRates?.level1_from_level2;
  return {
    android: rates?.android ?? 10,
    ios: rates?.ios ?? 10,
  };
});

// 邀请链接
const shareLink = computed(() => {
  const id = agent.promoterInfo?.promoter_id;
  return id ? `https://promoter.aijpq.com?senior_id=${id}` : '';
});

const goBack = () => {
  router.back();
};

const openCommissionModal = () => {
  showCommissionModal.value = true;
};

// 复制到剪贴板
async function copyToClipboard(text: string) {
  if (!text) throw new Error('invalid text');
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

// 邀请代理（只复制，不自动分享）
async function handleInviteAgent() {
  if (!shareLink.value) {
    toast.error('尚未获取到邀请链接，请稍后重试');
    return;
  }

  try {
    await copyToClipboard(shareLink.value);
    toast.success('专属邀请链接，已复制成功！发给你的下级代理');
  } catch (error) {
    console.error('复制失败', error);
    toast.error('复制失败，请稍后再试');
  }
}

const ensureDataLoaded = async () => {
  try {
    loading.value = true;

    // 确保登录
    if (!auth.token) {
      router.replace('/login');
      return;
    }

    // 加载promoter信息（如果还没加载）
    if (!agent.promoterInfo) {
      await agent.loadPromoterInfo();
    }

    // 仅一级代理可访问
    if (agent.promoterInfo?.level !== 1) {
      router.replace('/agent/home');
      return;
    }

    // 仅active状态可访问
    if (agent.promoterInfo?.approval_status !== 'active') {
      router.replace('/apply/personal');
      return;
    }

    // 加载下级代理统计 & 下级分成比例
    await Promise.all([
      agent.loadChildrenStats(),
      agent.loadCommissionRates(),
    ]);
  } catch (error) {
    console.error('加载下级代理业绩失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  ensureDataLoaded();
});
</script>

<style scoped>
.team-performance-page {
  min-height: 100vh;
  background-color: #141414;
  color: #ffffff;
}

/* Header - 与邀请记录页面保持一致 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 46px;
  padding: 0 10px;
  background-color: #141414;
}

.header-left,
.header-right {
  width: 110px;
  display: flex;
  align-items: center;
}

.header-left {
  justify-content: flex-start;
  cursor: pointer;
  padding: 10px;
}

.header-right {
  justify-content: flex-end;
  padding: 10px 24px;
  cursor: pointer;
}

.header-right:hover {
  opacity: 0.8;
}

.back-icon,
.user-add-icon {
  width: 24px;
  height: 24px;
}

.header-title {
  flex: 1;
  text-align: center;
  font-family: 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 500;
  line-height: normal;
  opacity: 0.9;
}

/* Info Banner */
.info-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px;
}

.info-text {
  font-family: 'PingFang SC', sans-serif;
  font-size: 15px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
  text-align: center;
}

.info-icon {
  width: 16px;
  height: 16px;
}

/* List */
.agent-list {
  padding: 0 10px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.agent-card {
  background-color: #1f1f1f;
  border-radius: 8px;
  padding: 10px 14px;
}

.agent-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.agent-name {
  font-family: 'PingFang SC', sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 22px;
  color: #ffffff;
  margin: 0;
}

.agent-phone {
  font-family: 'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
  color: #bfbfbf;
  margin: 0;
}

.agent-stats {
  display: flex;
  width: 100%;
}

.stat-item {
  flex: 1 0 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  min-height: 0;
}

.stat-value {
  font-family: 'PingFang SC', sans-serif;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
  color: #8c8c8c;
  margin: 0;
}

.stat-value.has-value {
  color: #ffe395;
}

.stat-label-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
}

.stat-label {
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  line-height: 24px;
  color: #8c8c8c;
  margin: 0;
}

.stat-info-icon {
  width: 14px;
  height: 14px;
}

/* Empty & Loading States */
.empty-state,
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.empty-state p,
.loading-state p {
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}
</style>


