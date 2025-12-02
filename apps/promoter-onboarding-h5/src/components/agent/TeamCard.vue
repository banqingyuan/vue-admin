<template>
  <div class="team-card">
    <!-- 上半部分整体为点击热区，进入下级代理页面 -->
    <div class="clickable-area" @click="goTeamPerformance">
      <!-- 标题区 -->
      <div class="header">
        <div class="title-group">
          <img class="icon" src="/team.svg" alt="下级代理" />
          <span class="title">下级代理</span>
        </div>
        
        <div class="count-group">
          <div class="count">
            <span class="number">{{ subordinateCount }}</span>
            <span class="unit">人</span>
          </div>
          <svg class="arrow-icon" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 5L12.5 10L7.5 15" stroke="#8C8C8C" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <!-- 分成比例说明 -->
      <p class="commission-text">
        安卓：分成比例 <span class="rate">{{ rates.android }}%</span>，苹果：分成比例 <span class="rate">{{ rates.ios }}%</span>
      </p>

      <!-- 分隔线 -->
      <div class="divider"></div>

      <!-- 收入区（不包含底部按钮） -->
      <div class="earnings-section">
        <div class="section-header">
          <span class="section-title">收入</span>
        <div class="detail-link" @click.stop="goIncomeDetail">
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
            <p class="value">{{ formatMoney(totalEarnings) }}</p>
          </div>
          
          <div class="data-item">
            <p class="label">总订单数</p>
            <p class="value">{{ totalOrders }}</p>
          </div>
          
          <div class="data-item">
            <p class="label">总邀请人数</p>
            <p class="value">{{ totalInvites }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 按钮组（自身可点击，不受上方热区影响） -->
    <div class="button-group">
      <button class="btn btn-secondary" @click.stop="goTeamPerformance">查看代理业绩</button>
      <button class="btn btn-primary" @click.stop="goInviteAgent">邀请代理</button>
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


// 下级代理人数
const subordinateCount = computed(() => agent.childrenStats?.length ?? 0);

// 聚合数据
const totalEarnings = computed(() => 
  agent.childrenStats?.reduce((sum, child) => sum + child.parent_share_from_child_fen, 0) ?? 0
);

const totalOrders = computed(() =>
  agent.childrenStats?.reduce((sum, child) => sum + child.paid_order_count, 0) ?? 0
);

const totalInvites = computed(() =>
  agent.childrenStats?.reduce((sum, child) => sum + child.invite_count, 0) ?? 0
);


// 分成比例
const rates = computed(() => {
  const commissionRates = agent.commissionRates?.level1_from_level2;
  return {
    android: commissionRates?.android || 10,
    ios: commissionRates?.ios || 10,
  };
});

const shareLink = computed(() => {
  const id = agent.promoterInfo?.promoter_id;
  return id ? `https://promoter.aijpq.com?senior_id=${id}` : '';
});

const shareMessage = computed(() => {
  if (!shareLink.value) return '';
  return `推荐你加入【AI 扑克记牌器】代理合作，点击链接即可申请：${shareLink.value}`;
});

function formatMoney(fen: number): string {
  return (fen / 100).toFixed(2);
}

function goTeamPerformance() {
  router.push('/agent/team/performance');
}

function detectDeviceOS() {
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  return 'other';
}

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

async function goInviteAgent() {
  if (!shareLink.value) {
    toast.error('尚未获取到邀请链接，请稍后重试');
    return;
  }

  const device = detectDeviceOS();
  const text = shareMessage.value;
  try {
    // 先复制，再尝试触发系统分享（若支持）
    await copyToClipboard(shareLink.value);
    toast.success('专属邀请链接，已复制成功！发给你的下级代理');
    if ((device === 'android' || device === 'ios') && navigator.share) {
      await navigator.share({
        title: 'AI 扑克记牌器邀请',
        text,
        url: shareLink.value,
      });
    }
    return;
  } catch (error) {
    console.warn('分享流程异常，直接提示复制', error);
  }
}

function goIncomeDetail() {
  // 直接进入下级收入 Tab
  router.push({ path: '/agent/income', query: { tab: 'children' } });
}
</script>

<style scoped>
.team-card {
  background: var(--basic-2);
  border: 1px solid var(--basic-3);
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.clickable-area {
  cursor: pointer;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header:hover {
  opacity: 0.8;
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

.count-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.count {
  display: flex;
  align-items: center;
  gap: 6px;
}

.number {
  font-family: 'DingTalk JinBuTi', sans-serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 1;
  color: var(--primary-6);
}

.unit {
  font-family: var(--font-family-primary);
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  color: var(--basic-10);
}

.arrow-icon {
  width: 20px;
  height: 20px;
}

.commission-text {
  font-family: var(--font-family-primary);
  font-size: 14px;
  font-weight: 400;
  line-height: 21px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.7px;
  margin: 12px 0 0;
}

.rate {
  background: linear-gradient(135deg, #ffe395, #fff2cc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
}

.divider {
  width: 30px;
  height: 0;
  border-bottom: 1px solid var(--basic-3);
  margin: 12px auto;
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
  margin-top: 16px;
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

