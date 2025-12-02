<template>
  <button
    :type="htmlType"
    :class="[
      'base-button',
      `button-${type}`,
      `button-${size}`,
      { 'button-disabled': disabled },
      { 'button-block': block }
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot name="icon-left" />
    <span v-if="$slots.default || title" class="button-text">
      <slot>{{ title }}</slot>
    </span>
    <slot name="icon-right" />
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'primary' | 'secondary';
  size?: 'large' | 'medium';
  disabled?: boolean;
  block?: boolean;
  title?: string;
  htmlType?: 'button' | 'submit' | 'reset';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  disabled: false,
  block: false,
  title: '',
  htmlType: 'button',
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event);
  }
};
</script>

<style scoped>
.base-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  border-radius: var(--radius-10);
  border: 1px solid;
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-medium);
}

.base-button:active:not(.button-disabled) {
  opacity: 0.8;
  transform: scale(0.98);
}

/* Primary Button */
.button-primary {
  background: var(--primary-6);
  border-color: var(--primary-6);
  color: var(--primary-12);
}

.button-primary.button-disabled {
  background: var(--basic-3);
  border-color: var(--basic-4);
  color: var(--basic-5);
  cursor: not-allowed;
}

/* Secondary Button */
.button-secondary {
  background: var(--basic-1);
  border-color: var(--basic-3);
  color: var(--basic-10);
}

.button-secondary.button-disabled {
  background: var(--basic-1);
  border-color: var(--basic-3);
  color: var(--basic-5);
  cursor: not-allowed;
  opacity: 0.5;
}

/* Sizes - Large */
.button-large {
  padding: 10px 16px;
  border-radius: var(--radius-12);
}

.button-large .button-text {
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-24);
}

.button-large {
  gap: var(--spacing-6);
}

/* Sizes - Medium */
.button-medium {
  padding: 7px 12px;
}

.button-medium .button-text {
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-22);
}

/* Block */
.button-block {
  width: 100%;
}

.button-text {
  text-align: center;
  white-space: nowrap;
}
</style>

