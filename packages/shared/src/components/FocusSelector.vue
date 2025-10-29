<script setup lang="ts">
import type { FocusType } from '../types'
import { TEXT_DE } from '../text-de'

interface Props {
  modelValue: FocusType
}

defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: FocusType]
}>()

const focusOptions = [
  { label: TEXT_DE.focusOptions.weak, value: 'weak' as const },
  { label: TEXT_DE.focusOptions.strong, value: 'strong' as const },
  { label: TEXT_DE.focusOptions.slow, value: 'slow' as const }
]

function handleFocusChange(value: FocusType) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div>
    <div class="text-subtitle2 q-mb-xs">{{ TEXT_DE.words.focus }}</div>
    <div class="row q-col-gutter-sm">
      <div
        class="col-4"
        v-for="option in focusOptions"
        :key="option.value"
      >
        <q-btn
          :outline="modelValue !== option.value"
          :color="modelValue === option.value ? 'primary' : 'grey-8'"
          :label="option.label"
          no-caps
          class="full-width"
          @click="handleFocusChange(option.value)"
        />
      </div>
    </div>
  </div>
</template>
