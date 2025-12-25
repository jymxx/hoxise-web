<template>
  <div class="movie-manager">
    <MovieHome/>
  </div>
</template>

<script>
import MovieHome from '@/views/movie/MovieIndex.vue';
export default {
  name: 'Home',
  components: {
    MovieHome
  },  data() {
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
}


</style>