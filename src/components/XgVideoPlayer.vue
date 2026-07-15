<template>
  <div class="simple-video-player" v-show="visible">
    <div class="player-overlay" @click.self="closePlayer">
      <div class="player-container">
        <!-- 头部 -->
        <div class="player-header">
          <h3 class="player-title">{{ videoTitle }}</h3>
          <button class="close-btn" @click="closePlayer">
            <el-icon><Close /></el-icon>
          </button>
        </div>

        <!-- xgplayer 挂载点 -->
        <div ref="playerRef" class="xgplayer-container" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Close } from '@element-plus/icons-vue'
import Player from 'xgplayer'
import 'xgplayer/dist/index.min.css'

// Props
const props = defineProps<{
  /** 是否显示播放器 */
  visible: boolean
  /** 视频播放地址 */
  videoUrl?: string
  /** 视频标题（显示在播放器顶部） */
  videoTitle?: string
  /** 视频封面图 URL */
  videoPoster?: string
}>()

// Emits
const emit = defineEmits<{
  close: []
  play: []
  pause: []
  ended: []
}>()

// 状态
const playerRef = ref<HTMLDivElement | null>(null)
let player: Player | null = null

// 创建播放器
const initPlayer = () => {
  if (!playerRef.value || !props.videoUrl) return

  destroyPlayer()

  player = new Player({
    el: playerRef.value,
    url: props.videoUrl,
    poster: props.videoPoster || '',
    playsinline: true,
    whitelist: [''],
    lang: 'zh-cn',
    videoInit: true,
    autoplay: true,
    height: '100%',
    width: '100%',
  })

  player.on('play', () => emit('play'))
  player.on('pause', () => emit('pause'))
  player.on('ended', () => emit('ended'))
}

// 销毁播放器
const destroyPlayer = () => {
  if (player) {
    player.destroy()
    player = null
  }
}

// 关闭播放器
const closePlayer = () => {
  destroyPlayer()
  emit('close')
}

// 当 videoUrl 变化时重新加载
watch(
  () => props.videoUrl,
  (url) => {
    if (url && props.visible) {
      nextTick(initPlayer)
    } else {
      destroyPlayer()
    }
  },
)

// 当 visible 变化时处理播放器生命周期
watch(
  () => props.visible,
  (show) => {
    if (show && props.videoUrl) {
      nextTick(initPlayer)
    } else {
      destroyPlayer()
    }
  },
)

onMounted(() => {
  if (props.visible && props.videoUrl) {
    nextTick(initPlayer)
  }
})

onUnmounted(() => {
  destroyPlayer()
})
</script>

<style scoped lang="scss">
.simple-video-player {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  // 播放器外层容器
  .player-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;

    // 播放器容器
    .player-container {
      border-radius: 8px;
      width: 80%;
      max-width: 1000px;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      // 播放器头部
      .player-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background-color: #222;
        color: white;

        .player-title {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;

          &:hover {
            color: #1abc9c;
          }
        }
      }

      // 播放器容器
      .xgplayer-container {
        width: 100%;
        aspect-ratio: 16 / 9;
        background: #000;

        :deep(.xgplayer) {
          height: 100%;
          width: 100%;
        }
      }
    }
  }
}
</style>
