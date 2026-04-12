<template>
  <div class="character-section" v-if="characters?.length">
    <h2 class="section-title">角色介绍</h2>
    <div class="horizontal-scroll-container">
      <div v-for="char in characters" :key="char.id" class="character-item">
        <div class="character-poster-small">
          <el-image
            :src="char.imgUrl"
            :alt="char.name"
            fit="cover"
            class="image-slot"
            :preview-src-list="[char.imgUrl]"
            preview-teleported
            :hide-on-click-modal="true">
            <template #placeholder>
              <div class="image-slot">
                <el-icon :size="24"><Loading /></el-icon>
              </div>
            </template>
            <template #error>
              <div class="image-slot">
                <el-icon :size="24"><User /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
        <div class="character-info-small">
          <h3 class="character-name">{{ char.name }}</h3>
          <p class="character-relation">{{ char.relation }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading, User } from '@element-plus/icons-vue'

// Props
defineProps<{
  characters: any[]
}>()
</script>

<style scoped lang="scss">
.character-section {
  margin-top: 30px;
  max-width: 1200px;

  // ========== 标题区域 ==========
  .section-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 20px 0;
    color: white;
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(100, 150, 255, 0.15);

    // 左侧装饰条
    &::before {
      content: '';
      width: 4px;
      height: 20px;
      background: linear-gradient(180deg, #1abc9c, #9b59b6);
      border-radius: 2px;
    }
  }

  // ========== 横向滚动容器 ==========
  .horizontal-scroll-container {
    display: flex;
    overflow-x: auto;
    gap: 20px;
    padding: 8px 8px 24px 8px;
    scrollbar-width: thin;
    scrollbar-color: rgba(26, 188, 156, 0.5) rgba(20, 25, 35, 0.3);

    &::-webkit-scrollbar {
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(20, 25, 35, 0.3);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(90deg, rgba(26, 188, 156, 0.6), rgba(155, 89, 182, 0.6));
      border-radius: 4px;
    }
  }

  // ========== 角色卡片 ==========
  .character-item {
    flex: 0 0 auto;
    width: 140px;
    cursor: pointer;
    background: linear-gradient(145deg, rgba(30, 35, 50, 0.9), rgba(20, 25, 35, 0.95));
    border-radius: 16px;
    padding: 14px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.06);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      border-color: rgba(26, 188, 156, 0.35);
      box-shadow: 0 12px 25px rgba(0, 0, 0, 0.25);

      .character-name {
        color: #1abc9c;
      }
    }
  }

  // ========== 角色图片区域 ==========
  .character-poster-small {
    width: 100%;
    aspect-ratio: 3 / 4;
    margin: 0 auto 14px;
    border-radius: 12px;
    overflow: hidden;
    background: rgba(40, 45, 60, 0.8);

    .image-slot,
    :deep(.el-image) {
      width: 100%;
      height: 100%;
    }

    :deep(.el-image__inner) {
      object-position: top center;
    }

    .image-slot {
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.3);
    }
  }

  // ========== 角色信息区域 ==========
  .character-info-small {
    // 角色名称
    .character-name {
      font-size: 14px;
      font-weight: 600;
      margin: 0;
      color: #f0f0f0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.3s ease;
    }

    // 角色关系/演员
    .character-relation {
      font-size: 12px;
      color: #aaa;
      margin: 6px 0 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
