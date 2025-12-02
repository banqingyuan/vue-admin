<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="modal-overlay"
        @click="handleClose"
        @touchmove.prevent
      >
        <Transition name="slide-up">
          <div
            v-if="visible"
            class="modal-content"
            @click.stop
            @touchmove.stop
          >
            <!-- Header -->
            <div class="modal-header">
              <div class="modal-title">
                <p>{{ title }}</p>
              </div>
              <button class="close-button" @click="handleClose">
                <img src="/close-icon.svg" alt="关闭" class="close-icon" />
              </button>
            </div>

            <!-- Content -->
            <div class="modal-body">
              <!-- Level Badge -->
              <div v-if="showLevelInfo" class="level-badge-container">
                <div class="level-badge">
                  <p>{{ levelText }}</p>
                </div>
                <p class="level-desc">{{ levelDescText }}</p>
              </div>

              <!-- Android Section -->
              <div class="commission-section">
                <div class="commission-header">
                  <img src="/android-icon.svg" alt="Android" class="platform-icon" />
                  <p class="commission-title">
                    <span class="title-text">安卓订单，</span>
                    <span class="title-label">分成比例：</span>
                    <span class="commission-rate">{{ androidRate }}%</span>
                  </p>
                </div>
                <p class="calculation-method">
                  计算方式：原价*分成比例
                </p>
                <div class="example">
                  <p class="example-text">
                    例：99*{{ androidRate / 100 }}={{ androidExample }}，则收益
                  </p>
                  <p class="example-value"> +¥{{ androidExample }}</p>
                </div>
              </div>

              <!-- Divider -->
              <div class="divider"></div>

              <!-- iOS Section -->
              <div class="commission-section">
                <div class="commission-header">
                  <img src="/apple-icon.svg" alt="Apple" class="platform-icon" />
                  <p class="commission-title">
                    <span class="title-text">苹果订单，分成比例：</span>
                    <span class="commission-rate">{{ iosRate }}%</span>
                  </p>
                </div>
                <p class="calculation-method">
                  计算方式：原价*分成比例
                </p>
                <div class="example">
                  <p class="example-text">
                    例：99*{{ iosRate / 100 }}={{ iosExample }}，则收入
                  </p>
                  <p class="example-value"> +¥{{ iosExample }}</p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer">
              <button class="confirm-button" @click="handleClose">
                我知道了
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  visible: boolean;
  level?: number; // 1 for 高级代理, 2 for 代理
  androidRate: number; // e.g., 60 or 50
  iosRate: number; // e.g., 40 or 30
  title?: string; // 弹窗标题，例如“分成计算方式”或“下级分成计算方式”
  showLevelInfo?: boolean; // 是否展示顶部等级徽章
}

const props = withDefaults(defineProps<Props>(), {
  level: 1,
  title: '分成计算方式',
  showLevelInfo: true,
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const levelText = computed(() => {
  return props.level === 1 ? '高级代理' : '代理';
});

const levelDescText = computed(() => {
  return props.level === 1 ? '已尊享高分成比例！' : '已享高分成比例！';
});

const androidExample = computed(() => {
  return (99 * props.androidRate / 100).toFixed(1);
});

const iosExample = computed(() => {
  return (99 * props.iosRate / 100).toFixed(1);
});

const handleClose = () => {
  emit('update:visible', false);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 0 27.5px;
}

.modal-content {
  background: #262626;
  border: 1px solid #434343;
  border-radius: 12px;
  width: 320px;
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
}

.modal-title {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
}

.modal-title p {
  font-family: 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #ffffff;
  margin: 0;
}

.close-button {
  padding: 4px;
  border-radius: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  width: 16px;
  height: 16px;
  display: block;
}

/* Body */
.modal-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 20px;
  overflow-y: auto;
  flex: 1;
}

.level-badge-container {
  display: flex;
  align-items: center;
  gap: 7px;
}

.level-badge {
  background: linear-gradient(to right, #ffe395, #fff2cc);
  padding: 2px 4px;
  border-radius: 6px 0 6px 0;
}

.level-badge p {
  font-family: 'DingTalk JinBuTi', sans-serif;
  font-size: 15px;
  line-height: normal;
  color: #000000;
  margin: 0;
}

.level-desc {
  font-family: 'DingTalk JinBuTi', sans-serif;
  font-size: 15px;
  line-height: normal;
  color: #ffecb5;
  margin: 0;
}

.commission-section {
  display: flex;
  flex-direction: column;
}

.commission-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.platform-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: block;
}

.commission-title {
  font-family: 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  margin: 0;
}

.title-text,
.title-label {
  color: #ffffff;
}

.commission-rate {
  color: #ffe395;
}

.calculation-method {
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 26px;
  color: #bfbfbf;
  margin: 0;
}

.example {
  display: flex;
  align-items: flex-start;
  line-height: 22px;
}

.example-text {
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #bfbfbf;
  margin: 0;
}

.example-value {
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #ffecb5;
  margin: 0;
}

.divider {
  height: 1px;
  width: 100%;
  background: linear-gradient(
    to right,
    rgba(255, 227, 149, 0) 0%,
    rgba(255, 227, 149, 0.5) 50%,
    rgba(255, 227, 149, 0) 100%
  );
  opacity: 0.5;
}

/* Footer */
.modal-footer {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  padding: 16px 20px;
  gap: 10px;
}

.confirm-button {
  width: 100%;
  background: #ffe395;
  border: 1px solid #ffe395;
  border-radius: 10px;
  padding: 7px 13px;
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  color: #332d1e;
  text-align: center;
  cursor: pointer;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>

