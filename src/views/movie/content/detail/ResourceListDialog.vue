<template>
  <el-dialog
    title="📦 可用资源"
    v-model="visible"
    width="800px"
    align-center
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="resource-list-dialog"
    @close="emit('close')">
    <div class="dialog-body-split">
      <!-- 左侧：资源列表 -->
      <div class="body-left" element-loading-background="rgba(50, 50, 50, 0.8)">
        <div v-if="resourceList.length === 0" class="section-empty">暂无资源</div>
        <div v-else class="resource-list">
          <div v-for="item in resourceList" :key="item.id" class="resource-item">
            <div class="resource-left">
              <el-tag :type="getResourceTagType(item.resourceType)" class="resource-type-tag">
                {{ getResourceTypeLabel(item.resourceType) }}
              </el-tag>
              <el-input
                v-if="item.resourceType === 'CLOUD_DRIVE' && editingIds[item.id]"
                v-model="editForms[item.id].showName"
                class="edit-name-input"
                maxlength="20"
                placeholder="显示名称" />
              <span v-else class="resource-name" :title="item.showName">{{ item.showName }}</span>
              <el-tag v-if="item.hasSecret" type="warning" effect="plain">需要密码</el-tag>
            </div>
            <div class="resource-right" v-if="!uploadFormVisible">
              <!-- 未获取地址 -->
              <template v-if="!fetchedUrls[item.id]">
                <el-button type="primary" :loading="fetchingIds[item.id]" @click="handleGetResourceUrl(item)">
                  获取地址
                </el-button>
              </template>
              <!-- 已获取：视频 -->
              <template v-else-if="item.resourceType === 'VIDEO'">
                <span class="fetched-url-text" :title="fetchedUrls[item.id]">{{ fetchedUrls[item.id] }}</span>
                <el-button type="success" @click="handlePlayVideo(item)">播放</el-button>
              </template>
              <!-- 已获取：资源文件 -->
              <template v-else-if="item.resourceType === 'RESOURCE_FILE'">
                <span class="fetched-url-text" :title="fetchedUrls[item.id]">{{ fetchedUrls[item.id] }}</span>
                <el-button type="primary" @click="handleDownload(item)">下载</el-button>
              </template>
              <!-- 已获取：云盘链接 -->
              <!-- 编辑 -->
              <template v-else-if="item.resourceType === 'CLOUD_DRIVE' && editingIds[item.id]">
                <el-input v-model="editForms[item.id].url" class="edit-url-input" placeholder="请输入新的云盘链接" />
                <el-button type="primary" :loading="savingEditIds[item.id]" @click="handleEditSave(item)">
                  保存
                </el-button>
                <el-button @click="handleEditCancel(item)">取消</el-button>
              </template>
              <!-- 显示 -->
              <template v-else-if="item.resourceType === 'CLOUD_DRIVE'">
                <a :href="fetchedUrls[item.id]" target="_blank" class="cloud-link" :title="fetchedUrls[item.id]">
                  {{ fetchedUrls[item.id] }}
                </a>
                <el-button type="success" @click="handleCopyUrl(item)">复制</el-button>
                <el-button v-hasRole="['manager']" @click="handleEdit(item)">编辑</el-button>
              </template>
              <el-button
                v-hasRole="['manager']"
                type="danger"
                :loading="deletingIds[item.id]"
                @click="handleDelete(item)">
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：上传资源表单 -->
      <div v-show="uploadFormVisible" class="body-right">
        <div class="upload-form">
          <div class="upload-form-title">
            <el-icon><Cloudy /></el-icon>
            上传资源
          </div>
          <el-form :model="uploadForm" label-position="top">
            <el-form-item label="资源类型">
              <el-select v-model="uploadForm.resourceType" placeholder="选择资源类型">
                <el-option label="在线视频(OSS)" value="VIDEO" />
                <el-option label="资源文件(OSS)" value="RESOURCE_FILE" />
                <el-option label="云盘链接" value="CLOUD_DRIVE" />
              </el-select>
            </el-form-item>
            <el-form-item label="显示名称">
              <el-input v-model="uploadForm.showName" maxlength="20" placeholder="例如: 季度合集" />
            </el-form-item>

            <!-- 视频 / 资源文件 → 文件上传 -->
            <el-form-item
              v-if="uploadForm.resourceType === 'VIDEO' || uploadForm.resourceType === 'RESOURCE_FILE'"
              label="上传文件">
              <el-upload
                ref="uploadRef"
                :auto-upload="false"
                :show-file-list="true"
                :limit="1"
                :on-change="handleFileChange"
                :on-exceed="() => ElMessage.warning('只能选择一个文件')"
                accept="*"
                class="upload-file-wrap">
                <template #trigger>
                  <el-button type="primary" :disabled="!!uploadForm.file">选择文件</el-button>
                </template>
                <el-button v-if="uploadForm.file" type="danger" @click="handleClearFile">移除</el-button>
              </el-upload>
              <div v-if="uploadForm.file" class="file-name">{{ uploadForm.file.name }}</div>
            </el-form-item>

            <!-- 其他云盘 → 链接输入 -->
            <el-form-item v-if="uploadForm.resourceType === 'CLOUD_DRIVE'" label="云盘链接">
              <el-input v-model="uploadForm.url" placeholder="请输入云盘分享链接" type="url" />
            </el-form-item>

            <el-form-item label="">
              <div class="secret-toggle-row">
                <span class="secret-toggle-label"
                  ><el-icon><Lock /></el-icon> 访问密码</span
                >
                <el-switch v-model="secretEnabled" />
              </div>
            </el-form-item>
            <el-form-item v-if="secretEnabled" label="">
              <el-input
                v-model="uploadForm.secret"
                placeholder="设置访问密码（留空则无密码）"
                type="text"
                autocomplete="off" />
            </el-form-item>

            <div class="upload-form-actions">
              <el-button @click="handleUploadCancel">取消</el-button>
              <el-button type="primary" :loading="uploading" @click="handleUploadSubmit" :disabled="!isFormValid">
                确认上传
              </el-button>
            </div>
          </el-form>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="dialog-footer-left">
          <el-button
            v-hasRole="['manager']"
            type="primary"
            :icon="uploadFormVisible ? ArrowUp : Plus"
            @click="uploadFormVisible = !uploadFormVisible">
            {{ uploadFormVisible ? '收起' : '上传资源' }}
          </el-button>
        </div>
        <div class="dialog-footer-right">
          <el-button @click="handleClose">关闭</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import type { UploadInstance, UploadFile } from 'element-plus'
import { ArrowUp, Plus, Cloudy, Lock } from '@element-plus/icons-vue'
import {
  getCatalogExtraResourceUrl,
  saveCatalogExtra,
  updateCatalogExtra,
  deleteCatalogExtra,
} from '@/api/movie/movieCatalogExtra'
import { uploadFile, FileBizTypeEnum } from '@/api/system/file'

// Props
const props = defineProps<{
  catalogId?: number | string
  resourceList: any[]
}>()

// Emits
const emit = defineEmits<{
  close: []
  'play-video': [url: string]
  reload: []
}>()

// 状态
const visible = ref(true)
const fetchingIds = reactive<Record<number, boolean>>({}) // 获取中 防抖
const fetchedUrls = reactive<Record<number, string>>({}) // 获取到的URL集合

// 编辑资源相关
const editForms = reactive<Record<number, { url: string; showName: string }>>({}) // 编辑表单
const editingIds = reactive<Record<number, boolean>>({}) // 正在编辑
const savingEditIds = reactive<Record<number, boolean>>({}) // 保存中 防抖
const deletingIds = reactive<Record<number, boolean>>({}) // 删除中 防抖

// 开始编辑
const handleEdit = (item: any) => {
  editForms[item.id] = { url: fetchedUrls[item.id] || '', showName: item.showName || '' }
  editingIds[item.id] = true
}

// 编辑取消
const handleEditCancel = (item: any) => {
  delete editForms[item.id]
  delete editingIds[item.id]
}

// 编辑保存信息
const handleEditSave = async (item: any) => {
  const newUrl = editForms[item.id]?.url?.trim()
  const newName = editForms[item.id]?.showName?.trim()
  if (!newUrl || !newName) {
    ElMessage.warning('请输入云盘链接与显示名称')
    return
  }

  savingEditIds[item.id] = true
  try {
    await updateCatalogExtra({
      id: item.id,
      cloudDriveUrl: newUrl,
      showName: newName,
    })
    fetchedUrls[item.id] = newUrl
    item.showName = newName
    ElMessage.success('修改成功')
    handleEditCancel(item)
  } catch (error) {
    ElMessage.error(error || '修改失败')
  } finally {
    savingEditIds[item.id] = false
  }
}

// 删除资源
const handleDelete = async (item: any) => {
  try {
    await ElMessageBox.confirm(`确定删除资源「${item.showName}」吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }

  deletingIds[item.id] = true
  try {
    await deleteCatalogExtra(item.id)
    ElMessage.success('删除成功')
    emit('reload')
  } catch (error) {
    ElMessage.error(error || '删除失败')
  } finally {
    deletingIds[item.id] = false
  }
}

// 上传资源相关
const uploadFormVisible = ref(false)
const uploading = ref(false)
const secretEnabled = ref(false)
const uploadRef = ref<UploadInstance>()
const uploadForm = reactive({
  resourceType: '',
  showName: '',
  file: null as File | null,
  url: '',
  secret: '',
})

// 表单校验
const isFormValid = computed(() => {
  if (!uploadForm.resourceType || !uploadForm.showName) return false
  if (uploadForm.resourceType === 'CLOUD_DRIVE' && !uploadForm.url) return false
  if ((uploadForm.resourceType === 'VIDEO' || uploadForm.resourceType === 'RESOURCE_FILE') && !uploadForm.file)
    return false
  return true
})

// 文件选择
const handleFileChange = (uploadFile: UploadFile) => {
  if (uploadFile.raw) {
    uploadForm.file = uploadFile.raw
  }
}

// 清空文件
const handleClearFile = () => {
  uploadForm.file = null
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 重置表单
const resetUploadForm = () => {
  uploadForm.resourceType = ''
  uploadForm.showName = ''
  uploadForm.url = ''
  uploadForm.secret = ''
  secretEnabled.value = false
  handleClearFile()
  uploadFormVisible.value = false
}

// 取消上传
const handleUploadCancel = () => {
  resetUploadForm()
}

// 上传至后端
const handleUploadSubmit = async () => {
  if (!isFormValid.value) {
    return
  }
  uploading.value = true
  try {
    let fileId: string | undefined
    const isFileType = uploadForm.resourceType === 'VIDEO' || uploadForm.resourceType === 'RESOURCE_FILE'

    // 文件类型 → 先上传文件拿到 fileId
    if (isFileType && uploadForm.file) {
      const fid = await uploadFile(uploadForm.file, FileBizTypeEnum.MOVIE_RESOURCE)
      fileId = String(fid)
    }

    // 保存扩展信息
    await saveCatalogExtra({
      catalogId: Number(props.catalogId),
      resourceType: uploadForm.resourceType as any,
      showName: uploadForm.showName,
      fileId,
      cloudDriveUrl: uploadForm.url || undefined,
      secret: uploadForm.secret || undefined,
    })

    ElMessage.success('资源上传成功')
    resetUploadForm()
    emit('reload')
  } catch (error) {
    ElMessage.error(error || '上传失败')
  } finally {
    uploading.value = false
  }
}

// 资源类型标签名称转换
const getResourceTypeLabel = (type: string): string => {
  return resourceTypeLabels[type] || type
}

// 资源类型映射
const resourceTypeLabels: Record<string, string> = {
  VIDEO: '视频',
  RESOURCE_FILE: '资源文件',
  CLOUD_DRIVE: '云盘链接',
}

// 资源类型标签颜色
const getResourceTagType = (type: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' | undefined => {
  const map: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger' | undefined> = {
    VIDEO: 'success',
    RESOURCE_FILE: 'info',
    CLOUD_DRIVE: undefined,
  }
  return map[type]
}

// 获取资源实际地址
const handleGetResourceUrl = async (item: any) => {
  let secret: string | undefined

  // 有密码则弹出输入框
  if (item.hasSecret) {
    try {
      const { value } = await ElMessageBox.prompt('', ' 请输入密码', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'text',
        inputValidator: (v: string) => !!v,
        inputErrorMessage: '请输入密码',
      })
      secret = value
    } catch {
      // 用户取消
      return
    }
  }

  fetchingIds[item.id] = true
  try {
    const res = await getCatalogExtraResourceUrl(item.id, secret)
    const url = res || ''
    fetchedUrls[item.id] = url
  } catch (error) {
    ElMessage.error(error || '获取资源地址失败')
  } finally {
    fetchingIds[item.id] = false
  }
}

// 触发下载
const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename || ''
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 手动下载
const handleDownload = (item: any) => {
  downloadFile(fetchedUrls[item.id], item.showName)
  ElMessage.success('开始下载')
}

// 播放视频
const handlePlayVideo = (item: any) => {
  emit('play-video', fetchedUrls[item.id])
}

// 复制链接
const handleCopyUrl = async (item: any) => {
  await navigator.clipboard.writeText(fetchedUrls[item.id])
  ElNotification.success('链接已复制')
}

// 关闭
const handleClose = () => {
  visible.value = false
  emit('close')
}
</script>

<!-- el-dialog 样式覆盖 -->
<style lang="scss">
.resource-list-dialog .el-dialog__title {
  font-size: 20px;
  font-weight: 600;
}
</style>

<style scoped lang="scss">
/* ===== 主容器：左右分栏 ===== */
.dialog-body-split {
  display: flex;
  min-height: 380px;
  gap: 20px;

  /* ===== 左侧：资源列表 ===== */
  .body-left {
    flex: 1;
    min-width: 0;

    /* 空状态 */
    .section-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 100px 0;
      color: var(--el-text-color-secondary);
      font-size: 15px;

      &::before {
        content: '📦';
        font-size: 40px;
        opacity: 0.5;
      }
    }

    /* 资源列表容器 */
    .resource-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 50vh;
      overflow-y: auto;
      padding-right: 4px;

      /* 单行资源项 */
      .resource-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        border-radius: 8px;
        background: var(--el-fill-color-lighter, rgba(255, 255, 255, 0.03));
        border: 1px solid transparent;
        transition: all 0.2s ease;

        &:hover {
          background: var(--el-fill-color-light, rgba(255, 255, 255, 0.06));
          border-color: var(--el-border-color-light, rgba(255, 255, 255, 0.08));
        }

        /* 左侧：标签 + 名称 + 密码标记 */
        .resource-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
          height: 35px;

          .resource-type-tag {
            font-size: 12px;
            flex-shrink: 0;
          }

          .resource-name {
            font-size: 14px;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 180px;
          }

          /* 编辑模式下的名称输入框 */
          .edit-name-input {
            width: 140px;
          }
        }

        /* 右侧：操作按钮 / 链接 */
        .resource-right {
          flex-shrink: 0;
          margin-left: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          max-width: 65%;

          /* 已获取的文本链接（视频/资源文件） */
          .fetched-url-text {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 260px;
          }

          /* 云盘链接（a 标签） */
          .cloud-link {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 200px;
            font-size: 13px;
            padding: 0 0 2px;
            border-bottom: 1px solid var(--el-color-primary);
            color: var(--el-color-primary);
            text-decoration: none;
            transition: opacity 0.2s;
            margin-right: 4px;

            &:hover {
              opacity: 0.75;
            }
          }

          /* 编辑模式下的链接输入框 */
          .edit-url-input {
            font-size: 12px;
            max-width: 200px;
            margin-right: 4px;
          }

          :deep(.el-button) {
            & + .el-button {
              margin-left: 0;
            }
          }
        }
      }
    }
  }

  /* ===== 右侧：上传资源表单 ===== */
  .body-right {
    width: 340px;
    flex-shrink: 0;
    border-left: 1px solid var(--el-border-color-light);
    padding-left: 20px;
    max-height: 50vh;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--el-border-color-darker, rgba(255, 255, 255, 0.08));
      border-radius: 4px;
    }

    .upload-form {
      .upload-form-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      /* Element Plus 表单样式微调 */
      :deep(.el-form-item) {
        margin-bottom: 14px;
      }

      :deep(.el-form-item__label) {
        font-size: 12px;
        padding-bottom: 4px;
        font-weight: 500;
      }

      :deep(.el-select) {
        width: 100%;
      }

      /* 文件上传区域 */
      .upload-file-wrap {
        width: 100%;
      }

      .file-name {
        margin-top: 6px;
        font-size: 12px;
        word-break: break-all;
        color: var(--el-text-color-secondary);
        padding: 4px 8px;
        background: var(--el-fill-color-lighter, rgba(255, 255, 255, 0.03));
        border-radius: 4px;
      }

      /* 密码开关行（文字 + switch） */
      .secret-toggle-row {
        display: flex;
        align-items: center;
        gap: 8px;

        .secret-toggle-label {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          line-height: 1;
        }
      }

      /* 表单底部按钮组 */
      .upload-form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 8px;
        padding-top: 12px;
      }
    }
  }
}

/* ===== 弹窗底部按钮 ===== */
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
</style>
