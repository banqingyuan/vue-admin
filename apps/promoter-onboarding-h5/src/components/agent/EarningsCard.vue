<template>
  <div class="earnings-card">
    <!-- 标题和按钮组 -->
    <div class="header">
      <div class="title-group">
        <img class="icon" src="/benefit.svg" alt="总收入" />
        <span class="title">总收入</span>
      </div>
      
      <div class="button-group">
        <button class="btn btn-secondary" @click="goEarningsDetail">收入明细</button>
        <button class="btn btn-primary" @click="goWithdraw">立即提现</button>
      </div>
    </div>

    <!-- 数据展示区 -->
    <div class="data-row">
      <div class="data-item">
        <p class="label">总收入(元)</p>
        <p class="value">{{ formatMoney(balance?.total_earnings_fen) }}</p>
      </div>
      
      <div class="data-item">
        <p class="label">待结算(元)</p>
        <p class="value">{{ formatMoney(balance?.pending_settlement_fen) }}</p>
      </div>
      
      <div class="data-item">
        <p class="label">
          可提现(元)
        </p>
        <p class="value">{{ formatMoney(balance?.withdrawable_fen) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAgentStore } from '#/store/agent';
import { useToast } from '#/composables/useToast';

const router = useRouter();
const agent = useAgentStore();
const toast = useToast();

const balance = computed(() => agent.withdrawalBalance);

// 金额格式化（分转元，保留两位小数）
function formatMoney(fen?: number): string {
  if (fen === undefined || fen === null) return '0.00';
  return (fen / 100).toFixed(2);
}

function goEarningsDetail() {
  // 收入明细页，默认进入“邀请收入”模块
  router.push({ path: '/agent/income', query: { tab: 'invite' } });
}

function goWithdraw() {
  const withdrawable = balance.value?.withdrawable_fen || 0;
  router.push('/agent/withdraw');
}

function showWithdrawRule() {
  toast.info('提现规则：根据提现周期，次月 10～15日可提现');
}
</script>

<style scoped>
.earnings-card {
  background: rgba(255, 227, 149, 0.1);
  border: 1px solid var(--primary-6);
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 7px;
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

.button-group {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 3px 8px;
  border-radius: 7px;
  font-family: var(--font-family-primary);
  font-size: 14px;
  font-weight: 400;
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
}

.btn-primary {
  background: var(--primary-6);
  border: 1px solid var(--primary-6);
  color: var(--primary-12);
}

.data-row {
  display: flex;
  align-items: center;
  border-radius: 12px;
}

.data-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 0;
  border-radius: 10px;
  align-items: flex-start;
}

.label {
  font-family: var(--font-family-primary);
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  color: rgba(255, 227, 149, 0.5);
  letter-spacing: 0.14px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  text-align: left;
}

.help-icon {
  width: 16px;
  height: 16px;
  color: var(--basic-10);
  cursor: pointer;
}

.value {
  font-family: 'DingTalk JinBuTi', sans-serif;
  font-size: 19px;
  font-weight: 400;
  line-height: 1;
  color: var(--primary-6);
  margin: 0;
  text-align: left;
}
</style>

