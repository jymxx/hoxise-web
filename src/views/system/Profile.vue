<template>
  <div class="profile-container">
    <div class="profile-card">
      <div class="profile-header">
        <div class="header-left">
          <el-button link class="back-btn" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>
        <h2 class="page-title">
          <el-icon class="title-icon"><User /></el-icon>
          个人中心
        </h2>
      </div>

      <div class="profile-content">
        <!-- 头像区域 -->
        <div class="avatar-section">
          <div class="avatar-ring"></div>
          <div class="avatar-ring ring-2"></div>
          <el-upload action="#" :http-request="handleAvatarUpload" :show-file-list="false" accept="image/*">
            <div class="avatar-container">
              <el-avatar :src="userInfo.avatar" shape="circle" :size="130" fit="cover" class="main-avatar" />
              <div class="avatar-overlay">
                <el-icon :size="28"><Camera /></el-icon>
                <span>更换头像</span>
              </div>
            </div>
          </el-upload>
          <div class="avatar-glow"></div>
        </div>

        <!-- 用户信息区域 -->
        <div class="info-section">
          <div class="section-header">
            <h3 class="section-title">
              <el-icon class="section-icon"><UserFilled /></el-icon>
              基本信息
            </h3>
            <div class="header-actions">
              <template v-if="!editing">
                <el-button class="edit-btn" type="primary" size="small" @click="startEditing">
                  <el-icon><Edit /></el-icon>
                  编辑资料
                </el-button>
              </template>
              <template v-else>
                <el-button class="action-btn" size="small" @click="cancelEditing">取消</el-button>
                <el-button
                  class="action-btn confirm-btn"
                  type="primary"
                  size="small"
                  :loading="submitting"
                  @click="handleSubmit">
                  <el-icon><Check /></el-icon>
                  确认保存
                </el-button>
              </template>
            </div>
          </div>

          <div class="info-cards">
            <!-- 昵称卡片 -->
            <div class="info-card">
              <div class="info-label">
                <el-icon class="label-icon"><Star /></el-icon>
                昵称
              </div>
              <div class="info-value">
                <template v-if="!editing">
                  {{ userInfo.nickName }}
                </template>
                <template v-else>
                  <el-input
                    v-model="editForm.nickName"
                    maxlength="20"
                    placeholder="请输入昵称"
                    class="edit-input"
                    clearable />
                </template>
              </div>
            </div>

            <!-- 手机号卡片 -->
            <div class="info-card">
              <div class="info-label">
                <el-icon class="label-icon"><Cellphone /></el-icon>
                手机号
              </div>
              <div class="info-value phone-value">{{ userInfo.phoneNumber }}</div>
            </div>

            <!-- 角色卡片 -->
            <div class="info-card">
              <div class="info-label">
                <el-icon class="label-icon"><Trophy /></el-icon>
                角色
              </div>
              <div class="info-value roles-value">
                <el-tag v-for="role in userInfo.roles" :key="role" class="role-tag" effect="light">
                  {{ getRoleLabel(role) }}
                </el-tag>
              </div>
            </div>
            <!-- 访问地址卡片 -->
            <div class="info-card url-card">
              <div class="info-label">
                <el-icon class="label-icon"><Link /></el-icon>
                站内分享地址
              </div>
              <div class="info-value url-value">
                <div class="url-box">
                  <el-icon class="url-icon"><Link /></el-icon>
                  <span class="url-text">{{ profileUrl }}</span>
                </div>
                <el-button class="copy-btn" size="small" @click="copyProfileUrl">
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
              </div>
            </div>

            <!-- 是否公开 -->
            <div class="info-card">
              <div class="info-label">
                <el-icon class="label-icon"><Star /></el-icon>
                是否公开数据
              </div>
              <div class="info-value">【开发中】</div>
            </div>
            <!-- 访问次数 -->
            <div class="info-card">
              <div class="info-label">
                <el-icon class="label-icon"><Star /></el-icon>
                被访问次数
              </div>
              <div class="info-value">【开发中】</div>
            </div>

            <!-- DB 数据来源卡片 -->
            <div class="info-card source-card">
              <div class="info-label">
                <el-icon class="label-icon"><DataLine /></el-icon>
                DB数据来源 (主要)
              </div>
              <div class="info-value source-value">
                <span>Bangumi 番组计划 </span>
                <a href="https://bangumi.tv/" target="_blank" class="source-link">
                  <el-icon><Link /></el-icon>
                  https://bangumi.tv/
                </a>
              </div>
            </div>
            <div class="info-card source-card">
              <div class="info-label">
                <el-icon class="label-icon"><DataLine /></el-icon>
                DB数据来源
              </div>
              <div class="info-value source-value">
                <span>The Movie Database </span>
                <a href="https://www.themoviedb.org/" target="_blank" class="source-link">
                  <el-icon><Link /></el-icon>
                  https://www.themoviedb.org/
                </a>
              </div>
            </div>
          </div>

          <!-- 底部联系邮箱按钮 -->
          <div class="contact-section">
            <el-button class="contact-btn" @click="copyContactEmail">
              <el-icon><Message /></el-icon>
              问题反馈
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import {
  Camera,
  Edit,
  CopyDocument,
  ArrowLeft,
  User,
  UserFilled,
  Star,
  Cellphone,
  Trophy,
  Link,
  Check,
  DataLine,
  Message,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { getUserInfo, modifyUserInfo } from '@/api/system/user'
import { uploadFile, getFileAccessUrl, FileBizTypeEnum } from '@/api/system/file'
import { useRouter } from 'vue-router'
import { getRoleLabel } from '@/utils/enums/role'

// Router
const router = useRouter()

const userStore = useUserStore()

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
  await navigator.clipboard.writeText(profileUrl.value)
  ElNotification.success('链接已复制')
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
    // 上传文件获取 fileId
    const fileId = await uploadFile(file, FileBizTypeEnum.AVATAR)
    // 更新用户头像
    await modifyUserInfo({ avatarFileId: fileId })
    // 获取新的头像访问URL并更新显示
    userInfo.value.avatar = await getFileAccessUrl(fileId)
    ElMessage.success('头像上传成功')
    userStore.loadUserInfo() // 重新加载用户信息
  } catch (error: any) {
    ElMessage.error(error)
  }
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
    userStore.loadUserInfo() // 重新加载用户信息
  } catch (error: any) {
    ElMessage.error('修改失败：' + error.message)
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
    ElMessage.error('加载用户信息失败：' + error)
  }
}

const startEditing = () => {
  editForm.value.nickName = userInfo.value.nickName
  editing.value = true
}

const cancelEditing = () => {
  editing.value = false
}

// 复制联系邮箱
const copyContactEmail = async () => {
  await navigator.clipboard.writeText('2273554340@qq.com')
  ElNotification.success('邮箱地址已复制')
}

// 返回上一页
const goBack = () => {
  router.back()
}

// ========== 生命周期 ==========
onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped lang="scss">
// ========== CSS 变量 ==========
$primary: #667eea;
$secondary: #764ba2;
$accent: #f093fb;
$text-dark: #1a1a2e;
$text-muted: #6a6a8a;

// ========== 页面容器 ==========
.profile-container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #0c0c1e 0%, #1a1a3e 50%, #0f0f2d 100%);
  padding: 24px;
  overflow: hidden;

  // 个人资料卡片
  .profile-card {
    position: relative;
    z-index: 10;
    max-width: 700px;
    margin: 30px auto;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 255, 0.95));
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    animation: cardFadeIn 0.6s ease;

    // 卡片头部
    .profile-header {
      padding: 40px 24px;
      background: linear-gradient(135deg, $primary 0%, $secondary 50%, $accent 100%);
      background-size: 200% 200%;
      animation: gradientFlow 6s ease infinite;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      // 返回按钮
      .header-left {
        position: absolute;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 20;

        .back-btn {
          color: rgba(255, 255, 255, 0.95);
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: translateX(-4px);
          }
        }
      }

      // 页面标题
      .page-title {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 12px;

        .title-icon {
          font-size: 32px;
        }
      }
    }

    // 卡片内容区
    .profile-content {
      padding: 40px 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 40px;

      // 头像区域
      .avatar-section {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;

        // 旋转光环
        .avatar-ring {
          position: absolute;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: rgba($primary, 0.6);
          border-right-color: rgba($secondary, 0.6);
          animation: ringRotate 3s linear infinite;
        }

        .ring-2 {
          width: 180px;
          height: 180px;
          border-top-color: rgba($accent, 0.4);
          border-right-color: rgba($primary, 0.4);
          animation-duration: 5s;
          animation-direction: reverse;
        }

        @keyframes ringRotate {
          to {
            transform: rotate(360deg);
          }
        }

        // 头像容器
        .avatar-container {
          position: relative;
          cursor: pointer;
          transition: all 0.4s ease;
          z-index: 10;

          &:hover {
            transform: scale(1.05);
            .avatar-overlay {
              opacity: 1;
            }
          }

          .main-avatar {
            box-shadow: 0 4px 20px rgba($primary, 0.4);
            border: 3px solid rgba(255, 255, 255, 0.8);
          }
        }

        // 头像悬浮遮罩
        .avatar-overlay {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba($primary, 0.85), rgba($secondary, 0.85));
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

        // 底部光晕
        .avatar-glow {
          position: absolute;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba($primary, 0.3) 0%, transparent 70%);
          filter: blur(20px);
          z-index: 0;
          animation: glowPulse 3s ease-in-out infinite;
        }
      }

      // 用户信息区域
      .info-section {
        width: 100%;

        // 区域头部
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid rgba($primary, 0.15);

          .section-title {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            color: $text-dark;
            display: flex;
            align-items: center;
            gap: 10px;

            .section-icon {
              font-size: 24px;
              color: $primary;
            }
          }

          // 头部操作按钮
          .header-actions {
            display: flex;
            gap: 10px;

            .edit-btn {
              background: linear-gradient(135deg, $primary, $secondary);
              padding: 8px 20px;

              &:hover {
                transform: translateY(-2px);
              }
            }

            .action-btn {
              padding: 8px 18px;

              &.confirm-btn {
                background: linear-gradient(135deg, #6cc7ff, #38ef7d);
                &:hover {
                  transform: translateY(-2px);
                }
              }
            }
          }
        }

        // 信息卡片组
        .info-cards {
          display: flex;
          flex-direction: column;
          gap: 16px;

          .info-card {
            position: relative;
            display: flex;
            align-items: center;
            padding: 18px 20px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 255, 0.7));
            border-radius: 14px;
            border: 1px solid rgba($primary, 0.15);
            transition: all 0.3s ease;

            // 左侧彩色边框
            &::before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              bottom: 0;
              width: 4px;
              background: linear-gradient(180deg, $primary, $secondary);
            }

            &:hover {
              transform: translateX(6px);
              border-color: rgba($primary, 0.3);
            }

            // 信息标签
            .info-label {
              display: flex;
              align-items: center;
              gap: 10px;
              min-width: 100px;
              font-size: 14px;
              font-weight: 600;
              color: $text-muted;

              .label-icon {
                font-size: 18px;
                color: $primary;
              }
            }

            // 信息值
            .info-value {
              flex: 1;
              font-size: 15px;
              color: $text-dark;
              text-align: right;

              // 手机号等宽字体
              &.phone-value {
                font-family: monospace;
                letter-spacing: 1px;
              }

              // 角色标签组
              &.roles-value {
                display: flex;
                gap: 8px;
                justify-content: flex-end;
                flex-wrap: wrap;

                .role-tag {
                  font-size: 12px;
                  padding: 4px 12px;
                  border-radius: 8px;
                  border: 1px solid rgba($primary, 0.3);
                  background: linear-gradient(rgba($primary, 0.1), rgba($secondary, 0.1));
                  color: $primary;
                  font-weight: 600;
                }
              }

              // URL 值
              &.url-value {
                display: flex;
                align-items: center;
                gap: 12px;
                justify-content: flex-end;
              }
            }

            // URL 卡片特殊样式
            &.url-card {
              .url-box {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 14px;
                background: linear-gradient(rgba($primary, 0.08), rgba($secondary, 0.08));
                border-radius: 10px;
                border: 1px solid rgba($primary, 0.15);
                max-width: 380px;

                .url-icon {
                  color: $primary;
                  font-size: 16px;
                  flex-shrink: 0;
                }

                .url-text {
                  font-family: monospace;
                  color: #4a4a6a;
                  font-size: 12px;
                  word-break: break-all;
                }
              }

              .copy-btn {
                background: linear-gradient(135deg, $primary, $secondary);
                color: #fff;
                padding: 10px 18px;
                border-radius: 10px;
                flex-shrink: 0;
                transition: all 0.3s ease;

                &:hover {
                  transform: translateY(-2px);
                }
              }
            }

            // 数据来源卡片样式
            &.source-card {
              .source-value {
                display: flex;
                align-items: center;
                gap: 12px;
                justify-content: flex-end;

                span {
                  font-size: 14px;
                  font-weight: 600;
                  color: $text-muted;
                }

                .source-link {
                  display: inline-flex;
                  align-items: center;
                  gap: 6px;
                  padding: 8px 14px;
                  background: linear-gradient(rgba($primary, 0.08), rgba($secondary, 0.08));
                  border-radius: 10px;
                  border: 1px solid rgba($primary, 0.15);
                  color: $primary;
                  font-size: 13px;
                  font-weight: 600;
                  text-decoration: none;
                  transition: all 0.3s ease;

                  &:hover {
                    background: linear-gradient(rgba($primary, 0.15), rgba($secondary, 0.15));
                    border-color: rgba($primary, 0.3);
                    color: $secondary;
                  }
                }
              }
            }
          }
        }

        // 编辑输入框样式
        .edit-input {
          :deep(.el-input__wrapper) {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba($primary, 0.15);
            padding: 8px 14px;
          }
          :deep(.el-input__inner::placeholder) {
            color: #a0a0c0;
          }
        }

        // 底部联系邮箱
        .contact-section {
          margin-top: 24px;
          display: flex;
          justify-content: flex-end;

          .contact-btn {
            background: linear-gradient(135deg, rgba($primary, 0.08), rgba($secondary, 0.08));
            border: 1px solid rgba($primary, 0.2);
            color: $primary;
            padding: 8px 16px;
            font-size: 13px;
            border-radius: 20px;
            transition: all 0.3s ease;

            .el-icon {
              margin-right: 4px;
              font-size: 16px;
            }

            &:hover {
              background: linear-gradient(135deg, rgba($primary, 0.15), rgba($secondary, 0.15));
              border-color: rgba($primary, 0.35);
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba($primary, 0.2);
            }
          }
        }
      }
    }
  }
}

// 卡片淡入动画
@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 渐变流动动画
@keyframes gradientFlow {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>
