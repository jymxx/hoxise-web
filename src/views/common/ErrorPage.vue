<template>
  <div class="error-page">
    <div class="error-content">
      <!-- 404 错误码，每个字符独立浮动 -->
      <div class="error-code">
        <span v-for="(char, index) in '404'" :key="index" :style="getCharStyle(index)">{{ char }}</span>
      </div>
      <h1 class="error-title">页面未找到</h1>
      <p class="error-message">抱歉，您访问的页面不存在或已被移除</p>
      <el-button class="home-btn" @click="handleGoHome">
        <el-icon><House /></el-icon> 返回首页
      </el-button>
    </div>
    <!-- 粒子背景（全屏，底层） -->
    <vue-particles id="tsparticles" :options="particlesOptions" class="particles-bg" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { House } from '@element-plus/icons-vue'

const router = useRouter()

// 粒子效果配置
const particlesOptions = {
  fpsLimit: 60, // 帧率限制
  fullScreen: {
    enable: true, // 全屏模式
    zIndex: -1, // 层级（-1 表示在最底层）
  },
  detectRetina: true, // 自动检测视网膜屏幕并调整分辨率
  background: {
    color: { value: '#0a0a0a' }, // 背景颜色（深色）
  },
  particles: {
    number: {
      value: 80, // 粒子数量
      density: {
        enable: true, // 根据画布面积自动调整粒子数量
        area: 800, // 密度参考面积
      },
    },
    color: {
      value: ['#c3ade9', '#59a4a9', '#8b5cf6', '#06b6d4'], // 粒子颜色池（紫/青渐变）
    },
    shape: { type: 'circle' }, // 粒子形状（圆形）
    opacity: {
      value: { min: 0.2, max: 0.7 }, // 透明度范围
      animation: {
        enable: true, // 透明度动画
        speed: 1, // 变化速度
        minimumValue: 0.2, // 最小透明度
      },
    },
    size: {
      value: { min: 1, max: 4 }, // 粒子大小范围（像素）
    },
    links: {
      enable: true, // 启用粒子连线
      distance: 120, // 连线距离阈值
      color: { value: '#c3ade9' }, // 连线颜色
      opacity: 0.15, // 连线透明度
      width: 1, // 连线宽度
    },
    move: {
      enable: true, // 启用移动
      speed: 0.5, // 移动速度
      direction: 'none', // 移动方向（none=随机）
      random: true, // 随机方向
      outModes: { default: 'out' }, // 超出边界后的行为（out=消失）
    },
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: 'repulse' }, // 鼠标悬停时的互动（排斥效果）
      resize: true, // 窗口大小变化时重新计算
    },
    modes: {
      repulse: {
        distance: 70, // 排斥距离
        duration: 0.4, // 排斥持续时间（秒）
      },
    },
  },
}

/**
 * 获取字符样式（浮动动画延迟）
 */
const getCharStyle = (index: number) => ({
  animationDelay: `${index * 0.2}s`,
})

/**
 * 返回首页
 */
const handleGoHome = () => {
  router.push('/')
}
</script>

<style scoped lang="scss">
/* ========== 动画定义 ========== */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* ========== 页面布局 ========== */
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0a0a0a;
  color: white;
  position: relative;
  overflow: hidden;

  /* 粒子背景层 */
  .particles-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  /* 内容区域 */
  .error-content {
    text-align: center;
    padding: 40px;
    z-index: 1;
    position: relative;

    /* 404 错误码 */
    .error-code {
      font-size: 120px;
      font-weight: 700;
      margin-bottom: 20px;
      line-height: 1;

      span {
        display: inline-block;
        background: linear-gradient(135deg, #c3ade9, #59a4a9);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: float 3s ease-in-out infinite;

        &:nth-child(1) {
          animation-delay: 0s;
        }
        &:nth-child(2) {
          animation-delay: 0.2s;
        }
        &:nth-child(3) {
          animation-delay: 0.4s;
        }
      }
    }

    /* 错误标题 */
    .error-title {
      font-size: 32px;
      font-weight: 600;
      margin: 20px 0;
      color: #ffffff;
    }

    /* 错误描述 */
    .error-message {
      font-size: 16px;
      color: #909399;
      margin: 16px 0 40px;
    }

    /* 返回首页按钮 */
    .home-btn {
      background: linear-gradient(135deg, #c3ade9, #59a4a9);
      border: none;
      padding: 12px 40px;
      font-size: 16px;
      font-weight: 500;
      color: white;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 1;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(195, 173, 233, 0.4);
      }

      &:active {
        transform: translateY(0);
      }

      :deep(.el-icon) {
        margin-right: 6px;
      }
    }
  }
}
</style>
