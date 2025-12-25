<template>
  <div class="movie-detail">
    <div class="detail-header">
      <div class="back-button" @click="goBack">
        <i class="el-icon-arrow-left"></i> 返回
      </div>
    </div>
    
      <div class="detail-content" v-if="movieDetail">
        <div class="main-content">
        <!-- 图片与基本信息区域 -->
        <div class="content-header">
          <div class="poster-section">
            <img :src="movieDetail.posterUrl" :alt="movieDetail.nameCn" class="movie-poster">
          </div>
          
          <div class="info-section">
            <h1 class="movie-title">{{ movieDetail.nameCn || movieDetail.matchingName }}</h1>
            <p class="original-title" v-if="movieDetail.originalName !== movieDetail.nameCn">{{ movieDetail.originalName }}</p>
            
            <!-- 别名显示 -->
            <div class="alias-section" v-if="getAliasString()">
              <div class="meta-item">
                <span class="meta-label">别名:</span>
                <span class="meta-value">{{ getAliasString() }}</span>
              </div>
            </div>
            
            <div class="movie-meta">
              <div class="meta-item">
                <span class="meta-label">类型:</span>
                <span class="meta-value">{{ movieDetail.subjectType === 'ANIME' ? '动漫' : '影视' }}</span>
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

        <!-- 标签区域 -->
        <div class="tags-section-full" v-if="movieDetail.tags && movieDetail.tags.length > 0">
          <!-- <h2 class="section-title">标签</h2> -->
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
        
        <!-- 操作按钮区域 -->
        <div class="action-buttons">
          <el-button type="primary" size="large" class="play-button" @click="handleButtonClick('play')">
            <i class="el-icon-video-play"></i> 立即观看
          </el-button>
          <el-button type="primary" size="large" class="play-button" @click="handleButtonClick('nasCloud')">
            <i class="el-icon-upload"></i> Nas云存储库
          </el-button>
          <el-button size="large" class="collect-button"  @click="handleButtonClick('collect')">
            <i class="el-icon-star-off"></i> 收藏
          </el-button>
          <el-button size="large" class="match-button"  @click="handleButtonClick('match')">
            <i class="el-icon-search"></i> 手动匹配信息
          </el-button>
          <el-button type="primary" size="large" class="play-button" 
                     :loading="isAIGenerating" 
                     :disabled="isAIGenerating"
                     @click="generateAISummary">
            <img src="@/assets/images/icon/deepseek_log.png" class="ai-icon" /> {{ isAIGenerating ? 'AI生成中...' : 'AI总结' }}
          </el-button>
        </div>
        
        <!-- AI总结显示区域 -->
        <div class="ai-summary-section" v-if="showAISummary">
          <!-- <h3 class="section-title">AI总结</h3> -->
          <div class="ai-summary-content">
            <div class="summary-text">{{ aiSummaryText }}</div>
            <div class="loading-indicator" v-if="isAIGenerating">
              <i class="el-icon-loading"></i> 
            </div>
          </div>
          <!-- <el-button size="small" @click="stopAIGeneration" v-if="isAIGenerating" class="stop-button">
            停止生成
          </el-button> -->
        </div>
        
        <!-- 角色展示区域 -->
        <div class="character-section" v-if="characters && characters.length > 0">
          <h2 class="section-title">角色介绍</h2>
          <div class="horizontal-scroll-container">
            <div 
              class="character-item" 
              v-for="(character) in characters" 
              :key="character.id"
            >
              <div class="character-poster-small">
                <img :src="character.imgUrl || defaultImage" :alt="character.name">
              </div>
              <div class="character-info-small">
                <h3 class="character-name">{{ character.name }}</h3>
                <p class="character-relation">{{ character.relation }}</p>
              </div>
            </div>
          </div>
        </div>

                
        <!-- 章节展示区域 -->
        <div class="episode-section" v-if="episodes && episodes.length > 0">
          <h2 class="section-title">章节列表</h2>
          <div class="episode-grid">
            <div 
              class="episode-item" 
              v-for="(episode, index) in episodes" 
              :key="episode.id"
            >
              <div class="episode-cover">
                <img :src="movieDetail.posterUrl" :alt="episode.nameCn || episode.name" class="episode-cover-image">
                <span class="episode-number">{{ episode.ep || index + 1 }}</span>
              </div>
              <div class="episode-info">
                <h3 class="episode-title">{{ episode.ep }}. {{ episode.nameCn || episode.name }}</h3>
                <!-- <p class="episode-subtitle">{{ episode.name }} ({{ episode.ep || index + 1 }})</p> -->
                <p class="episode-date" v-if="episode.airdate">放送日期: {{ episode.airdate }}</p>
                <p class="episode-duration" v-if="episode.duration">时长: {{ episode.duration }}</p>
                <p class="episode-description" v-if="episode.description">{{ episode.description.substring(0, 50) }}...</p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
      <!-- 详细信息侧边栏 -->
      <div class="sidebar" v-if="movieDetail.infobox && movieDetail.infobox.length > 0">
        <div class="infobox-section">
          <h2 class="section-title"></h2>
          <div class="infobox-list">
            <div 
              v-for="info in movieDetail.infobox" 
              :key="info.id"
              class="infobox-item">
              <div class="info-key">{{ info.infoboxKey }}:</div>
              <div class="info-value">{{ formatInfoValue(info.infoboxKey, info.infoboxValue) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    
    <!-- 加载状态 -->
    <div v-else class="loading">
      <el-skeleton :rows="6" animated />
    </div>
    
    <!-- 简单视频播放器弹窗 -->
    <SimpleVideoPlayer
      :visible="showVideoPlayer"
      :video-url="currentVideoUrl"
      :video-title="movieDetail ? movieDetail.nameCn : ''"
      :video-poster="movieDetail ? movieDetail.posterUrl : ''"
      :current-episode="currentEpisode"
      @close="closeVideoPlayer"
      @play="onVideoPlay"
      @pause="onVideoPause"
      @ended="onVideoEnded"
    />
  </div>
  
</template>

<script>
import { getMovieDetail,getMovieCharacter,getMovieEpisode,getPlayerUrl } from '@/api/movie';
import { getSimpleConfig } from '@/api/system';
import { getAISummary } from '@/api/ai';
import { isLogin } from '@/api/auth';
import { getToken } from '@/utils/auth';
import SimpleVideoPlayer from '@/views/movie/components/SimpleVideoPlayer.vue';

export default {
  name: 'MovieDetail',
  components: {
    SimpleVideoPlayer,
  },
  props: {
    movieId: [String, Number]  // 接受字符串或数字类型
  },
  data() {
    return {
      defaultImage: require('@/assets/images/default-poster.png'),
      movieDetail: null,
      characters: [],
      episodes: [],
      showVideoPlayer: false,
      currentVideoUrl: '',
      currentEpisode: null,
      showAISummary: false,
      aiSummaryText: '',
      isAIGenerating: false,
      aiEventSource: null,
    }
  },
  
  mounted() {
    this.loadMovieDetail();
    this.loadCharacters();
    this.loadEpisodes();
  },
  
  methods: {
    async loadMovieDetail() {
      try {
        const response = await getMovieDetail(this.movieId);
        if (response.code === 200) {
          this.movieDetail = response.data;
        } else {
          this.$message.error(response.message || '获取详情失败');
        }
      } catch (error) {
        console.error('获取影视详情失败:', error);
        this.$message.error('获取影视详情失败');
      }
    },
    // 加载角色数据
    loadCharacters(){
      getMovieCharacter(this.movieId).then(res=>{ 
        if(res.code==200){ 
          this.characters = res.data;  // 存储角色数据
        }
      })
    },
    //加载章节信息
    loadEpisodes(){
      getMovieEpisode(this.movieId).then(res=>{ 
        if(res.code==200){ 
          this.episodes = res.data;  // 存储角色数据
        }
      })
    },
  
    // 获取别名字符串
    getAliasString() {
      if (!this.movieDetail || !this.movieDetail.infobox) return '';
      
      // 查找别名信息
      const aliasInfo = this.movieDetail.infobox.find(item => 
        item.infoboxKey === '别名' || item.infoboxKey === '别称' || item.infoboxKey === 'alias'
      );
      
      if (aliasInfo) {
        try {
          // 尝试解析JSON格式的别名数据
          const parsedValue = JSON.parse(aliasInfo.infoboxValue);
          if (Array.isArray(parsedValue)) {
            // 如果是数组，提取每个对象的v属性并连接成字符串
            return parsedValue.map(item => item.v).join(', ');
          } else {
            // 如果不是数组，直接返回原始值
            return aliasInfo.infoboxValue;
          }
        } catch (e) {
          // 如果不是JSON格式，直接返回原始值
          return aliasInfo.infoboxValue;
        }
      }
      
      return '';
    },
    
    // 格式化信息框值，特别处理别名字段
    formatInfoValue(key, value) {
      if (key === '别名' || key === '别称' || key === 'alias') {
        try {
          const parsedValue = JSON.parse(value);
          if (Array.isArray(parsedValue)) {
            return parsedValue.map(item => item.v).join(', ');
          }
        } catch (e) {
          // 如果不是JSON格式，返回原始值
        }
      }
      return value;
    },
    //点击操作按钮
    handleButtonClick(key){
      switch (key) {
        case 'play':
          this.openVideoPlayer();
          break;
        case 'nasCloud': 
          this.openNasCloud();
          break;
        default:
          this.$message.info('没有操作权限')
          break;
      }
    },

    //打开nas云存储地址
    openNasCloud(){
        getSimpleConfig('nas_share').then(res=>{
          if(res.code==200){ 
            window.open(res.data.dictValue);
          }else{
            this.$message.error(res.message || '获取nas云存储地址失败');
          }
        })
    },
    
    // 打开视频播放器
    openVideoPlayer() {
      getPlayerUrl().then(res=>{ 
        if(res.code==200){ 
          this.showVideoPlayer = true;
          this.currentVideoUrl = res.data;
        }else{
          this.$message.error(res.message || '获取播放地址失败');
        }
      })

    },
    
    // 关闭视频播放器
    closeVideoPlayer() {
      this.showVideoPlayer = false;
      this.currentVideoUrl = '';
      this.currentEpisode = null;
    },
    
    // 视频播放回调
    onVideoPlay() {
      console.log('视频开始播放');
    },
    
    // 视频暂停回调
    onVideoPause() {
      console.log('视频暂停');
    },
    
    // 视频结束回调
    onVideoEnded() {
      console.log('视频播放结束');
      // 可以在这里实现自动播放下一集等功能
    },
    
    goBack() {
      this.$emit('go-back');  // 使用$emit触发go-back事件
    },
    
    // 生成AI简介
    async generateAISummary() {
      const checkRes = await this.checkLogin();
      if (!checkRes){
        this.$emit('show-login');
        return;
      }
      // 重置AI摘要内容
      this.showAISummary = true;
      this.aiSummaryText = '';
      this.isAIGenerating = true;
      
      // 使用API函数连接到后端的流式API
      this.aiEventSource = getAISummary(this.movieId);
      
      this.aiEventSource.onmessage = (event) => {
        const data = event.data;
        
        // 检查是否是结束标记
        if (data === '[DONE]') {
          this.isAIGenerating = false;
          this.aiEventSource.close();
          return;
        }
        
        // 将接收到的数据追加到摘要文本中
        this.aiSummaryText += data;
      };
      
      this.aiEventSource.onerror = (error) => {
        this.isAIGenerating = false;
        this.aiEventSource.close();
      };
    },
    
    // 停止AI生成
    stopAIGeneration() {
      if (this.aiEventSource) {
        this.aiEventSource.close();
        this.isAIGenerating = false;
      }
    },
    //检查登录状态
    async checkLogin(){
      //先在本地查验
      let localToken = getToken();
      if(!localToken || localToken==='' || localToken==='null' || localToken==='undefined' || localToken===' '){ 
        this.$message.warning('AI功能需要登录');
        return false;
      }else{
        //接口查验
        let checkStatus = await isLogin();
        if(!checkStatus.data){ 
          this.$message.error('登录已过期');
          return false;
        }
      }
      return true;
    },

  }
}
</script>

<style scoped lang="scss">
.movie-detail {
  background-color: #0a0a0a;
  min-height: 100vh;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: relative; /* 添加相对定位 */
  
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
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
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
          
          .alias-section {
            margin-bottom: 15px;
            
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
              }
            }
          }
          
          .movie-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
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
          
          &.collect-button, &.share-button, &.like-button, &.match-button, &.ai-button {
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
        
        .section-title {
          font-size: 18px;
          margin: 0 0 15px 0;
          color: #1abc9c;
        }
        
    .ai-summary-content {
        margin-bottom: 15px;
        position: relative;
        background: linear-gradient(45deg, #6cb3ff, #8a2be2, #1abc9c, #ff6b6b, #6cb3ff);
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
          background: linear-gradient(45deg, #6cb3ff, #8a2be2, #1abc9c, #ff6b6b, #ffa500, #e8469c, #00ff7f, #9370db, #6cb3ff);
          background-size: 600% 600%;
          animation: gradientShift 20s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        .loading-indicator {
          margin-top: 10px;
          background: linear-gradient(45deg, #6cb3ff, #8a2be2, #1abc9c, #ff6b6b, #ffa500, #e8469c, #00ff7f, #9370db, #6cb3ff);
          background-size: 600% 600%;
          animation: gradientShift 20s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-style: italic;
          
          .el-icon-loading {
            margin-right: 5px;
          }
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

        .stop-button {
          background-color: rgba(231, 76, 60, 0.2);
          border-color: #e74c3c;
          color: #e74c3c;
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
          
          &::-webkit-scrollbar {
            height: 6px;
          }
          
          &::-webkit-scrollbar-thumb {
            background: #1abc9c;
            border-radius: 3px;
          }
          
          &::-webkit-scrollbar-track {
            background: transparent;
          }
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
            
            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              object-position: center top;
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
  
  .section-title {
      font-size: 24px;
      margin: 30px 0 20px 0;
      padding-bottom: 10px;
      border-bottom: 2px solid #1abc9c;
  }
  
   .episode-section {
    margin-top: 30px;
    max-width: 1100px;
    
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
        object-fit: cover;
        object-position: top;
      }
      
      img.episode-cover-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top;
      }
      
      .episode-number {
        position: absolute;
        top: 10px;
        left: 10px;
        background-color: rgba(0, 0, 0, 0.7);
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 14px;
        z-index: 2;
        color: white;
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
      
      .episode-date, .episode-duration {
        font-size: 13px;
        color: #777;
        margin: 3px 0;
      }
      
      .episode-description {
        font-size: 13px;
        color: #ccc;
        margin: 8px 0 0 0;
        line-height: 1.4;
        flex: 1;
      }
    }
  }
  
  .loading {
    max-width: 1200px;
    margin: 0 auto;
  }
}

@media (max-width: 1024px) {
  .movie-detail {
    .detail-content {
      flex-direction: column;
      
      .main-content {
        .character-section {
          margin-top: 30px;
        }
      }
      
      .sidebar {
        flex: none;
        width: 100%;
        margin-top: 20px;
      }
    }
  }
}

@media (max-width: 768px) {
  .movie-detail {
    padding: 10px;
    
    .content-header {
      flex-direction: column;
      
      .poster-section {
        flex: 0 0 auto;
        margin-bottom: 20px;
      }
    }
    
    .action-buttons {
      flex-direction: column;
      
      .el-button {
        width: 100%;
      }
    }
  }
}
</style>