<template>
  <div class="library-header">
    <!-- 头部 -->
    <div class="header-container">
      <sparkles-text text="全部影视" :sparklesCount="5" class="sparkles-text" />
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-area">
      <el-input
        v-model="localParams.keyword"
        placeholder="按回车搜索..."
        clearable
        @keyup.enter="handleSearch"
        class="search-input">
        <template #prefix>
          <el-icon><Search /></el-icon>
          <glow-boder />
        </template>
      </el-input>

      <!-- 筛选条件下拉 -->
      <el-popover placement="bottom" :width="400" trigger="click" :hide-after="0" popper-class="filter-popover" class="filter-popover">
        <template #reference>
          <el-button class="filter-btn">
            <el-icon><Filter /></el-icon>
            筛选
          </el-button>
        </template>
        <div class="filter-panel">
          <div class="filter-item">
            <div class="filter-label">
              <el-icon><Sort /></el-icon>
              <span>排序方式</span>
            </div>
            <el-select v-model="localParams.orderBy" placeholder="选择排序字段" clearable :teleported="false">
              <el-option label="上传时间" value="createTime" />
              <el-option label="文件大小" value="totalSize" />
              <el-option label="播出日期" value="releaseDate" />
            </el-select>
          </div>
          <div class="filter-item">
            <div class="filter-label">
              <el-icon><ArrowUp /></el-icon>
              <span>排序顺序</span>
            </div>
            <el-radio-group v-model="localParams.isAsc" size="default">
              <el-radio-button :value="false">降序 ↓</el-radio-button>
              <el-radio-button :value="true">升序 ↑</el-radio-button>
            </el-radio-group>
          </div>
          <div class="filter-item">
            <div class="filter-label">
              <el-icon><DataAnalysis /></el-icon>
              <span>数据筛选</span>
            </div>
            <el-checkbox v-model="localParams.notMatched" class="not-matched-checkbox"> 仅显示未匹配数据 </el-checkbox>
          </div>
          <div class="filter-actions">
            <el-button @click="handleReset">
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              应用筛选
            </el-button>
          </div>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Filter, Sort, ArrowUp, DataAnalysis, RefreshLeft } from '@element-plus/icons-vue'
import GlowBoder from '@/components/inspira-ui/special-effects/GlowBoder.vue'
import SparklesText from '@/components/inspira-ui/text-animations/SparklesText.vue'

export interface FilterParams {
  keyword: string
  orderBy: string
  isAsc: boolean
  notMatched: boolean
}

interface Props {
  filterParams: FilterParams
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:filterParams': [value: FilterParams]
  'search': []
  'reset': []
}>()

// 方法
const handleSearch = () => {
  emit('search')
}

const handleReset = () => {
  emit('reset')
}
</script>

<style scoped lang="scss">
.library-header {
  /* 头部区域 - 标题和搜索框 */
  .header-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 20px;
    margin-bottom: 0;

    /* 闪光文字样式覆盖 */
    .sparkles-text {
      font-size: 28px;
      margin-right: 10px;
    }
  }

  /* 搜索区域 */
  .search-area {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding: 0 20px 20px;

    .search-input {
      width: 300px;
      height: 40px;

      :deep(.el-input__wrapper) {
        border-radius: 20px;
        background-color: #1a1a1a;
        border-color: #333;
        box-shadow: none;

        .el-input__inner {
          color: white;
        }

        &:focus-within {
          border-color: #1abc9c;
          box-shadow: 0 0 0 2px rgba(26, 188, 156, 0.2);
        }

        .el-input__prefix {
          color: #888;
        }
      }
    }

    .filter-btn {
      border-radius: 20px;
      padding: 10px 20px;
      background-color: #1abc9c;
      border-color: #1abc9c;
      color: white;

      .el-icon {
        margin-right: 5px;
      }

      &:hover {
        background-color: #16a085;
        border-color: #16a085;
      }
    }
  }
}

/* 筛选 popover 样式 */
.filter-popover {
  /* 筛选面板内容 */
  .filter-panel {
    padding: 18px;
    background-color: #fff;
    border-radius: 12px;

    /* 单个筛选项 */
    .filter-item {
      margin-bottom: 28px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* 筛选标签标题 */
    .filter-label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 15px;
      color: #333;
      font-weight: 600;

      .el-icon {
        color: #1abc9c;
        font-size: 18px;
      }
    }

    /* 底部操作按钮 */
    .filter-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
  }
}
</style>
