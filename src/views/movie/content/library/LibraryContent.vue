<template>
  <div class="library-content">
    <!-- 影视列表和滚动区域 -->
    <el-scrollbar @end-reached="emit('load-more')" :distance="20" class="movie-scroll">
      <!-- 影视列表 -->
      <div v-loading.lock="loading" class="movie-grid">
        <div
          v-for="(movie, index) in movies"
          :key="`${movie.id}-${index}`"
          :class="['movie-card', { flipped: flippedMovieId === movie.id }]"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @click="emit('go-detail', movie.id)"
          @contextmenu.prevent="handleFlip(movie)"
          @mouseleave="handleMouseLeave(movie)">
          <div class="movie-card-inner">
            <!-- 正面 -->
            <div class="movie-card-front">
              <div class="movie-poster">
                <el-image :src="movie.posterUrl" :alt="movie.name" fit="cover" lazy>
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

                <!-- 操作菜单 (仅已登录且访问自己数据时) -->
                <div
                  v-if="canOperate"
                  class="movie-overlay"
                  @mouseenter="hoveredMovieId = movie.id"
                  @mouseleave="hoveredMovieId = null">
                  <el-dropdown trigger="click" @command="(cmd: string) => handleCommand(cmd, movie)">
                    <el-button
                      circle
                      class="action-btn"
                      :style="{ opacity: hoveredMovieId === movie.id ? 1 : 0 }"
                      @click.stop>
                      <el-icon><More /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="re-match">重新匹配</el-dropdown-item>
                        <el-dropdown-item command="remove">删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>

                <!-- 评分和分类 -->
                <div class="movie-meta">
                  <span class="category">{{ movie.platform }}</span>
                </div>
              </div>

              <div class="movie-info">
                <h3>{{ movie.name }}</h3>
                <span class="movie-year">{{ movie.releaseYear }}</span>
              </div>
            </div>

            <!-- 背面 -->
            <div class="movie-card-back">
              <div class="back-content">
                <h4>{{ movie.name }}</h4>
                <p class="back-meta">{{ movie.originName }}</p>
                <p class="back-meta"><span class="label">平台：</span>{{ movie.platform }}</p>
                <p class="back-meta"><span class="label">年份：</span>{{ movie.releaseYear }}</p>
                <p class="back-meta">
                  <span class="label">评分：</span>
                  <span class="rating-text">{{ movie.rating }}</span>
                </p>
                <p v-if="movie.metaTags?.length" class="back-tags">
                  <span class="label">标签：</span>
                  <span class="tags">{{ movie.metaTags.join(', ') }}</span>
                </p>
                <el-divider />
                <p v-if="movie.totalSize" class="back-row">
                  <span class="label">文件大小：</span> {{ movie.totalSize }} GB
                </p>
                <p v-if="movie.createTime" class="back-row">
                  <span class="label">上传时间：</span> {{ formatDateTime(movie.createTime) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载中提示 -->
      <div v-if="hasMore && loadingMore && movies.length > 0" class="end-title">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <!-- 没有更多提示 -->
      <div v-if="!hasMore && movies.length > 0" class="end-title">
        没有更多了
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Loading, Picture, More } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useMovieStore } from '@/store/modules/movie'

interface Movie {
  id: number | string
  name: string
  originName: string
  platform: string
  releaseYear: string
  rating: string
  metaTags?: string[]
  posterUrl: string
  totalSize?: string
  createTime?: string
}

interface Props {
  movies: Movie[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  canOperate: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'go-detail': [id: number]
  'show-matching': [movie: { id: string | number; name: string }]
  'load-more': []
  'delete': [movie: Movie]
}>()

// 本地状态
const hoveredMovieId = ref<number | null>(null)
const flippedMovieId = ref<number | string | null>(null)

// 格式化时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return ''
  return dateTime.split(' ')[0]
}

// 下拉菜单命令
const handleCommand = (command: string, movie: Movie) => {
  switch (command) {
    case 're-match':
      emit('show-matching', { id: movie.id, name: movie.name })
      break
    case 'remove':
      handleDelete(movie)
      break
  }
}

// 删除
const handleDelete = (movie: Movie) => {
  ElMessageBox.confirm(`确定要删除"${movie.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      emit('delete', movie)
    })
    .catch(() => {})
}

// 翻转卡片
const handleFlip = (movie: Movie) => {
  if (flippedMovieId.value === movie.id) {
    flippedMovieId.value = null
  } else {
    flippedMovieId.value = movie.id
  }
}

// 鼠标移出翻回
const handleMouseLeave = (movie: Movie) => {
  if (flippedMovieId.value === movie.id) {
    flippedMovieId.value = null
  }
}
</script>

<style scoped lang="scss">
.library-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  /* 滚动区域 */
  .movie-scroll {
    flex: 1;
    overflow: hidden;
    padding: 0 20px 20px;
  }

  /* 影视网格布局 */
  .movie-grid {
    padding-top: 20px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    position: relative;
    min-height: 400px;

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

  /* 影视卡片 - 3D 翻转效果 */
  .movie-card {
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
    background-color: #1a1a1a;
    height: 380px;
    perspective: 1000px;
    animation: cardEnter 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;

    /* 卡片内部容器 - 翻转的核心 */
    .movie-card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      transition: transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1);

      /* 正面和背面共用样式 */
      .movie-card-front,
      .movie-card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        border-radius: 10px;
        overflow: hidden;
      }

      /* 卡片正面 */
      .movie-card-front {
        background-color: #1a1a1a;
      }

      /* 卡片背面 - 翻转后显示 */
      .movie-card-back {
        transform: rotateY(180deg);
        background: linear-gradient(135deg, #1a2a3a, #0d1520);
        border: 1px solid rgba(26, 188, 156, 0.3);

        .back-content {
          padding: 15px;
          color: white;
          height: 100%;
          overflow-y: auto;

          h4 {
            font-size: 16px;
            margin-bottom: 12px;
            color: #1abc9c;
            line-height: 1.4;
          }

          /* 背面元数据行 */
          .back-meta {
            font-size: 13px;
            margin-bottom: 8px;
            color: #b0b0b0;

            .label {
              color: #888;
            }

            .rating-text {
              color: #ff9e02;
              font-weight: bold;
            }
          }

          /* 背面标签 */
          .back-tags {
            font-size: 13px;
            margin-bottom: 8px;

            .label {
              color: #888;
            }

            .tags {
              color: #a0a0a0;
              line-height: 1.5;
            }
          }

          /* 背面信息行 */
          .back-row {
            font-size: 12px;
            color: #909090;
            line-height: 1.6;
            margin-bottom: 10px;
          }
        }
      }
    }

    /* 翻转状态 - 卡片被翻转时 */
    &.flipped {
      .movie-card-inner {
        transform: rotateY(180deg);
      }

      &:hover {
        transform: none;
        box-shadow: none;
      }
    }

    /* 鼠标悬停效果 */
    &:hover {
      transform: translateY(-7px) scale(1.02);
      box-shadow:
        0 15px 35px rgba(0, 0, 0, 0.6),
        0 0 25px rgba(26, 188, 156, 0.3);
      filter: brightness(1.02);
    }

    /* 海报容器 */
    .movie-poster {
      width: 100%;
      height: 300px;
      position: relative;

      .el-image {
        width: 100%;
        height: 100%;
        display: block;
      }

      /* 操作按钮遮罩层 */
      .movie-overlay {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 1;

        .action-btn {
          background-color: rgba(26, 188, 156, 0.9);
          color: white;
          transition: all 0.3s ease;

          &:hover {
            background-color: rgba(22, 160, 133, 1);
            transform: scale(1.1);
          }
        }
      }

      /* 底部渐变遮罩 - 让文字更清晰 */
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

      /* 评分和分类标签 */
      .movie-meta {
        position: absolute;
        bottom: 5px;
        left: 5px;
        right: 5px;
        display: flex;
        justify-content: space-between;
        z-index: 1;

        .category {
          color: #eee;
          font-size: 12px;
          background-color: rgba(0, 0, 0, 0.7);
          padding: 5px 10px;
          border-radius: 4px;
        }
      }
    }

    /* 影视信息区 */
    .movie-info {
      padding: 15px;
      text-align: center;

      h3 {
        font-size: 16px;
        margin: 0 0 5px 0;
        color: white;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .movie-year {
        font-size: 12px;
        color: #aeaeae;
      }
    }
  }

  /* 图片占位符 - 加载中和加载失败时显示 */
  .image-slot {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 14px;
  }

  /* 没有更多提示 */
  .end-title {
    text-align: center;
    padding: 20px;
    color: #aaa;
    font-size: 14px;
  }
}

// 卡片进入动画
@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
