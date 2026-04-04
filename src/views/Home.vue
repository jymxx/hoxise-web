<template>
  <div class="movie-manager">
    <MovieIndex />
    
    <div class="icp-info">
      <p>ICP备案/许可证号：蜀ICP备2025179642号 | 川公网安备51010702043884号</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import MovieIndex from '@/views/movie/MovieIndex.vue'

</script>

<style scoped lang="scss">
.movie-manager {
  background-color: #000000;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.icp-info {
  text-align: center;
  padding: 20px;
  color: #ffffff;
  font-size: 14px;
  margin-top: auto;
}
</style>
