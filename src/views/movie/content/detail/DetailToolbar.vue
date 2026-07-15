<template>
  <div class="action-buttons">
    <el-button v-if="hasVideoResource" type="primary" size="large" class="play-button" @click="handleQuickPlay">
      <el-icon class="button-icon"><VideoPlay /></el-icon>
      <span class="button-text">立即播放</span>
    </el-button>
    <el-button v-hasRole="['manager']" type="primary" size="large" class="edit-button" @click="emit('matching')">
      <el-icon class="button-icon"><Search /></el-icon>
      <span class="button-text">手动匹配信息</span>
    </el-button>
    <el-button v-if="showResourceBtn" type="primary" size="large" class="resource-button" @click="clickResource">
      <el-icon class="button-icon"><FolderOpened /></el-icon>
      <span class="button-text">资源列表</span>
    </el-button>
  </div>

  <!-- 资源列表弹窗 -->
  <ResourceListDialog
    v-if="showResourceDialog"
    :catalog-id="catalogId"
    :resource-list="resourceList"
    @close="showResourceDialog = false"
    @play-video="handlePlayResourceVideo"
    @reload="loadResourceList" />

  <!-- 视频播放器 -->
  <XgVideoPlayer
    v-if="showVideoPlayer"
    :visible="showVideoPlayer"
    :video-url="currentVideoUrl"
    :video-title="currentVideoTitle"
    :video-poster="movieDetail?.posterUrl || ''"
    @close="closeVideoPlayer" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { VideoPlay, Search, FolderOpened } from '@element-plus/icons-vue'
import { checkRole } from '@/utils/permission'
import { hasCatalogExtraInfo } from '@/api/movie/movieCatalogExtra'
import { useResourceAction } from '@/composables/useMovieResourceAction.ts'
import XgVideoPlayer from '@/components/XgVideoPlayer.vue'
import ResourceListDialog from './ResourceListDialog.vue'

// Props
const props = defineProps<{
  catalogId?: number | string
  movieDetail?: any
}>()

// Emits
const emit = defineEmits<{
  matching: []
}>()

// 资源列表
const showResourceDialog = ref(false)
const resourceList = ref<any[]>([])

// 控制是否显示资源列表按钮 管理员或有资源才显示
const showResourceBtn = computed(() => {
  return checkRole(['manager']) || resourceList.value.length > 0
})

// 资源集合中是否有视频资源
const hasVideoResource = computed(() => {
  return resourceList.value.some((item: any) => item.resourceType === 'VIDEO')
})

// 加载资源列表
const loadResourceList = async () => {
  if (!props.catalogId) return
  const res = await hasCatalogExtraInfo(Number(props.catalogId))
  resourceList.value = res || []
}

// 点击资源列表按钮
const clickResource = () => {
  loadResourceList()
  showResourceDialog.value = true
}

// 视频播放器
const showVideoPlayer = ref(false)
const currentVideoUrl = ref('')
const currentVideoTitle = ref('')

// 关闭视频播放器
const closeVideoPlayer = () => {
  showVideoPlayer.value = false
  currentVideoUrl.value = ''
}

// 从资源列表播放视频
const handlePlayResourceVideo = (url: string, resource: any) => {
  currentVideoUrl.value = url // 视频地址
  currentVideoTitle.value = resource.showName // 视频标题
  showVideoPlayer.value = true
}

const { handleGetResourceUrl, fetchedUrls } = useResourceAction()

// 立即播放 - 找到第一个视频资源，获取地址后播放
const handleQuickPlay = async () => {
  const videoResource = resourceList.value.find((item: any) => item.resourceType === 'VIDEO')
  if (!videoResource) return
  // 已获取过地址则直接复用，避免重复弹密码
  const url = fetchedUrls[videoResource.id] || (await handleGetResourceUrl(videoResource))
  if (!url) return
  currentVideoUrl.value = url
  currentVideoTitle.value = videoResource.showName
  showVideoPlayer.value = true
}

onMounted(() => {
  loadResourceList()
})
</script>

<style scoped lang="scss">
.action-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;

  .el-button {
    border-radius: 25px;
    padding: 12px 28px;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;

    .button-icon {
      font-size: 18px;
    }

    .button-text {
      letter-spacing: 0.5px;
    }

    &.play-button {
      background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%);
      border: none;
      box-shadow: 0 4px 15px rgba(26, 188, 156, 0.35);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(26, 188, 156, 0.45);
      }

      &:active {
        transform: translateY(0);
      }
    }

    &.edit-button {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
      border: none;
      box-shadow: 0 4px 15px rgba(52, 152, 219, 0.35);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(52, 152, 219, 0.45);
      }

      &:active {
        transform: translateY(0);
      }
    }

    &.ai-button {
      background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
      border: none;
      box-shadow: 0 4px 15px rgba(155, 89, 182, 0.35);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(155, 89, 182, 0.45);
      }

      &:active {
        transform: translateY(0);
      }

      .rotating {
        animation: spin 1.5s linear infinite;
      }
    }

    &.resource-button {
      background: linear-gradient(135deg, #5a7f8c 0%, #4a6a7a 100%);
      border: none;
      box-shadow: 0 4px 15px rgba(90, 127, 140, 0.35);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(90, 127, 140, 0.45);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
