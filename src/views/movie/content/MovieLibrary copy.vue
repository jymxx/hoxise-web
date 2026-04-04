<template>
  <div class="movie-library">
    <LibraryHeader
      v-model:filter-params="filterParams"
      @search="loadMovies"
      @reset="resetAndLoad"
    />

    <LibraryContent
      :movies="movies"
      :loading="loading"
      :loading-more="loadingMore"
      :has-more="hasMore"
      :can-operate="canOperate"
      @go-detail="emit('go-detail', $event)"
      @show-matching="emit('show-matching', $event)"
      @load-more="loadMore"
      @delete="handleDeleteMovie"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { getLibrary, pageSimple } from '@/api/movie/movieCatalog'
import { deleteCatalog } from '@/api/movie/movieManage'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useMovieStore } from '@/store/modules/movie'
import { getTargetUserid } from '@/utils/route'
import LibraryHeader, { type FilterParams } from './library/LibraryHeader.vue'
import LibraryContent from './library/LibraryContent.vue'

interface Props {
  directory?: string
}

const props = defineProps<Props>()

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

// 分页参数
const pageParams = reactive({
  pageNum: 1,
  pageSize: 50,
  directory: props.directory || '',
})

// 筛选参数（合并为一个对象）
const filterParams = reactive<FilterParams>({
  keyword: '',
  orderBy: '',
  isAsc: true,
  notMatched: false,
})

// 判断是否有筛选条件
const hasFilterCondition = computed(() => {
  return !!(
    filterParams.keyword ||
    filterParams.orderBy ||
    filterParams.notMatched ||
    !filterParams.isAsc
  )
})

// 已登录且访问的是自己的数据
const canOperate = computed(() => {
  return userStore.isLogin && !movieStore.accessUserid
})

// 加载数据
const loadMovies = async () => {
  loading.value = true
  loadingMore.value = true
  try {
    const api = hasFilterCondition.value ? pageSimple : getLibrary
    let res

    if (hasFilterCondition.value) {
      res = await api({ ...pageParams, ...filterParams }, getTargetUserid())
    } else {
      res = await api(
        {
          pageNum: pageParams.pageNum,
          directory: pageParams.directory,
        },
        getTargetUserid(),
      )
    }

    const newList = res.list.map((item: any) => ({
      ...item,
      posterUrl: item.posterUrl || '',
    }))

    movies.value = [...movies.value, ...newList]
    hasMore.value = newList.length >= pageParams.pageSize
  } catch (error) {
    ElMessage.error('加载失败:' + error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 加载更多
const loadMore = async () => {
  if (!hasMore.value) return
  pageParams.pageNum++
  loadMovies()
}

// 重置并加载
const resetAndLoad = () => {
  pageParams.pageNum = 1
  pageParams.directory = props.directory || ''
  filterParams.keyword = ''
  filterParams.orderBy = ''
  filterParams.isAsc = true
  filterParams.notMatched = false
  movies.value = []
  loading.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
  loadMovies()
}

// 删除电影
const handleDeleteMovie = async (movie: any) => {
  try {
    await deleteCatalog(movie.id)
    movies.value = movies.value.filter((m) => m.id !== movie.id)
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.error('删除失败:' + error)
  }
}

// 监听 directory 变化
watch(
  () => props.directory,
  () => resetAndLoad(),
)

// 初始化
onMounted(() => {
  pageParams.directory = props.directory || ''
  loadMovies()
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
}
</style>
