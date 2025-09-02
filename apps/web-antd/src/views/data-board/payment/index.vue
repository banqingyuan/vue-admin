<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import CohortAnalysisTable from './components/CohortAnalysisTable.vue';
</script>

<template>
  <Page
    description="基于队列的月度付费拆解，支持按天筛选订单"
    title="付费数据 - 队列分析"
  >
    <div class="cohort-only">
      <CohortAnalysisTable />
    </div>
  </Page>
</template>

<style lang="scss" scoped>
.cohort-only {
  padding: 16px;
}
</style>
