<template>
  <div class="agent-home">
    <!-- 顶部导航栏（Fixed） -->
    <AppHeader />
    
    <!-- 顶部账号状态区（Sticky） -->
    <AccountStatus class="sticky-header" />

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 总收入卡片 -->
      <EarningsCard />

      <!-- 下级代理卡片（仅一级代理） -->
      <TeamCard v-if="isLevel1" />

      <!-- 推广卡片 -->
      <PromotionCard />
    </div>

    <!-- 底部信息 -->
    <div class="footer-info">
      <p class="company-name">杭州一目可识科技有限公司</p>
      <span class="divider">|</span>
      <p class="icp">浙ICP备2025148163号</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '#/store/auth';
import { useAgentStore } from '#/store/agent';
import AppHeader from '#/components/ui/AppHeader.vue';
import AccountStatus from '#/components/agent/AccountStatus.vue';
import EarningsCard from '#/components/agent/EarningsCard.vue';
import TeamCard from '#/components/agent/TeamCard.vue';
import PromotionCard from '#/components/agent/PromotionCard.vue';

const router = useRouter();
const auth = useAuthStore();
const agent = useAgentStore();

// 组件挂载状态标志
const isMounted = ref(false);

// 是否为一级代理
const isLevel1 = computed(() => agent.promoterInfo?.level === 1);

// 加载所有数据
async function loadAllData() {
  // 在开始加载前检查组件是否仍然挂载
  if (!isMounted.value) return;
  
  try {
    await Promise.all([
      agent.loadWithdrawalBalance(),
      agent.loadSelfPromotionStats(),
      agent.loadCommissionRates(),
      isLevel1.value ? agent.loadChildrenStats() : Promise.resolve(),
    ]);
  } catch (error) {
    // 只在组件仍然挂载时记录错误
    if (isMounted.value) {
      console.error('加载数据失败:', error);
    }
  }
}

// 轮询定时器
let pollingTimer: ReturnType<typeof setInterval> | null = null;

// 启动轮询（每30秒）
function startPolling() {
  stopPolling();
  pollingTimer = setInterval(() => {
    // 轮询回调中也检查挂载状态
    if (isMounted.value) {
      loadAllData();
    }
  }, 30000);
}

// 停止轮询
function stopPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
}

onMounted(async () => {
  // 设置组件已挂载标志
  isMounted.value = true;
  
  // 检查用户状态
  if (!auth.token) {
    router.replace('/login');
    return;
  }

  // 获取promoter信息
  await agent.loadPromoterInfo();

  // 如果不是active状态，重定向
  if (agent.promoterInfo?.approval_status !== 'active') {
    router.replace('/apply/personal');
    return;
  }

  // 加载数据并启动轮询
  await loadAllData();
  startPolling();
});

onUnmounted(() => {
  // 立即设置组件未挂载标志，阻止任何进行中的异步操作
  isMounted.value = false;
  stopPolling();
});
</script>

<style scoped>
.agent-home {
  min-height: 100vh;
  background: var(--basic-0);
  display: flex;
  flex-direction: column;
  padding-top: 81px; /* AppHeader高度56px + margin 15px + 10px */
}

.sticky-header {
  position: sticky;
  top: 81px; /* 吸附在AppHeader下方 */
  z-index: 100;
  background: var(--basic-0);
}

.main-content {
  flex: 1;
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  font-family: var(--font-family-primary);
  font-size: 12px;
  line-height: 21px;
  color: var(--basic-5);
}

.company-name,
.icp {
  margin: 0;
}

.divider {
  width: 1px;
  height: 12px;
  background: var(--basic-3);
}
</style>

