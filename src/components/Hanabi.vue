<template>
  <div v-if="showFireworks" class="global-fireworks-overlay" @click="handleOverlayClick"></div>
</template>

<script>
import confetti from 'canvas-confetti';

export default {
  name: 'Hanabi',
  data() {
    return {
      showFireworks: true
    };
  },
  mounted() {
    // 使用捕获阶段监听整个文档的点击事件
    document.addEventListener('click', this.handleDocumentClick, true);
  },
  methods: {
    handleDocumentClick(event) {
      // 检查点击的元素是否已经有其他事件处理器
      // 或者是表单元素、链接等有默认行为的元素
      const target = event.target;
      const tagName = target.tagName.toLowerCase();
      
      // 检查元素是否有事件监听器（简单判断）
      const hasClickHandler = 
        target.onclick || 
        target.hasAttribute('onclick') ||
        target.classList.contains('no-fireworks') || // 添加一个类来排除某些元素
        ['button', 'a', 'input', 'textarea', 'select', 'label'].includes(tagName);
      
      // 如果元素已经有点击处理程序，则不触发烟花效果
      if (hasClickHandler) {
        return;
      }
      
      // 检查元素是否具有 data-no-fireworks 属性
      if (target.hasAttribute('data-no-fireworks')) {
        return;
      }
      
      // 检查父元素是否有 no-fireworks 类或 data-no-fireworks 属性
      let parent = target.parentElement;
      while (parent) {
        if (parent.classList.contains('no-fireworks') || parent.hasAttribute('data-no-fireworks')) {
          return;
        }
        parent = parent.parentElement;
      }
      
      // 触发小烟花效果
      this.createSubtleFireworks(event.clientX, event.clientY);
    },
    
    handleOverlayClick(event) {
      // 这个方法实际上不会被调用，因为pointer-events: none
      // 但保留以防万一
    },
    
    createSubtleFireworks(x, y) {
      const normalizedX = x / window.innerWidth;
      const normalizedY = y / window.innerHeight;
      
      // 创建一个小而微妙的烟花效果
      confetti({
        particleCount: 8, // 减少粒子数量
        angle: 90,
        spread: 45, // 增加扩散角度使更柔和
        startVelocity: 10, // 降低速度
        decay: 0.9,
        gravity: 1,
        drift: -0.5,
        ticks: 100, // 减少持续时间
        origin: { x: normalizedX, y: normalizedY },
        colors: ['#a8a8a8', '#cccccc', '#ffffff'], // 使用更柔和的颜色
        shapes: ['circle'],
        scalar: 0.4, // 减小粒子大小
        zIndex: 9999
      });
      
      // 添加一个非常小的额外效果
      setTimeout(() => {
        confetti({
          particleCount: 4, 
          angle: 90,
          spread: 60,
          startVelocity: 6,
          decay: 0.85,
          gravity: 1.2,
          drift: 0.5,
          ticks: 60,
          origin: { x: normalizedX, y: normalizedY },
          colors: ['#a8a8a8', '#cccccc', '#ffffff'],
          shapes: ['circle'],
          scalar: 0.3,
          zIndex: 9999
        });
      }, 100);
    }
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleDocumentClick, true);
  }
}
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