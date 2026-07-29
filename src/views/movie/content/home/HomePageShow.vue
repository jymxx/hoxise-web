<template>
  <div class="movie-card-section">
    <!-- 影视展示区域 -->
    <div class="movie-showcase">
      <div class="featured-movies">
        <!-- 主推荐电影 -->
        <div class="main-feature">
          <HomeCard
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          />
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
import { ref, onMounted } from 'vue'
import { Loading, Picture } from '@element-plus/icons-vue'
import { randomQuery, lastUpdate } from '@/api/movie/movieCatalog'
import { getTargetUserid } from '@/utils/route'
import HomeCard from '@/views/movie/content/home/card/HomeCard.vue'

// Emits
const emit = defineEmits<{
  'go-detail': [id: number]
  'go-allMovie': [key: string]
}>()

// 状态
const movies = ref<any[]>([])
const lastUpdateMovies = ref<any[]>([])

// 数据处理
const processMovie = (movie: any) => ({
  ...movie,
  posterUrl: movie.posterUrl || '',
  rating: movie.rating?.toFixed(1) ?? '0.0',
})

// 加载随机影视
const getRandomMovies = async () => {
  const res = await randomQuery(20, getTargetUserid())
  movies.value = res.map(processMovie)
}

// 加载最近添加
const getLastUpdate = async () => {
  const res = await lastUpdate(getTargetUserid())
  lastUpdateMovies.value = res.map(processMovie)
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
  width: 100%;
  .movie-showcase {
    margin-top: 20px;
    height: 65vh;

    .featured-movies {
      display: flex;
      gap: 20px;
      height: calc(100% - 70px);

      .main-feature {
        flex: 2;
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
