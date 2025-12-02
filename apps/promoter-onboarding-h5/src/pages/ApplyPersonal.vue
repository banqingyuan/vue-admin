<template>
  <div class="apply-page">
    <!-- Header - Fixed -->
      <AppHeader />

    <!-- Main Content -->
    <div class="main-content">
      <!-- Poster Banner -->
      <PosterBanner />

      <!-- Form -->
      <form class="apply-form" @submit.prevent="onSubmit">
        <!-- 入驻类型 -->
        <section class="form-section type-section">
          <h3 class="section-title">入驻类型</h3>
          <div class="radio-group">
            <BaseRadio v-model="type" value="personal" :checked="type === 'personal'">
              个人
            </BaseRadio>
            <BaseRadio v-model="type" value="company" :checked="type === 'company'">
              企业
            </BaseRadio>
          </div>
          <p class="section-hint">
            {{ type === 'personal' ? '纳税主体为个人，收益提现到个人账户' : '纳税主体为企业，签约合同，收益提现为对公转账' }}
          </p>
        </section>

        <!-- 申请信息 -->
        <section class="form-section info-section">
          <h3 class="section-title">申请信息</h3>
          
          <!-- 个人类型字段 -->
          <template v-if="type === 'personal'">
            <BaseInput
              v-model="personal.name"
              label="真实姓名"
              placeholder="请输入身份证姓名"
              required
            />
            <BaseInput
              v-model="personal.idNumber"
              label="身份证号"
              placeholder="请输入身份证号"
              type="text"
              required
            />
            <BaseInput
              v-model="personal.introduction"
              label="资源介绍"
              type="textarea"
              placeholder="请简述您的业务能力、销售能力、 运营能力、资源储备能力等情况。"
              :maxlength="200"
              :rows="4"
              show-count
            />
          </template>

          <!-- 公司类型字段 -->
          <template v-else>
            <BaseInput
              v-model="company.companyName"
              label="企业名称"
              placeholder="请输入营业执照中公司全称"
              required
            />
            <BaseInput
              v-model="company.businessLicenseNumber"
              label="统一社会信用代码"
              placeholder="请输入营业执照上的编号"
              type="text"
              required
            />
            <BaseInput
              v-model="company.legalPersonName"
              label="法人名称"
              placeholder="请输入法人姓名"
              required
            />
            <BaseInput
              v-model="company.introduction"
              label="公司介绍"
              type="textarea"
              placeholder="请简述公司的业务能力、销售能力、 运营能力、资源储备能力等情况。"
              :maxlength="200"
              :rows="4"
              show-count
            />
          </template>
        </section>

        <!-- 联系方式 -->
        <section class="form-section contact-section">
          <h3 class="section-title">联系方式</h3>
          
          <!-- 公司类型多一个"联系人姓名"字段 -->
          <template v-if="type === 'company'">
            <BaseInput
              v-model="company.contactName"
              label="联系人姓名"
              placeholder="请输入联系人姓名"
              required
            />
          </template>
          
          <BaseInput
            v-model="wechat"
            label="微信号"
            placeholder="请输入微信号"
            required
          />
        </section>

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
        提交申请
      </BaseButton>
    </div>

    <!-- Agreement Modal (协议弹窗) -->
    <AgreementModal 
      :visible="showAgreementModal" 
      @close="showAgreementModal = false"
      @confirm="handleAgreementConfirm"
    />
    
    <!-- Confirm Modal -->
    <ConfirmModal
      v-if="showConfirmModal"
      :visible="showConfirmModal"
      :type="type"
      :data="confirmData"
      @close="showConfirmModal = false"
      @confirm="handleFinalSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { submitInfoApi } from '#/api/promoter';
import { useToast } from '#/composables/useToast';
import { useAuthStore } from '#/store/auth';
import AppHeader from '#/components/ui/AppHeader.vue';
import PosterBanner from '#/components/PosterBanner.vue';
import BaseButton from '#/components/ui/BaseButton.vue';
import BaseInput from '#/components/ui/BaseInput.vue';
import BaseRadio from '#/components/ui/BaseRadio.vue';
import BaseCheckbox from '#/components/ui/BaseCheckbox.vue';
import AgreementModal from '#/components/AgreementModal.vue';
import ConfirmModal from '#/components/ConfirmModal.vue';

const toast = useToast();

const router = useRouter();
const type = ref<'personal' | 'company'>('personal');

// 个人类型表单数据
const personal = ref({
  name: '',
  idNumber: '',
  introduction: '',
});

// 公司类型表单数据
const company = ref({
  companyName: '',
  legalPersonName: '',
  businessLicenseNumber: '',
  introduction: '',
  contactName: '',
});

const wechat = ref('');
const agreed = ref(false);
const showConfirmModal = ref(false);
const showAgreementModal = ref(false);
const pendingSubmit = ref(false); // 标记是否因未勾选协议而打开弹窗

// 用于存储用户手机号（从auth store获取）
const auth = useAuthStore();
const userPhone = computed(() => auth.user?.phone || '');

// 确认弹窗数据
const confirmData = computed(() => {
  if (type.value === 'personal') {
    return {
      name: personal.value.name,
      idNumber: personal.value.idNumber,
      phone: userPhone.value,
      wechat: wechat.value,
    };
  } else {
    return {
      companyName: company.value.companyName,
      legalPersonName: company.value.legalPersonName,
      businessLicenseNumber: company.value.businessLicenseNumber,
      contactName: company.value.contactName,
      phone: userPhone.value,
      wechat: wechat.value,
    };
  }
});

// 当类型切换时,重置表单数据
watch(type, () => {
  personal.value = {
    name: '',
    idNumber: '',
    introduction: '',
  };
  company.value = {
    companyName: '',
    legalPersonName: '',
    businessLicenseNumber: '',
    introduction: '',
    contactName: '',
  };
  wechat.value = '';
  agreed.value = false;
});

const canSubmit = computed(() => {
  if (!agreed.value || !wechat.value) return false;
  
  if (type.value === 'personal') {
    return personal.value.name && personal.value.idNumber;
  } else {
    return company.value.companyName && company.value.legalPersonName && company.value.businessLicenseNumber && company.value.contactName;
  }
});

function contactService() {
  window.location.href = 'https://work.weixin.qq.com/kfid/kfc2f7022befdbcb9e2';
}

// 确认协议
function handleAgreementConfirm() {
  showAgreementModal.value = false;
  agreed.value = true;
  
  // 如果是因为未勾选协议而打开的弹窗，点击确认后自动显示确认弹窗
  if (pendingSubmit.value) {
    pendingSubmit.value = false;
    // 延迟一下，让协议弹窗先关闭
    setTimeout(() => {
      showConfirmModal.value = true;
    }, 100);
  }
}

// 点击提交按钮 - 显示确认弹窗
function onSubmit() {
  // 先检查是否填写完整
  const isFormValid = type.value === 'personal' 
    ? (personal.value.name && personal.value.idNumber && wechat.value)
    : (company.value.companyName && company.value.legalPersonName && company.value.businessLicenseNumber && company.value.contactName && wechat.value);
  
  if (!isFormValid) {
    toast.error('请填写完整信息');
    return;
  }
  
  // 如果未勾选协议，自动打开协议弹窗
  if (!agreed.value) {
    pendingSubmit.value = true;
    showAgreementModal.value = true;
    return;
  }

  // 显示确认弹窗
  showConfirmModal.value = true;
}

// 确认后实际提交
async function handleFinalSubmit() {
  showConfirmModal.value = false;
  
  try {
    toast.success('提交中...');
    
    if (type.value === 'personal') {
      await submitInfoApi({
        type: 'personal',
        name: personal.value.name,
        introduction: personal.value.introduction,
        detail_info: {
          id_number: personal.value.idNumber,
          wechat: wechat.value,
        },
      });
    } else {
      await submitInfoApi({
        type: 'company',
        name: company.value.companyName,
        introduction: company.value.introduction,
        detail_info: {
          company_name: company.value.companyName,
          business_license_number: company.value.businessLicenseNumber,
          legal_person: company.value.legalPersonName,
          contact_name: company.value.contactName,
          wechat: wechat.value,
        },
      });
    }
    
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
</script>

<style scoped>
.apply-page {
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

.apply-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-bottom: 0;
}

.type-section {
  padding-bottom: 24px;
  gap: 12px;
}

.info-section,
.contact-section {
  padding-bottom: 0;
  gap: 0;
}

.section-title {
  font-family: var(--font-family-primary);
  font-size: 20px;
  font-weight: var(--font-weight-regular);
  line-height: 1;
  color: var(--primary-6);
  margin: 0 0 12px 0;
  width: 100%;
  text-align: center;
}

.radio-group {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  overflow: hidden;
}

.section-hint {
  font-family: var(--font-family-primary);
  font-size: 14px;
  font-weight: var(--font-weight-regular);
  line-height: 22px;
  color: var(--basic-10);
  width: 100%;
  margin: 0;
  white-space: pre-wrap;
  text-align: left;
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
