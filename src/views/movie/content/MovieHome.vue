<template>
  <div class="movie-home">
    <div class="container">
      <!-- 搜索区域 -->
      <div class="search-section">
        <div class="search-box">
          <el-input
            placeholder="AI搜索..."
            v-model="searchKeyword"
            class="search-input"
            size="large"
            @keyup.enter.native="handleSearch"
          >
            <div slot="prefix" class="input-icon">
              <!-- <img src="@/assets/images/icon/deepseek_log.png" alt="搜索" class="search-icon-img"> -->
            </div>
            <el-button slot="append" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          </el-input>
        </div>
      </div>

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
                <img :src="movies[0]?.posterUrl">
                <div class="movie-overlay-main">
                  <div class="movie-info">
                    <h3>{{ movies[0]?.name }}</h3>
                    <p class="movie-meta">
                      <span class="movie-country">类型: {{ movies[0]?.platform }} | {{ movies[0]?.releaseYear }}</span>
                    </p>
                    <p class="movie-meta">
                      <span class="movie-genre">标签: {{  movies[0]?.metaTags.join(', ') }}</span>
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
                  <img :src="movie.posterUrl">
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
                  <img :src="movie.posterUrl">
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
      
      <div class="remaining-content">
        <div class="remaining-label" @click="handleClickLastUpdate">最近添加 ></div>
        <div class="horizontal-scroll-container">
          <div 
            class="movie-item" 
            v-for="(movie) in lastUpdate" 
            :key="movie.id"
            @click="viewMovieDetail(movie.id)"
          >
            <div class="movie-poster-small">
              <img :src="movie.posterUrl" :alt="movie.name">
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
import { randomQuery,lastUpdate } from '@/api/movie';
export default {
  name: 'MovieHome',
  components: {
  },
  data() {
    return {
      searchKeyword: '',
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
            movie.posterUrl = movie.posterUrl==null?"":movie.posterUrl,
            movie.rating = movie.rating?movie.rating.toFixed(1):0;
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
    handleClickLastUpdate(){
      this.$emit('go-allMovie', 'library');
    },
    handleSearch() {
      if (this.searchKeyword.trim()) {
        this.$emit('show-login')
      } else {
        this.$message.warning('请输入搜索关键词');
      }
    },
    
 
    //详情页面
    viewMovieDetail(id) {
      this.$emit('go-detail', id);
    }
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
    margin: 0 auto;
  }
  
  // 搜索区域样式
  .search-section {
    padding: 30px 0;
    text-align: center;
    
    .search-box {
      max-width: 600px;
      margin: 0 auto;
      
      ::v-deep .el-input__inner {
        background-color: rgba(255, 255, 255, 0.1);
        border: 1px solid #444;
        color: white;
        height: 48px;
        font-size: 16px;
        
        &::placeholder {
          color: #aaa;
        }
      }
      
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
  
  // 影片展示区域样式
  .movie-showcase {
    margin-top: 20px;
    height: 65vh; 
    
    .featured-movies {
      display: flex;
      gap: 20px;
      height: calc(100% - 70px); /* 减去标题高度 */
      
      .main-feature {
        flex: 2;
        
        .featured-card {
          height: 100%;
          
          .movie-poster {
            width: 100%;
            height: 100%;
            
            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
            }
          }
        }
      }
      
      .secondary-features {
        flex: 3;
        display: flex;
        flex-direction: column;
        gap: 20px;
        
        .movie-row {
          display: flex;
          gap: 15px;
          flex: 1;
          
          .secondary-card {
            flex: 1;
            
            .movie-poster {
              width: 100%;
              height: 100%;
              
              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
              }
            }
          }
        }
      }
    }
    
    .movie-card {
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        
        .movie-overlay {
          opacity: 1;
        }
      }
      
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
            
            .movie-country, .movie-genre {
              // background-color: rgba(255, 255, 255, 0.2);
              padding: 4px 10px;
              border-radius: 12px;
              font-size: 16px;
              backdrop-filter: blur(5px);
              display: inline-block;
              margin: 0 5px 5px 0;
              
              .ai-icon {
                width: 16px;
                height: 16px;
                vertical-align: middle;
                margin-right: 5px;
                display: inline-block;
              }
              
              i {
                margin-right: 5px;
                color: #409EFF;
                display: inline-block;
                vertical-align: middle;
              }
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
  
  // 下方剩余空间
  .remaining-content {
    padding: 20px;
    background: linear-gradient(135deg, #c3ade9, #59a4a9);
    border-radius: 10px;
    
    .remaining-label{
      cursor: pointer;
      font-size: 24px;
      font-weight: bold;
      color: white;
      margin-bottom: 20px;
      text-align: left
    }
    h3 {
      font-size: 24px;
      font-weight: bold;
      color: white;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .horizontal-scroll-container {
      display: flex;
      overflow-x: auto;
      gap: 20px;
      padding: 10px 5px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.5) transparent;
      
      &::-webkit-scrollbar {
        height: 8px;
      }
      
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      
      &::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.5);
        border-radius: 4px;
      }
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
    }
    
    .movie-poster-small {
      width: 120px;
      height: 180px;
      margin: 0 auto 10px;
      border-radius: 8px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
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
@media (max-width: 992px) {
  .movie-home {
    .movie-showcase .featured-movies {
      flex-direction: column;
      height: auto;
      
      .main-feature .featured-card {
        height: 400px;
      }
      
      .secondary-features .movie-row {
        flex-wrap: wrap;
        
        .secondary-card {
          flex: 0 0 calc(50% - 10px);
          height: 200px;
        }
      }
    }
    
    .remaining-content {
      height: 30vh;
    }
  }
}

@media (max-width: 768px) {
  .movie-home {
    padding: 10px;
    
    .search-section .search-box {
      max-width: 100%;
    }
    
    .movie-showcase .featured-movies {
      .main-feature .featured-card {
        height: 300px;
      }
      
      .secondary-features .movie-row .secondary-card {
        flex: 0 0 100%;
        height: 150px;
      }
    }
    
    .remaining-content p {
      font-size: 18px;
    }
  }
}
</style>