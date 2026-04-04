<script setup lang="ts">
import { cn } from '@inspira-ui/plugins'
import { computed } from 'vue'

interface BorderBeamProps {
  class?: string // 用于自定义样式的额外 CSS 类
  size?: number // 动画边框光束的尺寸
  duration?: number // 动画持续时间（秒）
  borderWidth?: number // 光束边框的宽度
  anchor?: number // 光束的锚点，决定其在边框上的位置
  colorFrom?: string // 光束渐变的起始颜色
  colorTo?: string // 光束渐变的结束颜色
  delay?: number // 动画开始前的延迟时间（秒）
}

const props = withDefaults(defineProps<BorderBeamProps>(), {
  size: 200,
  duration: 12,
  anchor: 90,
  borderWidth: 1.5,
  colorFrom: '#ffaa40',
  colorTo: '#9c40ff',
  delay: 0,
})

const durationInSeconds = computed(() => `${props.duration}s`)
const delayInSeconds = computed(() => `${props.delay}s`)
</script>

<template>
  <div
    :class="
      cn(
        `border-beam animate-border-beam pointer-events-none absolute inset-0 rounded-[inherit] mask-intersect! [mask-clip:padding-box,border-box]! [border:calc(var(--border-width)*1px)_solid_transparent] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)] after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:[animation-delay:var(--delay)] after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:calc(var(--anchor)*1%)_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]`,
        props.class,
      )
    " />
</template>

<style scoped>
.border-beam {
  --size: v-bind(size);
  --duration: v-bind(durationInSeconds);
  --anchor: v-bind(anchor);
  --border-width: v-bind(borderWidth);
  --color-from: v-bind(colorFrom);
  --color-to: v-bind(colorTo);
  --delay: v-bind(delayInSeconds);
}

.animate-border-beam::after {
  animation: border-beam-anim var(--duration) infinite linear;
}

@keyframes border-beam-anim {
  to {
    offset-distance: 100%;
  }
}
</style>
