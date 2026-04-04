<template>
  <el-dialog
    title="手动修正匹配信息"
    v-model="visible"
    width="50%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    custom-class="movie-search-dialog"
    @close="emit('close')">

    <div class="search-container">
      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="输入要匹配的名称"
          @keyup.enter="handleSearch"
          size="large"
          clearable>
          <template #append>
            <el-button :icon="Search" @click="handleSearch"></el-button>
          </template>
        </el-input>
      </div>

      <!-- 结果 -->
      <div v-loading="searchLoading" element-loading-background="rgba(50, 50, 50, 0.8)">
        <div class="search-results">
          <div
            v-for="(item, index) in searchResults"
            :key="index"
            :class="{ selected: selectedBangumiDB?.id === item.id }"
            class="result-item"
            @click="selectMovie(item)">

            <div class="result-poster">
              <el-image
                :src="item.image || defaultImage"
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

            <div class="result-info">
              <h3 class="result-title">{{ item.name_cn || item.name }}</h3>
              <p class="result-original-name">{{ item.name }}</p>
              <div class="result-meta">
                <span v-if="item.type">{{ getTypeText(item.type) }}</span>
                <span v-if="item.platform">{{ item.platform }}</span>
                <span v-if="item.eps">{{ item.eps || item.total_episodes }}话</span>
                <span v-if="item.date">时间：{{ item.date }}</span>
              </div>
              <p class="result-summary" v-if="item.summary" :title="item.summary">
                {{ item.summary.substring(0, 150) }}{{ item.summary.length > 150 ? '...' : '' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :disabled="!selectedBangumiDB || updateLoading"
          :loading="updateLoading"
          @click="handleSubmit">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { queryBangumi, updateDbBangumi } from '@/api/movie/movieManage'

// Props & Emits
const props = defineProps<{
  movieInfo: { id: string | number; name: string }
}>()

const emit = defineEmits<{
  close: []
  'submit-success': []
}>()

// 状态
const visible = ref(true)
const searchKeyword = ref('')
const searchResults = ref<any[]>([])
const searchLoading = ref(false)
const selectedBangumiDB = ref<any>(null)
const updateLoading = ref(false)
const defaultImage = '/images/default-poster.png'

// 类型映射
const typeMap: Record<number, string> = {
  1: '漫画',
  2: '动画',
  3: '音乐',
  4: '游戏',
  6: '三次元'
}

// 方法
const getTypeText = (type: number): string => {
  return typeMap[type] || '影视'
}

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  searchLoading.value = true
  try {
    const res = await queryBangumi(searchKeyword.value)
    if (res.code === 200) {
      if (res.data.length === 0) {
        ElMessage.warning('未找到匹配项')
      }
      searchResults.value = res.data
    } else {
      ElMessage.error(res.msg || '搜索失败')
      searchResults.value = []
    }
  } catch (error) {
    ElMessage.error('搜索失败，请稍后重试')
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}

const handleClose = () => {
  visible.value = false
  emit('close')
}

const selectMovie = (movie: any) => {
  selectedBangumiDB.value = movie
}

const handleSubmit = async () => {
  if (!selectedBangumiDB.value) {
    ElMessage.warning('请先选择一个匹配项')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要匹配【"${selectedBangumiDB.value.name_cn || selectedBangumiDB.value.name}"】吗？\n数据库名称：【${props.movieInfo.name}】`,
      '确认保存',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    updateLoading.value = true
    const res = await updateDbBangumi(props.movieInfo.id, selectedBangumiDB.value.id)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      emit('submit-success')
      visible.value = false
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  } finally {
    updateLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.movie-search-dialog {
  background-color: #1a1a1a;

  :deep(.el-dialog__header) {
    background-color: #1a1a1a;
  }

  :deep(.el-dialog__title) {
    color: #1abc9c;
  }

  :deep(.el-dialog__body) {
    background-color: #1a1a1a;
  }
}

.search-container {
  .search-box {
    margin-bottom: 20px;

    :deep(.el-input-group__append) {
      background-color: #1abc9c;
      border-color: #1abc9c;
      color: white;
    }

    :deep(.el-input__inner) {
      background-color: #2d2d2d;
      border: 1px solid #444;
      color: white;
      height: 48px;
      font-size: 16px;

      &::placeholder {
        color: #aaa;
      }
    }
  }

  .search-results {
    min-height: 20vh;
    max-height: 50vh;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;

    .result-item {
      display: flex;
      gap: 15px;
      padding: 15px;
      border: 1px solid #333;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.3s;
      background-color: #222;
      text-align: center;

      &:hover {
        background-color: #2d2d2d;
      }

      .result-poster {
        flex: 0 0 80px;

        .el-image {
          width: 160px;
          height: 220px;
          border-radius: 4px;
        }
      }

      .result-info {
        flex: 1;

        .result-title {
          margin: 0 0 5px 0;
          font-size: 16px;
          color: white;
          word-break: break-all;
        }

        .result-original-name {
          margin: 0 0 8px 0;
          color: #bbb;
          font-size: 14px;
          word-break: break-all;
        }

        .result-meta {
          display: flex;
          gap: 10px;
          margin-bottom: 8px;
          flex-wrap: wrap;

          span {
            font-size: 12px;
            color: #999;
            background-color: #333;
            padding: 3px 6px;
            border-radius: 4px;
          }
        }

        .result-summary {
          margin: 0;
          color: #ccc;
          font-size: 13px;
          line-height: 1.4;
          text-align: left;
          overflow: hidden;
        }
      }
    }

    .result-item.selected {
      background-color: #81bcf7;
      color: white;

      .result-title,
      .result-original-name,
      .result-meta,
      .result-summary {
        color: white;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px;
  margin: 20px 10px 0 0;
  width: 100%;
}
</style>
