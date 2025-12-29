<template>
  <div class="movie-library">
    <div class="container">
      <!-- 标题 -->
      <div class="section-header">
        <h2>全部影视</h2>
      </div>

      <!-- 所有影视展示区域 -->
      <div class="all-movies-grid">
        <div 
          class="movie-card" 
          v-for="movie in movies" 
          :key="movie.id"
          @click="viewMovieDetail(movie.id)"
        >
          <div class="movie-poster">
            <img :src="movie.posterUrl" :alt="movie.name">
            <div class="movie-details">
              <span class="movie-rating">{{ movie.rating }}</span>
              <span class="movie-directory">{{ movie.platform }}</span>
            </div>
          </div>
          <div class="movie-info">
            <h3>{{ movie.name }}</h3>
            <span class="movie-year">{{ movie.releaseYear }}</span>
          </div>
        </div>
      </div>
    
    </div>
  </div>
</template>

<script>
import { getLibrary } from '@/api/movie';

import '@/assets/css/responsive-movielibrary.css';
export default {
  name: 'MovieLibrary',
  props: {
    directory: String,
  },
  data() {
    return {
      movies: [],
      pageParams:{
        pageNum:1,
        pageSize:50,
        directory:this.directory
      },
      totalCount: 0,
    }
  },
  watch: {
    directory: function(newVal, oldVal) {
      this.pageParams.pageNum=1;
      this.pageParams.pageSize=20;
      this.pageParams.directory=newVal;
      this.movies=[];
      this.loadMovies();
    }
  },
  mounted() {
    this.loadMovies();
  },
  methods: {
    loadMovies() {
        getLibrary(this.pageParams).then(res => { 
          if(res.code==200) { 
            let data = res.data.list;
            this.totalCount = res.data.total;
            data.forEach(movie => {
            movie.posterUrl = movie.posterUrl==null?"":movie.posterUrl,
            movie.rating = movie.rating?movie.rating.toFixed(1):0;
            });
            this.movies = this.movies.concat(data);
            if(this.totalCount >= this.pageParams.pageNum * this.pageParams.pageSize && data.length >= this.pageParams.pageSize) {
                this.pageParams.pageNum++;
                this.loadMovies();
            }
          }
        });
    },
    viewMovieDetail(id) {
      this.$emit('go-detail', id);
    }
  }
}
</script>

<style scoped lang="scss">
.movie-library {
  background-color: #0a0a0a;
  min-height: calc(100vh - 100px);
  padding: 20px;
  color: white;
  
  .container {
    margin: 0 auto;
  }
  
  .section-header {
    margin-bottom: 20px;
    
    h2 {
      font-size: 24px;
      font-weight: bold;
      color: white;
      text-align: left;
    }
  }
  
  .all-movies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .movie-card {
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    background-color: #1a1a1a;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    
    .movie-poster {
      width: 100%;
      height: 300px;
      position: relative;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      //阴影效果
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 30%;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
        pointer-events: none;
      }
      
      .movie-details {
        position: absolute;
        bottom: 5px;
        left: 5px;
        right: 5px;
        display: flex;
        justify-content: space-between;
        z-index: 1; /* 确保在遮罩层上方 */
        
        .movie-rating {
          color: #ff9e02;
          font-weight: bold;
          font-size: 12px;
          background-color: rgba(0, 0, 0, 0.7);
          padding: 5px 10px;
          border-radius: 4px;
        }
        
        .movie-directory {
          color: rgb(238, 238, 238);
          font-weight: bold;
          font-size: 12px;
          padding: 5px 10px;
          border-radius: 4px;
        }
      }
    }
    
    .movie-info {
      padding: 15px;
      h3 {
        font-size: 16px;
        margin: 0;
        color: white;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .movie-year {
        font-size: 12px;
        padding: 3px 8px;
        color: rgb(174, 174, 174);
      }
    }
  }
  
  .load-more {
    text-align: center;
    
    ::v-deep .el-button {
      background-color: #1abc9c;
      border-color: #1abc9c;
      color: white;
      height: 48px;
      font-size: 16px;
      padding: 0 30px;
    }
  }
}

</style>