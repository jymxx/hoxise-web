<template>
  <div class="simple-video-player" v-show="visible">
    <div class="player-overlay" @click="closePlayer">
      <!-- 播放器容器 -->
      <div class="player-container" @click.stop>
        <!-- 播放器头部 -->
        <div class="player-header">
          <h3 class="player-title">{{ videoTitle }}</h3>
          <button class="close-btn" @click="closePlayer">
            <i class="el-icon-close"></i>
          </button>
        </div>
        
        <!-- 视频播放区域 -->
        <div class="video-wrapper">
          <video-player
            ref="videoPlayer"
            class="video-player vjs-default-skin"
            :options="playerOptions"
            @play="onPlay"
            @pause="onPause"
            @ended="onEnded"
            @timeupdate="onTimeUpdate"
            @loadeddata="onLoadedData"
          />
        </div>
        
        <!-- 当前集数信息 -->
        <div class="episode-info" v-if="currentEpisode">
          <p>正在播放: 第{{ currentEpisode.ep || 1 }}集 - {{ currentEpisode.nameCn || currentEpisode.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import 'video.js/dist/video-js.css'
import { videoPlayer } from 'vue-video-player'

export default {
  name: 'SimpleVideoPlayer',
  components: {
    videoPlayer
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    videoUrl: {
      type: String,
      default: ''
    },
    videoTitle: {
      type: String,
      default: ''
    },
    videoPoster: {
      type: String,
      default: ''
    },
    currentEpisode: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      currentTime: 0,
      duration: 0,
      isPlaying: false
    }
  },
  computed: {
    playerOptions() {
      return {
        // 视频源
        sources: [{
          type: "video/mp4",
          src: this.videoUrl
        }],
        // 播放器选项
        autoplay: false,
        controls: true,
        preload: 'auto',
        fluid: true,
        muted: false,
        aspectRatio: '16:9',
        // 进度条可拖动
        userActions: {
          hotkeys: true
        },
        // 设置海报
        poster: this.videoPoster,
        // 设置播放速度选项
        playbackRates: [0.5, 1.0, 1.5, 2.0],
        // 设置语言
        language: 'zh-CN',
        // 设置皮肤
        notSupportedMessage: '此视频暂无法播放',
      }
    }
  },
  watch: {
    visible(newVal) {
      if (newVal && this.$refs.videoPlayer) {
        // 延迟一点确保DOM已渲染
        this.$nextTick(() => {
          // 可以在这里做一些初始化操作
        })
      }
    },
    videoUrl(newUrl) {
      // 当视频URL改变时，更新播放器
      if (this.$refs.videoPlayer && newUrl) {
        const player = this.$refs.videoPlayer.player
        if (player) {
          player.src(newUrl)
        }
      }
    }
  },
  methods: {
    closePlayer() {
      this.$emit('close');
      if (this.$refs.videoPlayer) {
        const player = this.$refs.videoPlayer.player
        if (player) {
          player.pause()
        }
      }
    },
    onPlay() {
      this.isPlaying = true;
      this.$emit('play')
    },
    onPause() {
      this.isPlaying = false;
      this.$emit('pause')
    },
    onEnded() {
      this.isPlaying = false
      this.$emit('ended')
    },
    onTimeUpdate(data) {
      // 注意：使用vue-video-player时，事件参数可能不同
      this.currentTime = data ? data.currentTime : 0
    },
    onLoadedData() {
      // 视频数据加载完成
      if (this.$refs.videoPlayer) {
        const player = this.$refs.videoPlayer.player
        if (player) {
          this.duration = player.duration()
        }
      }
    }
  }
}
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
        
        .video-player {
          width: 100%;
          height: auto;
          max-height: 60vh;
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

// Video.js 播放器皮肤自定义样式
::v-deep .video-js {
  width: 100%;
  font-size: 14px;
}

::v-deep .vjs-big-play-button {
  font-size: 2.5em;
}

::v-deep .vjs-control-bar {
  background: linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);
}

::v-deep .vjs-slider {
  background-color: rgba(255, 255, 255, 0.3);
}

::v-deep .vjs-load-progress {
  background: rgba(255, 255, 255, 0.2);
}

::v-deep .vjs-play-progress {
  background: #1abc9c;
}
</style>