<template>
  <div class="action-buttons">
    <el-button type="primary" size="large" class="play-button" @click="emit('play')">
      <el-icon class="button-icon"><VideoPlay /></el-icon>
      <span class="button-text">立即观看</span>
    </el-button>
    <el-button v-if="hasManagerRole" type="primary" size="large" class="edit-button" @click="emit('matching')">
      <el-icon class="button-icon"><Search /></el-icon>
      <span class="button-text">手动匹配信息</span>
    </el-button>
    <el-button type="primary" size="large" class="ai-button" :loading="isAIGenerating" @click="emit('ai-summary')">
      <el-icon class="button-icon" :class="{ rotating: isAIGenerating }"><MagicStick /></el-icon>
      <span class="button-text">{{ isAIGenerating ? 'AI 生成中...' : 'AI 总结' }}</span>
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VideoPlay, Search, MagicStick } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'

// Props
defineProps<{
  isAIGenerating: boolean
}>()

// Emits
const emit = defineEmits<{
  play: []
  action: [key: string]
  matching: []
  'ai-summary': []
}>()

// Store
const userStore = useUserStore()

// 管理员权限
const hasManagerRole = computed(() => {
  const roles = userStore.roles || []
  return roles.includes('manager')
})
</script>

<style scoped lang="scss">
.action-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;

  .el-button {
    border-radius: 25px;
    padding: 12px 28px;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;

    .button-icon {
      font-size: 18px;
    }

    .button-text {
      letter-spacing: 0.5px;
    }

    &.play-button {
      background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%);
      border: none;
      box-shadow: 0 4px 15px rgba(26, 188, 156, 0.35);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(26, 188, 156, 0.45);
      }

      &:active {
        transform: translateY(0);
      }
    }

    &.edit-button {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
      border: none;
      box-shadow: 0 4px 15px rgba(52, 152, 219, 0.35);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(52, 152, 219, 0.45);
      }

      &:active {
        transform: translateY(0);
      }
    }

    &.ai-button {
      background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
      border: none;
      box-shadow: 0 4px 15px rgba(155, 89, 182, 0.35);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(155, 89, 182, 0.45);
      }

      &:active {
        transform: translateY(0);
      }

      .rotating {
        animation: spin 1.5s linear infinite;
      }
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
