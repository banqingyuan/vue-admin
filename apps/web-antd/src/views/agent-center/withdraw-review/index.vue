<script setup lang="ts">
const checklist = [
  '提现申请基础信息（金额、渠道、申请时间）。',
  '风控校验结果与历史驳回记录。',
  '审核操作：通过、驳回、备注追踪。',
];
</script>

<template>
  <div class="agent-center-placeholder">
    <h2>提现审核</h2>
    <p>后续将在此接入 promoter 提现审批流，当前为占位内容。</p>
    <ol>
      <li v-for="item in checklist" :key="item">
        {{ item }}
      </li>
    </ol>
  </div>
</template>

<style scoped>
.agent-center-placeholder {
  padding: 24px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  color: #f0f0f0;
}

ol {
  padding-left: 20px;
  margin: 0;
}
</style>


