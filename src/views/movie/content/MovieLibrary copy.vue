<template>
  <div class="movie-library">
    <!-- 头部 -->
    <div class="header-container">
      <sparkles-text text="全部影视" :sparklesCount="5" class="sparkles-text" />
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-area">
      <el-input
        v-model="pageParams.keyword"
        placeholder="按回车搜索..."
        clearable
        @keyup.enter="handleSearch"
        class="search-input">
        <template #prefix>
          <el-icon><Search /></el-icon>
          <glow-boder />
        </template>
      </el-input>

      <!-- 筛选条件下拉 -->
      <el-popover placement="bottom" :width="400" trigger="click" :hide-after="0" popper-class="filter-popover">
        <template #reference>
          <el-button class="filter-btn">
            <el-icon><Filter /></el-icon>
            筛选
          </el-button>
        </template>
        <div class="filter-panel">
          <div class="filter-item">
            <div class="filter-label">
              <el-icon><Sort /></el-icon>
              <span>排序方式</span>
            </div>
            <el-select v-model="pageParams.orderBy" placeholder="选择排序字段" clearable :teleported="false">
              <el-option label="上传时间" value="createTime" />
              <el-option label="文件大小" value="totalSize" />
              <el-option label="播出日期" value="releaseDate" />
            </el-select>
          </div>
          <div class="filter-item">
            <div class="filter-label">
              <el-icon><ArrowUp /></el-icon>
              <span>排序顺序</span>
            </div>
            <el-radio-group v-model="pageParams.isAsc" size="default">
              <el-radio-button :value="false">降序 ↓</el-radio-button>
              <el-radio-button :value="true">升序 ↑</el-radio-button>
            </el-radio-group>
          </div>
          <div class="filter-item">
            <div class="filter-label">
              <el-icon><DataAnalysis /></el-icon>
              <span>数据筛选</span>
            </div>
            <el-checkbox v-model="pageParams.notMatched" class="not-matched-checkbox"> 仅显示未匹配数据 </el-checkbox>
          </div>
          <div class="filter-actions">
            <el-button @click="resetFilter">
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              应用筛选
            </el-button>
          </div>
        </div>
      </el-popover>
    </div>

    <!-- 影视列表和滚动区域 -->
    <el-scrollbar @end-reached="loadMore" :distance="20" class="movie-scroll">
      <!-- 影视列表 -->
      <div v-loading.lock="loading" class="movie-grid">
        <div
          v-for="movie in movies"
          :key="movie.id"
          :class="['movie-card', { flipped: flippedMovieId === movie.id }]"
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
      <div v-if="!hasMore && movies.length > 0" class="end-title">没有更多了</div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  Loading,
  Picture,
  More,
  Search,
  Filter,
  Sort,
  DataAnalysis,
  RefreshLeft,
  ArrowUp,
} from '@element-plus/icons-vue'
import { getLibrary, pageSimple } from '@/api/movie/movieCatalog'
import { deleteCatalog } from '@/api/movie/movieManage'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useMovieStore } from '@/store/modules/movie'
import { getTargetUserid } from '@/utils/route'
import GlowBoder from '@/components/inspira-ui/special-effects/GlowBoder.vue'
import SparklesText from '@/components/inspira-ui/text-animations/SparklesText.vue'

// Props & Emits
const props = defineProps<{
  directory?: string
}>()

const emit = defineEmits<{
  'go-detail': [id: number]
  'show-matching': [movie: { id: string | number; name: string }]
}>()

// Store
const userStore = useUserStore()
const movieStore = useMovieStore()

// 状态
const movies = ref<any[]>([])
const loading = ref(false)
const hasMore = ref(true)
const loadingMore = ref(false)
const hoveredMovieId = ref<number | null>(null)
const flippedMovieId = ref<number | string | null>(null)

// 翻转卡片
const handleFlip = (movie: any) => {
  if (flippedMovieId.value === movie.id) {
    flippedMovieId.value = null // 再次右键翻回
  } else {
    flippedMovieId.value = movie.id
  }
}

// 鼠标移出翻回
const handleMouseLeave = (movie: any) => {
  if (flippedMovieId.value === movie.id) {
    flippedMovieId.value = null
  }
}

// 格式化时间 yyyy-MM-dd HH:mm:ss -> yyyy-MM-dd
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return ''
  return dateTime.split(' ')[0]
}

// 分页参数
const pageParams = ref({
  pageNum: 1,
  pageSize: 50,
  directory: '', // 目录过滤
  keyword: '', // 模糊查询名称
  notMatched: false, // 是否过滤出未匹配数据
  orderBy: '', // 默认时间(ID)升序
  isAsc: true, // 默认升序
})

// 已登录且访问的是自己的数据
const canOperate = computed(() => {
  return userStore.isLogin && !movieStore.accessUserid
})

// 加载数据
// isSearch: true=搜索/筛选 (初次重置页码), false=分页加载
const fetchData = async (isSearch = false) => {
  loadingMore.value = true
  if (isSearch) {
    loading.value = true
    pageParams.value.pageNum = 1
  }
  try {
    const api = isSearch ? pageSimple : getLibrary
    const params = {
      ...pageParams.value,
      keyword: pageParams.value.keyword || undefined,
      orderBy: pageParams.value.orderBy || undefined,
      notMatched: pageParams.value.notMatched || false,
    }

    const res = await api(params, getTargetUserid())
    const newList = res.list.map((item: any) => ({
      ...item,
      posterUrl: item.posterUrl || '',
    }))

    movies.value = isSearch ? newList : [...movies.value, ...newList]
    hasMore.value = newList.length >= pageParams.value.pageSize
  } catch (error) {
    ElMessage.error(isSearch ? '搜索失败:' : '加载失败:' + error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 搜索
const handleSearch = () => {
  fetchData(true)
}

// 重置并加载
const resetAndLoad = () => {
  pageParams.value.pageNum = 1
  pageParams.value.directory = props.directory || ''
  pageParams.value.keyword = ''
  movies.value = []
  hasMore.value = true
  loading.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
  fetchData()
}

// 重置筛选条件
const resetFilter = () => {
  pageParams.value.orderBy = ''
  pageParams.value.isAsc = true
  pageParams.value.notMatched = false
  handleSearch()
}

// 加载更多
const loadMore = async () => {
  if (!hasMore.value) return
  pageParams.value.pageNum++
  fetchData()
}

// 下拉菜单命令
const handleCommand = (command: string, movie: any) => {
  switch (command) {
    case 're-match': // 重新匹配
      emit('show-matching', { id: movie.id, name: movie.name })
      break
    case 'remove': // 删除
      handleDelete(movie)
      break
  }
}

// 删除
const handleDelete = (movie: any) => {
  ElMessageBox.confirm(`确定要删除"${movie.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await deleteCatalog(movie.id)
      movies.value = movies.value.filter((m) => m.id !== movie.id)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

// 监听 directory 变化
watch(
  () => props.directory,
  () => resetAndLoad(),
)

// 生命周期
onMounted(() => {
  pageParams.value.directory = props.directory || ''
  fetchData()
})
</script>

<style scoped lang="scss">
.movie-library {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #0a0a0a;
  color: white;
  padding: 20px;

  /* 头部区域 - 标题和搜索框 */
  .header-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 20px;
    margin-bottom: 0;

    /* 闪光文字样式覆盖 */
    .sparkles-text {
      font-size: 28px; // 文字大小
      margin-right: 10px;
    }
  }

  /* 搜索区域 */
  .search-area {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding: 0 20px 20px;

    .search-input {
      width: 300px;
      height: 40px;

      :deep(.el-input__wrapper) {
        border-radius: 20px;
        background-color: #1a1a1a;
        border-color: #333;
        box-shadow: none;

        .el-input__inner {
          color: white;
        }

        &:focus-within {
          border-color: #1abc9c;
          box-shadow: 0 0 0 2px rgba(26, 188, 156, 0.2);
        }

        .el-input__prefix {
          color: #888;
        }
      }
    }

    .filter-btn {
      border-radius: 20px;
      padding: 10px 20px;
      background-color: #1abc9c;
      border-color: #1abc9c;
      color: white;

      .el-icon {
        margin-right: 5px;
      }

      &:hover {
        background-color: #16a085;
        border-color: #16a085;
      }
    }
  }

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
    perspective: 1000px; // 3D 透视深度

    /* 卡片内部容器 - 翻转的核心 */
    .movie-card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d; // 保持 3D 空间
      transition: transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1); // 翻转动画

      /* 正面和背面共用样式 */
      .movie-card-front,
      .movie-card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden; // 背面不可见
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
        transform: rotateY(180deg); // 初始旋转 180 度
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
              color: #888; // 标签文字颜色
            }

            .rating-text {
              color: #ff9e02; // 评分金色
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
        transform: rotateY(180deg); // 整体旋转 180 度
      }

      // 翻转时禁用 hover 效果
      &:hover {
        transform: none;
        box-shadow: none;
      }
    }

    /* 鼠标悬停效果 */
    &:hover {
      transform: translateY(-7px) scale(1.02); // 上浮 + 微放大
      box-shadow:
        0 15px 35px rgba(0, 0, 0, 0.6),
        // 深色阴影
        0 0 25px rgba(26, 188, 156, 0.3); // 绿色光晕
      filter: brightness(1.02); // 轻微提亮
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

/* 筛选 popover 样式 */
.filter-popover {
  &.el-popover {
    padding: 0 !important;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4); // 外部阴影
    border: 1px solid rgba(255, 255, 255, 0.1); // 边框
  }

  /* 筛选面板内容 */
  .filter-panel {
    padding: 18px;
    background-color: #fff;
    border-radius: 12px;

    /* 单个筛选项 */
    .filter-item {
      margin-bottom: 28px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* 筛选标签标题 */
    .filter-label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 15px;
      color: #333;
      font-weight: 600;

      .el-icon {
        color: #1abc9c; // 图标绿色
        font-size: 18px;
      }
    }

    /* 底部操作按钮 */
    .filter-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0; // 分隔线
    }
  }
}
</style>
