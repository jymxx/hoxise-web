<template>
  <div class="simple-video-player" v-show="visible">
    <div class="player-overlay" @click="closePlayer">
      <div class="player-container" @click.stop>
        <!-- 头部 -->
        <div class="player-header">
          <h3 class="player-title">{{ videoTitle }}</h3>
          <button class="close-btn" @click="closePlayer">
            <i class="el-icon-close"></i>
          </button>
        </div>

        <!-- 视频区域 -->
        <div class="video-wrapper">
          <video
            ref="videoRef"
            class="video-js vjs-default-skin"
            :src="videoUrl"
            :poster="videoPoster"
            controls
            @play="onPlay"
            @pause="onPause"
            @ended="onEnded"
            @timeupdate="onTimeUpdate"
            @loadeddata="onLoadedData" />
        </div>

        <!-- 集数信息 -->
        <div class="episode-info" v-if="currentEpisode">
          <p>正在播放：第{{ currentEpisode.ep || 1 }}集 - {{ currentEpisode.nameCn || currentEpisode.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import 'video.js/dist/video-js.css'

// Props
const props = defineProps<{
  visible: boolean
  videoUrl?: string
  videoTitle?: string
  videoPoster?: string
  currentEpisode?: any
}>()

// Emits
const emit = defineEmits<{
  close: []
  play: []
  pause: []
  ended: []
}>()

// 状态
const videoRef = ref<HTMLVideoElement | null>(null)
const currentTime = ref(0)
const duration = ref(0)
const isPlaying = ref(false)

// 关闭
const closePlayer = () => {
  emit('close')
  if (videoRef.value) {
    videoRef.value.pause()
  }
}

// 事件
const onPlay = () => {
  isPlaying.value = true
  emit('play')
}

const onPause = () => {
  isPlaying.value = false
  emit('pause')
}

const onEnded = () => {
  isPlaying.value = false
  emit('ended')
}

const onTimeUpdate = (event: Event) => {
  const target = event.target as HTMLVideoElement
  currentTime.value = target.currentTime
}

const onLoadedData = (event: Event) => {
  const target = event.target as HTMLVideoElement
  duration.value = target.duration
}

// 监听 URL 变化
watch(() => props.videoUrl, (newUrl) => {
  if (newUrl && videoRef.value) {
    videoRef.value.src = newUrl
  }
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

    .player-container {
      background-color: #000;
      border-radius: 8px;
      width: 80%;
      max-width: 1000px;
      max-height: 80vh;
      overflow: hidden;
      position: relative;

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
          padding: 5px;

          &:hover {
            color: #1abc9c;
          }
        }
      }

      .video-wrapper {
        position: relative;
        width: 100%;

        .video-js {
          width: 100%;
          max-height: 60vh;
          font-size: 14px;

          .vjs-big-play-button {
            font-size: 2.5em;
          }

          .vjs-control-bar {
            background: linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%);
          }

          .vjs-slider {
            background-color: rgba(255, 255, 255, 0.3);
          }

          .vjs-load-progress {
            background: rgba(255, 255, 255, 0.2);
          }

          .vjs-play-progress {
            background: #1abc9c;
          }
        }
      }

      .episode-info {
        padding: 10px 20px;
        background-color: #333;
        color: white;
        font-size: 14px;
      }
    }
  }
}
</style>
