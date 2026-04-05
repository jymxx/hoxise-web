<template>
  <div class="movie-card-wrapper" @mouseleave="handleMouseLeave">
    <div
      class="movie-card-inner"
      :class="{ flipped: isFlipped }"
      @click="handleClick"
      @contextmenu.prevent="handleContextMenu">
      <!-- 正面 -->
      <div class="movie-card-front">
        <div class="movie-poster">
          <el-image :src="movie.posterUrl" :alt="movie.name" fit="cover">
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

          <!-- 操作菜单 -->
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

        <!-- 影视信息 -->
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
          <p v-if="movie.totalSize" class="back-row"><span class="label">文件大小：</span> {{ movie.totalSize }} GB</p>
          <p v-if="movie.createTime" class="back-row">
            <span class="label">上传时间：</span> {{ formatDateTime(movie.createTime) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Loading, Picture, More } from '@element-plus/icons-vue'

interface Movie {
  id: string | number
  name: string
  originName: string
  posterUrl: string
  platform: string
  releaseYear: string
  rating: string
  metaTags?: string[]
  totalSize?: number
  createTime?: string
}

const props = defineProps<{
  movie: Movie
  canOperate: boolean
}>()

const emit = defineEmits<{
  'go-detail': [id: number]
  'show-matching': [movie: { id: string | number; name: string }]
  command: [command: string, movie: Movie]
}>()

const hoveredMovieId = ref<number | string | null>(null)
const isFlipped = ref(false)

// 格式化时间 yyyy-MM-dd HH:mm:ss -> yyyy-MM-dd
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return ''
  return dateTime.split(' ')[0]
}

// 点击跳转详情
const handleClick = () => {
  emit('go-detail', props.movie.id as number)
}

// 右键翻转
const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault()
  isFlipped.value = !isFlipped.value
}

// 鼠标移出翻回
const handleMouseLeave = () => {
  isFlipped.value = false
}

// 下拉菜单命令
const handleCommand = (command: string, movie: Movie) => {
  emit('command', command, movie)
}
</script>

<style scoped lang="scss">
/* 外层包装器 - 处理 hover 位移和阴影效果 */
.movie-card-wrapper {
  display: block;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
  opacity: 0;
  animation: cardEnter 0.5s ease forwards;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    filter 0.3s ease;

  &:hover {
    transform: translateY(-7px) scale(1.03);
    filter: brightness(1.02);
    box-shadow:
      0 0 10px rgba(156, 249, 212, 0.3),
      0 0 20px rgba(149, 180, 237, 0.15);
  }
}

/* 进入动画 */
@keyframes cardEnter {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 内层卡片 - 处理 3D 翻转 */
.movie-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1);
  cursor: pointer;

  &.flipped {
    transform: rotateY(180deg);
  }

  /* 正面和背面 - 绝对定位 + 背面隐藏 */
  .movie-card-front,
  .movie-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 10px;
  }

  /* 卡片正面 */
  .movie-card-front {
    background-color: #1a1a1a;
  }

  /* 卡片背面 - 旋转 180 度 */
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

      .back-row {
        font-size: 12px;
        color: #9090a0;
        line-height: 1.6;
        margin-bottom: 10px;
      }
    }
  }
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

  /* 操作按钮 */
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

  /* 底部渐变遮罩 */
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

/* 影视信息 */
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

/* 图片占位符 */
.image-slot {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
}
</style>
