<template>
  <div class="movie-home">
    <div class="container">

      <!-- AI回复区域 -->
      <div class="ai-response-section">

        <div class="ai-response-box">
          <div class="ai-response-header">
            <img src="@/assets/images/icon/deepseek_log.png" class="ai-icon" />
            <h3>DeepSeek 助手</h3>
            <!-- 模式切换和提示图标 -->
            <div class="mode-toggle-container">
              <el-tooltip 
                class="item" 
                effect="dark" 
                placement="bottom">
                <div slot="content">
                  RAG模式(模型deepseek-reasoner): 检索增强生成，向大模型提供本地知识库作为数据集 (本应用预先使用向量数据库过滤,文本向量模型: 通义千问-text-embedding-v4)<br>
                  深度思考(模型deepseek-reasoner): 由大模型自行根据输入文本分析推荐
                </div>
                <i class="el-icon-question mode-info-icon"></i>
              </el-tooltip>
              <div class="switch-with-labels">
                <span :class="{'active-label': chatMode === 'chat'}">RAG模式</span>
                <el-switch
                  v-model="chatMode"
                  class="mode-toggle-switch"
                  :active-value="'reasoner'"
                  :inactive-value="'chat'"
                  active-color="#1abc9c"
                  inactive-color="#909399">
                </el-switch>
                <span :class="{'active-label': chatMode === 'reasoner'}">深度思考</span>
              </div>
            </div>
            <div class="header-actions">
              <el-button 
                type="info" 
                size="mini" 
                plain 
                @click="startNewConversation"
                class="new-conversation-btn"
              >
                新对话
              </el-button>
            </div>
          </div>
          
          <!-- 搜索框 -->
          <div class="ai-search-box">
            <el-input
              placeholder="开始对话..."
              v-model="searchKeyword"
              class="search-input"
              size="large"
              @keyup.enter.native="handleSearch"
            >
              <el-button slot="append" icon="el-icon-search" @click="handleSearch"                    
                      :loading="isAIGenerating" 
                      :disabled="isAIGenerating">AI推荐</el-button>
            </el-input>
          </div>
          
            <div class="ai-response-content" :class="{ 'animated-gradient': aiResponseContent }">
            <div v-if="isAIGenerating && !aiResponseContent" class="loading-placeholder">
              <div class="loading-spinner">
                <div class="spinner"></div>
                <p>AI生成中...</p>
              </div>
            </div>
            <div v-else-if="!aiResponseContent && !isAIGenerating" class="suggestions-container">
              <p class="suggestions-title">试试这些?</p>
              <div class="suggestions-list">
                <el-button 
                  v-for="(suggestion, index) in randomSuggestions" 
                  :key="index"
                  type="info"
                  size="small"
                  plain
                  class="suggestion-btn"
                  @click="useSuggestion(suggestion)"
                >
                  {{ suggestion }}
                </el-button>
              </div>
            </div>
            
            <div v-else v-html="aiResponseContent"></div>
            
            <!-- 当AI正在生成且已有内容时显示加载图标 -->
            <div v-if="isAIGenerating && aiResponseContent" class="ai-generating-overlay">
              <div class="generating-indicator">
                <i class="el-icon-loading spinner-icon"></i>
                <span>AI生成中...</span>
              </div>
            </div>
          </div>


          <!-- AI推荐电影展示区域 -->
            <div class="ai-movies-section" v-if="aiRecommendedMovies.length > 0">
              <div class="ai-movie-grid">
                <div 
                  class="ai-movie-card" 
                  v-for="movie in aiRecommendedMovies" 
                  :key="movie.id"
                  @click="viewMovieDetail(movie.catalogid)"
                >
                  <div class="movie-poster">
                    <el-image 
                      :src="movie.posterUrl" 
                      :alt="movie.name"
                      fit="cover"
                      class="image-slot"
                    >
                      <div slot="placeholder" class="image-slot">
                        <i class="el-icon-loading"></i>
                      </div>
                      <div slot="error" class="image-slot">
                        <i class="el-icon-picture-outline"></i>
                      </div>
                    </el-image>
                    <div class="movie-overlay">
                      <div class="movie-info">
                        <!-- <h4>{{ movie.name }}</h4>
                        <p class="movie-rating">{{ movie.rating }}</p> -->
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

        </div>
      </div>
      
      <!-- 影视展示区域 -->
      <div class="movie-showcase">
        <div class="featured-movies">
          <!-- 主推荐电影（占据左侧） -->
          <div class="main-feature">
            <div 
              class="movie-card featured-card" 
              @click="viewMovieDetail(movies[0].id)"
            >
              <div class="movie-poster">
                <el-image 
                  :src="movies[0]?.posterUrl"
                  fit="cover"
                  class="image-slot"
                >
                  <div slot="placeholder" class="image-slot">
                    <i class="el-icon-loading"></i>
                  </div>
                  <div slot="error" class="image-slot">
                    <i class="el-icon-picture-outline"></i>
                  </div>
                </el-image>
                <div class="movie-overlay-main">
                  <div class="movie-info">
                    <h3>{{ movies[0]?.name }}</h3>
                    <p class="movie-meta">
                      <span class="movie-country">类型: {{ movies[0]?.platform }} | {{ movies[0]?.releaseYear }}</span>
                    </p>
                    <p class="movie-meta">
                      <span class="movie-genre">标签: {{  movies[0]?.metaTags?.join(', ') }}</span>
                    </p>
                    <p class="movie-rating">{{ movies[0]?.rating }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 其他电影展示区域 -->
          <div class="secondary-features">
            <!-- 第二行电影 -->
            <div class="movie-row">
              <div 
                class="movie-card secondary-card" 
                v-for="movie in movies.slice(1, 6)" 
                :key="movie.id"
                @click="viewMovieDetail(movie.id)"
              >
                <div class="movie-poster">
                  <el-image 
                    :src="movie.posterUrl"
                    fit="cover"
                    class="image-slot"
                  >
                    <div slot="placeholder" class="image-slot">
                      <i class="el-icon-loading"></i>
                    </div>
                    <div slot="error" class="image-slot">
                      <i class="el-icon-picture-outline"></i>
                    </div>
                  </el-image>
                  <div class="movie-overlay">
                    <div class="movie-info">
                      <h3>{{ movie.name }}</h3>
                      <p class="movie-rating">{{ movie.rating }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 第三行电影 -->
            <div class="movie-row">
              <div 
                class="movie-card secondary-card" 
                v-for="movie in movies.slice(6, 11)" 
                :key="movie.id"
                @click="viewMovieDetail(movie.id)"
              >
                <div class="movie-poster">
                  <el-image 
                    :src="movie.posterUrl"
                    fit="cover"
                    class="image-slot"
                  >
                    <div slot="placeholder" class="image-slot">
                      <i class="el-icon-loading"></i>
                    </div>
                    <div slot="error" class="image-slot">
                      <i class="el-icon-picture-outline"></i>
                    </div>
                  </el-image>
                  <div class="movie-overlay">
                    <div class="movie-info">
                      <h3>{{ movie.name }}</h3>
                      <p class="movie-rating">{{ movie.rating }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 最近添加 -->
      <div class="remaining-content">
        <div class="remaining-label" @click="handleClickLastUpdate">最近添加 ></div>
        <div class="horizontal-scroll-container">
          <div 
            class="movie-item" 
            v-for="(movie) in lastUpdate" 
            :key="movie.id"
            @click="viewMovieDetail(movie.id)"
          >
            <div class="movie-poster-small">
              <el-image 
                :src="movie.posterUrl" 
                :alt="movie.name"
                fit="cover"
                class="image-slot"
              >
                <div slot="placeholder" class="image-slot">
                  <i class="el-icon-loading"></i>
                </div>
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
            </div>
            <div class="movie-info-small">
              <h3>{{ movie.name }}</h3>
              <p class="movie-rating-small">{{ movie.rating }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script>
import { randomQuery,lastUpdate } from '@/api/movie/movieCatalog';
import { getMovieDetail } from '@/api/movie/movieDb';
import { aiRecommend } from '@/api/ai/movie';
import { isLogin } from '@/api/system/auth';
import { getToken } from '@/utils/auth';
import aiSuggestions from '@/utils/constants/suggestions';

import '@/assets/css/responsive-moviehome.css';

export default {
  name: 'MovieHome',
  components: {
  },
  data() {
    return {
      searchKeyword: '',
      movies: [],
      lastUpdate: [],
      showAIResponse: false,
      aiResponseContent: '',
      aiEventSource: null,
      isAIGenerating: false,
      suggestions: aiSuggestions,
      chatId: '', // 添加chatId变量
      chatMode: 'reasoner',//chat 聊天模式 reasoner 分析模式
      randomSuggestions: [], // 添加随机建议数组
      currentLoadAIResponse: '',//当前响应内容
      aiRecommendedMovies: [], // AI推荐的电影列表
      stopAddShow: false,//停止追加内容
    }
  },
  mounted() {
    this.getRandomMovies();
    this.getLastUpdate();
    this.generateRandomChatId(); // 初始化chatId
    this.updateRandomSuggestions(); // 初始化随机建议
  },

  methods: {
    //随机影视
    async getRandomMovies() {
      randomQuery(20).then(res => {
        if(res.code ==200){
          this.movies = res.data;
          this.movies.forEach(movie => {
            movie.posterUrl = movie.posterUrl==null?"":movie.posterUrl,
            movie.rating = movie.rating?movie.rating.toFixed(1):0;
          });
        }else{
          this.$message.error(res.message);
        }
      });
    },
    //最近更新
    getLastUpdate() {
      lastUpdate().then(res => {
        this.lastUpdate = res.data;
        this.lastUpdate.forEach(movie => {
          movie.posterUrl = movie.posterUrl==null?"":movie.posterUrl,
          movie.rating = movie.rating?movie.rating.toFixed(1):0;
        });
      });
    },
    handleClickLastUpdate(){
      this.$emit('go-allMovie', 'library');
    },
    handleSearch() {
      if (this.searchKeyword.trim()) {
        this.getAIRecommendation(this.searchKeyword.trim());
      } else {
        this.$message.warning('请输入文本');
      }
    },
    
    useSuggestion(suggestion) {
      this.searchKeyword = suggestion;
      this.getAIRecommendation(suggestion);
    },

    // 获取AI推荐
    async getAIRecommendation(userText) {
      this.stopAddShow = false;
      if (this.isAIGenerating) {
        return;
      }
      const checkRes = await this.checkLogin();
      if (!checkRes){
        this.$emit('show-login');
        return;
      }

      this.currentLoadAIResponse = '';//重置
      this.searchKeyword='';

      // 在新对话前添加分隔线和用户输入内容（HTML格式）
      if (this.aiResponseContent) {
        this.aiResponseContent += '<hr style="border: 0; border-top: 1px solid rgba(26, 188, 156, 0.3); margin: 15px 0;">';
      }
      this.aiResponseContent += `<strong style="color: #64b5f6;">用户:</strong> ${this.escapeHtml(userText)}<br><br><strong style="color: #81c784;">DeepSeek助手:</strong> `;
      // 确保内容区域滚动到底部
      this.$nextTick(() => {
        const contentDiv = this.$el.querySelector('.ai-response-content');
        if (contentDiv) {
          contentDiv.scrollTop = contentDiv.scrollHeight;
        }
      });

      this.showAIResponse = true;
      this.isAIGenerating = true;
      
      // 调用AI推荐接口
      this.aiEventSource = aiRecommend(userText,this.chatId,this.chatMode);
      
      this.aiEventSource.onmessage = (event) => {
        const data = event.data;
        // 检查是否是结束标记
        if (data === '[DONE]') {
          // 正常结束，关闭连接并重置状态
          this.isAIGenerating = false;
          if (this.aiEventSource) {
            this.aiEventSource.close();
            this.aiEventSource = null;
          }
          this.extractAndLoadMovies();
          return;
        }

        //不需要向用户显示末尾的字符
        if(data === '【'){
            this.stopAddShow = true;
        }
        if (!this.stopAddShow){ 
          // 将接收到的数据追加到摘要文本中
          this.aiResponseContent += this.filterStr(data);
        }
        this.currentLoadAIResponse += data;

        //因为思维链中也有这个字符 所以思维链结束后需要开放
        if(data === '】'){
            this.stopAddShow = false;
        }

        // 确保内容区域滚动到底部
        this.$nextTick(() => {
          const contentDiv = this.$el.querySelector('.ai-response-content');
          if (contentDiv) {
            contentDiv.scrollTop = contentDiv.scrollHeight;
          }
        });
      };
      
      this.aiEventSource.onerror = (error) => {
        // 检查连接状态，只有在非正常关闭时才显示错误
        if (this.aiEventSource && this.aiEventSource.readyState !== EventSource.CLOSED) {
          // 真正的错误情况
          this.isAIGenerating = false;
          this.aiEventSource.close();
          this.aiEventSource = null;
        } else {
          // 连接已经正常关闭或即将关闭，不显示错误消息
          this.isAIGenerating = false;
          this.aiEventSource = null;
        }
        
        this.$message.error('AI服务异常');
        
      };
    },
    //过滤显示字符串
    filterStr(str) { 
      if(str == null){
        return null
      }
      // 处理思维链标签，将其转换为带样式的HTML
      let processedStr = str;
      processedStr = processedStr.replace(/\[REASONING_START\]/g, '<span class="reasoning-chain">');
      processedStr = processedStr.replace(/\[REASONING_END\]/g, '</span></br></br>');
      
      // 继续处理其他特殊字符
      processedStr = processedStr.replace(/\*/g, '').replace(/---/g, '').replace(/\#/g, '');
      
      return processedStr;
    },
    // 提取并加载catalog信息
    async extractAndLoadMovies() {
        // 移除末尾的【...】格式
        if (this.aiResponseContent) {
          // 使用正则表达式字面量，g 表示全局匹配
          this.aiResponseContent = this.aiResponseContent.replace(/\【.*?\】/g, '');
        }

        // 从currentLoadAIResponse中提取ID数组，格式如【622,597,109】
        let matches = this.currentLoadAIResponse?.match(/【.*?】/g);
        let idMatch = matches ? [matches[matches.length - 1]] : null;
        console.log(idMatch);
        if (idMatch) {
          // 提取并解析ID数组
          const idString = idMatch[0];
          // 移除方括号后再处理
          const cleanIdString = idString.replace(/^\【|\】$/g, '');
          const movieIds = cleanIdString.split(/[,\，]/).map(id => parseInt(id.trim())).filter(id => !isNaN(id));

          if (movieIds.length > 0) {
            // 获取每个电影的详细信息
            const moviePromises = movieIds.map(id => getMovieDetail(id));
            const movieResponses = await Promise.all(moviePromises);
            
            // 过滤成功响应并提取电影数据
            const movies = movieResponses
              .filter(response => response.code === 200)
              .map(response => response.data)
              .filter(movie => movie); // 过滤掉可能的空值
            
            // 更新AI推荐的电影列表
            this.aiRecommendedMovies = movies;
        }
      }
    },

     //开始新对话
    startNewConversation() {
      // 清空AI回复内容
      this.aiResponseContent = '';
      // 清空搜索关键词
      this.searchKeyword = '';
      // 如果有AI生成正在进行，停止它
      if (this.aiEventSource) {
        this.aiEventSource.close();
        this.aiEventSource = null;
      }
      // 重置生成状态
      this.isAIGenerating = false;
      //重新生成id
      this.generateRandomChatId();
      //更新建议词
      this.updateRandomSuggestions();
      //移除推荐
      this.aiRecommendedMovies = [];
    },
    // 更新随机建议
    updateRandomSuggestions() {
      const shuffled = [...this.suggestions].sort(() => 0.5 - Math.random());
      this.randomSuggestions = shuffled.slice(0, 7);
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
        // 转义HTML特殊字符，防止XSS攻击
    escapeHtml(unsafe) {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },
    //详情页面
    viewMovieDetail(id) {
      this.$emit('go-detail', id);
    },
    // 生成随机对话ID
    generateRandomChatId() {
      this.chatId = Math.floor(100000 + Math.random() * 900000);
    },
    
  }
}
</script>

<style scoped lang="scss">
.movie-home {
  background-color: #0a0a0a;
  min-height: calc(100vh - 100px);
  padding: 20px;
  color: white;
  
  .container {
    max-width: 2200px;
    // margin: 0 auto;
  }
  
// AI回复区域样式
  .ai-response-section {
    margin: 20px auto 30px;
    max-width: 1000px;
    background-color: rgba(30, 30, 30, 0.9);
    border-radius: 12px;
    padding: 20px;
    border: 1px solid rgba(26, 188, 156, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    
  //ai推荐
  .ai-movies-section {
      margin-bottom: 20px;
      background-color: rgba(40, 40, 40, 0.7);
      // border-radius: 8px;
      padding: 15px;
      // border: 1px solid rgba(26, 188, 156, 0.2);

      .recommended-title {
        color: #1abc9c;
        margin: 0 0 10px 0;
        font-size: 16px;
        font-weight: 600;
      }

      .ai-movie-grid {
        display: flex;
        gap: 15px;
        overflow-x: auto;
        padding: 5px 0;
        white-space: nowrap;

        &::-webkit-scrollbar {
          height: 6px;
        }

        &::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb {
          background: rgba(26, 188, 156, 0.5);
          border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb:hover {
          background: rgba(26, 188, 156, 0.8);
        }
      }

      .ai-movie-card {
        display: inline-block;
        width: 80px;
        height: 120px;
        border-radius: 6px;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        position: relative;
        flex: 0 0 auto;

        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);

          .movie-overlay {
            opacity: 1;
          }
        }

        .movie-poster {
          width: 100%;
          height: 100%;

          .el-image {
            width: 100%;
            height: 100%;
            display: block;

          }
        }

        .movie-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent);
          opacity: 0.2;
          transition: opacity 0.3s ease;
          display: flex;
          align-items: flex-end;
          padding: 5px;

          .movie-info {
            width: 100%;
            h4 {
              font-size: 12px;
              color: white;
              margin: 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .movie-rating {
              color: #ff9e02;
              font-weight: bold;
              font-size: 12px;
              margin: 2px 0 0 0;
            }
          }
        }
      }
    }

    .ai-response-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(26, 188, 156, 0.3);
      
      .ai-icon {
        width: 32px;
        height: 32px;
        margin-right: 12px;
        vertical-align: middle;
      }
      
      h3 {
        margin: 0;
        color: #1abc9c;
        font-size: 20px;
        font-weight: 600;
      }

       .header-actions {
        margin-left: auto; // 将按钮推到右侧
        .new-conversation-btn {
          background-color: rgba(194, 183, 183, 0.9);
          border: 1px solid rgba(26, 188, 156, 0.3);
          color: white;
          border-radius: 16px;
          padding: 6px 12px;
          font-size: 14px;
          transition: all 0.3s ease;
          
          &:hover {
            background-color: rgba(255, 236, 167, 0.3);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          }
        }
       }
       
       .mode-toggle-container {
         display: flex;
         align-items: center;
         margin-right: 15px;
         
         .mode-info-icon {
           margin-left:10px;
           margin-right: 10px;
           color: #bbb;
           font-size: 18px;
           cursor: pointer;
           
           &:hover {
             color: #1abc9c;
           }
         }
         
         .switch-with-labels {
           display: flex;
           align-items: center;
           gap: 8px;
           
           span {
             font-size: 14px;
             color: #aaa;
             transition: color 0.3s;
             
             &.active-label {
               color: #1abc9c;
               font-weight: bold;
             }
           }
           
           .mode-toggle-switch {
             ::v-deep .el-switch__core {
               width: 45px !important; // 调整开关大小
             }
           }
         }
       }
      }

    .ai-search-box {
      margin-bottom: 20px;
      
      ::v-deep .el-input {
        .el-input__inner {
          background-color: rgba(40, 40, 40, 0.9);
          border: 1px solid rgba(26, 188, 156, 0.3);
          color: white;
          height: 50px;
          font-size: 16px;
          border-radius: 25px;
          padding-left: 20px;
          padding-right: 120px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          
          &::placeholder {
            color: #aaa;
          }
          
          &:focus {
            border-color: #1abc9c;
            box-shadow: 0 0 0 2px rgba(26, 188, 156, 0.3);
          }
        }
        
        .el-input-group__append {
          background-color: rgba(26, 188, 156, 0.9);
          border-color: #1abc9c;
          color: white;
          border-radius: 25px;
          padding: 0 30px;
          font-size: 16px;
          height: 50px;
          margin: 0 10px 0 0;
          transition: all 0.3s ease;
          
          &:hover {
            background-color: #1abc9c;
            border-color: #1abc9c;
          }
          
          .el-icon-search {
            margin-right: 8px;
          }
          
          /* 修复加载状态下的样式问题 */
          .el-loading-spinner {
            .circular {
              width: auto;
              height: auto;
            }
          }
        }
      }
    }

    .suggestions-container {
      padding: 15px;
      text-align: center;
      
      .suggestions-title {
        color: #e0e0e0;
        margin-bottom: 15px;
        font-size: 16px;
        font-weight: 600;
      }
      
      .suggestions-list {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
        
        .suggestion-btn {
          margin: 5px;
          background-color: rgba(40, 40, 40, 0.9);
          border: 1px solid rgba(26, 188, 156, 0.3);
          color: white;
          border-radius: 16px;
          padding: 8px 15px;
          font-size: 14px;
          transition: all 0.3s ease;
          
          &:hover {
            background-color: rgba(26, 188, 156, 0.3);
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          }
        }
      }
    }
    
    .ai-response-content {
      line-height: 1.6;
      color: #e0e0e0;
      min-height: 200px;
      max-height: 600px;
      overflow-y: auto;
      padding: 15px;
      border-radius: 8px;
      text-align: left;
      white-space: pre-wrap;
      word-break: break-word;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(26, 188, 156, 0.2);
      position: relative;
      
      /* 为用户和AI内容添加不同样式 */
      .user-content {
        color: #64b5f6; /* 蓝色表示用户 */
        font-weight: 500;
        margin: 8px 0;
      }
      
      .ai-content {
        color: #81c784; /* 绿色表示AI */
        margin: 8px 0;
      }
      
      .divider {
        color: #e0e0e0;
        opacity: 0.5;
        margin: 10px 0;
        text-align: center;
        border-top: 1px solid rgba(26, 188, 156, 0.3);
        padding-top: 10px;
      }
      
      /* 添加滚动条样式 */
      &::-webkit-scrollbar {
        width: 8px;
      }
      
      &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: rgba(26, 188, 156, 0.5);
        border-radius: 4px;
      }
      
      &::-webkit-scrollbar-thumb:hover {
        background: rgba(26, 188, 156, 0.8);
      }
      
      &.animated-gradient {
        /* 修复背景剪切问题：只在子元素上应用渐变 */
        background: transparent !important;

        /* 文本使用混合模式显示背景颜色 */
        color: #ffffff;
        
        /* 为文本添加动画阴影效果 */
        * {
          animation: textColorShift 15s ease-in-out infinite alternate;
          text-shadow: 0 0 1px currentColor;
        }
      }
    }

    ::v-deep .reasoning-chain {
      color: #f8e1f8; 
      padding: 2px 4px;
      border-radius: 4px;
      font-style: italic;
      margin: 0 2px;
      font-size: 0.9em;
    }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes textColorShift {
    0% {
      color: #6cb3ff;
      text-shadow: 0 0 3px #6cb3ff;
    }
    25% {
      color: #ff6b6b;
      text-shadow: 0 0 3px #ff6b6b;
    }
    50% {
      color: #00ff7f;
      text-shadow: 0 0 3px #00ff7f;
    }
    75% {
      color: #ffa500;
      text-shadow: 0 0 3px #ffa500;
    }
    100% {
      color: #9370db;
      text-shadow: 0 0 3px #9370db;
    }
  }

    
    .loading-placeholder {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      width: 100%;
      
      .loading-spinner {
        text-align: center;
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(26, 188, 156, 0.3);
          border-top: 4px solid #1abc9c;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }
        
        p {
          color: #e0e0e0;
          margin: 0;
          font-size: 16px;
        }
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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

    .ai-generating-overlay {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(0, 0, 0, 0.6);
      padding: 8px 12px;
      border-radius: 20px;
      z-index: 10;
    }

    .generating-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #1abc9c;
      font-size: 14px;
    }

    .spinner-icon {
      font-size: 16px;
      animation: rotation 1s linear infinite;
    }
    @keyframes rotation {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }



  // 影片展示区域样式
  .movie-showcase {
    margin-top: 20px;
    height: 65vh; 
    
    .featured-movies {
      display: flex;
      gap: 20px;
      height: calc(100% - 70px); /* 减去标题高度 */
      
      .main-feature {
        flex: 2;
        
        .featured-card {
          height: 100%;
          
          .movie-poster {
            width: 100%;
            height: 100%;
            
            .el-image {
              width: 100%;
              height: 100%;
              display: block;
              
            }
          }
        }
      }
      
      .secondary-features {
        flex: 3;
        display: flex;
        flex-direction: column;
        gap: 20px;
        
        .movie-row {
          height: 220px;
          display: flex;
          gap: 15px;
          flex: 1;
          
          .secondary-card {
            flex: 1;
            
            .movie-poster {
              width: 100%;
              height: 100%;
              
              .el-image {
                width: 100%;
                height: 100%;
                display: block;

              }
            }
          }
        }
      }
    }
    
    .movie-card {
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        
        .movie-overlay {
          opacity: 1;
        }
      }
      
      .movie-overlay-main {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent 50%);
        opacity: 1;
        transition: opacity 0.3s ease;
        display: flex;
        align-items: flex-end;
        padding: 15px;
        
        .movie-info {
          padding: 20px;
          h3 {
            font-size: 36px;
            color: white;
            text-align: left;
          }
          
          .movie-meta {
            display: block;
            margin-bottom: 20px;
            text-align: left;
            
            .movie-country, .movie-genre {
              // background-color: rgba(255, 255, 255, 0.2);
              padding: 4px 10px;
              border-radius: 12px;
              font-size: 16px;
              backdrop-filter: blur(5px);
              display: inline-block;
              margin: 0 5px 5px 0;
              
              .ai-icon {
                width: 16px;
                height: 16px;
                vertical-align: middle;
                margin-right: 5px;
                display: inline-block;
              }
              
              i {
                margin-right: 5px;
                color: #409EFF;
                display: inline-block;
                vertical-align: middle;
              }
            }
          }
          
          .movie-rating {
            position: absolute;
            top: 15px;
            right: 40px;
            color: #ff9e02;
            font-weight: bold;
            font-size: 28px;
            margin: 0;
            background-color: rgba(0, 0, 0, 0.7);
            padding: 5px 15px;
            border-radius: 20px;
            opacity: 1;
          }
        }
      }

      .movie-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent 50%);
        opacity: 1;
        transition: opacity 0.3s ease;
        display: flex;
        padding: 15px;
        align-items: flex-end;
        
        .movie-info {
          h3 {
            font-size: 16px;
            max-width: 220px;
            margin-bottom: 30px;
            color: white;
          }

          .movie-rating {
            position: absolute;
            top: 10px;
            right: 35px;
            color: #ff9e02;
            font-weight: bold;
            font-size: 18px;
            margin: 0;
            background-color: rgba(0, 0, 0, 0.7);
            padding: 5px 15px;
            border-radius: 20px;
            opacity: 1;
          }
        }
      }
    }
  }
  
  // 下方剩余空间
  .remaining-content {
    padding: 20px;
    background: linear-gradient(135deg, #c3ade9, #59a4a9);
    border-radius: 10px;
    
    .remaining-label{
      cursor: pointer;
      font-size: 24px;
      font-weight: bold;
      color: white;
      margin-bottom: 20px;
      text-align: left
    }
    h3 {
      font-size: 24px;
      font-weight: bold;
      color: white;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .horizontal-scroll-container {
      display: flex;
      overflow-x: auto;
      gap: 20px;
      padding: 10px 5px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.5) transparent;
      
      &::-webkit-scrollbar {
        height: 8px;
      }
      
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      
      &::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.5);
        border-radius: 4px;
      }
    }
    
    .movie-item {
      flex: 0 0 auto;
      width: 140px;
      cursor: pointer;
      text-align: center;
      transition: transform 0.3s;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      padding: 10px;
      
      &:hover {
        transform: translateY(-5px);
        background: rgba(0, 0, 0, 0.3);
      }
    }
    
    .movie-poster-small {
      width: 120px;
      height: 180px;
      margin: 0 auto 10px;
      border-radius: 8px;
      overflow: hidden;
      
      .el-image {
        width: 100%;
        height: 100%;
        display: block;
        

      }
    }
    
    .movie-info-small {
      h3 {
        font-size: 14px;
        font-weight: 600;
        color: white;
        margin: 0 0 5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .movie-rating-small {
        margin: 0;
        color: #ff9e02;
        font-weight: bold;
      }
    }
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