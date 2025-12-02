<template>
  <div class="agent-list">
    <div
      v-for="child in children"
      :key="child.promoter_id"
      class="agent-card"
    >
      <div class="agent-header">
        <p class="agent-name">
          {{ child.name || '未命名代理' }}
        </p>
        <p class="agent-phone">
          {{ child.phone || '-' }}
        </p>
      </div>

      <div class="agent-stats">
        <div class="stat-item">
          <p
            class="stat-value"
            :class="{ 'has-value': child.invite_count > 0 }"
          >
            {{ child.invite_count }}
          </p>
          <p class="stat-label">邀请人数</p>
        </div>

        <div class="stat-item">
          <p
            class="stat-value"
            :class="{ 'has-value': child.paid_order_count > 0 }"
          >
            {{ child.paid_order_count }}
          </p>
          <p class="stat-label">累计订单</p>
        </div>

        <div class="stat-item">
          <p
            class="stat-value"
            :class="{ 'has-value': child.parent_share_from_child_fen > 0 }"
          >
            {{ formatMoney(child.parent_share_from_child_fen) }}
          </p>
          <div class="stat-label-wrapper">
            <p class="stat-label">收入</p>
            <img
              src="/info-circle.svg"
              alt="说明"
              class="stat-info-icon"
              @click="handleInfoClick"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !children.length" class="empty-state">
      <div class="empty-icon">
        <img src="/file.svg" alt="empty" />
      </div>
      <div class="empty-text-group">
        <p class="empty-title">暂无下级代理</p>
        <p class="empty-subtitle">这里会呈现你的下级代理信息</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAgentStore } from '#/store/agent';

const agent = useAgentStore();

// 定义 emit
const emit = defineEmits<{
  openCommissionModal: [];
}>();

const loading = computed(() => false); // 由外部页面控制加载，这里仅负责展示
const children = computed(() => agent.childrenStats || []);

const formatMoney = (fen: number) => {
  return `¥${(fen / 100).toFixed(2)}`;
};

const handleInfoClick = () => {
  emit('openCommissionModal');
};
</script>

<style scoped>
.agent-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.agent-card {
  background-color: #1f1f1f;
  border-radius: 8px;
  padding: 10px 14px;
}

.agent-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.agent-name {
  font-family: 'PingFang SC', sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 22px;
  color: #ffffff;
  margin: 0;
}

.agent-phone {
  font-family: 'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
  color: #bfbfbf;
  margin: 0;
}

.agent-stats {
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

.stat-info-icon {
  width: 14px;
  height: 14px;
  cursor: pointer;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 80px 20px;
}

.empty-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.empty-icon img {
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
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.loading-state p {
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}
</style>


