<template>
  <div class="movie-home">
    <div class="movie-home-container">
      <!-- AI 功能 -->
      <!-- <AiChat @go-detail="emitDetail" /> -->

      <!-- 影视卡片展示 -->
      <MovieCard @go-detail="emit('go-detail', $event)" @go-allMovie="emit('go-allMovie', $event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MovieCard from './home/MovieCard.vue'

// Emits
const emit = defineEmits<{
  'go-detail': [id: number]
  'go-allMovie': [key: string]
}>()

// 触发详情事件
const emitDetail = (id: number) => {
  emit('go-detail', id)
}
</script>

<style scoped lang="scss">
.movie-home {
  padding: 20px;
  color: white;
  height: 100%;
  overflow-y: auto;
}
</style>
