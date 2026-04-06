<template>
  <!-- 过渡动画 - 加载时显示 -->
  <LampEffectBg v-if="loading" class="loading-bg">
    <div class="loading-content">
      <span class="loading-text">Loading</span>
      <div class="loading-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
  </LampEffectBg>

  <!-- 主内容 -->
  <div v-else class="movie-detail">
    <!-- 详情内容 -->
    <div class="detail-content">
      <!-- 返回按钮 - 左上角固定 -->
      <button class="back-button" @click="emit('go-back')">
        <i class="el-icon-arrow-left"> < 返回</i>
      </button>

      <div class="main-content">
        <!-- 详情信息模块：图片区域、右侧信息、完整标签 -->
        <DetailInfo :movie-detail="movieDetail" />

        <!-- 操作按钮模块 -->
        <ActionButtons :is-a-i-generating="isAIGenerating" @play="openVideoPlayer" @matching="openMatchingDialog" />

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
import { getMovieDetail, getMovieCharacter, getMovieEpisode } from '@/api/movie/movieDb'
import SimpleVideoPlayer from '@/components/SimpleVideoPlayer.vue'
import DetailInfo from './detail/DetailInfo.vue'
import ActionButtons from './detail/ActionButtons.vue'
import CharacterSection from './detail/CharacterSection.vue'
import EpisodeSection from './detail/EpisodeSection.vue'
import SidebarInfo from './detail/SidebarInfo.vue'
import LampEffectBg from '@/components/inspira-ui/backgrounds/LampEffectBg.vue'

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
const loading = ref(true) // 加载中
const movieDetail = ref<any>(null) // 影视详情
const characters = ref<any[]>([]) // 角色列表
const episodes = ref<any[]>([]) // 章节列表
const showVideoPlayer = ref(false) // 视频播放器
const currentVideoUrl = ref('') // 视频播放地址
const currentEpisode = ref<any>(null) // 当前播放的章节
const isAIGenerating = ref(false) // AI 生成中

// 初始化
const init = async () => {
  if (!props.bangumiId) {
    loading.value = false
    return
  }
  const bangumiId = String(props.bangumiId)
  await Promise.all([loadMovieDetail(bangumiId), loadCharacters(bangumiId), loadEpisodes(bangumiId)])
  // 确保至少显示 x 秒
  // await new Promise((resolve) => setTimeout(resolve, 1200))
  loading.value = false
}

// 加载详情
const loadMovieDetail = async (id: string) => {
  try {
    const res = await getMovieDetail(id)
    movieDetail.value = res
  } catch (error) {
    ElMessage.error('获取影视详情失败:' + error)
    emit('go-back')
  }
}

// 加载角色
const loadCharacters = async (id: string) => {
  try {
    const res = await getMovieCharacter(id)
    characters.value = res
  } catch (error) {
    console.error('加载角色数据失败:', error)
  }
}

// 加载章节
const loadEpisodes = async (id: string) => {
  try {
    const res = await getMovieEpisode(id)
    episodes.value = res
  } catch (error) {
    console.error('加载章节数据失败:', error)
  }
}

// 打开播放器
const openVideoPlayer = async () => {
  // try {
  //   const res = await getPlayerUrl({})
  //   if (res.code === 200) {
  //     currentVideoUrl.value = res.data
  //     showVideoPlayer.value = true
  //   } else {
  //     ElMessage.error(res.message || '获取播放地址失败')
  //   }
  // } catch (error) {
  //   ElMessage.error('获取播放地址失败')
  // }
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

// 初始化
onMounted(() => {
  init()
})
</script>

<style scoped lang="scss">
.movie-detail {
  background-color: #0a0a0a;
  min-height: 100vh;
  height: 100vh;
  color: white;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;

  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  .detail-content {
    max-width: 1500px;
    margin: 0 auto;
    display: flex;
    gap: 30px;
    width: 100%;
    position: relative;
    min-height: calc(100vh - 40px);

    /* 返回按钮 - 左上角固定 */
    .back-button {
      position: fixed;
      top: 24px;
      left: 24px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: rgba(26, 188, 156, 0.3);
      backdrop-filter: blur(10px);
      border-radius: 30px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 14px;
      font-weight: 500;
      z-index: 100;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

      i {
        font-size: 16px;
        transition: transform 0.3s ease;
      }

      &:hover {
        background: rgba(26, 188, 156, 0.3);
        border-color: rgba(26, 188, 156, 0.5);
        box-shadow: 0 6px 25px rgba(26, 188, 156, 0.3);

        i {
          transform: translateX(-4px);
        }
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
}

/* 过渡动画背景 */
.loading-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 加载内容样式 */
.loading-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.loading-text {
  font-size: 32px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 6px;
}

/* 跳动圆点 */
.loading-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22d3ee, #a855f7);
  animation: dot-bounce 1.4s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.5);

  &:nth-child(1) {
    animation-delay: 0s;
  }

  &:nth-child(2) {
    animation-delay: 0.2s;
  }

  &:nth-child(3) {
    animation-delay: 0.4s;
  }
}

@keyframes dot-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
    box-shadow: 0 0 30px rgba(34, 211, 238, 0.8);
  }
}
</style>
