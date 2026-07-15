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
                {{ resourceTypeLabels[item.resourceType] || item.resourceType }}
              </el-tag>
              <el-input
                v-if="editingIds[item.id]"
                v-model="editForms[item.id].showName"
                class="edit-name-input"
                maxlength="20"
                placeholder="显示名称" />
              <span v-else class="resource-name" :title="item.showName">{{ item.showName }}</span>
              <el-tag v-if="item.hasSecret" type="warning" effect="plain">需要密码</el-tag>
            </div>
            <div class="resource-right" v-if="!uploadFormVisible">
              <!-- 0.链接显示-->
              <template v-if="fetchedUrls[item.id] && item.resourceType === 'CLOUD_DRIVE' && !editingIds[item.id]">
                <a :href="fetchedUrls[item.id]" target="_blank" class="cloud-link" :title="fetchedUrls[item.id]">
                  {{ fetchedUrls[item.id] }}
                </a>
              </template>
              <!-- 1.未获取地址 -->
              <template v-if="!fetchedUrls[item.id] && !editingIds[item.id]">
                <el-button type="primary" :loading="fetchingIds[item.id]" @click="handleResourceAction(item)">
                  {{ btnLabels[item.resourceType] || '获取地址' }}
                </el-button>
              </template>
              <!-- 2.已获取地址 -->
              <!-- a.视频 -->
              <template v-else-if="item.resourceType === 'VIDEO' && !editingIds[item.id]">
                <el-button type="success" @click="handlePlayVideo(item)">播放</el-button>
              </template>
              <!-- b.资源文件 -->
              <template v-else-if="item.resourceType === 'RESOURCE_FILE' && !editingIds[item.id]">
                <el-button type="primary" @click="handleDownload(item)">下载</el-button>
              </template>
              <!-- c.云盘链接 -->
              <template v-else-if="item.resourceType === 'CLOUD_DRIVE' && !editingIds[item.id]">
                <el-button type="success" @click="handleCopyUrl(item)">复制</el-button>
              </template>
              <!-- 2.编辑按钮 非云盘链接直接显示 云盘链接需要先获取 -->
              <template v-if="!editingIds[item.id] && (item.resourceType !== 'CLOUD_DRIVE' || fetchedUrls[item.id])">
                <el-button v-hasRole="['manager']" @click="handleEdit(item)">编辑</el-button>
              </template>
              <template v-else-if="editingIds[item.id]">
                <el-input
                  v-if="item.resourceType === 'CLOUD_DRIVE'"
                  v-model="editForms[item.id].url"
                  class="edit-url-input"
                  placeholder="请输入新的云盘链接" />
                <el-button type="primary" :loading="savingEditIds[item.id]" @click="handleEditSave(item)">
                  保存
                </el-button>
                <el-button @click="handleEditCancel(item)">取消</el-button>
              </template>
              <!-- 删除按钮 -->
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
              <OssUploader
                ref="ossUploaderRef"
                :key="uploadForm.resourceType"
                :bizType="FileBizTypeEnum.MOVIE_RESOURCE"
                :maxSize="50 * 1024 * 1024 * 1024"
                :accept="uploadForm.resourceType === 'VIDEO' ? '.mp4,.avi,.mkv,.mov,.wmv,.flv,.webm' : undefined"
                @success="handleUploadSuccess" />
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
                placeholder="设置访问密码"
                type="text"
                maxlength="200"
                autocomplete="off" />
            </el-form-item>

            <div class="upload-form-actions">
              <el-button @click="handleUploadCancel">取消</el-button>
              <el-button type="primary" :loading="uploading" @click="handleUploadSubmit" :disabled="!isFormValid">
                确认提交
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
import { ArrowUp, Plus, Cloudy, Lock } from '@element-plus/icons-vue'
import { saveCatalogExtra, updateCatalogExtra, deleteCatalogExtra } from '@/api/movie/movieCatalogExtra'
import { useResourceAction } from '@/composables/useMovieResourceAction'
import { FileBizTypeEnum } from '@/api/system/file'
import OssUploader from '@/components/OssUploader.vue'

// Props
const props = defineProps<{
  catalogId?: number | string
  resourceList: any[]
}>()

// Emits
const emit = defineEmits<{
  close: []
  'play-video': [url: string, resource: any]
  reload: []
}>()

// 状态
const visible = ref(true)

const { handleGetResourceUrl, fetchingIds, fetchedUrls } = useResourceAction()

// 编辑资源相关
const editForms = reactive<Record<number, { url: string; showName: string }>>({}) // 编辑表单
const editingIds = reactive<Record<number, boolean>>({}) // 正在编辑
const savingEditIds = reactive<Record<number, boolean>>({}) // 保存中 防抖
const deletingIds = reactive<Record<number, boolean>>({}) // 删除中 防抖

// 资源类型映射
const resourceTypeLabels: Record<string, string> = {
  VIDEO: '视频',
  RESOURCE_FILE: '资源文件',
  CLOUD_DRIVE: '云盘链接',
}

// 操作按钮文字映射
const btnLabels: Record<string, string> = {
  VIDEO: '播放',
  RESOURCE_FILE: '下载',
  CLOUD_DRIVE: '获取地址',
}

// 资源类型标签颜色
const getResourceTagType = (type: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' | undefined => {
  const map: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger' | undefined> = {
    VIDEO: 'success',
    RESOURCE_FILE: 'info',
    CLOUD_DRIVE: 'primary',
  }
  return map[type]
}

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
  const newName = editForms[item.id]?.showName?.trim()
  if (!newName) {
    ElMessage.warning('请输入显示名称')
    return
  }

  const isCloudDrive = item.resourceType === 'CLOUD_DRIVE'
  if (isCloudDrive) {
    const newUrl = editForms[item.id]?.url?.trim()
    if (!newUrl) {
      ElMessage.warning('请输入云盘链接')
      return
    }
  }

  savingEditIds[item.id] = true
  try {
    const data: any = { id: item.id, showName: newName }
    if (isCloudDrive) {
      data.cloudDriveUrl = editForms[item.id].url.trim()
      fetchedUrls[item.id] = data.cloudDriveUrl
    }
    await updateCatalogExtra(data)
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
const uploadedFileId = ref<string>() // 上传成功的文件ID
const uploadForm = reactive({
  resourceType: 'CLOUD_DRIVE', // 资源类型
  showName: '', // 显示名称
  url: '', // 云盘链接
  secret: '', // 访问密码
})

// 上传至后端
const handleUploadSubmit = async () => {
  if (!isFormValid.value) return

  const isFileType = uploadForm.resourceType === 'VIDEO' || uploadForm.resourceType === 'RESOURCE_FILE'
  if (isFileType && !uploadedFileId.value) {
    ElMessage.warning('请先上传文件')
    return
  }

  uploading.value = true
  try {
    // 保存扩展信息
    await saveCatalogExtra({
      catalogId: Number(props.catalogId),
      resourceType: uploadForm.resourceType as any,
      showName: uploadForm.showName,
      fileId: isFileType ? uploadedFileId.value || undefined : undefined,
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

// 表单校验
const isFormValid = computed(() => {
  if (!uploadForm.resourceType || !uploadForm.showName) {
    return false
  }
  if (uploadForm.resourceType === 'CLOUD_DRIVE' && !uploadForm.url) {
    return false
  }
  if ((uploadForm.resourceType === 'VIDEO' || uploadForm.resourceType === 'RESOURCE_FILE') && !uploadedFileId.value) {
    return false
  }
  return true
})

// OSS 上传成功回调
const handleUploadSuccess = (result: any) => {
  uploadedFileId.value = result.fileId ? String(result.fileId) : undefined
}

// 重置表单
const resetUploadForm = () => {
  uploadForm.resourceType = 'CLOUD_DRIVE'
  uploadForm.showName = ''
  uploadForm.url = ''
  uploadForm.secret = ''
  secretEnabled.value = false
  uploadedFileId.value = undefined
  uploadFormVisible.value = false
}

// 取消上传
const handleUploadCancel = () => {
  resetUploadForm()
}

// 获取地址后根据资源类型执行后续操作
const handleResourceAction = async (item: any) => {
  // 获取资源地址
  await handleGetResourceUrl(item)
  if (!fetchedUrls[item.id]) return

  const actionMap: Record<string, () => void> = {
    VIDEO: () => handlePlayVideo(item), // 播放视频
    RESOURCE_FILE: () => handleDownload(item), // 下载文件
  }
  actionMap[item.resourceType]?.()
}

// 手动下载
const handleDownload = (item: any) => {
  const link = document.createElement('a')
  link.href = fetchedUrls[item.id]
  link.download = item.showName || 'download'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('开始下载文件...')
}

// 播放视频
const handlePlayVideo = (item: any) => {
  emit('play-video', fetchedUrls[item.id], item)
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
  height: 380px;
  gap: 20px;

  /* ===== 左侧：资源列表 ===== */
  .body-left {
    flex: 1;
    overflow-y: auto;

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

        /* 标签 + 名称 + 密码标记 */
        .resource-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
          height: 35px;

          .resource-type-tag {
            font-size: 13px;
            flex-shrink: 0;
          }

          .resource-name {
            font-size: 16px;
            font-weight: 700;
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

        /* 操作按钮 / 链接 */
        .resource-right {
          flex-shrink: 0;
          margin-left: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          max-width: 65%;

          /* 云盘链接（a 标签） */
          .cloud-link {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 260px;
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
    padding-right: 20px;
    max-height: 50vh;
    overflow-y: auto;

    .upload-form {
      .upload-form-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--el-text-color-primary);
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
