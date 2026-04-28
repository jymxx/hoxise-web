<template>
  <div class="episode-section" v-if="episodes?.length">
    <h2 class="section-title">章节列表</h2>
    <div class="episode-grid">
      <div
        v-for="(episode, index) in episodes"
        :key="episode.id"
        class="episode-item"
        @click="emit('play-episode', episode)">
        <div class="episode-cover">
          <el-image :src="posterUrl" fit="cover" class="episode-cover-image image-slot">
            <template #placeholder>
              <div class="image-slot"><i class="el-icon-loading"></i></div>
            </template>
            <template #error>
              <div class="image-slot"><i class="el-icon-picture-outline"></i></div>
            </template>
          </el-image>
        </div>
        <div class="episode-info">
          <h3 class="episode-title">{{ episode.ep }}. {{ episode.nameCn || episode.name }}</h3>
          <p class="episode-subtitle">{{ episode.name }} ({{ episode.ep || index + 1 }})</p>
          <p class="episode-date" v-if="episode.airDate">放送日期：{{ episode.airDate }}</p>
          <p class="episode-duration" v-if="episode.duration">时长：{{ episode.duration }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
defineProps<{
  episodes: any[]
  posterUrl?: string
}>()

// Emits
const emit = defineEmits<{
  'play-episode': [episode: any]
}>()
</script>

<style scoped lang="scss">
.episode-section {
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

  // ========== 章节网格布局 ==========
  .episode-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
    padding: 8px 0 24px 0;
  }

  // ========== 单个章节卡片 ==========
  .episode-item {
    display: flex;
    flex-direction: column;
    background: linear-gradient(145deg, rgba(30, 35, 50, 0.9), rgba(20, 25, 35, 0.95));
    border-radius: 16px;
    overflow: hidden;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.06);

    &:hover {
      transform: translateY(-4px);
      border-color: rgba(26, 188, 156, 0.35);
      box-shadow: 0 12px 25px rgba(0, 0, 0, 0.25);

      .episode-title {
        color: #1abc9c;
      }
    }
  }

  // ========== 封面图片区域 ==========
  .episode-cover {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: rgba(40, 45, 60, 0.8);

    // 底部渐变遮罩
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.5));
      pointer-events: none;
    }

    .episode-cover-image,
    :deep(.el-image) {
      width: 100%;
      height: 100%;
    }

    // 图片加载占位
    .image-slot {
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.25);
      font-size: 24px;
    }
  }

  // ========== 章节信息区域 ==========
  .episode-info {
    padding: 14px 16px 16px;
    flex: 1;
    display: flex;
    flex-direction: column;

    // 章节标题
    .episode-title {
      font-size: 15px;
      margin: 0 0 6px 0;
      color: #f0f0f0;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    // 原标题/副标题
    .episode-subtitle {
      font-size: 12px;
      color: #aaa;
      margin: 0 0 8px 0;
    }

    // 放送日期和时长
    .episode-date,
    .episode-duration {
      font-size: 11px;
      color: #aaa;
      margin: 2px 0;
    }
  }
}
</style>
