<template>
  <div class="oss-uploader" @drop.prevent="handleDrop" @dragover.prevent>
    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      :accept="accept"
      :multiple="false"
      style="display: none"
      @change="handleInputChange" />

    <!-- 未选择文件：拖拽/点击区域 -->
    <div v-if="!file" class="upload-zone" @click="openFilePicker">
      <div class="upload-icon" :style="{ width: props.iconSize + 'px', height: props.iconSize + 'px' }">
        <slot name="icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </slot>
      </div>
      <div class="upload-text">
        <slot name="hint">
          <span class="upload-text-main">点击或拖拽文件到此处</span>
          <span class="upload-text-sub">{{ props.hint }}</span>
        </slot>
      </div>
    </div>

    <!-- 已选择文件 -->
    <div v-else class="file-card">
      <div class="file-info">
        <span class="file-icon">📄</span>
        <div class="file-detail">
          <span class="file-name" :title="file.name">{{ file.name }}</span>
          <span class="file-size">{{ formatSize(file.size) }}</span>
        </div>
      </div>
      <div class="file-actions">
        <span v-if="uploadedResult" class="upload-success">
          <el-icon><SuccessFilled /></el-icon>
          <span>上传成功</span>
        </span>
        <el-button v-if="!uploading" size="small" text @click="clearFile">移除</el-button>
        <el-button v-if="!uploading" size="small" type="primary" :disabled="!!uploadedResult" @click="startUpload">
          {{ uploadedResult ? '已上传' : '开始上传' }}
        </el-button>
      </div>

      <!-- 进度条 -->
      <div v-if="uploading" class="progress-wrap">
        <el-progress :percentage="progress" :stroke-width="6" :color="progressColor" />
        <div class="progress-size">{{ formatSize(loadedBytes) }} / {{ formatSize(file?.size || 0) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { SuccessFilled } from '@element-plus/icons-vue'
import axios from 'axios'
import { generatePresignedUrl } from '@/api/system/file'
import type { FileBizTypeEnum } from '@/api/system/file'

const props = withDefaults(
  defineProps<{
    /** 业务类型 */
    bizType: FileBizTypeEnum
    /** 可接受的文件扩展名，如 ".jpg,.png" */
    accept?: string
    /** 提示文字 */
    hint?: string
    /** 最大文件大小（字节），默认 10MB */
    maxSize?: number
    /** 上传图标尺寸（px），默认 40 */
    iconSize?: number
  }>(),
  {
    accept: '*',
    hint: '',
    maxSize: 10 * 1024 * 1024,
    iconSize: 40,
  },
)

const emit = defineEmits<{
  success: [result: any]
  error: [err: Error]
}>()

const fileInputRef = ref<HTMLInputElement>()
const file = ref<File | null>(null)
const uploading = ref(false)
const progress = ref(0)
const loadedBytes = ref(0)
const uploadedResult = ref<any>(null)

const progressColor = computed(() => [
  { color: '#409eff', percentage: 60 },
  { color: '#67c23a', percentage: 100 },
])

/** 格式化文件大小（B / KB / MB / GB） */
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

/** 打开文件选择器 */
const openFilePicker = () => {
  fileInputRef.value?.click()
}

/** 文件输入框 change 回调 */
const handleInputChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    setFile(input.files[0])
  }
}

/** 拖拽文件回调 */
const handleDrop = (e: DragEvent) => {
  if (e.dataTransfer?.files?.[0]) {
    setFile(e.dataTransfer.files[0])
  }
}

/**
 * 设置待上传文件
 * @param f 用户选择的文件
 */
const setFile = (f: File) => {
  if (f.size > props.maxSize) {
    ElMessage.warning(`文件大小不能超过 ${formatSize(props.maxSize)}`)
    return
  }
  file.value = f
  uploadedResult.value = null
  progress.value = 0
  loadedBytes.value = 0
}

/** 清除已选文件 */
const clearFile = () => {
  file.value = null
  uploadedResult.value = null
  progress.value = 0
  if (fileInputRef.value) fileInputRef.value.value = ''
}

/**
 * 通过预签名 URL 直传 OSS
 * 流程：获取预签名地址 → PUT 直传 → 回调通知
 */
const startUpload = async () => {
  if (!file.value) return

  uploading.value = true
  progress.value = 0

  try {
    // 1. 获取预签名 URL
    const f = file.value
    const presigned = await generatePresignedUrl(f.name, f.type, props.bizType)
    if (!presigned.uploadUrl) {
      throw new Error('获取预签名 URL 失败')
    }

    // 2. 直传 OSS
    const response = await axios.put(presigned.uploadUrl, f, {
      headers: { 'Content-Type': f.type || 'application/octet-stream' },
      onUploadProgress: (e) => {
        loadedBytes.value = e.loaded
        if (e.total) {
          progress.value = Math.round((e.loaded / e.total) * 100)
        }
      },
    })

    if (response.status !== 200) {
      throw new Error(`OSS 上传失败 (${response.status})`)
    }

    uploadedResult.value = presigned
    ElNotification.success({ title: '上传成功', message: f.name, duration: 2000 })
    emit('success', presigned)
  } catch (err: any) {
    ElMessage.error(err?.message || '上传失败')
    emit('error', err)
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped lang="scss">
/* ===== 根容器 ===== */
.oss-uploader {
  width: 100%;
}

/* ===== 拖拽/点击上传区域（未选择文件时） ===== */
.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 16px;
  border: 1px dashed var(--el-border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  background: var(--el-fill-color-lighter, rgba(255, 255, 255, 0.02));

  &:hover {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9, rgba(64, 158, 255, 0.05));
  }

  /* 上传图标 */
  .upload-icon {
    color: var(--el-text-color-placeholder);
    opacity: 0.6;
  }

  /* 文字提示 */
  .upload-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .upload-text-main {
      font-size: 14px;
      color: var(--el-text-color-regular);
    }

    .upload-text-sub {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}

/* ===== 已选文件卡片 ===== */
.file-card {
  padding: 14px 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 10px;
  background: var(--el-fill-color-lighter, rgba(255, 255, 255, 0.03));

  /* 文件基本信息行（图标 + 名称 + 大小） */
  .file-info {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;

    .file-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .file-detail {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;

      .file-name {
        font-size: 13px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--el-text-color-primary);
      }

      .file-size {
        font-size: 11px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  /* 操作栏（上传成功提示 + 按钮组） */
  .file-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
  }

  /* 上传成功提示 */
  .upload-success {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-right: auto;
    font-size: 13px;
    color: var(--el-color-success);
  }

  /* 进度条 + 已上传大小 */
  .progress-wrap {
    margin-top: 10px;

    .progress-size {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-top: 4px;
      margin-right: 20px;
      text-align: right;
    }
  }

}
</style>
