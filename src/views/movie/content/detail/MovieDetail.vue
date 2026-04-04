<template>
  <div class="movie-detail">
    <div class="detail-header">
      <div class="back-button" @click="emit('go-back')"><i class="el-icon-arrow-left"></i> 返回</div>
    </div>

    <!-- 详情内容 -->
    <div class="detail-content" v-if="movieDetail">
      <div class="main-content">
        <!-- 图片区域 -->
        <div class="content-header">
          <div class="poster-section">
            <el-image :src="movieDetail.posterUrl" fit="cover" class="movie-poster image-slot" lazy>
              <template #placeholder>
                <div class="image-slot"><i class="el-icon-loading"></i></div>
              </template>
              <template #error>
                <div class="image-slot"><i class="el-icon-picture-outline"></i></div>
              </template>
            </el-image>
          </div>

          <!-- 右侧信息 -->
          <div class="info-section">
            <h1 class="movie-title">{{ movieDetail.nameCn || movieDetail.originalName }}</h1>
            <p class="original-title">{{ movieDetail.originalName }}</p>

            <div class="movie-meta">
              <div class="meta-item">
                <span class="meta-label">类型:</span>
                <span class="meta-value">{{ getSubjectTypeText(movieDetail.subjectType) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">平台:</span>
                <span class="meta-value">{{ movieDetail.platform || '未知' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">总集数:</span>
                <span class="meta-value">{{ movieDetail.totalEpisodes || movieDetail.eps || '未知' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">评分:</span>
                <span class="meta-value rating">{{ movieDetail.rating || '0.0' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">上映日期:</span>
                <span class="meta-value">{{ movieDetail.releaseDate || '' }}</span>
              </div>
            </div>

            <div class="tags-section">
              <el-tag
                v-for="(tag, index) in movieDetail.metaTags"
                :key="index"
                class="tag-item"
                type="info"
                size="small">
                {{ tag }}
              </el-tag>
            </div>

            <div class="movie-description">
              <h3>简介</h3>
              <p>{{ movieDetail.summary || '暂无简介' }}</p>
            </div>
          </div>
        </div>

        <!-- 完整标签 -->
        <div class="tags-section-full" v-if="movieDetail.tags?.length">
          <div class="tags-list">
            <el-tag
              v-for="(tag, index) in movieDetail.tags"
              :key="index"
              class="tag-item-full"
              type="info"
              size="small">
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" size="large" class="play-button" @click="openVideoPlayer">
            <i class="el-icon-video-play"></i> 立即观看
          </el-button>
          <el-button size="large" class="collect-button" @click="handleClick('collect')">
            <i class="el-icon-star-off"></i> 收藏
          </el-button>
          <el-button v-if="hasManagerRole" type="primary" size="large" class="play-button" @click="openMatchingDialog">
            <i class="el-icon-search"></i> 手动匹配信息
          </el-button>
          <el-button
            type="primary"
            size="large"
            class="play-button"
            :loading="isAIGenerating"
            @click="generateAISummary">
            <img src="/images/icon/deepseek_log.png" class="ai-icon" />
            {{ isAIGenerating ? 'AI 生成中...' : 'AI 总结' }}
          </el-button>
        </div>

        <!-- AI 总结 -->
        <div class="ai-summary-section" v-if="showAISummary">
          <div class="ai-summary-content">
            <div class="summary-text">{{ aiSummaryText }}</div>
          </div>
        </div>

        <!-- 角色介绍 -->
        <div class="character-section" v-if="characters?.length">
          <h2 class="section-title">角色介绍</h2>
          <div class="horizontal-scroll-container">
            <div v-for="char in characters" :key="char.id" class="character-item">
              <div class="character-poster-small">
                <el-image :src="char.imgUrl || defaultImage" :alt="char.name" fit="cover" class="image-slot">
                  <template #placeholder>
                    <div class="image-slot"><i class="el-icon-loading"></i></div>
                  </template>
                  <template #error>
                    <div class="image-slot"><i class="el-icon-picture-outline"></i></div>
                  </template>
                </el-image>
              </div>
              <div class="character-info-small">
                <h3 class="character-name">{{ char.name }}</h3>
                <p class="character-relation">{{ char.relation }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 章节列表 -->
        <div class="episode-section" v-if="episodes?.length">
          <h2 class="section-title">章节列表</h2>
          <div class="episode-grid">
            <div v-for="(episode, index) in episodes" :key="episode.id" class="episode-item">
              <div class="episode-cover">
                <el-image :src="movieDetail.posterUrl" fit="cover" class="episode-cover-image image-slot">
                  <template #placeholder>
                    <div class="image-slot"><i class="el-icon-loading"></i></div>
                  </template>
                  <template #error>
                    <div class="image-slot"><i class="el-icon-picture-outline"></i></div>
                  </template>
                </el-image>
              </div>
              <div class="episode-info">
                <h3 class="episode-title">{{ episode.ep }}. {{ episode.nameCn || episode.name }}</h3>
                <p class="episode-subtitle">{{ episode.name }} ({{ episode.ep || index + 1 }})</p>
                <p class="episode-date" v-if="episode.airDate">放送日期：{{ episode.airDate }}</p>
                <p class="episode-duration" v-if="episode.duration">时长：{{ episode.duration }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 侧边栏信息 -->
      <div class="sidebar" v-if="movieDetail.infobox?.length">
        <div class="infobox-section">
          <div v-for="info in movieDetail.infobox" :key="info.id" class="infobox-item">
            <div class="info-key">{{ info.infoboxKey }}:</div>
            <div class="info-value">{{ formatInfoValue(info.infoboxKey, info.infoboxValue) }}</div>
          </div>
        </div>
      </div>
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { getMovieDetail, getMovieCharacter, getMovieEpisode, getPlayerUrl } from '@/api/movie/movieDb'
import { getAISummary } from '@/api/ai/movie'
import { isLogin } from '@/api/system/auth'
import { getToken } from '@/utils/auth'
import SimpleVideoPlayer from '../components/SimpleVideoPlayer.vue'

// Props & Emits
const props = defineProps<{
  catalogid?: string | number
}>()

const emit = defineEmits<{
  'show-login': []
  'show-matching': [movie: { id: string | number; name: string }]
  'go-back': []
}>()

// Store
const userStore = useUserStore()

// 状态
const defaultImage = '/images/default-avatar.png'
const movieDetail = ref<any>(null)
const characters = ref<any[]>([])
const episodes = ref<any[]>([])
const showVideoPlayer = ref(false)
const currentVideoUrl = ref('')
const currentEpisode = ref<any>(null)
const showAISummary = ref(false)
const aiSummaryText = ref('')
const isAIGenerating = ref(false)
let aiEventSource: EventSource | null = null

// 管理员权限
const hasManagerRole = computed(() => {
  const roles = userStore.roles || []
  return roles.includes('manager')
})

// 初始化
const init = async () => {
  if (!props.catalogid) return
  await loadMovieDetail()
  await loadCharacters()
  await loadEpisodes()
}

// 加载详情
const loadMovieDetail = async () => {
  try {
    const res = await getMovieDetail(props.catalogid)
    if (res.code === 200) {
      movieDetail.value = res.data
    } else {
      ElMessage.error(res.message || '获取详情失败')
    }
  } catch (error) {
    ElMessage.error('获取影视详情失败')
  }
}

// 加载角色
const loadCharacters = async () => {
  try {
    const res = await getMovieCharacter(props.catalogid)
    if (res.code === 200) {
      characters.value = res.data
    }
  } catch (error) {
    console.error('加载角色失败:', error)
  }
}

// 加载章节
const loadEpisodes = async () => {
  try {
    const res = await getMovieEpisode(props.catalogid)
    if (res.code === 200) {
      episodes.value = res.data
    }
  } catch (error) {
    console.error('加载章节失败:', error)
  }
}

// 类型文本
const getSubjectTypeText = (type: string) => {
  const map: Record<string, string> = {
    ANIME: '动漫',
    MOVIE: '电影',
    TV: '电视剧',
  }
  return map[type] || '其它'
}

// 格式化信息
const formatInfoValue = (key: string, value: string) => {
  if (key === '别名' || key === '别称' || key === 'alias') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => item.v).join(', ')
      }
    } catch (e) {}
  }
  return value
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

// 打开匹配
const openMatchingDialog = () => {
  emit('show-matching', {
    id: props.catalogid,
    name: movieDetail.value?.matchingName,
  })
}

// 操作按钮
const handleClick = (key: string) => {
  if (key === 'collect') {
    ElMessage.info('收藏功能开发中...')
  }
}

// AI 总结
const generateAISummary = async () => {
  ElMessage.warning('功能维护升级中...')
  return

  const checkRes = await checkLogin()
  if (!checkRes) {
    emit('show-login')
    return
  }

  showAISummary.value = true
  aiSummaryText.value = ''
  isAIGenerating.value = true

  aiEventSource = getAISummary(props.catalogid)

  aiEventSource.onmessage = (event) => {
    const data = event.data
    if (data === '[DONE]') {
      isAIGenerating.value = false
      aiEventSource?.close()
      aiEventSource = null
      return
    }
    aiSummaryText.value += data
  }

  aiEventSource.onerror = () => {
    isAIGenerating.value = false
    aiEventSource?.close()
    ElMessage.error('AI 服务异常')
  }
}

// 检查登录
const checkLogin = async (): Promise<boolean> => {
  const token = getToken()
  if (!token || token === '' || token === 'null' || token === 'undefined') {
    ElMessage.warning('AI 功能需要登录')
    return false
  }
  const checkStatus = await isLogin()
  if (!checkStatus.data) {
    ElMessage.error('登录已过期')
    return false
  }
  return true
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

  .detail-header {
    display: flex;
    justify-content: flex-end;

    .back-button {
      display: inline-flex;
      align-items: center;
      padding: 10px 15px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
  }

  .detail-content {
    max-width: 1500px;
    margin: 0 auto;
    display: flex;
    gap: 30px;
    width: 100%;

    .main-content {
      flex: 1;

      .content-header {
        display: flex;
        gap: 30px;
        margin-bottom: 30px;

        .poster-section {
          flex: 0 0 400px;

          .movie-poster {
            width: 100%;
            border-radius: 10px;
          }
        }

        .info-section {
          flex: 1;

          .movie-title {
            font-size: 32px;
            margin-bottom: 10px;
            color: white;
          }

          .original-title {
            font-size: 18px;
            color: #aaa;
            margin-bottom: 10px;
            font-style: italic;
          }

          .movie-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
            margin-bottom: 20px;

            .meta-item {
              display: flex;
              flex-direction: column;

              .meta-label {
                font-size: 14px;
                color: #aaa;
                margin-bottom: 5px;
              }

              .meta-value {
                font-size: 16px;
                font-weight: bold;

                &.rating {
                  color: #ff9e02;
                }
              }
            }
          }

          .tags-section {
            margin-bottom: 20px;

            .tag-item {
              margin-right: 8px;
              margin-bottom: 8px;
              background-color: rgba(26, 188, 156, 0.2);
              border-color: rgba(26, 188, 156, 0.3);
            }
          }

          .movie-description {
            h3 {
              font-size: 18px;
              margin-bottom: 10px;
            }

            p {
              line-height: 1.6;
              color: #ccc;
            }
          }
        }
      }

      .tags-section-full {
        margin-bottom: 20px;

        .tags-list {
          .tag-item-full {
            margin-right: 8px;
            margin-bottom: 8px;
            background-color: rgba(26, 188, 156, 0.2);
            border-color: rgba(26, 188, 156, 0.3);
          }
        }
      }

      .action-buttons {
        display: flex;
        gap: 15px;
        margin-bottom: 30px;
        flex-wrap: wrap;

        .el-button {
          border-radius: 25px;
          padding: 12px 25px;
          font-size: 16px;

          &.play-button {
            background-color: #1abc9c;
            border-color: #1abc9c;

            .ai-icon {
              width: 24px;
              height: 24px;
              margin-right: 8px;
              vertical-align: middle;
            }
          }

          &.collect-button {
            background-color: rgba(255, 255, 255, 0.1);
            border: 1px solid #444;
          }
        }
      }

      .ai-summary-section {
        min-height: 120px;
        margin-top: 20px;
        padding: 20px;
        background-color: rgba(30, 30, 30, 0.7);
        border-radius: 8px;
        border-left: 4px solid #1abc9c;

        .ai-summary-content {
          position: relative;
          background: linear-gradient(
            45deg,
            #6cb3ff,
            #8a2be2,
            #1abc9c,
            #ff6b6b,
            #ffa500,
            #e8469c,
            #00ff7f,
            #9370db,
            #6cb3ff
          );
          background-size: 400% 400%;
          animation: gradientShift 8s ease infinite;
          border-radius: 8px;
          padding: 15px;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;

          .summary-text {
            text-align: left;
            line-height: 1.6;
            background: linear-gradient(
              45deg,
              #6cb3ff,
              #8a2be2,
              #1abc9c,
              #ff6b6b,
              #ffa500,
              #e8469c,
              #00ff7f,
              #9370db,
              #6cb3ff
            );
            background-size: 600% 600%;
            animation: gradientShift 20s ease infinite;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            white-space: pre-wrap;
            word-break: break-word;
          }
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      }

      .character-section {
        margin-top: 30px;
        max-width: 1100px;

        .section-title {
          font-size: 24px;
          margin: 30px 0 20px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #1abc9c;
        }

        .horizontal-scroll-container {
          display: flex;
          overflow-x: auto;
          gap: 20px;
          padding: 10px 5px 20px 5px;
          scrollbar-width: thin;
          scrollbar-color: #1abc9c transparent;
        }

        .character-item {
          flex: 0 0 auto;
          width: 120px;
          cursor: pointer;
          transition: transform 0.3s ease;
          background-color: rgba(30, 30, 30, 0.7);
          border-radius: 8px;
          padding: 10px;
          text-align: center;

          &:hover {
            transform: scale(1.05);
          }

          .character-poster-small {
            width: 80px;
            height: 100px;
            margin: 0 auto 10px;
            border-radius: 5px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;

            :deep(.el-image__inner) {
              object-position: top;
              width: 100%;
              height: 100%;
            }
          }

          .character-info-small {
            .character-name {
              font-size: 12px;
              margin: 0;
              color: white;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .character-relation {
              font-size: 11px;
              color: #aaa;
              margin: 3px 0 0 0;
            }
          }
        }
      }

      .episode-section {
        margin-top: 30px;
        max-width: 1100px;

        .section-title {
          font-size: 24px;
          margin: 30px 0 20px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #1abc9c;
        }

        .episode-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 20px;
          padding: 10px 0 20px 0;
        }

        .episode-item {
          display: flex;
          flex-direction: column;
          background-color: rgba(30, 30, 30, 0.7);
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.3s ease;
          cursor: pointer;

          &:hover {
            transform: scale(1.03);
          }
        }

        .episode-cover {
          position: relative;
          width: 100%;
          height: 100px;
          overflow: hidden;

          .episode-cover-image {
            width: 100%;
            height: 100%;
            display: block;
          }
        }

        .episode-info {
          padding: 15px;
          flex: 1;
          display: flex;
          flex-direction: column;

          .episode-title {
            font-size: 16px;
            margin: 0 0 5px 0;
            color: white;
            font-weight: bold;
          }

          .episode-subtitle {
            font-size: 14px;
            color: #aaa;
            margin: 0 0 8px 0;
          }

          .episode-date,
          .episode-duration {
            font-size: 13px;
            color: #777;
            margin: 3px 0;
          }
        }
      }
    }

    .sidebar {
      flex: 0 0 300px;
      background-color: rgba(30, 30, 30, 0.7);
      border-radius: 10px;
      padding: 20px;
      height: fit-content;
      align-self: flex-start;

      .infobox-section {
        .section-title {
          font-size: 20px;
          margin: 0 0 20px 0;
          padding-bottom: 10px;
          border-bottom: 1px solid #1abc9c;
        }

        .infobox-list {
          .infobox-item {
            padding: 8px 0;
            border-bottom: 1px solid #333;

            &:last-child {
              border-bottom: none;
            }

            .info-key {
              font-weight: bold;
              color: #1abc9c;
              margin-bottom: 3px;
            }

            .info-value {
              color: #ccc;
              word-break: break-word;
            }
          }
        }
      }
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
