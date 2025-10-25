<script setup lang="ts">
interface Props {
  isHappy: boolean
  size?: number
}

withDefaults(defineProps<Props>(), {
  size: 60
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 60 60"
    xmlns="http://www.w3.org/2000/svg"
    class="inline-block"
    :aria-label="isHappy ? 'Happy fox icon' : 'Neutral fox icon'"
  >
    <g>
      <!-- Ears -->
      <path
        d="M 10 20 L 5 5 L 20 15 Z"
        fill="#f97316"
      />
      <path
        d="M 50 20 L 55 5 L 40 15 Z"
        fill="#f97316"
      />
      <path
        d="M 12 20 L 10 10 L 20 16 Z"
        fill="#FFF"
      />
      <path
        d="M 48 20 L 50 10 L 40 16 Z"
        fill="#FFF"
      />

      <!-- Head -->
      <path
        d="M 10 50 C 10 20, 10 5, 30 5 C 50 5, 50 20, 50 50 Q 30 60, 10 50 Z"
        fill="#f97316"
      />

      <!-- Muzzle -->
      <path
        d="M 20 52 C 20 40, 20 30, 30 30 C 40 30, 40 40, 40 52 Q 30 58, 20 52 Z"
        fill="#FFF"
      />

      <!-- Nose -->
      <circle
        cx="30"
        cy="35"
        r="3"
        fill="#27272a"
      />

      <!-- Eyes -->
      <g
        v-if="isHappy"
        stroke="#27272a"
        stroke-width="2"
        stroke-linecap="round"
        fill="none"
      >
        <path d="M18 26 A 4 4 0 0 1 26 26" />
        <path d="M34 26 A 4 4 0 0 1 42 26" />
      </g>
      <g
        v-else
        fill="#27272a"
      >
        <circle
          cx="22"
          cy="26"
          r="2"
        />
        <circle
          cx="38"
          cy="26"
          r="2"
        />
      </g>

      <!-- Mouth -->
      <path
        :d="isHappy ? 'M25 38 Q 30 45, 35 38' : 'M28 40 L 32 40'"
        stroke="#27272a"
        stroke-width="2"
        stroke-linecap="round"
        fill="none"
      />
    </g>
  </svg>
</template>
