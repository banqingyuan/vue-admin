<template>
  <div class="login-page">
    
    <!-- Main Content -->
    <div class="login-content">
      <!-- Logo & Title Section -->
      <div class="header-section">
        <div class="logo-container">
          <img src="/logo.png" alt="Logo" class="logo-image" />
        </div>
        <div class="title-section">
          <h1 class="main-title">代理合作</h1>
          <p class="subtitle">欢迎使用【AI 扑克记牌器】代理合作平台</p>
        </div>
      </div>

      <!-- Form Section -->
      <form class="login-form" @submit.prevent="onSubmit">
        <!-- Phone Input -->
        <div class="input-wrapper phone-input">
          <div class="input-container">
            <img src="/human.svg" alt="" class="input-icon" />
            <input
              v-model.trim="phone"
              type="tel"
              inputmode="numeric"
              placeholder="请输入手机号"
              class="input-field"
            />
          </div>
        </div>

        <!-- Code Input & Send Button -->
        <div class="code-section">
          <div class="input-wrapper code-input">
            <div class="input-container">
              <img src="/message.svg" alt="" class="input-icon" />
              <input
                v-model.trim="code"
                type="text"
                inputmode="numeric"
                maxlength="4"
                placeholder="请输入验证码"
                class="input-field"
                @input="handleCodeInput"
              />
            </div>
          </div>
          <BaseButton
            type="primary"
            size="medium"
            :disabled="countdown > 0 || sending || !phone"
            :title="countdown > 0 ? `${countdown}s` : '发送验证码'"
            @click="sendCode"
          />
        </div>

        <!-- Agreement Checkbox -->
        <div class="agreement-section">
          <BaseCheckbox v-model="agreed">
            <span class="agreement-text">
              <span class="text-white">我已阅读且同意</span>
              《<a href="https://www.aijpq.com/agreements/user-agreement.html" target="_blank" class="agreement-link" @click.stop>用户协议</a>》《<a href="https://www.aijpq.com/agreements/privacy-policy.html" target="_blank" class="agreement-link" @click.stop>隐私条款</a>》
            </span>
          </BaseCheckbox>
        </div>

        <!-- Submit Button -->
        <BaseButton
          type="primary"
          size="medium"
          html-type="submit"
          :disabled="!canSubmit"
          title="立即登录"
          block
        />
      </form>
    </div>

    <!-- Footer Section -->
    <div class="footer-section">
      <BaseButton
        type="secondary"
        size="medium"
        class="customer-service-btn"
        @click="contactService"
      >
        <template #icon-left>
          <img src="/wechat.png" alt="" class="icon-customer" />
        </template>
        联系「代理合作」专属客服
      </BaseButton>
      <div class="company-info">
        <span class="info-text">杭州一目可识科技有限公司</span>
        <div class="divider" />
        <span class="info-text">浙ICP备2025148163号</span>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { sendCodeApi, loginApi } from '#/api/auth';
import { getStatusApi, validateSeniorIdApi } from '#/api/promoter';
import { useAuthStore } from '#/store/auth';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from '#/composables/useToast';
import BaseButton from '#/components/ui/BaseButton.vue';
import BaseCheckbox from '#/components/ui/BaseCheckbox.vue';

const toast = useToast();

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const phone = ref('');
const code = ref('');
const agreed = ref(false);
const sending = ref(false);
const countdown = ref(0);
let timer: number | null = null;

function startCountdown(sec = 60) {
  countdown.value = sec;
  timer && window.clearInterval(timer);
  timer = window.setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0 && timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }, 1000);
}

const canSubmit = computed(() => phone.value && code.value && agreed.value);

function handleCodeInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const value = input.value.replace(/\D/g, ''); // 只保留数字
  code.value = value.slice(0, 4); // 限制最多4位
  input.value = code.value; // 更新输入框显示
}

async function sendCode() {
  if (!phone.value) return;
  sending.value = true;
  try {
    await sendCodeApi({ phone_number: phone.value, allow_register_role: 'promoter' });
    startCountdown();
  } finally {
    sending.value = false;
  }
}

async function onSubmit() {
  if (!canSubmit.value) return;
  
  try {
    const data = await loginApi({ 
      phone_number: phone.value, 
      code: code.value, 
      allow_register_role: 'promoter' 
    });
    auth.setToken(data.token);
    auth.setUser(data.user);
    
    // 检查URL中是否有 senior_id 参数
    const seniorIdParam = route.query.senior_id as string;
    
    if (seniorIdParam) {
      // 如果有 senior_id，验证其有效性
      try {
        const response = await validateSeniorIdApi(seniorIdParam);
        
        if (response.valid) {
          // 有效的邀请链接，跳转到邀请页面
          router.replace(`/invite-entry?senior_id=${seniorIdParam}`);
          return;
        }
        // 无效的 senior_id，按正常流程处理
      } catch (error) {
        console.error('验证 senior_id 失败:', error);
        // 验证失败，按正常流程处理
      }
    }
    
    // 没有 senior_id 或验证失败，检查申请状态
    try {
      const statusInfo = await getStatusApi();
      const status = statusInfo.status;
      
      // 根据状态跳转到不同页面
      if (status === 'not_submitted') {
        // 未提交 -> 申请页面
        router.replace('/apply/personal');
      } else if (status === 'pending') {
        // 待审核状态 -> 提交成功页面
        router.replace('/result/success');
      } else if (status === 'reject') {
        // 拒绝状态 -> 审核拒绝页面
        router.replace('/result/fail');
      } else if (status === 'active' || status === 'pass') {
        // 审核通过 -> 跳转到代理主页
        router.replace('/agent/home');
      } else {
        // 其他未知状态 -> 申请页面
        router.replace('/apply/personal');
      }
    } catch (statusError) {
      console.error('获取状态失败:', statusError);
      // 状态获取失败，默认跳转到申请页面
      router.replace('/apply/personal');
    }
  } catch (error: any) {
    console.error('登录失败:', error);
    const errorMessage = error?.response?.data?.message || '登录失败，请检查手机号或验证码';
    toast.error(errorMessage);
  }
}

function contactService() {
  router.push('/contact-service');
}

</script>

<style scoped>
.login-page {
  background: var(--basic-0);
  min-height: 100vh;
  width: 100%;
  max-width: var(--container-width);
  margin: 0 auto;
  position: relative;
  display: flex;
  flex-direction: column;
}

.login-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 24px 20px;
  overflow: auto;
  box-sizing: border-box;
  height: 724px;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 374px;
}

.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
  margin-bottom: 60px;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-image {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-15);
  object-fit: contain;
}

.title-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--basic-10);
}

.main-title {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-22);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-32);
  text-align: center;
  white-space: nowrap;
  margin: 0;
}

.subtitle {
  font-family: 'PingFang HK', var(--font-family-primary);
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-regular);
  line-height: normal;
  opacity: 0.7;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
}

.input-wrapper {
  width: 100%;
}

.input-container {
  background: var(--basic-0);
  border: 1px solid var(--basic-4);
  border-radius: var(--radius-12);
  display: flex;
  align-items: center;
  overflow: hidden;
  width: 100%;
  transition: all 0.2s;
}

.input-container:focus-within {
  background: var(--primary-6-alpha-5);
  border-color: var(--primary-6);
}

.input-icon {
  width: 14px;
  height: 14px;
  margin-left: var(--spacing-12);
  flex-shrink: 0;
}

.input-field {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 10px 12px;
  font-family: var(--font-family-primary);
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-24);
  color: var(--basic-10);
  min-width: 0;
}

.input-field::placeholder {
  color: var(--basic-5);
}

.code-section {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
}

.code-input {
  flex: 1;
}

.agreement-section {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 326px;
}

.agreement-text {
  font-family: var(--font-family-primary);
  font-size: 12px;
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-18);
  color: var(--basic-6);
}

.text-white {
  color: var(--basic-10);
}

.agreement-link {
  color: var(--primary-6);
  text-decoration: underline;
  text-decoration-skip-ink: none;
  text-underline-position: from-font;
  cursor: pointer;
}

.agreement-link:visited {
  color: var(--primary-6);
}

.footer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-10);
  width: 326px;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.customer-service-btn {
  width: auto;
  padding-left: 12px;
  padding-right: 12px;
}

.icon-customer {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.company-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-8);
  width: 100%;
}

.info-text {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-12);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-21);
  color: var(--basic-5);
}

.divider {
  background: var(--basic-3);
  width: 1px;
  height: 12px;
}

.home-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: var(--home-bar-height);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 8px;
  box-sizing: border-box;
}

</style>
