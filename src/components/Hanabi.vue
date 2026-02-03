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
    
      // 触发烟花效果
      this.createSubtleFireworks(event.clientX, event.clientY);
    },
    
    handleOverlayClick(event) {
      // 这个方法实际上不会被调用，因为pointer-events: none
    },
    
    //特效
    createSubtleFireworks(x, y) {
      const normalizedX = x / window.innerWidth;
      const normalizedY = y / window.innerHeight;
      
      // 创建粒子效果
      confetti({
        particleCount: 20, // 粒子数量
        angle: 90, //弹射角度
        spread: 45, // 扩散角度
        startVelocity: 8, // 初始速度
        decay: 0.9, // 粒子衰减
        gravity: 1, // 重力
        drift: 0, // 飘落水平偏移
        ticks: 100, // 持续时间
        origin: { x: normalizedX, y: normalizedY },
        colors: ['#a8a8a8', '#cccccc', '#ffffff'], 
        shapes: ['circle'],
        scalar: 0.4, // 粒子大小
        zIndex: 9999
      });
  
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