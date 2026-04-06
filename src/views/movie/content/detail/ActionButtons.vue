<template>
  <div class="action-buttons">
    <el-button type="primary" size="large" class="play-button" @click="emit('play')">
      <i class="el-icon-video-play"></i> 立即观看
    </el-button>
    <el-button size="large" class="collect-button" @click="emit('action', 'collect')">
      <i class="el-icon-star-off"></i> 收藏
    </el-button>
    <el-button v-if="hasManagerRole" type="primary" size="large" class="play-button" @click="emit('matching')">
      <i class="el-icon-search"></i> 手动匹配信息
    </el-button>
    <el-button type="primary" size="large" class="play-button" :loading="isAIGenerating" @click="emit('ai-summary')">
      <!-- <img src="/images/icon/deepseek_log.png" class="ai-icon" /> -->
      {{ isAIGenerating ? 'AI 生成中...' : 'AI 总结' }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
    padding: 12px 25px;
    font-size: 16px;

    &.play-button {
      background-color: #1abc9c;
      border-color: #1abc9c;

      .ai-icon {
        width: 24px;
        height: 24px;
        margin-right: 8px;
        vertical-align: middle;
      }
    }

    &.collect-button {
      background-color: rgba(255, 255, 255, 0.1);
      border: 1px solid #444;
    }
  }
}
</style>
