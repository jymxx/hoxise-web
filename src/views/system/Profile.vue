<template>
  <div class="profile-container">
    <div class="profile-card">
      <div class="profile-header">
        <h2 class="page-title">个人中心</h2>
      </div>

      <div class="profile-content">
        <!-- 头像区域 -->
        <div class="avatar-section">
          <el-upload action="#" :http-request="handleAvatarUpload" :show-file-list="false" accept="image/*">
            <div class="avatar-container">
              <el-avatar :src="userInfo.avatar" shape="circle" :size="120" fit="cover" />
              <div class="avatar-overlay">
                <el-icon :size="24"><Camera /></el-icon>
                <span>点击更换</span>
              </div>
            </div>
          </el-upload>
        </div>

        <!-- 用户信息区域 -->
        <div class="info-section">
          <div class="section-header">
            <h3 class="section-title">基本信息</h3>
            <div class="header-actions">
              <template v-if="!editing">
                <el-button type="primary" size="small" @click="startEditing">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
              </template>
              <template v-else>
                <el-button size="small" @click="cancelEditing">取消</el-button>
                <el-button type="primary" size="small" :loading="submitting" @click="handleSubmit"> 确认 </el-button>
              </template>
            </div>
          </div>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户 ID">
              {{ userInfo.userId }}
            </el-descriptions-item>
            <el-descriptions-item label="昵称">
              <template v-if="!editing">
                {{ userInfo.nickName }}
              </template>
              <template v-else>
                <el-input v-model="editForm.nickName" maxlength="20" placeholder="请输入昵称" />
              </template>
            </el-descriptions-item>
            <el-descriptions-item label="手机号">
              {{ userInfo.phoneNumber }}
            </el-descriptions-item>
            <el-descriptions-item label="角色">
              <el-tag v-for="role in userInfo.roles" :key="role" size="small" style="margin-right: 8px">
                {{ role }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="访问地址">
              <div class="profile-url">
                <span class="url-text">{{ profileUrl }}</span>
                <el-button type="primary" size="small" @click="copyProfileUrl">
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </div>
  </div>

  <!-- 星空背景 -->
  <StarsBg :factor="0.05" :speed="50" star-color="#fff" />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Camera, Edit, CopyDocument } from '@element-plus/icons-vue'
import { uploadAvatar, getUserInfo, modifyUserInfo } from '@/api/system/user'
import StarsBg from '@/components/inspira-ui/backgrounds/StarsBg.vue'

// ========== 类型定义 ==========
interface UserInfo {
  userId: number
  userName: string
  nickName: string
  roles: string[]
  avatar: string
  phoneNumber: string
}

// ========== 本地状态 ==========
const userInfo = ref<UserInfo>({} as UserInfo)
const editing = ref(false)
const submitting = ref(false)
const editForm = ref({
  nickName: '',
})

// ========== 计算属性 ==========
const profileUrl = computed(() => {
  if (userInfo.value.userId == null) return ''
  const baseUrl = import.meta.env.VITE_ROOT_WEBSITE_URL
  return `${baseUrl}/${userInfo.value.userId}/visitor`
})

// ========== 方法 ==========
/**
 * 复制个人主页链接
 */
const copyProfileUrl = async () => {
  try {
    await navigator.clipboard.writeText(profileUrl.value)
    ElMessage.success('链接已复制')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
/**
 * 处理头像上传
 */
const handleAvatarUpload = async (options: { file: File }) => {
  const file = options.file

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  // 验证文件大小（限制 10MB）
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('头像大小不能超过 10MB')
    return
  }

  try {
    const newAvatarUrl = await uploadAvatar(file)
    userInfo.value.avatar = newAvatarUrl
    ElMessage.success('头像上传成功')
  } catch (error) {
    ElMessage.error('头像上传失败: ' + error)
  }
}

const startEditing = () => {
  editForm.value.nickName = userInfo.value.nickName
  editing.value = true
}

const cancelEditing = () => {
  editing.value = false
}

/**
 * 处理提交
 */
const handleSubmit = async () => {
  submitting.value = true
  try {
    await modifyUserInfo(editForm.value)
    userInfo.value.nickName = editForm.value.nickName
    ElMessage.success('修改成功')
    editing.value = false
  } catch (error) {
    ElMessage.error('修改失败：' + error)
  } finally {
    submitting.value = false
  }
}

/**
 * 加载用户信息
 */
const loadUserInfo = async () => {
  try {
    userInfo.value = await getUserInfo()
  } catch (error) {
    console.error('[加载用户信息失败]', error)
  }
}

// ========== 生命周期 ==========
onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped lang="scss">
// 页面容器
.profile-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 24px;

  // 卡片主体
  .profile-card {
    max-width: 800px;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    // 头部
    .profile-header {
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;

      .page-title {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
    }

    // 内容区
    .profile-content {
      padding: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;

      // 头像区域
      .avatar-section {
        .avatar-container {
          position: relative;
          cursor: pointer;

          &:hover {
            .avatar-overlay {
              opacity: 1;
            }
          }
        }

        .avatar-overlay {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #fff;
          opacity: 0;
          transition: opacity 0.3s ease;

          span {
            font-size: 12px;
          }
        }
      }

      // 用户信息区域
      .info-section {
        width: 100%;
        max-width: 500px;

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .section-title {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #333;
          }

          .header-actions {
            display: flex;
            gap: 8px;
          }
        }

        :deep(.el-descriptions__label) {
          width: 100px;
          font-weight: 500;
          color: #606266;
        }

        // 个人主页链接样式
        .profile-url {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;

          .url-text {
            flex: 1;
            font-family: monospace;
            color: #303133;
            word-break: break-all;
          }

          .el-button {
            flex-shrink: 0;
          }
        }
      }
    }
  }
}
</style>
