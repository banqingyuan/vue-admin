<template>
  <div class="app-shell">
    <router-view />
    <!-- 全局：结果二维码占位组件可在各页内使用 -->
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
:global(html, body, #app) {
  height: 100%;
  margin: 0;
  background: var(--basic-0, #141414);
  overflow-x: hidden; /* 禁用横向滚动 */
  width: 100%;
  position: relative;
}

:global(html) {
  overflow-x: hidden;
  width: 100%;
}

:global(body) {
  overflow-x: hidden;
  width: 100%;
  max-width: 100vw;
}

.app-shell {
  max-width: 700px;
  min-height: 100%;
  margin: 0 auto;
  background: var(--basic-0, #141414);
  overflow-x: hidden; /* 确保 app-shell 也不会横向滚动 */
  width: 100%;
}
</style>


