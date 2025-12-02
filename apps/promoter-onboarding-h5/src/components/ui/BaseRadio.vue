<template>
  <div class="base-radio" @click="select">
    <div
      :class="['radio-input', { 'radio-checked': isChecked }]"
    >
      <div v-if="isChecked" class="radio-dot" />
    </div>
    <div v-if="$slots.default || label" class="radio-label">
      <slot>{{ label }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue?: string | number;
  value: string | number;
  label?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const isChecked = computed(() => props.modelValue === props.value);

const select = () => {
  emit('update:modelValue', props.value);
};
</script>

<style scoped>
.base-radio {
  background: var(--fixed-box);
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  cursor: pointer;
  user-select: none;
}

.radio-input {
  background: var(--basic-0);
  border: 1px solid var(--basic-4);
  border-radius: var(--radius-100);
  width: 16px;
  height: 16px;
  min-width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.radio-checked {
  border-color: var(--primary-6);
}

.radio-dot {
  background: var(--primary-6);
  border-radius: 50%;
  width: 8px;
  height: 8px;
}

.radio-label {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-24);
  color: var(--basic-10);
}

.radio-checked + .radio-label {
  color: var(--primary-6);
}
</style>

