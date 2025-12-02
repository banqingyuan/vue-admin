<template>
  <div class="invited-users-page">
    <!-- Header -->
    <div class="header">
      <div class="header-left" @click="goBack">
        <img src="/back-icon.svg" alt="返回" class="back-icon" />
      </div>
      <div class="header-title">邀请用户列表</div>
      <div class="header-right">
        <img src="/user-add-icon.svg" alt="添加" class="user-add-icon" />
      </div>
    </div>

    <!-- Info Banner -->
    <div class="info-banner">
      <p class="info-text">已绑定 {{ totalCount }} 位，享受长线收益分成</p>
      <img
        src="/info-circle.svg"
        alt="信息"
        class="info-icon clickable"
        @click="showCommissionModal = true"
      />
    </div>

    <!-- User List -->
    <div class="user-list">
      <div
        v-for="record in userRecords"
        :key="record.user_id"
        class="user-card"
      >
        <div class="user-header">
          <p class="user-id">ID: {{ record.user_id }}</p>
          <p class="register-time">{{ record.register_time }}</p>
        </div>
        <div class="user-stats">
          <div class="stat-item">
            <p class="stat-value" :class="{ 'has-value': record.paid_order_count > 0 }">
              {{ record.paid_order_count }}
            </p>
            <div class="stat-label-wrapper">
              <p class="stat-label">付费次数</p>
            </div>
          </div>
          <div class="stat-item">
            <p class="stat-value" :class="{ 'has-value': record.total_revenue_fen > 0 }">
              {{ formatMoney(record.total_revenue_fen) }}
            </p>
            <div class="stat-label-wrapper">
              <p class="stat-label">累计收入</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && userRecords.length === 0" class="empty-state">
        <div class="empty-icon">
          <img src="/file.svg" alt="empty" />
        </div>
        <div class="empty-text-group">
          <p class="empty-title">暂未邀请的用户</p>
          <p class="empty-subtitle">这里会呈现你的邀请记录</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <p>加载中...</p>
      </div>
    </div>

    <!-- Commission Info Modal -->
    <CommissionInfoModal
      v-model:visible="showCommissionModal"
      :level="promoterLevel"
      :android-rate="androidRate"
      :ios-rate="iosRate"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  getInvitedUsersApi,
  type InvitedUserRecord,
  getCommissionRatesApi,
  type CommissionRates,
} from '#/api/agent';
import { getStatusApi } from '#/api/promoter';
import CommissionInfoModal from '#/components/common/CommissionInfoModal.vue';

const router = useRouter();
const userRecords = ref<InvitedUserRecord[]>([]);
const totalCount = ref(0);
const loading = ref(false);
const showCommissionModal = ref(false);
const promoterLevel = ref(1);
const androidRate = ref(60);
const iosRate = ref(40);

const goBack = () => {
  router.back();
};

const formatMoney = (fen: number) => {
  return `¥${(fen / 100).toFixed(2)}`;
};

const loadData = async () => {
  try {
    loading.value = true;

    // 并行获取数据
    const [statusData, commissionData, records] = await Promise.all([
      getStatusApi(),
      getCommissionRatesApi(),
      getInvitedUsersApi(),
    ]);

    // 设置代理级别
    promoterLevel.value = statusData.level ?? 1;

    // 根据代理级别设置佣金比例
    if (promoterLevel.value === 1) {
      // 一级代理：直接推广比例
      androidRate.value = commissionData.level1_direct.android;
      iosRate.value = commissionData.level1_direct.ios;
    } else {
      // 二级代理:直接推广比例
      androidRate.value = commissionData.level2_direct.android;
      iosRate.value = commissionData.level2_direct.ios;
    }

    // 设置邀请用户数据
    userRecords.value = records || [];
    totalCount.value = records?.length ?? 0;
  } catch (error) {
    console.error('加载数据失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.invited-users-page {
  min-height: 100vh;
  background-color: #141414;
  color: #ffffff;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 46px;
  padding: 0 10px;
  background-color: #141414;
}

.header-left,
.header-right {
  width: 110px;
  display: flex;
  align-items: center;
}

.header-left {
  justify-content: flex-start;
  cursor: pointer;
  padding: 10px;
}

.header-right {
  justify-content: flex-end;
  padding: 10px 24px;
}

.back-icon {
  width: 24px;
  height: 24px;
}

.user-add-icon {
  width: 24px;
  height: 24px;
}

.header-title {
  flex: 1;
  text-align: center;
  font-family: 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 500;
  line-height: normal;
  opacity: 0.9;
}

/* Info Banner */
.info-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px;
}

.info-text {
  font-family: 'PingFang SC', sans-serif;
  font-size: 15px;
  line-height: 22px;
  color: #8c8c8c;
  text-align: center;
}

.info-icon {
  width: 16px;
  height: 16px;
}

.info-icon.clickable {
  cursor: pointer;
}

/* User List */
.user-list {
  padding: 0 10px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-card {
  background-color: #1f1f1f;
  border-radius: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid #262626;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-id {
  font-family: 'PingFang SC', sans-serif;
  font-size: 18px;
  font-weight: 600; /* Semibold */
  line-height: 22px;
  color: #ffffff;
  margin: 0;
}

.register-time {
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 400; /* Regular */
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

.user-stats {
  display: flex;
  width: 100%;
}

.stat-item {
  flex: 1 0 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  min-height: 0;
}

.stat-value {
  font-family: 'PingFang SC', sans-serif;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
  color: #8c8c8c;
  margin: 0;
}

.stat-value.has-value {
  color: #ffe395;
}

.stat-label-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
}

.stat-label {
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  line-height: 24px;
  color: #8c8c8c;
  margin: 0;
}

/* Empty & Loading States */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 120px 20px;
}

.empty-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-text-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.empty-title {
  font-family: 'PingFang SC', sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  color: #ffffff;
  text-align: center;
  margin: 0;
}

.empty-subtitle {
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: normal;
  color: #8c8c8c;
  text-align: center;
  margin: 0;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  color: #8c8c8c;
  font-size: 14px;
}
</style>

