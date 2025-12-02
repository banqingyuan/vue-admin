<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
          <!-- Header -->
          <div class="modal-header">
            <h3 class="modal-title">请确认信息无误</h3>
            <button class="close-btn" @click="handleClose">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Alert -->
          <div class="alert-section">
            <div class="alert-warning">
              <svg class="alert-icon" viewBox="0 0 18 18" fill="currentColor">
                <circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <path d="M9 5V9M9 11V11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <p class="alert-text">请确保填写无误后再提交。</p>
            </div>
          </div>

          <!-- Content -->
          <div class="modal-content">
            <!-- Personal Type -->
            <template v-if="type === 'personal'">
              <div class="info-item">
                <span class="info-label">真实姓名</span>
                <span class="info-value">{{ data.name }}</span>
              </div>
              <div class="divider" />
              <div class="info-item">
                <span class="info-label">身份证号</span>
                <span class="info-value">{{ data.idNumber }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">联系电话</span>
                <span class="info-value">{{ data.phone }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">联系微信号</span>
                <span class="info-value">{{ data.wechat }}</span>
              </div>
            </template>

            <!-- Company Type -->
            <template v-else-if="type === 'company'">
              <div class="info-item">
                <span class="info-label">企业名称</span>
                <span class="info-value">{{ data.companyName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">统一社会信用代码</span>
                <span class="info-value">{{ data.businessLicenseNumber }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">法人名称</span>
                <span class="info-value">{{ data.legalPersonName }}</span>
              </div>
              <div class="divider" />
              <div class="info-item">
                <span class="info-label">联系人姓名</span>
                <span class="info-value">{{ data.contactName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">联系电话</span>
                <span class="info-value">{{ data.phone }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">联系微信号</span>
                <span class="info-value">{{ data.wechat }}</span>
              </div>
            </template>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <BaseButton
              type="secondary"
              size="medium"
              class="btn-cancel"
              @click="handleClose"
            >
              我要修改
            </BaseButton>
            <BaseButton
              type="primary"
              size="medium"
              class="btn-confirm"
              @click="handleConfirm"
            >
              确认无误，立即提交
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import BaseButton from './ui/BaseButton.vue';

interface PersonalData {
  name: string;
  idNumber: string;
  phone: string;
  wechat: string;
}

interface CompanyData {
  companyName: string;
  legalPersonName: string;
  businessLicenseNumber: string;
  contactName: string;
  phone: string;
  wechat: string;
}

interface Props {
  visible: boolean;
  type: 'personal' | 'company';
  data: PersonalData | CompanyData;
}

defineProps<Props>();

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();

function handleClose() {
  emit('close');
}

function handleConfirm() {
  emit('confirm');
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-container {
  background: var(--basic-2);
  border: 1px solid var(--basic-3);
  border-radius: 12px;
  width: 100%;
  max-width: 335px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--basic-2);
  gap: 16px;
}

.modal-title {
  font-family: var(--font-family-primary);
  font-size: 16px;
  font-weight: var(--font-weight-semibold);
  line-height: 24px;
  color: var(--basic-10);
  margin: 0;
  flex: 1;
}

.close-btn {
  width: 24px;
  height: 24px;
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--basic-10);
  flex-shrink: 0;
  border-radius: 4px;
}

.close-btn:hover {
  background: var(--basic-3);
}

.close-btn svg {
  width: 16px;
  height: 16px;
}

/* Alert */
.alert-section {
  padding: 0 20px 10px;
}

.alert-warning {
  background: var(--warning-11);
  border: 1px solid var(--warning-8);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-icon {
  width: 18px;
  height: 18px;
  color: var(--warning-8);
  flex-shrink: 0;
}

.alert-text {
  font-family: var(--font-family-primary);
  font-size: 14px;
  font-weight: var(--font-weight-regular);
  line-height: 22px;
  color: var(--basic-10);
  margin: 0;
  flex: 1;
}

/* Content */
.modal-content {
  padding: 0 20px;
  overflow-y: auto;
  flex: 1;
}

.info-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--basic-2);
  gap: 16px;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-family: var(--font-family-primary);
  font-size: 14px;
  font-weight: var(--font-weight-regular);
  line-height: 26px;
  color: var(--basic-6);
  flex-shrink: 0;
}

.info-value {
  font-family: var(--font-family-primary);
  font-size: 16px;
  font-weight: var(--font-weight-regular);
  line-height: 24px;
  color: var(--basic-10);
  text-align: right;
  word-break: break-all;
}

.divider {
  height: 1px;
  width: 100%;
  background: linear-gradient(
    to right,
    rgba(255, 227, 149, 0) 0%,
    rgba(255, 227, 149, 0.5) 50%,
    rgba(255, 227, 149, 0) 100%
  );
  opacity: 0.5;
}

/* Footer */
.modal-footer {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-cancel {
  flex-shrink: 0;
  padding: 7px 17px;
  border-radius: 10px;
}

.btn-confirm {
  flex: 1;
  padding: 7px 17px;
  border-radius: 10px;
  min-width: 0;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from .modal-container {
  transform: scale(0.9);
}

.modal-fade-leave-to .modal-container {
  transform: scale(0.9);
}
</style>

