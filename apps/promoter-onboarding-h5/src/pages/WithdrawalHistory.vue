<template>
  <div class="withdrawal-history-page">
    <!-- Header -->
    <div class="header">
      <div class="header-left" @click="goBack">
        <img src="/back-icon.svg" alt="返回" class="back-icon" />
      </div>
      <div class="header-title">提现记录</div>
      <div class="header-right"></div>
    </div>

    <!-- Empty State -->
    <div class="empty-state">
      <div class="empty-icon">
        <img src="/file.svg" alt="empty" />
      </div>
      <div class="empty-text-group">
        <p class="empty-title">暂无提现记录</p>
        <p class="empty-subtitle">这里会呈现你的提现记录</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.withdrawal-history-page {
  min-height: 100vh;
  background-color: #141414;
  color: #ffffff;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
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
  padding: 10px;
}

.back-icon {
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

/* Empty State */
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
</style>

