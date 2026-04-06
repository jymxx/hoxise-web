<template>
  <div class="movie-detail">
    <!-- 详情内容 -->
    <div class="detail-content" v-if="movieDetail">
      <!-- 返回按钮 - 左上角固定 -->
      <button class="back-button" @click="emit('go-back')">
        <i class="el-icon-arrow-left"></i>
      </button>

      <div class="main-content">
        <!-- 详情信息模块：图片区域、右侧信息、完整标签 -->
        <DetailInfo :movie-detail="movieDetail" />

        <!-- 操作按钮模块 -->
        <ActionButtons
          :is-a-i-generating="isAIGenerating"
          @play="openVideoPlayer"
          @action="handleClick"
          @matching="openMatchingDialog"
          @ai-summary="handleAiSummary" />

        <!-- AI 总结模块 -->
        <!-- <AiSummarySection :show="showAISummary" :text="aiSummaryText" /> -->

        <!-- 角色介绍模块 -->
        <CharacterSection :characters="characters" />

        <!-- 章节列表模块 -->
        <EpisodeSection :episodes="episodes" :poster-url="movieDetail.posterUrl" @play-episode="playEpisode" />
      </div>

      <!-- 侧边栏信息模块 -->
      <SidebarInfo :infobox="movieDetail.infobox" class="sidebar" />
    </div>

    <!-- 加载状态 -->
    <div v-else class="loading">
      <el-skeleton :rows="6" animated />
    </div>

    <!-- 视频播放器 -->
    <SimpleVideoPlayer
      v-if="showVideoPlayer"
      :visible="showVideoPlayer"
      :video-url="currentVideoUrl"
      :video-title="movieDetail?.nameCn || ''"
      :video-poster="movieDetail?.posterUrl || ''"
      :current-episode="currentEpisode"
      @close="closeVideoPlayer" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMovieDetail, getMovieCharacter, getMovieEpisode, getPlayerUrl } from '@/api/movie/movieDb'
import SimpleVideoPlayer from '../components/SimpleVideoPlayer.vue'
import DetailInfo from './detail/DetailInfo.vue'
import ActionButtons from './detail/ActionButtons.vue'
import CharacterSection from './detail/CharacterSection.vue'
import EpisodeSection from './detail/EpisodeSection.vue'
import SidebarInfo from './detail/SidebarInfo.vue'

// Props & Emits
const props = defineProps<{
  catalogid?: string | number
  bangumiId?: string | number
}>()

const emit = defineEmits<{
  'show-matching': [movie: { id: string | number; name: string }]
  'go-back': []
}>()

// 状态
const movieDetail = ref<any>(null)
const characters = ref<any[]>([])
const episodes = ref<any[]>([])
const showVideoPlayer = ref(false)
const currentVideoUrl = ref('')
const currentEpisode = ref<any>(null)
const isAIGenerating = ref(false)

// 初始化
const init = async () => {
  if (!props.bangumiId) return
  const bangumiId = String(props.bangumiId)
  await loadMovieDetail(bangumiId)
  await loadCharacters(bangumiId)
  await loadEpisodes(bangumiId)
}

// 加载详情
const loadMovieDetail = async (id: string) => {
  try {
    const res = await getMovieDetail(id)
    movieDetail.value = res
  } catch (error) {
    ElMessage.error('获取影视详情失败')
  }
}

// 加载角色
const loadCharacters = async (id: string) => {
  try {
    const res = await getMovieCharacter(id)
    if (res.code === 200) {
      characters.value = res.data
    }
  } catch (error) {
    console.error('加载角色失败:', error)
  }
}

// 加载章节
const loadEpisodes = async (id: string) => {
  try {
    const res = await getMovieEpisode(id)
    if (res.code === 200) {
      episodes.value = res.data
    }
  } catch (error) {
    console.error('加载章节失败:', error)
  }
}

// 打开播放器
const openVideoPlayer = async () => {
  try {
    const res = await getPlayerUrl({})
    if (res.code === 200) {
      currentVideoUrl.value = res.data
      showVideoPlayer.value = true
    } else {
      ElMessage.error(res.message || '获取播放地址失败')
    }
  } catch (error) {
    ElMessage.error('获取播放地址失败')
  }
}

// 关闭播放器
const closeVideoPlayer = () => {
  showVideoPlayer.value = false
  currentVideoUrl.value = ''
  currentEpisode.value = null
}

// 播放章节
const playEpisode = (episode: any) => {
  currentEpisode.value = episode
  openVideoPlayer()
}

// 打开匹配对话框
const openMatchingDialog = () => {
  emit('show-matching', {
    id: String(props.catalogid),
    name: movieDetail.value?.matchingName,
  })
}

// 操作按钮处理
const handleClick = (key: string) => {
  if (key === 'collect') {
    ElMessage.info('收藏功能开发中...')
  }
}

// AI 总结（占位方法）
const handleAiSummary = () => {
  ElMessage.warning('功能维护升级中...')
}

// 暴露方法
defineExpose({
  init,
})

// 初始化
onMounted(() => {
  init()
})
</script>

<style scoped lang="scss">
.movie-detail {
  background-color: #0a0a0a;
  min-height: 100vh;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: scroll;

  .detail-content {
    max-width: 1500px;
    margin: 0 auto;
    display: flex;
    gap: 30px;
    width: 100%;
    position: relative;

    /* 返回按钮 - 左上角固定 */
    .back-button {
      position: fixed;
      top: 80px;
      left: 280px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s;
      border: none;
      color: white;
      font-size: 18px;
      z-index: 100;

      &:hover {
        background-color: rgba(26, 188, 156, 0.3);
        transform: translateX(-5px);
      }

      i {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    > .sidebar {
      flex: 0 0 300px;
    }
  }

  .loading {
    max-width: 1200px;
    margin: 0 auto;
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
