<template>
  <div class="invite-page">
    <!-- Header - Fixed -->
      <AppHeader />

    <!-- Main Content -->
    <div class="main-content">
      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <img class="welcome-banner-img" src="/invite.png" alt="邀请码" />
      </div>

      <!-- Form Section -->
      <form class="invite-form" @submit.prevent="onSubmit">
        <h3 class="form-title">完善您的信息</h3>

        <!-- 姓名 -->
        <BaseInput
          v-model="formData.name"
          label="姓名"
          placeholder="请输入姓名"
          required
        />

        <!-- 身份证号 -->
        <BaseInput
          v-model="formData.idNumber"
          label="身份证号"
          placeholder="请输入身份证号"
          required
        />

        <!-- 微信号 -->
        <BaseInput
          v-model="formData.wechat"
          label="微信号"
          placeholder="请输入微信号"
        />

        <!-- 协议勾选 -->
        <div class="agreement-wrapper">
          <BaseCheckbox v-model="agreed">
            <span class="agreement-text">
              我已阅读且同意<span class="agreement-link" @click.stop="showAgreementModal = true">《AI扑克记牌器代理合作协议》</span>
            </span>
          </BaseCheckbox>
        </div>
      </form>
    </div>

    <!-- 底部按钮 - Sticky -->
    <div class="footer-actions">
      <BaseButton
        type="secondary"
        size="large"
        class="btn-contact"
        @click="contactService"
      >
        联系客服
      </BaseButton>
      <BaseButton
        type="primary"
        size="large"
        class="btn-submit"
        :disabled="!canSubmit"
        @click="onSubmit"
      >
        立即提交
      </BaseButton>
    </div>

    <!-- Agreement Modal (协议弹窗) -->
    <AgreementModal 
      :visible="showAgreementModal" 
      @close="showAgreementModal = false"
      @confirm="handleAgreementConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { submitInfoApi, validateSeniorIdApi } from '#/api/promoter';
import { useToast } from '#/composables/useToast';
import { useAuthStore } from '#/store/auth';
import AppHeader from '#/components/ui/AppHeader.vue';
import BaseButton from '#/components/ui/BaseButton.vue';
import BaseInput from '#/components/ui/BaseInput.vue';
import BaseCheckbox from '#/components/ui/BaseCheckbox.vue';
import AgreementModal from '#/components/AgreementModal.vue';

const toast = useToast();
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const formData = ref({
  name: '',
  idNumber: '',
  wechat: '',
});

const seniorId = ref<number | null>(null);
const seniorName = ref<string>('');
const agreed = ref(false);
const showAgreementModal = ref(false);
const pendingSubmit = ref(false); // 标记是否因未勾选协议而打开弹窗

const canSubmit = computed(() => {
  return formData.value.name && formData.value.idNumber && agreed.value;
});

// 页面加载时验证 senior_id
onMounted(async () => {
  const seniorIdParam = route.query.senior_id as string;
  
  if (!seniorIdParam) {
    toast.error('缺少邀请参数');
    router.replace('/apply/personal');
    return;
  }

  try {
    const response = await validateSeniorIdApi(seniorIdParam);
    
    if (!response.valid) {
      toast.error('无效的邀请链接');
      router.replace('/apply/personal');
      return;
    }

    seniorId.value = Number.parseInt(seniorIdParam, 10);
    seniorName.value = response.senior_name || '';
    
  } catch (error: any) {
    console.error('验证上级代理失败:', error);
    toast.error('验证邀请链接失败');
    router.replace('/apply/personal');
  }
});

// 确认协议
function handleAgreementConfirm() {
  showAgreementModal.value = false;
  agreed.value = true;
  
  // 如果是因为未勾选协议而打开的弹窗，点击确认后自动提交
  if (pendingSubmit.value) {
    pendingSubmit.value = false;
    // 延迟一下，让协议弹窗先关闭
    setTimeout(() => {
      onSubmit();
    }, 100);
  }
}

async function onSubmit() {
  // 先检查是否填写完整
  if (!formData.value.name || !formData.value.idNumber) {
    toast.error('请填写完整信息');
    return;
  }

  // 如果未勾选协议，自动打开协议弹窗
  if (!agreed.value) {
    pendingSubmit.value = true;
    showAgreementModal.value = true;
    return;
  }

  if (!seniorId.value) {
    toast.error('邀请信息已失效');
    return;
  }

  try {
    toast.success('提交中...');

    await submitInfoApi({
      type: 'personal',
      name: formData.value.name,
      introduction: '',
      detail_info: {
        id_number: formData.value.idNumber,
        wechat: formData.value.wechat,
      },
      senior_id: seniorId.value,
    });

    toast.success('提交成功');
    setTimeout(() => {
      router.push('/result/success');
    }, 1000);
  } catch (error: any) {
    console.error('提交失败:', error);
    const errorMessage = error?.response?.data?.message || '提交失败，请稍后重试';
    toast.error(errorMessage);
  }
}

function contactService() {
  window.location.href = 'https://work.weixin.qq.com/kfid/kfc2f7022befdbcb9e2';
}
</script>

<style scoped>
.invite-page {
  background: var(--bg-0);
  min-height: 100vh;
  width: 100%;
  max-width: 375px;
  margin: 0 auto;
  position: relative;
  display: flex;
  flex-direction: column;
  padding-top: 81px; /* AppHeader高度56px + margin 15px + 10px */
}

.main-content {
  flex: 1;
  padding: 16px;
  padding-bottom: 100px;
  overflow: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.welcome-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.welcome-banner-img {
  width: 343px;
  height: 123px;
}

.welcome-title {
  font-family: var(--font-family-pingfang);
  font-size: 26px;
  font-weight: var(--font-weight-semibold);
  line-height: 32px;
  color: var(--primary-6);
  margin: 0;
}

.commission-info {
  font-family: var(--font-family-pingfang);
  font-size: 16px;
  line-height: normal;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  text-align: center;
}

.commission-info .highlight {
  font-weight: var(--font-weight-semibold);
  background: linear-gradient(to right, var(--primary-6), #fff2cc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.binding-info {
  font-family: var(--font-family-dingtalk);
  font-size: 16px;
  line-height: normal;
  color: rgba(255, 227, 149, 0.5);
  letter-spacing: 0.8px;
  margin: 0;
}

.invite-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 0;
}

.form-title {
  font-family: var(--font-family-pingfang);
  font-size: 20px;
  font-weight: var(--font-weight-regular);
  line-height: 1;
  color: var(--primary-6);
  margin: 0 0 12px 0;
  width: 100%;
  text-align: center;
}

.agreement-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  margin-top: 0;
}

.agreement-text {
  font-family: var(--font-family-primary);
  font-size: 14px;
  font-weight: var(--font-weight-regular);
  line-height: 26px;
  color: var(--basic-6);
}

.agreement-link {
  color: var(--primary-6);
  cursor: pointer;
  text-decoration: none;
}

.agreement-link:hover {
  text-decoration: underline;
}

.footer-actions {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: stretch;
  gap: 10px;
  padding: 14px 20px;
  background: var(--basic-0);
  width: 375px;
  max-width: 100%;
  z-index: 99;
  box-sizing: border-box;
}

.btn-contact {
  flex-shrink: 0;
}

.btn-submit {
  flex: 1;
  min-width: 0;
}
</style>

