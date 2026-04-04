<template>
  <div class="movie-card-section">
    <!-- 影视展示区域 -->
    <div class="movie-showcase">
      <div class="featured-movies">
        <!-- 主推荐电影 -->
        <div v-if="mainMovie" class="main-feature">
          <div class="movie-card featured-card" @click="emitDetail(mainMovie.id)">
            <div class="movie-poster">
              <el-image :src="mainMovie.posterUrl" fit="cover" class="image-slot" lazy>
                <template #placeholder>
                  <div class="image-slot">
                    <el-icon><Loading /></el-icon>
                  </div>
                </template>
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="movie-overlay-main">
                <div class="movie-info">
                  <h3>{{ mainMovie.name }}</h3>
                  <p class="movie-meta">
                    <span class="movie-type">类型：{{ mainMovie.platform }} | {{ mainMovie.releaseYear }}</span>
                  </p>
                  <p class="movie-meta">
                    <span class="movie-genre">标签：{{ mainMovie.metaTags?.join(', ') }}</span>
                  </p>
                  <p class="movie-rating">{{ mainMovie.rating }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 其他电影展示 -->
        <div class="secondary-features">
          <!-- 第二行 -->
          <div v-if="secondaryMovies1.length > 0" class="movie-row">
            <div
              v-for="movie in secondaryMovies1"
              :key="movie.id"
              class="movie-card secondary-card"
              @click="emitDetail(movie.id)">
              <div class="movie-poster">
                <el-image :src="movie.posterUrl" fit="cover" class="image-slot" lazy>
                  <template #placeholder>
                    <div class="image-slot">
                      <el-icon><Loading /></el-icon>
                    </div>
                  </template>
                  <template #error>
                    <div class="image-slot">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
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

          <!-- 第三行 -->
          <div v-if="secondaryMovies2.length > 0" class="movie-row">
            <div
              v-for="movie in secondaryMovies2"
              :key="movie.id"
              class="movie-card secondary-card"
              @click="emitDetail(movie.id)">
              <div class="movie-poster">
                <el-image :src="movie.posterUrl" fit="cover" class="image-slot">
                  <template #placeholder>
                    <div class="image-slot">
                      <el-icon><Loading /></el-icon>
                    </div>
                  </template>
                  <template #error>
                    <div class="image-slot">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
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
      <div class="last-update-label" @click="emit('go-allMovie', 'library')">最近添加 &gt;</div>
      <div class="horizontal-scroll-container">
        <div v-for="movie in lastUpdateMovies" :key="movie.id" class="movie-item" @click="emitDetail(movie.id)">
          <div class="movie-poster-small">
            <el-image :src="movie.posterUrl" :alt="movie.name" fit="cover" class="image-slot">
              <template #placeholder>
                <div class="image-slot">
                  <el-icon><Loading /></el-icon>
                </div>
              </template>
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Loading, Picture } from '@element-plus/icons-vue'
import { randomQuery, lastUpdate } from '@/api/movie/movieCatalog'
import { getTargetUserid } from '@/utils/route'

// Emits
const emit = defineEmits<{
  'go-detail': [id: number]
  'go-allMovie': [key: string]
}>()

// 数据处理
const processMovie = (movie: any) => ({
  ...movie,
  posterUrl: movie.posterUrl || '',
  rating: movie.rating?.toFixed(1) ?? '0.0',
})

// 状态
const movies = ref<any[]>([])
const lastUpdateMovies = ref<any[]>([])

// 计算属性
const mainMovie = computed(() => movies.value[0] ?? null)
const secondaryMovies1 = computed(() => movies.value.slice(1, 6))
const secondaryMovies2 = computed(() => movies.value.slice(6, 11))

// 加载随机影视
const getRandomMovies = async () => {
  try {
    const res = await randomQuery(20, getTargetUserid())
    movies.value = res.map(processMovie)
  } catch (error) {
    console.error('获取随机影视失败:', error)
  }
}

// 加载最近添加
const getLastUpdate = async () => {
  try {
    const res = await lastUpdate(getTargetUserid())
    lastUpdateMovies.value = res.map(processMovie)
  } catch (error) {
    console.error('获取最近添加失败:', error)
  }
}

// 触发详情事件
const emitDetail = (id: number) => {
  emit('go-detail', id)
}

// 暴露方法给父组件
defineExpose({
  getRandomMovies,
})

// 初始化
onMounted(() => {
  getRandomMovies()
  getLastUpdate()
})
</script>

<style scoped lang="scss">
.movie-card-section {
  .movie-showcase {
    margin-top: 20px;
    height: 65vh;

    .featured-movies {
      display: flex;
      gap: 20px;
      height: calc(100% - 70px);

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

    .movie-card {
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;
      position: relative;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      }

      .movie-overlay-main {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent 50%);
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

            .movie-type,
            .movie-genre {
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
          }
        }
      }

      .movie-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent 50%);
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
          }
        }
      }
    }
  }

  .last-update-content {
    padding: 20px;
    background: linear-gradient(135deg, #c3ade9, #59a4a9);
    border-radius: 10px;

    .last-update-label {
      cursor: pointer;
      font-size: 24px;
      font-weight: bold;
      color: white;
      margin-bottom: 20px;
      text-align: left;
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
