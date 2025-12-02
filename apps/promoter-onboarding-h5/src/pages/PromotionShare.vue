<template>
  <div class="promotion-share-page">
    <div class="header">
      <button class="back-btn" @click="goBack">
        <img src="/back-icon.svg" alt="返回" />
      </button>
      <div class="title">我的邀请信息</div>
      <div class="header-placeholder" />
    </div>

    <div class="content">
      <!-- 邀请码 -->
      <section class="card code-card">
        <div class="code-header">
          <p class="card-title">邀请码</p>
          <div class="code-display-row">
          <p class="invite-code">{{ formattedInviteCode }}</p>
            <button class="icon-btn" @click="copyText(invitationCode, '复制成功～')">
          <img src="/copy.svg" alt="复制" />
        </button>
          </div>
        </div>
      </section>

      <!-- 邀请链接 + 二维码 -->
      <section class="card link-card">
        <div class="card-title-row">
          <p class="card-title highlight">邀请链接</p>
          <button class="ghost-btn" @click="copyText(shareLink, '复制成功～')">
            复制推广链接
          </button>
        </div>
        <p class="share-link">{{ shareLink }}</p>

        <div class="qr-wrapper">
          <div class="qr-box">
            <img v-if="qrDataUrl" :src="qrDataUrl" alt="二维码" />
            <div v-else class="qr-placeholder">生成中...</div>
          </div>
          <p class="qr-tip">可长按保存到相册</p>
          <button class="primary-btn" @click="saveQrImage">保存到相册</button>
        </div>
      </section>

      <!-- 邀请文案 -->
      <section class="card script-card">
        <div class="card-title-row">
          <p class="card-title">邀请文案</p>
          <button class="ghost-btn" @click="copyText(inviteScript, '复制成功～')">
            复制文案
          </button>
        </div>
        <div class="script-text">
          <p>推荐你用【AI 扑克记牌器】：</p>
          <p>下载链接：<span class="highlight-text">{{ downloadLink }}</span></p>
          <p class="empty-line">&nbsp;</p>
          <p>登录后输入邀请码【<span class="highlight-text">{{ formattedInviteCode }}</span>】可多得一天免费 SVIP 会员哈。</p>
        </div>
      </section>

      <!-- 使用规则 -->
      <section class="card rule-card">
        <p class="card-title">邀请新用户说明</p>
        <div class="rule-text">
          <p>邀请新用户填写邀请码才可获得代理佣金，新用户是指使用唯一新设备标识与未注册手机号，并通过首次注册的用户。</p>
        </div>
      </section>
    </div>

    <!-- Footer -->
    <footer class="page-footer">
      <div class="footer-content">
        <p class="footer-text">杭州一目可识科技有限公司</p>
        <div class="footer-divider"></div>
        <p class="footer-text">浙ICP备2025148163号</p>
        <div class="footer-divider"></div>
        <a 
          class="footer-link" 
          href="https://www.aijpq.com/agreements/agent-distribution-agreement.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          《AI扑克记牌器代理合作协议》
        </a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import QRCode from 'qrcode';
import { useRouter } from 'vue-router';
import { useAgentStore } from '#/store/agent';
import { useToast } from '#/composables/useToast';

const router = useRouter();
const agent = useAgentStore();
const toast = useToast();

const qrDataUrl = ref('');
const generating = ref(false);

const invitationCode = computed(() => agent.selfPromotionStats?.invitation_code || '');
const promoterId = computed(() => agent.promoterInfo?.promoter_id || 0);

const shareLink = computed(() =>
  promoterId.value ? `https://www.aijpq.com?promoter_id=${promoterId.value}` : '',
);

const downloadLink = computed(() =>
  promoterId.value ? `https://www.aijpq.com?promoter_id=${promoterId.value}` : '',
);

const formattedInviteCode = computed(() => {
  if (!invitationCode.value) return '----';
  return invitationCode.value.split('').join(' ');
});

const inviteScript = computed(() => {
  return `推荐你用【AI 扑克记牌器】：\n下载链接：${downloadLink.value}\n登录后输入邀请码【${formattedInviteCode.value}】可多得一天免费 SVIP 会员哈。`;
});

const generateQrCode = async () => {
  if (!shareLink.value || generating.value) return;
  generating.value = true;
  try {
    qrDataUrl.value = await QRCode.toDataURL(shareLink.value, {
      width: 320,
      margin: 0,
      color: {
        dark: '#0f0f0f',
        light: '#ffffff',
      },
    });
  } catch (error) {
    console.error('生成二维码失败:', error);
  } finally {
    generating.value = false;
  }
};

watch(shareLink, () => {
  qrDataUrl.value = '';
  generateQrCode();
});

const ensureDataLoaded = async () => {
  if (!agent.promoterInfo) {
    await agent.loadPromoterInfo();
  }
  if (!agent.selfPromotionStats) {
    await agent.loadSelfPromotionStats();
  }
};

const goBack = () => {
  router.back();
};

const copyText = async (text: string, successMsg: string) => {
  if (!text) {
    toast.error('暂无可复制内容');
    return;
  }
  if (!navigator.clipboard) {
    toast.error('复制失败，请手动复制');
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMsg);
  } catch (error) {
    console.error('复制失败:', error);
    toast.error('复制失败，请手动复制');
  }
};

const saveQrImage = () => {
  if (!qrDataUrl.value) return;
  const link = document.createElement('a');
  link.href = qrDataUrl.value;
  link.download = `promoter-qr-${invitationCode.value || 'link'}.png`;
  link.click();
  toast.success('保存成功');
};

onMounted(async () => {
  await ensureDataLoaded();
  await generateQrCode();
});
</script>

<style scoped>
.promotion-share-page {
  min-height: 100vh;
  background: #141414;
  color: #ffffff;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 10px;
}

.back-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background: transparent;
  border: none;
  cursor: pointer;
}

.back-btn img {
  width: 24px;
  height: 24px;
}

.title {
  font-family: 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 500;
  opacity: 0.9;
}

.header-placeholder {
  width: 44px;
}

.content {
  padding: 12px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: var(--basic-1, #1f1f1f);
  border-radius: 12px;
  padding: 10px 12px;
}

/* 邀请码卡片 */
.code-card {
  display: flex;
  align-items: center;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.code-display-row {
  display: flex;
  align-items: center;
  gap: 11px;
}

.invite-code {
  font-family: 'DingTalk JinBuTi', sans-serif;
  font-size: 33px;
  line-height: normal;
  color: var(--primary-6, #ffe395);
  margin: 0;
}

.icon-btn {
  background: transparent;
  border: none;
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn img {
  width: 20px;
  height: 20px;
}

.ghost-btn {
  background: var(--basic-1, #1f1f1f);
  border: 1px solid var(--basic-3, #434343);
  border-radius: 10px;
  padding: 7px 12px;
  color: var(--basic-10, #ffffff);
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.card-title {
  font-family: 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: var(--primary-6, #ffe395);
  margin: 0;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

/* 邀请链接卡片 */
.link-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.share-link {
  font-family: 'PingFang SC', sans-serif;
  font-size: 16px;
  line-height: 24px;
  color: var(--primary-1, #fffdf0);
  word-break: break-all;
  margin: 0;
}

.qr-wrapper {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.qr-box {

  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 4px;
}

.qr-box img {
  width: 160px;
  height: 160px;
}

.qr-placeholder {
  font-size: 14px;
  color: var(--basic-5, #8c8c8c);
}

.qr-tip {
  font-family: 'PingFang SC', sans-serif;
  font-size: 16px;
  line-height: 24px;
  color: var(--basic-5, #8c8c8c);
  margin: 0;
}

.primary-btn {
  background: var(--primary-6, #ffe395);
  border: 1px solid var(--primary-6, #ffe395);
  border-radius: 10px;
  padding: 7px 12px;
  color: var(--primary-12, #201e1a);
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  text-align: center;
  cursor: pointer;
}

/* 邀请文案卡片 */
.script-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.script-card .card-title-row {
  gap: 12px;
}

.script-text {
  font-family: 'PingFang SC', sans-serif;
  font-size: 16px;
  line-height: normal;
  color: var(--basic-6, #bfbfbf);
}

.script-text p {
  margin: 0;
  line-height: normal;
}

.script-text .empty-line {
  font-size: 16px;
}

.highlight-text {
  color: var(--primary-6, #ffe395);
}

/* 规则卡片 */
.rule-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-text {
  font-family: 'PingFang SC', sans-serif;
  font-size: 16px;
  line-height: 24px;
  color: var(--basic-6, #bfbfbf);
}

.rule-text p {
  margin: 0 0 6px;
}

.rule-text p:last-child {
  margin-bottom: 0;
}

/* Footer */
.page-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: auto;
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
}

.footer-text {
  font-family: 'PingFang SC', sans-serif;
  font-size: 12px;
  line-height: 21px;
  color: var(--basic-5, #8c8c8c);
  margin: 0;
}

.footer-link {
  font-family: 'PingFang SC', sans-serif;
  font-size: 12px;
  line-height: 21px;
  color: var(--basic-5, #8c8c8c);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--primary-6, #ffe395);
}

.footer-link:active {
  opacity: 0.8;
}

.footer-divider {
  width: 1px;
  height: 12px;
  background: var(--basic-3, #434343);
}

.home-bar {
  width: 100%;
  height: 34px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;
}

</style>

