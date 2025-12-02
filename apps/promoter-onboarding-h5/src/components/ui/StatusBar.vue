<template>
  <div class="status-bar">
    <div class="status-bar-content">
      <div class="time-section">
        <span class="time-text">9:41</span>
      </div>
      <div class="dynamic-island-spacer" />
      <div class="levels-section">
        <svg class="cellular-icon" viewBox="0 0 19.2 12.226" fill="currentColor">
          <path d="M17.08 0h2.12v12.226h-2.12V0zM12.04 3.056h2.12v9.17h-2.12v-9.17zM6.96 6.113h2.12v6.113H6.96V6.113zM1.88 9.17h2.12v3.056H1.88V9.17z"/>
        </svg>
        <svg class="wifi-icon" viewBox="0 0 17.142 12.328" fill="currentColor">
          <path d="M8.571 2.058c2.36 0 4.52.889 6.143 2.34l1.428-1.623C14.17 1.028 11.536 0 8.571 0 5.606 0 2.972 1.028 1 2.775l1.428 1.623c1.623-1.451 3.783-2.34 6.143-2.34zm0 4.116c1.457 0 2.786.534 3.8 1.404l1.428-1.623c-1.337-1.17-3.069-1.897-5.228-1.897s-3.891.727-5.228 1.897l1.428 1.623c1.014-.87 2.343-1.404 3.8-1.404zm0 4.116c.803 0 1.457.654 1.457 1.457s-.654 1.457-1.457 1.457-1.457-.654-1.457-1.457.654-1.457 1.457-1.457z"/>
        </svg>
        <svg class="battery-icon" viewBox="0 0 27.328 13" fill="none">
          <rect x="0.5" y="0.5" width="22" height="12" rx="2.5" stroke="currentColor" stroke-opacity="0.35"/>
          <path opacity="0.4" d="M24 4v5c1.105 0 2-.895 2-2V6c0-1.105-.895-2-2-2z" fill="currentColor"/>
          <rect x="2" y="2" width="19" height="9" rx="1" fill="currentColor"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.status-bar {
  background: var(--basic-0);
  width: 100%;
  height: var(--status-bar-height);
  padding-top: 21px;
  display: flex;
  flex-direction: column;
}

.status-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.time-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 16px;
  padding-right: 6px;
  gap: 10px;
}

.time-text {
  font-family: var(--font-family-sf);
  font-size: var(--font-size-17);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-22);
  color: var(--basic-10);
  text-align: center;
}

.dynamic-island-spacer {
  width: 124px;
  height: 10px;
}

.levels-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding-left: 6px;
  padding-right: 16px;
}

.cellular-icon {
  width: 19.2px;
  height: 12.226px;
  color: var(--basic-10);
}

.wifi-icon {
  width: 17.142px;
  height: 12.328px;
  color: var(--basic-10);
}

.battery-icon {
  width: 27.328px;
  height: 13px;
  color: var(--basic-10);
}
</style>

