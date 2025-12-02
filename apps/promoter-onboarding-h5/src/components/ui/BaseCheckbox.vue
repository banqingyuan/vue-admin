<template>
  <div class="base-checkbox" @click="toggle">
    <div
      :class="['checkbox-input', { 'checkbox-checked': modelValue }]"
    >
      <svg
        v-if="modelValue"
        viewBox="0 0 16 16"
        fill="none"
        class="checkbox-icon"
      >
        <path
          d="M13.3333 4L6 11.3333L2.66667 8"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
    <div v-if="$slots.default" class="checkbox-label">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const toggle = () => {
  emit('update:modelValue', !props.modelValue);
};
</script>

<style scoped>
.base-checkbox {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  background: var(--basic-0);
  border: 1px solid var(--basic-4);
  border-radius: var(--radius-4);
  width: 18px;
  height: 18px;
  min-width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.checkbox-checked {
  background: var(--primary-6);
  border-color: var(--primary-6);
}

.checkbox-icon {
  width: 12px;
  height: 12px;
  color: var(--basic-0);
}

.checkbox-label {
  flex: 1;
  font-family: var(--font-family-primary);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-26);
  color: var(--basic-6);
  white-space: pre-wrap;
}
</style>

