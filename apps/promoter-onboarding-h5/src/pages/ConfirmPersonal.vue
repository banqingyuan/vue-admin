<template>
  <main class="page">
    <h1>确认｜个人</h1>
    <p>提交前请确认您已阅读并同意合作协议。</p>
    <div class="actions">
      <router-link to="/apply/personal">返回修改</router-link>
      <router-link to="/result/success">确认提交</router-link>
    </div>
  </main>
</template>

<script setup lang="ts">
</script>

<style scoped>
.page { padding: 16px; color: #fff; background: #141414; min-height: 100vh; }
.actions { display: flex; gap: 12px; }
a { color: #FFE395; }
</style>


