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
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { House } from '@element-plus/icons-vue'

const router = useRouter()

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

  /* 内容区域 */
  .error-content {
    text-align: center;
    padding: 40px;
    z-index: 11;
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
