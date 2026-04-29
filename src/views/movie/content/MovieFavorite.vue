<template>
  <div class="movie-favorite">
    <!-- 头部 -->
    <div class="header-container">
      <sparkles-text text="收藏记录" :sparklesCount="5" class="sparkles-text" />
    </div>

    <!-- 未登录提示 -->
    <div v-if="!userStore.isLogin" class="not-login-state">
      <el-icon class="not-login-icon"><UserFilled /></el-icon>
      <p>登录后即可管理收藏记录</p>
      <el-button type="primary" @click="uiStore.openLoginDialog()">去登录</el-button>
    </div>

    <!-- 影视列表和滚动区域 -->
    <el-scrollbar v-else class="movie-scroll" :distance="10">
      <div class="movie-grid">
        <template v-for="movie in movieList" :key="movie.id">
          <div class="movie-card">
            <MovieCard
              :movie="movie"
              :can-operate="false"
              @command="{}"
              @favorite-update="handleFavoriteUpdate"
              @go-detail="emit('go-detail', $event)" />
          </div>
        </template>
      </div>

      <!-- 空状态提示 -->
      <div v-if="!loading && totalCount === 0" class="empty-state">
        <div class="empty-content">
          <el-icon class="empty-icon"><Collection /></el-icon>
          <p class="empty-text">还没有收藏任何内容</p>
          <el-button type="primary" @click="emit('go-all-library')">去逛逛</el-button>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Collection, UserFilled } from '@element-plus/icons-vue'
import { getFavoriteList } from '@/api/movie/movieCatalog'
import { ElMessage, ElScrollbar } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useUIStore } from '@/store/modules/ui'
import MovieCard from './library/MovieCard.vue'
import SparklesText from '@/components/inspira-ui/text-animations/SparklesText.vue'

// Store
const userStore = useUserStore()
const uiStore = useUIStore()

// Emits
const emit = defineEmits<{
  'go-detail': [params: { catalogId: number; bangumiId?: number }]
  'go-all-library': []
}>()

// 状态
const loading = ref(false)
// 影视列表
const movieList = ref<any[]>([])

// 计算总数据量
const totalCount = computed(() => {
  return movieList.value.length
})

// 加载数据
const fetchData = async () => {
  loading.value = true
  try {
    // 收藏列表直接调用 getFavoriteList 接口
    const res = await getFavoriteList()
    // 处理数据
    const newList = res
    movieList.value.push(...newList) // 追加数据
  } catch (error) {
    ElMessage.error('加载失败:' + error)
  } finally {
    loading.value = false
  }
}

// 收藏更新（取消收藏时从列表移除）
const handleFavoriteUpdate = (movie: any, isFavorite: boolean) => {
  // 只有取消收藏时才需要移除列表项
  if (!isFavorite) {
    movieList.value = movieList.value.filter((m) => m.id !== movie.id)
  }
}

// 生命周期
onMounted(() => {
  if (userStore.isLogin) {
    // 登录了才加载数据
    fetchData()
  }
})
</script>

<style scoped lang="scss">
.movie-favorite {
  background-color: transparent;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: white;
  padding: 20px;

  /* 头部区域 - 标题和搜索框 */
  .header-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 20px;

    /* 闪光文字样式覆盖 */
    .sparkles-text {
      font-size: 28px;
      margin-right: 10px;
    }
  }

  /* 滚动区域 */
  .movie-scroll {
    flex: 1;
    padding: 0 20px 20px;
  }

  /* 影视网格布局 */
  .movie-grid {
    padding: 20px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    position: relative;

    :deep(.el-loading-mask) {
      background-color: rgba(10, 10, 10, 0.8);
    }

    :deep(.el-loading-spinner) {
      color: #1abc9c;

      .path {
        stroke: #1abc9c;
      }
    }
  }

  /* 未登录状态 */
  .not-login-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 40px;
    animation: fadeInUp 0.6s ease-out;
    border-radius: 24px;
    margin: 20px;

    .not-login-icon {
      font-size: 100px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #ec4899 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 24px;
      animation:
        float 3s ease-in-out infinite,
        gradient-shift 4s ease infinite;
      filter: drop-shadow(0 0 20px rgba(102, 126, 234, 0.4));
    }

    p {
      font-size: 18px;
      color: #e2e8f0;
      margin: 0 0 24px;
      font-weight: 500;
    }

    .el-button {
      height: 48px;
      padding: 0 32px;
      font-size: 16px;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #ec4899 100%);
      background-size: 200% auto;
      border: none;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
      animation: gradient-shift 4s ease infinite;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 35px rgba(102, 126, 234, 0.55);
      }
    }
  }

  /* 空状态 */
  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 80px 40px;
    animation: fadeInUp 0.6s ease-out;
    border-radius: 24px;
    margin: 20px;

    .empty-content {
      text-align: center;

      .empty-icon {
        font-size: 100px;
        color: #666;
        background: linear-gradient(135deg, #1abc9c 0%, #48cae4 50%, #667eea 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 24px;
        animation:
          float 3s ease-in-out infinite,
          gradient-shift 4s ease infinite;
        filter: drop-shadow(0 0 20px rgba(26, 188, 156, 0.4));
      }

      .empty-text {
        font-size: 22px;
        font-weight: 600;
        background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0 0 12px;
        animation: fadeInUp 0.5s ease-out 0.1s both;
      }

      .empty-hint {
        font-size: 16px;
        color: #94a3b8;
        margin: 0 0 28px;
        animation: fadeInUp 0.5s ease-out 0.2s both;
      }

      .el-button {
        height: 48px;
        padding: 0 32px;
        font-size: 16px;
        border-radius: 12px;
        background: linear-gradient(135deg, #1abc9c 0%, #48cae4 50%, #667eea 100%);
        background-size: 200% auto;
        border: none;
        box-shadow: 0 8px 25px rgba(26, 188, 156, 0.4);
        animation:
          gradient-shift 4s ease infinite,
          fadeInUp 0.5s ease-out 0.3s both;

        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(26, 188, 156, 0.55);
        }
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
