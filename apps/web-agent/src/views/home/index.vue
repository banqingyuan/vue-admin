<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { Toast, ToastType } from '#/components';
import { useAuthingClient } from '#/composables/useAuthingClient';
import { useMemberRecharge } from '#/composables/useMemberRecharge';
import {
  generatePackageId,
  MemberDuration,
  MemberType,
} from '#/services/member';

// 状态
const authingClient = useAuthingClient();
const { loading, rechargeMember } = useMemberRecharge();

const memberType = ref(MemberType.SVIP);
const duration = ref(MemberDuration.ThirtyDays);
const userInput = ref('');
const inputError = ref('');
const showConfirm = ref(false);
const showLogoutModal = ref(false);
const showAgencyModal = ref(false);
const maskedPhoneNumber = ref('');
const activePage = ref<'会员充值' | '充值记录' | '库存'>('会员充值');
const userRole = ref<null | string | string[]>(null);

// Toast 状态
const toastVisible = ref(false);
const toastMessage = ref('');
const toastType = ref(ToastType.SUCCESS);

// 用户 ID 验证正则
const USER_ID_REGEX = /^\d{8}$/;

// 检查是否为管理员
const isAdmin = computed(() => {
  if (!userRole.value) return false;
  if (Array.isArray(userRole.value)) {
    return userRole.value.includes('admin');
  }
  return userRole.value === 'admin';
});

// 初始化
onMounted(() => {
  const userInfo = authingClient.getUserInfo();
  if (userInfo) {
    if (userInfo.phone_number) {
      maskedPhoneNumber.value = maskPhoneNumber(userInfo.phone_number);
    }
    userRole.value = authingClient.getUserRole();
  } else {
    window.location.href = '/login-buffer';
  }
});

// 手机号脱敏
function maskPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber || phoneNumber.length < 11) return phoneNumber;
  return `${phoneNumber.slice(0, 3)}***${phoneNumber.slice(7)}`;
}

// 获取会员有效期显示名称
function getDurationText(dur: MemberDuration): string {
  switch (dur) {
    case MemberDuration.OneDay: {
      return '1天';
    }
    case MemberDuration.SevenDays: {
      return '7天';
    }
    case MemberDuration.ThirtyDays: {
      return '月卡';
    }
    case MemberDuration.ThreeDays: {
      return '3天';
    }
    default: {
      return `${dur}天`;
    }
  }
}

// 显示 Toast
function displayToast(message: string, type: ToastType = ToastType.SUCCESS) {
  toastMessage.value = message;
  toastType.value = type;
  toastVisible.value = true;
}

// 验证输入
function validateInput(input: string): boolean {
  return USER_ID_REGEX.test(input);
}

// 处理输入变化
function handleInputChange(e: Event) {
  const target = e.target as HTMLInputElement;
  userInput.value = target.value.trim();

  inputError.value =
    userInput.value && !validateInput(userInput.value)
      ? '请输入有效的用户 ID（8位数字）'
      : '';
}

// 显示确认弹窗
function handleShowConfirm() {
  if (!userInput.value) {
    inputError.value = '请输入用户 ID';
    return;
  }

  if (!validateInput(userInput.value)) {
    inputError.value = '请输入有效的用户 ID（8位数字）';
    return;
  }

  showConfirm.value = true;
}

// 确认充值
async function handleConfirmRecharge() {
  showConfirm.value = false;

  const packageId = generatePackageId(memberType.value, duration.value);
  const result = await rechargeMember({
    userId: Number.parseInt(userInput.value, 10),
    packageId,
  });

  if (result.success) {
    displayToast(result.message, ToastType.SUCCESS);
    userInput.value = '';
    inputError.value = '';
  } else {
    displayToast(result.message || '充值失败，请重试', ToastType.ERROR);
  }
}

// 显示/关闭退出登录弹窗
function handleShowLogoutModal() {
  showLogoutModal.value = true;
}

function handleCloseLogoutModal() {
  showLogoutModal.value = false;
}

// 退出登录
function handleLogout() {
  showLogoutModal.value = false;
  displayToast('正在退出登录...', ToastType.INFO);
  const logoutUrl = authingClient.buildLogoutUrl();
  window.location.href = logoutUrl;
}

// 显示/关闭代理合作页面
function handleShowAgencyModal() {
  showAgencyModal.value = true;
}

function handleCloseAgencyModal() {
  showAgencyModal.value = false;
}

// 复制微信号
function copyWechat() {
  navigator.clipboard.writeText('aijpq11');
  console.warn('微信号已复制');
}
</script>

<template>
  <div class="home-container">
    <!-- 头部 -->
    <div class="header">
      <div class="logo-container">
        <div class="app-logo">
          <img
            alt="AI扑克记牌器"
            class="logo-image"
            src="/assets/poker-logo.png"
          />
          <span class="title">AI扑克记牌器</span>
          <img
            alt="代理合作"
            class="agency-tag-img"
            src="/assets/agency-tag.png"
          />
        </div>
      </div>
      <div class="header-right">
        <div class="headphone-icon" @click="handleShowAgencyModal">
          <img alt="客服" src="/assets/headphone.png" />
        </div>
        <div class="profile-icon" @click="handleShowLogoutModal">
          <img alt="用户头像" src="/assets/profile-placeholder.png" />
        </div>
      </div>
    </div>

    <!-- Tabs 切换 -->
    <div class="segment-container">
      <div class="custom-segmented">
        <button
          v-for="page in ['会员充值', '库存', '充值记录']"
          :key="page"
          class="segment-item"
          :class="[{ active: activePage === page }]"
          @click="activePage = page as any"
        >
          {{ page }}
        </button>
      </div>
    </div>

    <!-- 充值记录提示 -->
    <div v-if="activePage === '充值记录'" class="page-tip">
      <img alt="提示" class="alert-icon" src="/assets/alert.png" />
      仅可撤消 24h 内的订单！
    </div>

    <!-- 会员充值内容 -->
    <div v-if="activePage === '会员充值'" class="recharge-content">
      <h2 class="section-title">♠ 会员充值</h2>

      <div class="member-type-section">
        <div class="section-label">会员类型</div>
        <div class="option-buttons">
          <button
            class="option-button"
            :class="[{ active: memberType === MemberType.VIP }]"
            @click="memberType = MemberType.VIP"
          >
            VIP
          </button>
          <button
            class="option-button"
            :class="[{ active: memberType === MemberType.SVIP }]"
            @click="memberType = MemberType.SVIP"
          >
            SVIP
          </button>
        </div>
      </div>

      <div class="duration-section">
        <div class="section-label">会员有效期</div>
        <div class="option-buttons">
          <button
            class="option-button"
            :class="[{ active: duration === MemberDuration.ThirtyDays }]"
            @click="duration = MemberDuration.ThirtyDays"
          >
            月卡
          </button>
          <button
            class="option-button"
            :class="[{ active: duration === MemberDuration.SevenDays }]"
            @click="duration = MemberDuration.SevenDays"
          >
            7天
          </button>
          <button
            class="option-button"
            :class="[{ active: duration === MemberDuration.ThreeDays }]"
            @click="duration = MemberDuration.ThreeDays"
          >
            3天
          </button>
          <button
            v-if="isAdmin"
            class="option-button"
            :class="[{ active: duration === MemberDuration.OneDay }]"
            @click="duration = MemberDuration.OneDay"
          >
            1天
          </button>
        </div>
      </div>

      <div class="user-id-section">
        <div class="section-label">输入用户 ID</div>
        <input
          v-model="userInput"
          class="user-id-input"
          :class="[{ error: !!inputError }]"
          placeholder="请输入用户ID（8位数字）"
          type="text"
          @input="handleInputChange"
        />
        <div v-if="inputError" class="input-hint-container">
          <span class="input-error">{{ inputError }}</span>
        </div>
      </div>

      <button
        class="recharge-button"
        :class="[{ loading }]"
        :disabled="loading || !!inputError || !userInput"
        @click="handleShowConfirm"
      >
        {{ loading ? '充值中...' : '立即充值' }}
      </button>
    </div>

    <!-- 库存页面 -->
    <div v-if="activePage === '库存'" class="inventory-placeholder">
      <p>库存功能正在加载...</p>
    </div>

    <!-- 充值记录页面 -->
    <div v-if="activePage === '充值记录'" class="records-placeholder">
      <p>充值记录正在加载...</p>
    </div>

    <!-- 确认弹窗 -->
    <div v-if="showConfirm" class="modal-overlay">
      <div class="confirm-modal">
        <h2 class="confirm-title">充值信息确认</h2>
        <div class="confirm-info-item">
          <span class="confirm-label">充值用户 ID</span>
          <span class="confirm-value">{{ userInput }}</span>
        </div>
        <div class="confirm-info-item">
          <span class="confirm-label">会员类型</span>
          <span class="confirm-value">{{ memberType.toUpperCase() }}</span>
        </div>
        <div class="confirm-info-item">
          <span class="confirm-label">类型</span>
          <span class="confirm-value">{{ getDurationText(duration) }}</span>
        </div>
        <div class="confirm-buttons">
          <button class="cancel-button" @click="showConfirm = false">
            取消
          </button>
          <button class="confirm-button" @click="handleConfirmRecharge">
            确认立即充值
          </button>
        </div>
      </div>
    </div>

    <!-- 退出登录弹窗 -->
    <div
      v-if="showLogoutModal"
      class="bottom-modal-overlay"
      @click="handleCloseLogoutModal"
    >
      <div class="bottom-modal" @click.stop>
        <div class="user-account-info">
          当前登录账号：{{ maskedPhoneNumber }}
        </div>
        <button class="logout-button" @click="handleLogout">退出登录</button>
        <button class="cancel-logout-button" @click="handleCloseLogoutModal">
          取消
        </button>
      </div>
    </div>

    <!-- 代理合作页面 -->
    <div
      v-if="showAgencyModal"
      class="slide-in-container"
      @click="handleCloseAgencyModal"
    >
      <div class="slide-in-page" @click.stop>
        <div class="slide-in-header">
          <button class="back-button" @click="handleCloseAgencyModal">
            <span class="back-arrow">←</span>
          </button>
          <h2 class="slide-in-title">代理合作</h2>
        </div>
        <div class="agency-content">
          <div class="qr-code-container">
            <img
              alt="代理合作微信二维码"
              class="agency-qrcode"
              src="/assets/agency-qr.png"
            />
          </div>
          <div class="agency-text">合作微信二维码</div>
          <div class="wechat-id-container" @click.stop="copyWechat">
            <img alt="微信" class="wechat-icon" src="/assets/wechat.svg" />
            <div class="wechat-id-label">合作微信号：</div>
            <div class="wechat-id">aijpq11</div>
            <img alt="复制" class="copy-icon" src="/assets/copy.png" />
          </div>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <Toast
      :visible="toastVisible"
      :message="toastMessage"
      :type="toastType"
      @close="toastVisible = false"
    />

    <!-- 页脚 -->
    <footer class="footer">
      <a
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noopener noreferrer"
      >
        浙ICP备2025148163号
      </a>
    </footer>
  </div>
</template>

<style scoped>
@import '../../styles/home.css';
</style>
