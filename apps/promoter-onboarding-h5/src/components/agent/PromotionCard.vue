<template>
  <div class="promotion-card">
    <!-- 标题和邀请码 -->
    <div class="header">
      <div class="title-group">
        <img class="icon" src="/invite.svg" alt="邀请码" />
        <span class="title">邀请码</span>
        <p class="invitation-code">{{ invitationCode }}</p>
      </div>
    </div>

    <!-- 分成比例说明 -->
    <div class="commission-info">
      <p class="commission-text">
        <span>安卓：分成比例 </span>
        <span class="rate">{{ rates.android }}%</span>
        <span class="separator">、</span>
        <span>苹果：分成比例 </span>
        <span class="rate">{{ rates.ios }}%</span>
      </p>
      <p class="tip-text">一次绑定，长线收益分成！！</p>
    </div>

    <!-- 分隔线 -->
    <div class="divider"></div>

    <!-- 收入区 -->
    <div class="earnings-section">
      <div class="section-header">
        <span class="section-title">收入</span>
        <div class="detail-link" @click="goPromotionEarnings">
          <span>收入明细</span>
          <svg viewBox="0 0 14 14" fill="none">
            <path d="M5 3L9 7L5 11" stroke="#8C8C8C" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <!-- 数据展示 -->
      <div class="data-row">
        <div class="data-item">
          <p class="label">总收入（元）</p>
          <p class="value">{{ formatMoney(stats?.total_revenue_fen) }}</p>
        </div>
        
        <div class="data-item">
          <p class="label">总订单数</p>
          <p class="value">{{ stats?.paid_order_count || 0 }}</p>
        </div>
        
        <div class="data-item">
          <p class="label">总邀请人数</p>
          <p class="value">{{ stats?.invite_count || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- 按钮组 -->
    <div class="button-group">
      <button class="btn btn-secondary" @click="goInvitationRecords">查看邀请记录</button>
      <button class="btn btn-primary" @click="goPromotion">去推广</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAgentStore } from '#/store/agent';

const router = useRouter();
const agent = useAgentStore();

const stats = computed(() => agent.selfPromotionStats);

// 邀请码
const invitationCode = computed(() => stats.value?.invitation_code || '----');

// 分成比例（根据代理级别）
const rates = computed(() => {
  const level = agent.promoterInfo?.level || 1;
  const commissionRates = agent.commissionRates;
  
  if (level === 1) {
    // 一级代理：直接推广用户
    return {
      android: commissionRates?.level1_direct?.android || 60,
      ios: commissionRates?.level1_direct?.ios || 40,
    };
  } else {
    // 二级代理：直接推广用户
    return {
      android: commissionRates?.level2_direct?.android || 60,
      ios: commissionRates?.level2_direct?.ios || 40,
    };
  }
});

function formatMoney(fen?: number): string {
  if (fen === undefined || fen === null) return '0.00';
  return (fen / 100).toFixed(2);
}

function goPromotionEarnings() {
  router.push('/agent/income?tab=invite');
}

function goInvitationRecords() {
  router.push('/agent/invited-users');
}

function goPromotion() {
  router.push('/agent/promotion/share');
}
</script>

<style scoped>
.promotion-card {
  background: var(--basic-2);
  border: 1px solid var(--basic-3);
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 2px;
}

.icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.title {
  font-family: var(--font-family-primary);
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  color: var(--basic-10);
}

.invitation-code {
  font-family: 'DingTalk JinBuTi', sans-serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 1;
  color: var(--primary-6);
  margin: 0;
}

.commission-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.commission-text {
  font-family: var(--font-family-primary);
  font-size: 14px;
  font-weight: 400;
  line-height: 21px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.7px;
  margin: 0;
}

.rate {
  background: linear-gradient(135deg, #ffe395, #fff2cc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
}

.separator {
  color: var(--basic-5);
  font-weight: 600;
}

.tip-text {
  font-family: 'DingTalk JinBuTi', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 21px;
  color: rgba(255, 227, 149, 0.5);
  letter-spacing: 0.7px;
  margin: 0;
}

.divider {
  width: 30px;
  height: 0;
  border-bottom: 1px solid var(--basic-3);
  margin: 0 auto;
}

.earnings-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
}

.section-title {
  font-family: var(--font-family-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  color: var(--basic-10);
}

.detail-link {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-family: var(--font-family-primary);
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  color: var(--basic-5);
}

.detail-link svg {
  width: 14px;
  height: 14px;
}

.detail-link:hover {
  opacity: 0.8;
}

.data-row {
  background: rgba(255, 227, 149, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
}

.data-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  border-radius: 10px;
  align-items: flex-start;
  min-width: 0; /* 防止内容溢出 */
}

.label {
  font-family: var(--font-family-primary);
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  color: rgba(255, 227, 149, 0.5);
  letter-spacing: 0.14px;
  margin: 0;
  text-align: center;
}

.value {
  font-family: 'DingTalk JinBuTi', sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 1;
  color: var(--primary-6);
  margin: 0;
  text-align: center;
}

.button-group {
  display: flex;
  gap: 16px;
}

.btn {
  padding: 7px 12px;
  border-radius: 10px;
  font-family: var(--font-family-primary);
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  text-align: center;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.btn:hover {
  opacity: 0.8;
}

.btn-secondary {
  background: var(--basic-1);
  border: 1px solid var(--basic-3);
  color: var(--basic-10);
  flex-shrink: 0;
}

.btn-primary {
  background: var(--primary-6);
  border: 1px solid var(--primary-6);
  color: var(--primary-12);
  flex: 1;
}
</style>

