<script setup lang="ts">
// @ts-nocheck
import type { HTMLAttributes } from 'vue'
import { cn } from '@inspira-ui/plugins'
import { computed } from 'vue'

interface Props {
  duration?: number // 发光边框动画的持续时间（秒）
  color?: string | Array<string> // 应用于发光边框的颜色或颜色数组
  borderRadius?: number // 边框的圆角半径
  borderWidth?: number // 边框宽度
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  borderRadius: 10,
  color: ['#ffaa40', '#9c40ff', '#40a9ff', '#00b894'], //'#FFF',
  borderWidth: 1,
  duration: 12,
})

const styles = computed(() => {
  return {
    '--border-radius': `${props.borderRadius}px`,
    '--border-width': `${props.borderWidth}px`,
    '--duration': `${props.duration}s`,
    backgroundImage: `radial-gradient(transparent,transparent, ${
      Array.isArray(props.color) ? props.color.join(',') : props.color
    },transparent,transparent)`,
    backgroundSize: '300% 300%',
    mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
    WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    padding: 'var(--border-width)',
    borderRadius: 'var(--border-radius)',
  }
})
</script>

<template>
  <div
    :style="styles"
    :class="
      cn(
        `motion-safe:animate-glow pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position]`,
        props.class,
      )
    " />
</template>
