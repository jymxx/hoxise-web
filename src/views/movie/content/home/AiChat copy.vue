<template>
  <div class="movie-home-ai">
    <div class="ai-response-section">
      <div class="ai-response-box">
        <!-- Header -->
        <div class="ai-response-header">
          <img src="/images/icon/deepseek_log.png" class="ai-icon" />
          <h3>DeepSeek 助手</h3>

          <!-- 模式切换 -->
          <div class="mode-toggle-container">
            <el-tooltip placement="bottom">
              <template #content>
                <div>
                  RAG 模式 (模型 deepseek-reasoner): 检索增强生成，向大模型提供本地知识库作为数据集<br>
                  深度思考 (模型 deepseek-reasoner): 由大模型自行根据输入文本分析推荐
                </div>
              </template>
              <i class="el-icon-question mode-info-icon"></i>
            </el-tooltip>

            <div class="switch-with-labels">
              <span :class="{ 'active-label': chatMode === 'chat' }">RAG 模式</span>
              <el-switch
                v-model="chatMode"
                :active-value="'reasoner'"
                :inactive-value="'chat'"
                active-color="#1abc9c"
                inactive-color="#909399" />
              <span :class="{ 'active-label': chatMode === 'reasoner' }">深度思考</span>
            </div>
          </div>

          <!-- 新对话按钮 -->
          <div class="right-action">
            <el-button
              type="info"
              size="small"
              plain
              @click="startNewConversation"
              class="new-conversation-btn">
              新对话
            </el-button>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="ai-search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="开始对话..."
            class="search-input"
            size="large"
            @keyup.enter="handleSearch">
            <template #append>
              <el-button :icon="Search" @click="handleSearch" :loading="isAIGenerating" :disabled="isAIGenerating">
                AI 搜索
              </el-button>
            </template>
          </el-input>
        </div>

        <!-- 响应内容 -->
        <div class="ai-response-content" :class="{ 'animated-gradient': aiResponseContent }">
          <!-- 无内容时显示建议 -->
          <div v-if="!aiResponseContent && !isAIGenerating" class="suggestions-container">
            <p class="suggestions-title">试试这些？</p>
            <div class="suggestions-list">
              <el-button
                v-for="(suggestion, index) in randomSuggestions"
                :key="index"
                type="info"
                size="small"
                plain
                class="suggestion-btn"
                @click="useSuggestion(suggestion)">
                {{ suggestion }}
              </el-button>
            </div>
          </div>

          <!-- AI 回复 -->
          <div v-else v-html="aiResponseContent"></div>

          <!-- 生成中指示器 -->
          <div v-if="isAIGenerating && aiResponseContent" class="ai-generating-overlay">
            <div class="generating-indicator">
              <i class="el-icon-loading spinner-icon"></i>
              <span>AI 生成中...</span>
            </div>
          </div>
        </div>

        <!-- AI 推荐电影 -->
        <div class="ai-movies-section" v-if="aiRecommendedMovies.length > 0">
          <div class="ai-movie-grid">
            <div
              v-for="movie in aiRecommendedMovies"
              :key="movie.catalogid"
              class="ai-movie-card"
              @click="viewMovieDetail(movie.catalogid)">
              <div class="movie-poster">
                <el-image
                  :src="movie.posterUrl"
                  :alt="movie.name"
                  fit="cover"
                  class="image-slot">
                  <template #placeholder>
                    <div class="image-slot"><i class="el-icon-loading"></i></div>
                  </template>
                  <template #error>
                    <div class="image-slot"><i class="el-icon-picture-outline"></i></div>
                  </template>
                </el-image>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getMovieDetail } from '@/api/movie/movieDb'
import { aiRecommend } from '@/api/ai/movie'
import { isLogin } from '@/api/system/auth'
import { getToken } from '@/utils/auth'
import aiSuggestions from '@/utils/constants/suggestions'

// Emits
const emit = defineEmits<{
  'go-detail': [id: number]
}>()

// 状态
const searchKeyword = ref('')
const aiResponseContent = ref('')
const isAIGenerating = ref(false)
const chatId = ref('')
const chatMode = ref<'chat' | 'reasoner'>('reasoner')
const randomSuggestions = ref<string[]>([])
const currentLoadAIResponse = ref('')
const aiRecommendedMovies = ref<any[]>([])
const stopAddShow = ref(false)
let aiEventSource: EventSource | null = null

// 初始化建议
const updateRandomSuggestions = () => {
  const shuffled = [...aiSuggestions].sort(() => 0.5 - Math.random())
  randomSuggestions.value = shuffled.slice(0, 7)
}

// 生成随机 ID
const generateRandomChatId = () => {
  chatId.value = String(Math.floor(100000 + Math.random() * 900000))
}

// 处理搜索
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    getAIRecommendation(searchKeyword.value.trim())
  } else {
    ElMessage.warning('请输入文本')
  }
}

// 使用建议
const useSuggestion = (suggestion: string) => {
  searchKeyword.value = suggestion
  getAIRecommendation(suggestion)
}

// 获取 AI 推荐
const getAIRecommendation = async (userText: string) => {
  ElMessage.warning('功能维护升级中...')
  return

  if (isAIGenerating.value) return

  const checkRes = await checkLogin()
  if (!checkRes) {
    emit('go-detail', 0) // 触发登录
    return
  }

  currentLoadAIResponse.value = ''
  searchKeyword.value = ''

  // 添加用户输入
  if (aiResponseContent.value) {
    aiResponseContent.value += '<hr style="border: 0; border-top: 1px solid rgba(26, 188, 156, 0.3); margin: 15px 0;">'
  }
  aiResponseContent.value += `<strong style="color: #64b5f6;">用户:</strong> ${escapeHtml(userText)}<br><br><strong style="color: #81c784;">DeepSeek 助手:</strong> `

  isAIGenerating.value = true
  aiEventSource = aiRecommend(userText, chatId.value, chatMode.value)

  aiEventSource.onmessage = (event) => {
    const data = event.data
    if (data === '[DONE]') {
      isAIGenerating.value = false
      aiEventSource?.close()
      aiEventSource = null
      extractAndLoadMovies()
      return
    }

    if (data === '【') {
      stopAddShow.value = true
    }
    if (!stopAddShow.value) {
      aiResponseContent.value += filterStr(data)
    }
    currentLoadAIResponse.value += data

    if (data === '】') {
      stopAddShow.value = false
    }
  }

  aiEventSource.onerror = () => {
    isAIGenerating.value = false
    aiEventSource?.close()
    ElMessage.error('AI 服务异常')
  }
}

// 过滤字符串
const filterStr = (str: string | null): string => {
  if (!str) return ''
  let processed = str
    .replace(/\[REASONING_START\]/g, '<span class="reasoning-chain">')
    .replace(/\[REASONING_END\]/g, '</span></br></br>')
    .replace(/\*/g, '')
    .replace(/---/g, '')
    .replace(/\#/g, '')
  return processed
}

// 提取电影
const extractAndLoadMovies = async () => {
  if (aiResponseContent.value) {
    aiResponseContent.value = aiResponseContent.value.replace(/【.*?】/g, '')
  }

  const matches = currentLoadAIResponse.value?.match(/【.*?】/g)
  const idMatch = matches ? [matches[matches.length - 1]] : null

  if (idMatch) {
    const cleanIdString = idMatch[0].replace(/^[【]|[】]$/g, '')
    const movieIds = cleanIdString
      .split(/[,\,]/)
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id))

    if (movieIds.length > 0) {
      const moviePromises = movieIds.map(id => getMovieDetail(id))
      const movieResponses = await Promise.all(moviePromises)
      aiRecommendedMovies.value = movieResponses
        .filter(res => res.code === 200)
        .map(res => res.data)
        .filter(movie => movie)
    }
  }
}

// 新对话
const startNewConversation = () => {
  aiResponseContent.value = ''
  searchKeyword.value = ''
  aiEventSource?.close()
  isAIGenerating.value = false
  generateRandomChatId()
  updateRandomSuggestions()
  aiRecommendedMovies.value = []
}

// 检查登录
const checkLogin = async (): Promise<boolean> => {
  const token = getToken()
  if (!token || token === '' || token === 'null' || token === 'undefined' || token === ' ') {
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

// HTML 转义
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// 详情
const viewMovieDetail = (id: number) => {
  emit('go-detail', id)
}

// 初始化
onMounted(() => {
  generateRandomChatId()
  updateRandomSuggestions()
})
</script>

<style scoped lang="scss">
.movie-home-ai {
  background-color: #0a0a0a;
  min-height: calc(100vh - 100px);
  padding: 20px;
  color: white;

  .ai-response-section {
    margin: 20px auto 30px;
    max-width: 1000px;
    background-color: rgba(30, 30, 30, 0.9);
    border-radius: 12px;
    padding: 20px;
    border: 1px solid rgba(26, 188, 156, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);

    .ai-movies-section {
      margin-bottom: 20px;
      background-color: rgba(40, 40, 40, 0.7);
      padding: 15px;

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
      }

      .ai-movie-card {
        display: inline-block;
        width: 80px;
        height: 120px;
        border-radius: 6px;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.3s ease;
        position: relative;
        flex: 0 0 auto;

        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
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

      .right-action {
        margin-left: auto;

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
          margin-left: 10px;
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
        }
      }
    }

    .ai-search-box {
      margin-bottom: 20px;

      :deep(.el-input) {
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

      &.animated-gradient {
        background: transparent !important;
        color: #ffffff;

        * {
          animation: textColorShift 15s ease-in-out infinite alternate;
          text-shadow: 0 0 1px currentColor;
        }
      }
    }

    :deep(.reasoning-chain) {
      color: #f8e1f8;
      padding: 2px 4px;
      border-radius: 4px;
      font-style: italic;
      margin: 0 2px;
      font-size: 0.9em;
    }

    @keyframes textColorShift {
      0% { color: #6cb3ff; text-shadow: 0 0 3px #6cb3ff; }
      25% { color: #ff6b6b; text-shadow: 0 0 3px #ff6b6b; }
      50% { color: #00ff7f; text-shadow: 0 0 3px #00ff7f; }
      75% { color: #ffa500; text-shadow: 0 0 3px #ffa500; }
      100% { color: #9370db; text-shadow: 0 0 3px #9370db; }
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
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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
