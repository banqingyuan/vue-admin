<script setup lang="ts">
const modes = [
  { title: '高级代理', desc: '适合拥有团队与渠道能力的 promoter，享有更高分成比例。' },
  { title: '渠道代理', desc: '按渠道包投放与结算，关注投放效率与实时数据。' },
];
</script>

<template>
  <div class="agent-center-placeholder">
    <h2>代理模式配置</h2>
    <p>未来将在此配置不同 promoter 模式与策略。</p>
    <div class="cards">
      <div v-for="item in modes" :key="item.title" class="card">
        <h3>{{ item.title }}</h3>
        <p>{{ item.desc }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.agent-center-placeholder {
  padding: 24px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  color: #f0f0f0;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.card {
  padding: 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
</style>


