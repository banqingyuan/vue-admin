<script setup lang="ts">
import type { Inventory } from '#/api/types';

import { onMounted, ref } from 'vue';

import { agentApi } from '#/api';

const inventories = ref<Inventory[]>([]);
const loading = ref(true);
const error = ref<null | string>(null);

// 库存卡片数据结构
interface CardData {
  type: 'SVIP' | 'VIP';
  duration: string;
  durationDays: number;
  quantity: number;
}

// 映射库存数据到卡片
const getCardData = (): CardData[] => {
  const cardData: CardData[] = [
    { type: 'VIP', duration: '月卡', durationDays: 30, quantity: 0 },
    { type: 'VIP', duration: '7天', durationDays: 7, quantity: 0 },
    { type: 'VIP', duration: '3天', durationDays: 3, quantity: 0 },
    { type: 'SVIP', duration: '月卡', durationDays: 30, quantity: 0 },
    { type: 'SVIP', duration: '7天', durationDays: 7, quantity: 0 },
    { type: 'SVIP', duration: '3天', durationDays: 3, quantity: 0 },
  ];

  if (inventories.value && inventories.value.length > 0) {
    inventories.value.forEach((item) => {
      const type = item.type.toLowerCase() === 'vip' ? 'VIP' : 'SVIP';
      const cardItem = cardData.find(
        (card) =>
          card.type === type && card.durationDays === item.duration_days,
      );
      if (cardItem) {
        cardItem.quantity = item.quantity || 0;
      }
    });
  }

  return cardData;
};

const cardData = ref<CardData[]>([]);

onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    const data = await agentApi.getInventories();
    inventories.value = data;
    cardData.value = getCardData();
  } catch (error_) {
    console.error('获取库存数据失败:', error_);
    error.value = '获取库存数据失败，请稍后重试';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="inventory-container">
    <div v-if="loading" class="loading-container">
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
    </div>

    <div v-else class="inventory-grid">
      <div
        v-for="card in cardData"
        :key="`${card.type}-${card.duration}`"
        class="inventory-card"
      >
        <div class="card-header">
          <span
            class="card-type"
            :class="[card.type === 'VIP' ? 'vip' : 'svip']"
          >
            {{ card.type }}
          </span>
          <span class="card-duration">{{ card.duration }}</span>
        </div>
        <div class="card-quantity">
          <span
            class="quantity-value"
            :class="[{ empty: card.quantity === 0 }]"
          >
            {{ card.quantity }}
          </span>
          <span class="quantity-unit">张</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../../styles/inventory.css';
</style>
