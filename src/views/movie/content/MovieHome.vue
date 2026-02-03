<template>
  <div class="movie-home">
    <div class="container">

      <!-- ai功能 -->
      <ai-chat />

      <!-- 影视展示区域 -->
      <div class="movie-showcase">
        <div class="featured-movies">
          <!-- 主推荐电影（占据左侧） -->
          <div class="main-feature">
            <div 
              class="movie-card featured-card" 
              @click="viewMovieDetail(movies[0].id)"
            >
              <div class="movie-poster">
                <el-image 
                  :src="movies[0]?.posterUrl"
                  fit="cover"
                  class="image-slot"
                >
                  <div slot="placeholder" class="image-slot">
                    <i class="el-icon-loading"></i>
                  </div>
                  <div slot="error" class="image-slot">
                    <i class="el-icon-picture-outline"></i>
                  </div>
                </el-image>
                <div class="movie-overlay-main">
                  <div class="movie-info">
                    <h3>{{ movies[0]?.name }}</h3>
                    <p class="movie-meta">
                      <span class="movie-type">类型: {{ movies[0]?.platform }} | {{ movies[0]?.releaseYear }}</span>
                    </p>
                    <p class="movie-meta">
                      <span class="movie-genre">标签: {{  movies[0]?.metaTags?.join(', ') }}</span>
                    </p>
                    <p class="movie-rating">{{ movies[0]?.rating }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 其他电影展示区域 -->
          <div class="secondary-features">
            <!-- 第二行电影 -->
            <div class="movie-row">
              <div 
                class="movie-card secondary-card" 
                v-for="movie in movies.slice(1, 6)" 
                :key="movie.id"
                @click="viewMovieDetail(movie.id)"
              >
                <div class="movie-poster">
                  <el-image 
                    :src="movie.posterUrl"
                    fit="cover"
                    class="image-slot"
                  >
                    <div slot="placeholder" class="image-slot">
                      <i class="el-icon-loading"></i>
                    </div>
                    <div slot="error" class="image-slot">
                      <i class="el-icon-picture-outline"></i>
                    </div>
                  </el-image>
                  <div class="movie-overlay">
                    <div class="movie-info">
                      <h3>{{ movie.name }}</h3>
                      <p class="movie-rating">{{ movie.rating }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 第三行电影 -->
            <div class="movie-row">
              <div 
                class="movie-card secondary-card" 
                v-for="movie in movies.slice(6, 11)" 
                :key="movie.id"
                @click="viewMovieDetail(movie.id)"
              >
                <div class="movie-poster">
                  <el-image 
                    :src="movie.posterUrl"
                    fit="cover"
                    class="image-slot"
                  >
                    <div slot="placeholder" class="image-slot">
                      <i class="el-icon-loading"></i>
                    </div>
                    <div slot="error" class="image-slot">
                      <i class="el-icon-picture-outline"></i>
                    </div>
                  </el-image>
                  <div class="movie-overlay">
                    <div class="movie-info">
                      <h3>{{ movie.name }}</h3>
                      <p class="movie-rating">{{ movie.rating }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 最近添加 -->
      <div class="last-update-content">
        <div class="last-update-label" @click="handleClickLastUpdate">最近添加 ></div>
        <div class="horizontal-scroll-container">
          <div 
            class="movie-item" 
            v-for="(movie) in lastUpdate" 
            :key="movie.id"
            @click="viewMovieDetail(movie.id)"
          >
            <div class="movie-poster-small">
              <el-image 
                :src="movie.posterUrl" 
                :alt="movie.name"
                fit="cover"
                class="image-slot"
              >
                <div slot="placeholder" class="image-slot">
                  <i class="el-icon-loading"></i>
                </div>
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
            </div>
            <div class="movie-info-small">
              <h3>{{ movie.name }}</h3>
              <p class="movie-rating-small">{{ movie.rating }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script>
import { randomQuery,lastUpdate } from '@/api/movie/movieCatalog';
import AiChat from './home/AiChat.vue'; 

import '@/assets/css/responsive-moviehome.css'; // 1080p兼容

export default {
  name: 'MovieHome',
  components: {
    AiChat,
  },
  data() {
    return {
      movies: [],
      lastUpdate: [],
    }
  },
  mounted() {
    this.getRandomMovies();
    this.getLastUpdate();
  },

  methods: {
    //随机影视
    getRandomMovies() {
      randomQuery(20).then(res => {
        if(res.code ==200){
          this.movies = res.data;
          this.movies.forEach(movie => {
            movie.posterUrl = movie.posterUrl==null?"":movie.posterUrl, //图片处理
            movie.rating = movie.rating?movie.rating.toFixed(1):0; //评分处理
          });
        }else{
          this.$message.error(res.message);
        }
      });
    },
    //最近更新
    getLastUpdate() {
      lastUpdate().then(res => {
        this.lastUpdate = res.data;
        this.lastUpdate.forEach(movie => {
          movie.posterUrl = movie.posterUrl==null?"":movie.posterUrl,
          movie.rating = movie.rating?movie.rating.toFixed(1):0;
        });
      });
    },
    //详情页面
    viewMovieDetail(id) {
      this.$emit('go-detail', id);
    },
    //最后更新
    handleClickLastUpdate(){
      this.$emit('go-allMovie', 'library');
    },
    
  }
}
</script>

<style scoped lang="scss">
.movie-home {
  background-color: #0a0a0a;
  min-height: calc(100vh - 100px);
  padding: 20px;
  color: white;
  
  .container {
    max-width: 2200px;
  }
  
  // 影片展示区域样式
  .movie-showcase {
    margin-top: 20px;
    height: 65vh; 
    
    .featured-movies {
      display: flex;
      gap: 20px;
      height: calc(100% - 70px); /* 减去标题高度 */

      // 左侧主推荐区域
      .main-feature {
        flex: 2;
        .featured-card {
          height: 100%;
          .movie-poster {
            width: 100%;
            height: 100%;
          }
        }
      }
      // 右侧推荐区域
      .secondary-features {
        flex: 4;
        display: flex;
        flex-direction: column;
        gap: 20px;
        
        .movie-row {
          height: 220px;
          display: flex;
          gap: 15px;
          flex: 1;
          
          .secondary-card {
            flex: 1;
            
            .movie-poster {
              width: 100%;
              height: 100%;
            }
          }
        }
      }
    }
    // 信息卡
    .movie-card {
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
      // 鼠标移入时，添加阴影
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      }
      // 悬浮在图片上的信息
      .movie-overlay-main {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent 50%);
        opacity: 1;
        transition: opacity 0.3s ease;
        display: flex;
        align-items: flex-end;
        padding: 15px;
        
        .movie-info {
          padding: 20px;
          h3 {
            font-size: 36px;
            color: white;
            text-align: left;
          }
          
          .movie-meta {
            display: block;
            margin-bottom: 20px;
            text-align: left;
            
            .movie-type, .movie-genre {
              padding: 4px 10px;
              backdrop-filter: blur(5px);
              display: inline-block;
              margin: 0 5px 5px 0;
            }
          }
          
          .movie-rating {
            position: absolute;
            top: 15px;
            right: 40px;
            color: #ff9e02;
            font-weight: bold;
            font-size: 28px;
            margin: 0;
            background-color: rgba(0, 0, 0, 0.7);
            padding: 5px 15px;
            border-radius: 20px;
            opacity: 1;
          }
        }
      }

      .movie-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent 50%);
        opacity: 1;
        transition: opacity 0.3s ease;
        display: flex;
        padding: 15px;
        align-items: flex-end;
        
        .movie-info {
          h3 {
            font-size: 16px;
            max-width: 220px;
            margin-bottom: 30px;
            color: white;
          }

          .movie-rating {
            position: absolute;
            top: 10px;
            right: 35px;
            color: #ff9e02;
            font-weight: bold;
            font-size: 18px;
            margin: 0;
            background-color: rgba(0, 0, 0, 0.7);
            padding: 5px 15px;
            border-radius: 20px;
            opacity: 1;
          }
        }
      }
    }
  }
  
  // 最近添加
  .last-update-content {
    padding: 20px;
    background: linear-gradient(135deg, #c3ade9, #59a4a9);
    border-radius: 10px;
    
    .last-update-label{
      cursor: pointer;
      font-size: 24px;
      font-weight: bold;
      color: white;
      margin-bottom: 20px;
      text-align: left
    }

    .horizontal-scroll-container {
      display: flex;
      overflow-x: auto;
      gap: 20px;
      padding: 10px 5px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.5) transparent;
    }
    
    .movie-item {
      flex: 0 0 auto;
      width: 140px;
      cursor: pointer;
      text-align: center;
      transition: transform 0.3s;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      padding: 10px;
      
      &:hover {
        transform: translateY(-5px);
        background: rgba(0, 0, 0, 0.3);
      }

      .movie-poster-small {
        width: 120px;
        height: 180px;
        margin: 0 auto 10px;
        border-radius: 8px;
        overflow: hidden;
        
        .el-image {
          width: 100%;
          height: 100%;
          display: block;
        }
      }
      
      .movie-info-small {
        h3 {
          font-size: 14px;
          font-weight: 600;
          color: white;
          margin: 0 0 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .movie-rating-small {
          margin: 0;
          color: #ff9e02;
          font-weight: bold;
        }
      }
    }
    

  }
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #909399;
  font-size: 14px;
}

</style>