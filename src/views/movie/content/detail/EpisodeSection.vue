<template>
  <div class="episode-section" v-if="episodes?.length">
    <h2 class="section-title">章节列表</h2>
    <div class="episode-grid">
      <div v-for="(episode, index) in episodes" :key="episode.id" class="episode-item" @click="emit('play-episode', episode)">
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
  max-width: 1100px;

  .section-title {
    font-size: 24px;
    margin: 30px 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #1abc9c;
  }

  .episode-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
    padding: 10px 0 20px 0;
  }

  .episode-item {
    display: flex;
    flex-direction: column;
    background-color: rgba(30, 30, 30, 0.7);
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: scale(1.03);
    }
  }

  .episode-cover {
    position: relative;
    width: 100%;
    height: 100px;
    overflow: hidden;

    .episode-cover-image {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  .episode-info {
    padding: 15px;
    flex: 1;
    display: flex;
    flex-direction: column;

    .episode-title {
      font-size: 16px;
      margin: 0 0 5px 0;
      color: white;
      font-weight: bold;
    }

    .episode-subtitle {
      font-size: 14px;
      color: #aaa;
      margin: 0 0 8px 0;
    }

    .episode-date,
    .episode-duration {
      font-size: 13px;
      color: #777;
      margin: 3px 0;
    }
  }
}
</style>
