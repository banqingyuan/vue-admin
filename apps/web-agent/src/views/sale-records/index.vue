<script setup lang="ts">
import type { SaleRecord } from '#/api/types';

import { onMounted, ref } from 'vue';

import { agentApi } from '#/api';
import { formatDateTime } from '#/api/utils';

const records = ref<SaleRecord[]>([]);
const loading = ref(true);
const error = ref<null | string>(null);
const showCancelModal = ref(false);
const selectedRecord = ref<null | SaleRecord>(null);
const cancelError = ref<null | string>(null);

// 格式化套餐名称
function formatPackageName(skuName: string): string {
  let memberType = '';
  if (skuName.includes('VIP')) {
    memberType = skuName.includes('SVIP') ? 'SVIP' : 'VIP';
  }

  let duration = '';
  if (skuName.includes('单日')) {
    duration = '单日';
  } else if (skuName.includes('3天')) {
    duration = '3天';
  } else if (skuName.includes('7天')) {
    duration = '7天';
  } else if (skuName.includes('月卡')) {
    duration = '月卡';
  }

  return `${memberType} ${duration}`;
}

// 显示撤销确认弹窗
function showCancelConfirm(record: SaleRecord) {
  selectedRecord.value = record;
  showCancelModal.value = true;
  cancelError.value = null;
}

// 确认撤销充值
async function confirmCancel() {
  if (!selectedRecord.value) return;

  try {
    const result = await agentApi.cancelSale(selectedRecord.value.id);
    if (result.success) {
      // 刷新记录列表
      await fetchRecords();
      showCancelModal.value = false;
      selectedRecord.value = null;
    } else {
      cancelError.value = result.message || '撤销失败';
    }
  } catch (error_) {
    console.error('撤销充值失败:', error_);
    cancelError.value =
      error_ instanceof Error ? error_.message : '撤销失败，请重试';
  }
}

// 获取销售记录
async function fetchRecords() {
  loading.value = true;
  error.value = null;

  try {
    const data = await agentApi.getSales();
    records.value = data;
  } catch (error_) {
    console.error('获取销售记录失败:', error_);
    error.value = '获取销售记录失败，请稍后重试';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchRecords);
</script>

<template>
  <div class="sale-records-container">
    <div v-if="loading" class="loading-container">
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="records.length === 0" class="empty-container">
      <p>暂无充值记录</p>
    </div>

    <div v-else class="records-list">
      <div v-for="record in records" :key="record.id" class="record-item">
        <div class="record-header">
          <span class="package-name">{{
            formatPackageName(record.sku_name)
          }}</span>
          <span class="record-status" :class="[record.status]">
            {{ record.status === 'completed' ? '已完成' : '处理中' }}
          </span>
        </div>
        <div class="record-info">
          <div class="info-row">
            <span class="label">用户 ID:</span>
            <span class="value">{{ record.user_id }}</span>
          </div>
          <div class="info-row">
            <span class="label">订单号:</span>
            <span class="value">{{ record.transaction_id }}</span>
          </div>
          <div class="info-row">
            <span class="label">时间:</span>
            <span class="value">{{ formatDateTime(record.created_at) }}</span>
          </div>
        </div>
        <button
          v-if="record.can_cancel"
          class="cancel-button"
          @click="showCancelConfirm(record)"
        >
          撤销充值
        </button>
      </div>
    </div>

    <!-- 撤销确认弹窗 -->
    <div v-if="showCancelModal" class="modal-overlay">
      <div class="confirm-modal">
        <h2 class="confirm-title">撤销充值确认</h2>
        <div v-if="selectedRecord" class="confirm-info">
          <div class="confirm-info-item">
            <span class="confirm-label">充值用户 ID</span>
            <span class="confirm-value">{{ selectedRecord.user_id }}</span>
          </div>
          <div class="confirm-info-item">
            <span class="confirm-label">订单号</span>
            <span class="confirm-value">{{
              selectedRecord.transaction_id
            }}</span>
          </div>
          <div class="confirm-info-item">
            <span class="confirm-label">套餐类型</span>
            <span class="confirm-value">{{
              formatPackageName(selectedRecord.sku_name)
            }}</span>
          </div>
          <div class="confirm-info-item">
            <span class="confirm-label">撤销说明</span>
            <span class="confirm-value">回收会员周期，恢复库存</span>
          </div>
          <p v-if="cancelError" class="error-message">{{ cancelError }}</p>
        </div>
        <div class="confirm-buttons">
          <button class="cancel-button" @click="showCancelModal = false">
            取消
          </button>
          <button class="cancel-confirm-button" @click="confirmCancel">
            确认撤销充值
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../../styles/sale-records.css';
</style>
