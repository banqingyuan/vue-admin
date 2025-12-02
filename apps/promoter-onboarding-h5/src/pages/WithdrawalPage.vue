<template>
  <div class="page-container">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="nav-left" @click="router.back()">
        <img src="/back-icon.svg" alt="back" class="nav-icon" />
      </div>
      <div class="nav-title">钱包余额</div>
      <div class="nav-right"></div>
    </div>

    <div class="content-area">
      <!-- 余额 Banner -->
      <div class="balance-banner">
        <div class="balance-label">可提现余额</div>
        <div class="balance-value">¥ {{ formatMoney(balance?.withdrawable_fen) }}</div>
      </div>

      <!-- 提现按钮 -->
      <div class="action-section">
        <button class="primary-btn" @click="handleWithdraw">立即提现</button>
      </div>

      <!-- 菜单卡片（与设计对齐：两张独立卡片） -->
      <div class="menu-card" @click="router.push('/agent/income')">
        <span class="menu-text">收入明细</span>
        <div class="menu-arrow"></div>
      </div>
      <div class="menu-card" @click="handleHistory">
        <span class="menu-text">提现记录</span>
        <div class="menu-arrow"></div>
      </div>

      <!-- 提现须知（设计稿规则卡片 + 内置联系客服按钮） -->
      <div class="rules-card">
        <div class="rules-title">提现须知：</div>
        <!-- 企业用户 -->
        <ol v-if="isCompanyUser" class="rules-list">
          <li>企业用户，以合同详情为准；</li>
          <li>如有疑问，点下方"联系客服"</li>
        </ol>
        <!-- 个人用户 -->
        <ol v-else class="rules-list">
          <li>提现周期：N月收益，次月 5号后可提现；</li>
          <li>单次可提现金额范围 ¥300～¥10000；</li>
          <li>提现遇到问题？点下方"联系客服"</li>
        </ol>
        <button class="contact-btn" @click="handleContactService">
          <img src="/head_phone.svg" alt="" class="contact-icon" />
          <span class="contact-text">任何疑问，联系客服</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAgentStore } from '#/store/agent';
import { useToast } from '#/composables/useToast';

const router = useRouter();
const agentStore = useAgentStore();
const toast = useToast();

const balance = computed(() => agentStore.withdrawalBalance);
const isCompanyUser = computed(() => agentStore.promoterInfo?.type === 'company');

onMounted(() => {
  agentStore.loadWithdrawalBalance();
  // 如果promoterInfo还未加载，则加载它
  if (!agentStore.promoterInfo) {
    agentStore.loadPromoterInfo();
  }
});

function formatMoney(fen?: number): string {
  if (fen === undefined || fen === null) return '0.00';
  return (fen / 100).toFixed(2);
}

function handleWithdraw() {
  // 功能暂未开放：按照 Figma 文案与样式提示
  toast.info('暂未到提现时间，详情可联系客服');
}

function handleHistory() {
  router.push('/agent/withdrawal-history');
}

function handleContactService() {
  // 参考全局已用实现（如 AppHeader.vue / Login.vue / InviteEntry.vue）
  window.location.href = 'https://work.weixin.qq.com/kfid/kfc2f7022befdbcb9e2';
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #141414;
  display: flex;
  flex-direction: column;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 导航栏 */
.nav-bar {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: #141414;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-left, .nav-right {
  width: 80px;
  display: flex;
  align-items: center;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.nav-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

/* 内容区域 */
.content-area {
  flex: 1;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
}

/* 余额 Banner */
.balance-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 16px;
}

.balance-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
}

.balance-value {
  font-size: 37px;
  font-weight: 600;
  color: #FFFFFF;
  font-family:  'PingFang SC', sans-serif;
  line-height: 1;
}

/* 提现按钮 */
.action-section {
  margin-bottom: 16px;
}

.primary-btn {
  width: 100%;
  height: 44px;
  background: #ffe395; /* var(--primary-6) */
  border: 1px solid #ffe395;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #201e1a; /* var(--primary-12) */
  cursor: pointer;
  transition: opacity 0.2s;
}

.primary-btn:active {
  opacity: 0.9;
}

/* 菜单卡片（单独） */
.menu-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #262626; /* var(--basic-2) */
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 12px;
  cursor: pointer;
}

.menu-card:active {
  background: rgba(255, 255, 255, 0.05);
}

.menu-text {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 1);
}

.menu-arrow {
  width: 10px;
  height: 10px;
  border-top: 2px solid #8c8c8c; /* var(--basic-5) */
  border-right: 2px solid #8c8c8c;
  transform: rotate(45deg);
}

/* 规则卡片 */
.rules-card {
  background: #191919;
  border-radius: 10px;
  padding: 12px;
  color: #bfbfbf; /* var(--basic-6) */
}
.rules-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
}
.rules-list {
  margin: 0 0 12px 0;
  padding-left: 21px;
}
.rules-list li {
  line-height: 24px;
}
.contact-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 7px 12px;
  background: #1f1f1f; /* var(--basic-1) */
  border: 1px solid #434343; /* var(--basic-3) */
  border-radius: 10px;
  color: #ffffff;
  cursor: pointer;
}
.contact-icon {
  width: 16px;
  height: 16px;
  opacity: 0.9;
}
.contact-text {
  font-size: 14px;
}
</style>
