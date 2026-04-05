<template>
  <div class="movie-library">
    <!-- 头部 -->
    <div class="header-container">
      <sparkles-text text="影视库" :sparklesCount="5" class="sparkles-text" />
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
      <el-popover
        placement="bottom"
        :width="400"
        trigger="click"
        :hide-after="0"
        popper-class="filter-popover"
        class="filter-popover">
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
            <el-button @click="resetAndLoad">
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
    <div class="movie-scroll" @scroll="handleScroll">
      <RecycleScroller :items="movieGroups" :item-size="420" key-field="id" class="movie-grid">
        <template #default="{ item: group }">
          <div class="movie-row">
            <div v-for="movie in group.movies" :key="movie.id" class="movie-card">
              <MovieCardInner
                :movie="movie"
                :can-operate="canOperate"
                @command="handleCommand"
                @go-detail="emit('go-detail', $event)" />
            </div>
          </div>
        </template>
      </RecycleScroller>

      <!-- 加载中提示 -->
      <div v-if="hasMore && loadingMore && totalCount > 0" class="end-title">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <!-- 没有更多提示 -->
      <div v-if="!hasMore && totalCount > 0" class="end-title">没有更多了</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Search, Filter, Sort, DataAnalysis, RefreshLeft, ArrowUp, Loading } from '@element-plus/icons-vue'
import { getLibrary, pageSimple } from '@/api/movie/movieCatalog'
import { deleteCatalog } from '@/api/movie/movieManage'
import { ElMessage, ElMessageBox } from 'element-plus'
import { RecycleScroller } from 'vue-virtual-scroller'
import { useUserStore } from '@/store/modules/user'
import { useMovieStore } from '@/store/modules/movie'
import { getTargetUserid } from '@/utils/route'
import GlowBoder from '@/components/inspira-ui/special-effects/GlowBoder.vue'
import SparklesText from '@/components/inspira-ui/text-animations/SparklesText.vue'
import MovieCardInner from './library/MovieCardInner.vue'

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
const loading = ref(false)
const hasMore = ref(true)
const loadingMore = ref(false)
// 分组数据（虚拟滚动容器，需要保持 id 稳定以复用组件）
const movieGroups = ref<{ id: string; movies: any[] }[]>([])

// 计算总数据量
const totalCount = computed(() => {
  return movieGroups.value.reduce((sum, group) => sum + group.movies.length, 0)
})

// 监听 directory 变化
watch(
  () => props.directory,
  () => resetAndLoad(),
)

// 分页参数 (pageSimple 接口用)
const pageParams = ref({
  pageNum: 1,
  pageSize: 50,
  directory: '', // 目录过滤
  keyword: '', // 模糊查询名称
  notMatched: false, // 是否过滤出未匹配数据
  orderBy: '', // 后端默认时间升序
  isAsc: true, // 默认升序
})

// 已登录且访问的是自己的数据
const canOperate = computed(() => {
  return userStore.isLogin && !movieStore.accessUserid
})

// 追加新数据到分组（只追加新组，不触动已有组）
const appendMovieGroups = (newMovies: any[]) => {
  const pageSize = 10
  const startIndex = totalCount.value
  const newGroups: { id: string; movies: any[] }[] = []
  for (let i = 0; i < newMovies.length; i += pageSize) {
    const chunk = newMovies.slice(i, i + pageSize)
    newGroups.push({
      id: `group-${startIndex + i}`,
      movies: chunk,
    })
  }
  // 追加数据
  movieGroups.value = [...movieGroups.value, ...newGroups]
}

// 判断是否有筛选条件
const hasFilterCondition = computed(() => {
  return !!(
    pageParams.value.keyword ||
    pageParams.value.orderBy ||
    pageParams.value.notMatched ||
    pageParams.value.orderBy ||
    !pageParams.value.isAsc
  )
})

// 加载数据
const fetchData = async () => {
  hasMore.value = true // 默认还有更多数据
  loadingMore.value = true
  try {
    // 根据是否有筛选条件决定使用哪个接口
    const api = hasFilterCondition.value ? pageSimple : getLibrary

    let res
    if (hasFilterCondition.value) {
      // 有筛选条件，走 pageSimple（带筛选参数）
      res = await api(pageParams.value, getTargetUserid())
    } else {
      // 无筛选条件，走 getLibrary 查询缓存数据
      res = await api(
        {
          pageNum: pageParams.value.pageNum,
          directory: pageParams.value.directory,
        },
        getTargetUserid(),
      )
    }

    // 处理数据
    const newList = res.list

    appendMovieGroups(newList) // 追加新组
    hasMore.value = newList.length >= pageParams.value.pageSize // 判断是否还有更多数据
  } catch (error) {
    ElMessage.error('加载失败:' + error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 搜索/筛选（重置页码并重新加载）
const handleSearch = () => {
  loading.value = true
  pageParams.value.pageNum = 1
  movieGroups.value = []
  fetchData()
}

// 重置条件并加载
const resetAndLoad = () => {
  pageParams.value.pageNum = 1
  pageParams.value.directory = props.directory || ''
  pageParams.value.keyword = ''
  pageParams.value.notMatched = false
  pageParams.value.orderBy = ''
  pageParams.value.isAsc = true
  movieGroups.value = []
  loading.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
  fetchData()
}

// 加载更多
const loadMore = async () => {
  if (!hasMore.value || loadingMore.value) return
  pageParams.value.pageNum++
  fetchData()
}

// 监听滚动到底部
const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  const { scrollTop, scrollHeight, clientHeight } = target
  // 距离底部 10px 时触发加载
  if (scrollHeight - scrollTop - clientHeight < 10 && hasMore.value && !loadingMore.value) {
    loadMore()
  }
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
      // 从 movieGroups 中过滤删除的电影
      movieGroups.value = movieGroups.value
        .map((group) => ({
          ...group,
          movies: group.movies.filter((m) => m.id !== movie.id),
        }))
        .filter((group) => group.movies.length > 0) // 移除空分组
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

// 生命周期
onMounted(() => {
  pageParams.value.directory = props.directory || ''
  fetchData()
})
</script>

<style scoped lang="scss">
.movie-library {
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

  .movie-scroll {
    overflow-y: scroll;
    /* 自定义滚动条样式 - 光条形式 */
    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #1abc9c, #48dbfb);
      border-radius: 2px;
      box-shadow: 0 0 10px rgba(72, 219, 251, 0.5);
      &:hover {
        background: linear-gradient(180deg, #48dbfb, #0abde3);
        box-shadow: 0 0 15px rgba(72, 219, 251, 0.8);
      }
    }
    /* 影视网格布局 - RecycleScroller 内容 */
    .movie-grid {
      padding: 5px;
      /* 影视行 - flex 布局容纳 10 个卡片 */
      .movie-row {
        margin-top: 10px;
        display: flex;
        gap: 10px;
        padding: 5px;
      }

      /* 影视卡片 */
      .movie-card {
        flex: 0 0 calc((100% - 90px) / 10); /* 减去 9 个 gap 的宽度，平分剩余空间 */
        border-radius: 10px;
        height: 400px;
      }
    }
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
