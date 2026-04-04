<template>
  <div v-if="showFireworks" class="global-fireworks-overlay"></div>
</template>

<script setup lang="ts">
/**
 * 烟花特效组件
 * 点击页面任意位置产生粒子效果（排除按钮、链接等表单元素）
 */
import confetti from 'canvas-confetti'

// ========== 响应式数据 ==========
const showFireworks = ref(true)

// ========== 事件处理 ==========
/**
 * 处理文档点击事件
 */
const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const tagName = target.tagName.toLowerCase()

  // 检查元素是否是表单元素或已有点击处理程序
  const hasClickHandler =
    target.onclick ||
    target.hasAttribute('onclick') ||
    target.classList.contains('no-fireworks') ||
    ['button', 'a', 'input', 'textarea', 'select', 'label'].includes(tagName)

  // 如果元素已经有点击处理程序，则不触发烟花效果
  if (hasClickHandler) {
    return
  }

  // 触发烟花效果
  createSubtleFireworks(event.clientX, event.clientY)
}

/**
 * 创建烟花特效
 * @param x 点击位置 X 坐标
 * @param y 点击位置 Y 坐标
 */
const createSubtleFireworks = (x: number, y: number) => {
  const normalizedX = x / window.innerWidth
  const normalizedY = y / window.innerHeight

  // 创建粒子效果
  confetti({
    particleCount: 30, // 粒子数量
    angle: 90, // 弹射角度
    spread: 360, // 扩散角度
    startVelocity: 7, // 初始速度
    decay: 0.9, // 粒子衰减
    gravity: 1, // 重力
    drift: 0, // 飘落水平偏移
    ticks: 100, // 持续时间
    origin: { x: normalizedX, y: normalizedY },
    colors: ['#a8a8a8', '#cccccc', '#ffffff'],
    shapes: ['circle'],
    scalar: 0.4, // 粒子大小
    zIndex: 9999,
  })
}

// ========== 生命周期 ==========
onMounted(() => {
  // 使用捕获阶段监听整个文档的点击事件
  document.addEventListener('click', handleDocumentClick, true)
})

onBeforeUnmount(() => {
  // 清理事件监听器
  document.removeEventListener('click', handleDocumentClick, true)
})
</script>

<style scoped>
.global-fireworks-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9998;
  pointer-events: none; /* 使覆盖层不拦截鼠标事件 */
}
</style>
