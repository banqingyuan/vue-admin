<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Segmented, DatePicker } from 'ant-design-vue';
import { getOverviewStats, type OverviewStats } from '#/api/core';
import dayjs, { type Dayjs } from 'dayjs';
import '../styles/colors.css';


// 时间范围选项
const timeRangeOptions = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '累计', value: 'all' },
];

// 当前选中的时间范围
const selectedTimeRange = ref<string>('all');

// 自定义日期范围
const dateRange = ref<[Dayjs, Dayjs] | null>(null);

// 统计数据
const stats = ref<OverviewStats | null>(null);
const loading = ref(false);

// 获取统计数据
async function fetchStats() {
  loading.value = true;
  try {
    const query: any = {
      time_range: selectedTimeRange.value,
    };
    
    // 如果选择了自定义日期范围
    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      query.time_range = 'custom';
      query.start_date = dateRange.value[0].format('YYYY-MM-DD');
      query.end_date = dateRange.value[1].format('YYYY-MM-DD');
    }
    
    const response = await getOverviewStats(query);
    stats.value = response;
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  } finally {
    loading.value = false;
  }
}

// 时间范围变化
function handleTimeRangeChange(value: string) {
  selectedTimeRange.value = value;
  // 如果不是自定义,清空日期选择
  if (value !== 'custom') {
    dateRange.value = null;
  }
  fetchStats();
}

// 日期范围变化
function handleDateRangeChange() {
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    fetchStats();
  }
}

// 格式化金额(分转元)
function formatAmount(fen: number): string {
  return (fen / 100).toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

// 组件挂载时获取数据
onMounted(() => {
  fetchStats();
});
</script>

<template>
  <div class="overview-container">
    <!-- 销售数据 -->
    <div class="stats-section">
      <div class="section-title">销售数据</div>
      <div class="section-controls">
        <Segmented
          v-model:value="selectedTimeRange"
          :options="timeRangeOptions"
          @change="handleTimeRangeChange"
          class="time-segmented"
        />
        <DatePicker.RangePicker
          v-model:value="dateRange"
          :placeholder="['开始日期', '结束日期']"
          format="YYYY-MM-DD"
          @change="handleDateRangeChange"
          class="date-picker"
        />
        <div class="update-time">
          更新时间：{{ stats?.updated_at || '-' }}
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">邀请用户数</div>
          <div class="stat-value">{{ stats?.invited_user_count?.toLocaleString() || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">付费订单数</div>
          <div class="stat-value">{{ stats?.paid_order_count?.toLocaleString() || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">付费金额（元）</div>
          <div class="stat-value">{{ stats?.paid_amount_fen ? formatAmount(stats.paid_amount_fen) : '0' }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">产生佣金（元）</div>
          <div class="stat-value">{{ stats?.commission_fen ? formatAmount(stats.commission_fen) : '0' }}</div>
        </div>
      </div>
    </div>

    <!-- 分割线 -->
    <div class="divider" />

    <!-- 代理数据 -->
    <div class="stats-section">
      <div class="section-title">代理数据</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">高级代理-人数</div>
          <div class="stat-value">{{ stats?.level1_promoter_count?.toLocaleString() || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">代理-人数</div>
          <div class="stat-value">{{ stats?.level2_promoter_count?.toLocaleString() || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">待审批</div>
          <div class="stat-value">{{ stats?.pending_promoter_count?.toLocaleString() || 0 }}</div>
        </div>
      </div>
    </div>

    <!-- 底部分割线 -->
    <div class="divider" />
  </div>
</template>

<style scoped>
.overview-container {
  padding: 16px;
  background: var(--overview-bg);
  min-height: 100vh;
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: var(--overview-text);
}

.section-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

:deep(.time-segmented) {
  background: var(--overview-border);
  border-radius: 6px;
  padding: 2px;
}

:deep(.time-segmented .ant-segmented-item) {
  padding: 0 7px;
  color: var(--overview-muted);
  font-size: 14px;
  line-height: 22px;
  border-radius: 4px;
  min-height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.time-segmented .ant-segmented-item-selected) {
  background: var(--overview-card-bg) !important;
  color: var(--overview-highlight) !important;
  border-radius: 4px;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.05);
}

:deep(.date-picker) {
  width: 270px;
  height: 30px;
}

:deep(.date-picker .ant-picker) {
  background: var(--overview-card-bg) !important;
  border: 1px solid var(--overview-border) !important;
  border-radius: 6px !important;
  padding: 4px 12px !important;
  height: 30px;
}

:deep(.date-picker .ant-picker-input > input) {
  color: var(--overview-muted) !important;
  font-size: 14px !important;
  line-height: 22px !important;
}

:deep(.date-picker .ant-picker-separator) {
  color: var(--overview-muted) !important;
}

:deep(.date-picker .ant-picker-suffix) {
  color: var(--overview-muted) !important;
}

:deep(.date-picker .ant-picker:hover) {
  border-color: var(--overview-border) !important;
}

.update-time {
  font-size: 14px;
  line-height: 22px;
  color: var(--overview-text);
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.stat-card {
  width: 200px;
  padding: 12px;
  background: var(--overview-card-bg);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 14px;
  line-height: 22px;
  color: var(--overview-text);
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  color: var(--overview-highlight);
  font-family: 'Inter', sans-serif;
}

.divider {
  height: 1px;
  width: 100%;
  background: rgba(255, 227, 149, 0.15);
  opacity: 0.5;
  margin: 16px 0;
  flex-shrink: 0;
}

/* 亮色模式 */
:global(:root) {
  --overview-bg: #f7f3ea;
  --overview-card-bg: #ffffff;
  --overview-border: #e8e2d3;
  --overview-text: #1b1b1b;
  --overview-muted: #5c5c5c;
  --overview-highlight: #c58b21;
  --overview-divider: rgba(197, 139, 33, 0.15);
}

:global(.dark) {
  --overview-bg: #141414;
  --overview-card-bg: rgba(255, 255, 255, 0.1);
  --overview-border: #434343;
  --overview-text: rgba(255, 255, 255, 0.85);
  --overview-muted: rgba(255, 255, 255, 0.45);
  --overview-highlight: #ffe395;
  --overview-divider: rgba(255, 227, 149, 0.15);
}
</style>
