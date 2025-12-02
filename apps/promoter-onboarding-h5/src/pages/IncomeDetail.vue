<template>
  <div class="income-page">
    <!-- Header -->
    <div class="header">
      <div class="header-left" @click="goBack">
        <img src="/back-icon.svg" alt="返回" class="back-icon" />
      </div>
      <div class="header-title">收入明细</div>
      <div class="header-right">
        <img src="/info-circle.svg" alt="说明" class="info-icon" @click="openCommissionModal" />
      </div>
    </div>

    <!-- Tab Group (仅一级代理显示) -->
    <div v-if="isLevel1" class="tab-group">
      <button
        class="tab"
        :class="{ active: activeTab === 'invite' }"
        @click="switchTab('invite')"
      >
        邀请收入
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'children' }"
        @click="switchTab('children')"
      >
        下级收入
      </button>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- 邀请收入 -->
      <div v-if="activeTab === 'invite'">
        <!-- Summary Card（有数据时展示） -->
        <div v-if="inviteRecords.length > 0" class="summary-card">
          <div class="summary-item">
            <p class="summary-label">总收入：</p>
            <p class="summary-value">
              {{ formatMoney(inviteSummary.totalFen) }}
            </p>
          </div>
          <div class="summary-item">
            <p class="summary-label">净收入：</p>
            <p class="summary-value">
              {{ formatMoney(inviteSummary.netFen) }}
            </p>
          </div>
          <div class="summary-item">
            <p class="summary-label">退款额：</p>
            <p class="summary-value">
              {{ formatMoney(inviteSummary.refundFen) }}
            </p>
          </div>
        </div>

        <!-- 邀请收入明细列表 -->
        <div class="invite-list">
          <div
            v-for="record in inviteRecords"
            :key="record.id"
            class="invite-item"
          >
            <div class="invite-item-header">
              <div class="invite-item-title">
                <span class="product-name">
                  {{ formatProductName(record.product_name) }}
                </span>
                <span
                  v-if="record.platform !== 'unknown'"
                  class="platform-icon-wrapper"
                  :class="record.platform"
                >
                  <img
                    :src="record.platform === 'android' ? '/android-icon.svg' : '/apple-icon.svg'"
                    :alt="record.platform === 'android' ? 'Android' : 'iOS'"
                    class="platform-icon"
                  />
                </span>
                <span v-else class="platform-text-badge">其它订单</span>
                <span
                  v-if="record.order_status === 'refunded'"
                  class="gold-badge"
                >
                  用户退款
                </span>
              </div>
              <div class="amount-block">
                <span
                  v-if="record.has_refund && record.order_status !== 'refunded'"
                  class="refund-label"
                >
                  有退款
                </span>
                <div
                  class="amount"
                  :class="{ refund: record.order_status === 'refunded' }"
                >
                  {{ formatAmount(record) }}
                </div>
                <img
                  src="/info-circle.svg"
                  alt="说明"
                  class="amount-info-icon"
                  @click.stop="openCommissionModal"
                />
              </div>
            </div>

            <div class="invite-item-body">
              <div class="meta-row">
                <span class="meta-label">用户ID：</span>
                <span class="meta-value">{{ record.user_id }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">付款时间：</span>
                <span class="meta-value">{{ record.paid_at }}</span>
              </div>
            </div>

            <div class="invite-item-footer" />
          </div>

          <div v-if="inviteRecords.length === 0 && !inviteLoading" class="empty-state empty-invite">
            <div class="empty-icon">
              <img src="/file.svg" alt="empty" />
            </div>
            <div class="empty-text-group">
              <p class="empty-title">暂无邀请收入记录</p>
              <p class="empty-subtitle">快去推广吧！这里会呈现收入数据</p>
            </div>
          </div>

          <div v-if="inviteLoading" class="list-footer">
            <span>加载中...</span>
          </div>
          <div
            v-else-if="!inviteHasMore && inviteRecords.length > 0"
            class="list-footer"
          >
            <span>没有更多了</span>
          </div>

          <!-- 滚动分页触发器 -->
          <div ref="loadMoreTrigger" class="load-more-trigger"></div>
        </div>
      </div>

      <!-- 下级收入（一级代理专有） -->
      <div v-else>
        <!-- Summary Card（有数据时展示） -->
        <div v-if="childrenList.length > 0" class="summary-card">
          <div class="summary-item">
            <p class="summary-label">总收入：</p>
            <p class="summary-value">
              {{ formatMoney(childrenSummary.totalFen) }}
            </p>
          </div>
          <div class="summary-item">
            <p class="summary-label">净收入：</p>
            <p class="summary-value">
              {{ formatMoney(childrenSummary.netFen) }}
            </p>
          </div>
          <div class="summary-item">
            <p class="summary-label">退款额：</p>
            <p class="summary-value">
              {{ formatMoney(childrenSummary.refundFen) }}
            </p>
          </div>
        </div>

        <!-- 下级代理列表，复用 TeamPerformance 的列表模块 -->
        <div v-if="childrenList.length === 0" class="empty-state empty-children">
          <div class="empty-icon">
            <img src="/file.svg" alt="empty" />
          </div>
          <div class="empty-text-group">
            <p class="empty-title">暂无下级收入记录</p>
            <p class="empty-subtitle">去邀请下级推广吧！这里会呈现下级带来的收入数据</p>
          </div>
        </div>
        <div v-else class="children-list">
          <ChildAgentList @openCommissionModal="openCommissionModal" />
        </div>
      </div>
    </div>

    <!-- 分成说明弹窗（Teleport 到 body） -->
    <CommissionInfoModal
      v-model:visible="commissionModalVisible"
      :level="agent.promoterInfo?.level || 2"
      :androidRate="ratesForActiveTab.android"
      :iosRate="ratesForActiveTab.ios"
      :title="ratesForActiveTab.title"
      :showLevelInfo="ratesForActiveTab.showLevelInfo"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '#/store/auth';
import { useAgentStore } from '#/store/agent';
import { getInvitePerformancesApi, type InvitePerformanceRecord } from '#/api/agent';
import ChildAgentList from '#/components/agent/ChildAgentList.vue';
import CommissionInfoModal from '#/components/common/CommissionInfoModal.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const agent = useAgentStore();

const loading = ref(false);
const activeTab = ref<'invite' | 'children'>('invite');

// 邀请收入明细列表 & 分页状态
const inviteRecords = ref<InvitePerformanceRecord[]>([]);
const invitePage = ref(1);
const invitePageSize = 20;
const inviteHasMore = ref(true);
const inviteLoading = ref(false);
const loadMoreTrigger = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const isLevel1 = computed(() => agent.promoterInfo?.level === 1);
const childrenList = computed(() => Array.isArray(agent.childrenStats) ? agent.childrenStats : []);

// 分成说明弹窗
const commissionModalVisible = ref(false);
const ratesForActiveTab = computed(() => {
  const defaultRates = { android: 0, ios: 0, title: '分成计算方式', showLevelInfo: true };
  const cr = agent.commissionRates;
  const level = agent.promoterInfo?.level || 2;
  if (!cr) return defaultRates;
  if (activeTab.value === 'children') {
    const r = cr.level1_from_level2;
    return {
      android: r?.android || 0,
      ios: r?.ios || 0,
      title: '下级分成计算方式',
      showLevelInfo: false,
    };
  }
  // 邀请收入：根据自身等级选择直推分成
  const r = (level === 1 ? cr.level1_direct : cr.level2_direct);
  return {
    android: r?.android || 0,
    ios: r?.ios || 0,
    title: '分成计算方式',
    showLevelInfo: true,
  };
});
const openCommissionModal = () => { commissionModalVisible.value = true; };

const goBack = () => {
  router.back();
};

const switchTab = (tab: 'invite' | 'children') => {
  // 非一级代理不允许查看下级收入（理论上tab组不会出现，这里兜底）
  if (tab === 'children' && !isLevel1.value) return;
  activeTab.value = tab;
  // 同步 URL 查询参数，便于刷新/分享后保持当前 Tab
  router.replace({ path: '/agent/income', query: { tab } });
  // 切到下级收入时，确保拉取最新统计（即使为空也要更新空态）
  if (tab === 'children') {
    agent.loadChildrenStats().catch((e) => console.error('刷新下级收入失败:', e));
  }
};

const formatMoney = (fen: number) => {
  return `¥${(fen / 100).toFixed(2)}`;
};

const formatAmount = (record: InvitePerformanceRecord) => {
  // refunded 状态显示负数，pending 和 withdrawable 显示正数
  const sign = record.order_status === 'refunded' ? '-' : '+';
  const amount = Math.abs(record.commission_amount_fen);
  return `${sign}¥${(amount / 100).toFixed(2)}`;
};

const formatProductName = (name?: string) => {
  if (!name) return 'VIP订单';
  return name.replace(/_/g, '-');
};

// 加载邀请收入业绩明细（滚动分页）
const loadInvitePerformances = async () => {
  if (inviteLoading.value || !inviteHasMore.value) return;
  inviteLoading.value = true;
  try {
    const res = await getInvitePerformancesApi({
      page: invitePage.value,
      page_size: invitePageSize,
    });
    if (res.records && res.records.length > 0) {
      inviteRecords.value.push(...res.records);
    }
    inviteHasMore.value = res.has_more;
    if (res.has_more) {
      invitePage.value += 1;
    }
  } catch (error) {
    console.error('加载邀请收入明细失败:', error);
  } finally {
    inviteLoading.value = false;
  }
};

// 邀请收入汇总（使用后端返回的汇总数据）
const inviteSummary = computed(() => {
  const stats = agent.selfPromotionStats;
  if (!stats) {
    return { totalFen: 0, netFen: 0, refundFen: 0 };
  }
  
  // 使用后端汇总数据
  const totalFen = stats.total_earnings_fen ?? 0;  // 总收益
  const refundFen = stats.total_refunded_fen ?? 0; // 退款额
  const netFen = stats.total_revenue_fen ?? 0;     // 净收益
  
  return { totalFen, netFen, refundFen };
});

// 下级收入汇总（按父级从子级获得的分成汇总）
const childrenSummary = computed(() => {
  const stats = Array.isArray(agent.childrenStats) ? agent.childrenStats : [];
  // parent_share_from_child_fen 是 pending + withdrawable 的总和（不扣退款）
  const totalFen = stats.reduce(
    (sum, child) => sum + (child.parent_share_from_child_fen || 0),
    0,
  );
  // parent_refunded_from_child_fen 是退款佣金
  const refundFen = stats.reduce(
    (sum, child) => sum + (child.parent_refunded_from_child_fen || 0),
    0,
  );
  const netFen = totalFen - refundFen;
  return { totalFen, netFen, refundFen };
});

const ensureDataLoaded = async () => {
  try {
    loading.value = true;

    if (!auth.token) {
      router.replace('/login');
      return;
    }

    if (!agent.promoterInfo) {
      await agent.loadPromoterInfo();
    }

    if (agent.promoterInfo?.approval_status !== 'active') {
      router.replace('/apply/personal');
      return;
    }

    // 加载邀请收入汇总与下级收入相关数据
    await Promise.all([
      agent.loadSelfPromotionStats(),
      agent.loadCommissionRates(),
      isLevel1.value ? agent.loadChildrenStats() : Promise.resolve(),
    ]);

    // 初始Tab：如果带了tab=children且是一级代理，则切到下级收入
    const initialTab = route.query.tab === 'children' && isLevel1.value
      ? 'children'
      : 'invite';
    activeTab.value = initialTab;
  } catch (error) {
    console.error('加载收入明细数据失败:', error);
  } finally {
    loading.value = false;
  }
};

const setupObserver = () => {
  if (!('IntersectionObserver' in window)) return;
  if (!loadMoreTrigger.value) return;
  observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry && entry.isIntersecting) {
      loadInvitePerformances();
    }
  });
  observer.observe(loadMoreTrigger.value);
};

onMounted(async () => {
  await ensureDataLoaded();
  // 初始加载一页邀请收入明细
  await loadInvitePerformances();
  setupObserver();
});

onUnmounted(() => {
  if (observer && loadMoreTrigger.value) {
    observer.unobserve(loadMoreTrigger.value);
  }
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});

// 监听 URL 中的 tab 变化（外部跳转或地址栏修改时生效）
watch(
  () => route.query.tab,
  (tab) => {
    const t = tab === 'children' ? 'children' : 'invite';
    if (t !== activeTab.value) {
      switchTab(t);
    }
  },
);
</script>

<style scoped>
.income-page {
  min-height: 100vh;
  background-color: #141414;
  color: #ffffff;
}

/* Header */
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
}

.back-icon,
.info-icon {
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

/* Tabs */
.tab-group {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
}

.tab {
  border: none;
  padding: 5px 11px;
  border-radius: 8px;
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  cursor: pointer;
  background-color: #262626;
  color: #ffffff;
}

.tab.active {
  background-color: #ffe395;
  color: #141414;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.content {
  padding: 0 10px 16px;
}

.summary-card {
  background-color: #201e1a;
  border: 1px solid #332d1e;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.summary-label {
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 16px;
  color: rgba(255, 227, 149, 0.5);
  margin: 0;
}

.summary-value {
  font-family: 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #ffecb5;
  margin: 0;
}

.children-list {
  margin-top: 10px;
}

.invite-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.invite-item {
  background-color: #1f1f1f;
  border: 1px solid #262626;
  border-radius: 8px;
  padding: 10px 12px;
}

.invite-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.invite-item-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.product-name {
  font-family: 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.platform-icon-wrapper {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #262626;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.platform-icon-wrapper.android {
  background-color: rgba(52, 168, 83, 0.16);
  border-color: rgba(52, 168, 83, 0.5);
}

.platform-icon-wrapper.ios {
  background-color: rgba(255, 255, 255, 0.08);
}

.platform-icon {
  width: 16px;
  height: 16px;
}

.platform-text-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background-color: #262626;
  font-family: 'PingFang SC', sans-serif;
  font-size: 12px;
  color: #bfbfbf;
}

.gold-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 227, 149, 0.35);
  background-color: rgba(51, 45, 30, 0.8);
  font-family: 'PingFang SC', sans-serif;
  font-size: 12px;
  color: #ffe395;
}

.amount-block {
  display: flex;
  align-items: center;
  gap: 8px;
}

.refund-label {
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #ffecb5;
  margin-right: 2px;
}

.amount {
  font-family: 'PingFang SC', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #ffecb5;
}

.amount.refund {
  color: #8c8c8c;
}

.amount-info-icon {
  width: 16px;
  height: 16px;
}

.invite-item-body {
  margin-top: 4px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-label {
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  color: #8c8c8c;
}

.meta-value {
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  color: #ffffff;
}

.invite-item-footer {
  margin-top: 6px;
}

.list-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
}

.list-footer span {
  font-family: 'PingFang SC', sans-serif;
  font-size: 12px;
  color: #8c8c8c;
}

.load-more-trigger {
  height: 1px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 120px 20px;
}

.empty-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.empty-icon img {
  width: 100%;
  height: 100%;
}

.empty-text-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.empty-title {
  font-family: 'PingFang SC', sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  color: #ffffff;
  text-align: center;
  margin: 0;
}

.empty-subtitle {
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: normal;
  color: #8c8c8c;
  text-align: center;
  margin: 0;
}
</style>


