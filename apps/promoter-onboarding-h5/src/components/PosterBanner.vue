<template>
  <div class="poster-banner">
    <img src="/banner.png" alt="代理合作伙伴招募" class="banner-image" />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.poster-banner {
  position: relative;
  width: 100%;
  height: 123px;
  border-bottom: 1px solid rgba(255, 227, 149, 0);
  overflow: hidden;
  background: linear-gradient(to top, rgba(255, 227, 149, 0.1), rgba(255, 227, 149, 0));
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
</style>

