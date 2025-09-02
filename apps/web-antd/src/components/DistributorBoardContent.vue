<script lang="ts" setup>
import type { AnalysisOverviewItem } from '@vben/common-ui';

import { computed } from 'vue';

import { AnalysisOverview } from '@vben/common-ui';

const props = defineProps<{
  installs: number;
  loading: boolean;
  orderCount: number;
  paidAmount: number;
  registrations: number;
}>();

const overviewItems = computed<AnalysisOverviewItem[]>(() => [
  {
    icon: undefined as any,
    title: '安装数',
    totalTitle: '安装总量',
    totalValue: props.installs,
    value: props.installs,
  },
  {
    icon: undefined as any,
    title: '注册数',
    totalTitle: '注册总量',
    totalValue: props.registrations,
    value: props.registrations,
  },
  {
    icon: undefined as any,
    title: '订单数',
    totalTitle: '订单总数',
    totalValue: props.orderCount,
    value: props.orderCount,
  },
  {
    icon: undefined as any,
    title: '付费金额 (元)',
    totalTitle: '付费总额 (元)',
    totalValue: props.paidAmount,
    value: props.paidAmount,
    prefix: '¥',
    decimals: 2,
  },
]);
</script>

<template>
  <AnalysisOverview :items="overviewItems" />
  <div v-if="loading" style="height: 1px"></div>
  <!-- 预留更多展示区块（趋势图、表格等） -->
  <slot></slot>
</template>
