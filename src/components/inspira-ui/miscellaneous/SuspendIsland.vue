<script lang="ts" setup>
import { cn } from '@inspira-ui/plugins'
import { motion, MotionConfig } from 'motion-v'
import { computed, onMounted, onUnmounted, ref, useSlots } from 'vue'

interface Props {
  class?: string
  title?: string
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
  title: 'Progress',
  height: 44,
})

const open = ref(false)
const slots = useSlots()

const scrollPercentage = ref(0)

const isSlotAvailable = computed(() => !!slots.default)
const borderRadius = computed(() => `${props.height / 2}px`)

onMounted(() => {
  if (window === undefined) return

  window.addEventListener('scroll', updatePageScroll)
  updatePageScroll()
})

function updatePageScroll() {
  scrollPercentage.value = window.scrollY / (document.body.scrollHeight - window.innerHeight)
}

onUnmounted(() => {
  window.removeEventListener('scroll', updatePageScroll)
})
</script>

<template>
  <MotionConfig
    :transition="{
      duration: 0.7,
      type: 'spring',
      bounce: 0.5,
    }">
    <div
      :class="
        cn('bg-primary/90 border-radius fixed top-12 left-1/2 z-999 -translate-x-1/2 backdrop-blur-lg', $props.class)
      "
      @click="() => (open = !open)">
      <motion.div
        id="motion-id"
        layout
        :initial="{
          height: props.height,
          width: 0,
        }"
        :animate="{
          height: open && isSlotAvailable ? 'auto' : props.height,
          width: open && isSlotAvailable ? 320 : 260,
        }"
        class="bg-natural-900 text-secondary relative cursor-pointer overflow-hidden">
        <header class="gray- flex h-11 cursor-pointer items-center gap-2 px-4">
          <h1 class="grow text-center font-bold">{{ title }}</h1>
        </header>
        <motion.div
          v-if="isSlotAvailable"
          class="mb-2 flex h-full max-h-60 flex-col gap-1 overflow-y-auto px-4 text-sm">
          <slot />
        </motion.div>
      </motion.div>
    </div>
  </MotionConfig>
</template>

<style scoped>
.border-radius {
  border-radius: v-bind(borderRadius);
}
</style>
