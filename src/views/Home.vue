<template>
  <div class="movie-manager">
    <MovieHome/>
    <div class="icp-info">
      <p>ICP备案/许可证号：蜀ICP备2025179642号 | 川公网安备51010702043884号</p>
    </div>

    <!-- 点击界面出现烟花效果 -->
    <Hanabi class="firework" />
  </div>
</template>

<script>
import MovieHome from '@/views/movie/MovieIndex.vue';
import Hanabi from '@/components/Hanabi.vue';

export default {
  name: 'Home',
  components: {
    MovieHome,
    Hanabi
  },  
  data() {
    return {
      
    }
  },
  methods: {

  }
}
</script>

<style scoped lang="scss">
.movie-manager {
  background-color: #000000;
  min-height: calc(100vh);
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