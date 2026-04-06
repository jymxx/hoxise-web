<template>
  <el-dialog
    v-model="showLogin"
    width="900px"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    center
    align-center
    :z-index="2000"
    @close="handleClose"
    class="sms-login-dialog">
    <div class="login-container">
      <!-- 左侧装饰区域 -->
      <div class="login-image">
        <!-- 光晕层 -->
        <div class="glow-overlay"></div>

        <!-- 装饰图标 -->
        <el-icon class="decor-icon star-1"><Star /></el-icon>
        <el-icon class="decor-icon star-2"><Star /></el-icon>
        <el-icon class="decor-icon star-3"><Star /></el-icon>
        <el-icon class="decor-icon moon"><Moon /></el-icon>

        <!-- 小人头像 -->
        <img src="@/assets/images/resource/loginIcon.png" alt="小人头像" class="character-icon" />

        <!-- 漂浮粒子 -->
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="login-form">
        <!-- 背景装饰 -->
        <div class="form-content">
          <div class="title-wrapper">
            <p class="form-title">短信快捷登录</p>
          </div>

          <el-form :model="form" :rules="rules" label-width="0">
            <el-form-item prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" @keyup.enter="handleLogin">
                <template #prefix>
                  <el-icon class="input-icon"><Phone /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="code">
              <div class="code-row">
                <el-input v-model="form.code" placeholder="请输入验证码" maxlength="6" @keyup.enter="handleLogin">
                  <template #prefix>
                    <el-icon class="input-icon"><Message /></el-icon>
                  </template>
                </el-input>
                <el-button
                  :disabled="countdown > 0 || !isPhoneValid"
                  :loading="sending"
                  @click="handleSendCode"
                  class="code-btn">
                  <span v-if="countdown <= 0" class="btn-content">
                    <el-icon class="btn-icon"><Position /></el-icon>
                    获取验证码
                  </span>
                  <span v-else>{{ countdown }}秒后重发</span>
                </el-button>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :loading="loading"
                :disabled="!canSubmit"
                @click="handleLogin"
                class="login-btn">
                <span class="btn-content">
                  <span class="btn-text">登录 / 注册</span>
                  <el-icon class="btn-arrow" :class="{ 'slide-in': loading }"><Arrow-Right /></el-icon>
                </span>
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 底部装饰线 -->
          <div class="footer-decoration">
            <div class="dot-row">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Phone, Message, Star, Moon, Position, ArrowRight, Lightning } from '@element-plus/icons-vue'
import { loginBySms } from '@/api/system/auth'
import { sendVerifyCode } from '@/api/system/sms'
import { setToken } from '@/utils/auth'
import { useLogin } from '@/composables/useLogin'

const { showLogin, close } = useLogin()

const loading = ref(false)
const sending = ref(false)
const countdown = ref(0)
const form = ref({ phone: '', code: '' })

const phonePattern = /^1[3-9]\d{9}$/
const codePattern = /^\d{4,6}$/

const rules = {
  phone: [
    {
      validator: (_rule: any, value: string, cb: (err?: Error) => void) => {
        if (!value) cb(new Error('请输入手机号'))
        else if (!phonePattern.test(value)) cb(new Error('请输入正确的手机号'))
        else cb()
      },
      trigger: 'blur',
    },
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: codePattern, message: '请输入 4-6 位数字验证码', trigger: 'blur' },
  ],
}

const isPhoneValid = computed(() => phonePattern.test(form.value.phone))
const canSubmit = computed(() => isPhoneValid.value && codePattern.test(form.value.code) && !loading.value)

let timer: ReturnType<typeof setInterval> | null = null
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

// 发送验证码
const handleSendCode = async () => {
  if (!isPhoneValid.value) {
    ElMessage.error('请输入正确的手机号')
    return
  }
  sending.value = true
  try {
    await sendVerifyCode(form.value.phone)
    ElMessage.success('验证码已发送，可能有延迟，请耐心等待')
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer!)
    }, 1000)
  } catch (error: any) {
    ElMessage.error(error.message)
  } finally {
    sending.value = false
  }
}
// 处理登录
const handleLogin = async () => {
  if (!canSubmit.value) {
    ElMessage.error('请填写完整的登录信息')
    return
  }
  loading.value = true
  try {
    const result = await loginBySms({ phone: form.value.phone, verifyCode: form.value.code })
    setToken(result.token)
    close()
    location.reload()
  } catch (error: any) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

const handleClose = () => close()
</script>

<style scoped lang="scss">
.sms-login-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
    overflow: hidden;
  }
  :deep(.el-dialog__header) {
    display: none;
  }

  .login-container {
    display: flex;
    min-height: 500px;
    position: relative;
  }

  /* ========== 左侧装饰区域 ========== */
  .login-image {
    flex: 0 0 45%;
    position: relative;
    overflow: hidden;
    border-radius: 20px;
    background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);

    /* 光晕层 */
    .glow-overlay {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 30% 30%, rgba(102, 126, 234, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 70% 70%, rgba(118, 75, 162, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.2) 0%, transparent 70%);
      z-index: 2;
      animation: glow-pulse 4s ease-in-out infinite;
    }

    /* 小人头像 - 底部居中 */
    .character-icon {
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 200px;
      height: auto;
      z-index: 10;
      filter: drop-shadow(0 0 30px rgba(102, 126, 234, 0.5));
      animation: character-float 3s ease-in-out infinite;
    }

    /* 装饰图标 */
    .decor-icon {
      position: absolute;
      z-index: 5;

      &.star-1 {
        top: 30px;
        left: 40px;
        font-size: 32px;
        color: rgba(255, 255, 255, 0.8);
        animation:
          star-twinkle 2s ease-in-out infinite,
          float-3d 3s ease-in-out infinite;
        filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
      }
      &.star-2 {
        top: 80px;
        left: 80px;
        font-size: 20px;
        color: rgba(102, 126, 234, 0.6);
        animation:
          star-twinkle 2.5s ease-in-out infinite 0.3s,
          float-3d 4s ease-in-out infinite 0.5s;
        filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.6));
      }
      &.star-3 {
        bottom: 150px;
        right: 50px;
        font-size: 24px;
        color: rgba(236, 72, 153, 0.7);
        animation:
          star-twinkle 3s ease-in-out infinite 0.6s,
          float-3d 3.5s ease-in-out infinite 1s;
        filter: drop-shadow(0 0 12px rgba(236, 72, 153, 0.7));
      }
      &.moon {
        top: 40px;
        right: 50px;
        font-size: 40px;
        color: rgba(255, 255, 255, 0.9);
        animation:
          moon-glow 4s ease-in-out infinite,
          float-3d 5s ease-in-out infinite;
        filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.6));
      }
    }

    /* 漂浮粒子 */
    .particle {
      position: absolute;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.6), rgba(118, 75, 162, 0.4));
      animation: particle-float 6s ease-in-out infinite;

      &.particle-1 {
        width: 8px;
        height: 8px;
        top: 100px;
        right: 80px;
        animation-delay: 0s;
        filter: blur(1px);
      }
      &.particle-2 {
        width: 6px;
        height: 6px;
        bottom: 120px;
        left: 60px;
        animation-delay: 2s;
        filter: blur(0.5px);
      }
      &.particle-3 {
        width: 4px;
        height: 4px;
        top: 200px;
        right: 120px;
        animation-delay: 4s;
        filter: blur(0.3px);
      }
    }
  }

  /* ========== 右侧表单区域 ========== */
  .login-form {
    flex: 1;
    position: relative;
    padding: 50px 55px;
    background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;

    /* 背景装饰 */
    .form-content {
      position: relative;
      z-index: 1;
    }

    /* ========== 标题区域 ========== */
    .title-wrapper {
      margin-bottom: 40px;
      text-align: center;
    }

    .form-title {
      font-size: 30px;
      font-weight: 800;
      margin: 0 0 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #ec4899 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gradient-shift 3s ease infinite;
      letter-spacing: 2px;
    }

    /* 表单项间距 */
    .el-form-item {
      margin-bottom: 24px;
      &:last-child {
        margin-bottom: 0;
      }
    }

    /* ========== 输入框统一样式 ========== */
    .el-form-item :deep(.el-input__wrapper) {
      height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.5);
      border: 1.5px solid #e2e8f0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        transition: left 0.5s ease;
      }

      &:hover {
        border-color: #cbd5e1;
        box-shadow:
          0 4px 12px rgba(0, 0, 0, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 0.5);
        &::before {
          left: 100%;
        }
      }

      &.is-focus {
        border-color: #667eea;
        box-shadow:
          0 0 0 4px rgba(102, 126, 234, 0.12),
          0 4px 16px rgba(102, 126, 234, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.5);
      }

      .el-input__inner {
        font-size: 15px;
        color: #1e293b;
        font-weight: 500;
        &::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }
      }
    }

    /* 输入框前缀图标 */
    .el-form-item :deep(.el-input__prefix) {
      left: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      .input-icon {
        color: #94a3b8;
        font-size: 18px;
        transition: all 0.3s ease;
      }
    }

    .el-form-item:focus-within :deep(.input-icon) {
      color: #667eea;
      transform: scale(1.1);
      filter: drop-shadow(0 0 4px rgba(102, 126, 234, 0.5));
    }

    /* ========== 验证码输入行 ========== */
    .code-row {
      display: flex;
      gap: 14px;
      .el-input {
        flex: 1;
      }

      /* 验证码按钮 */
      .code-btn {
        height: 52px;
        min-width: 145px;
        border-radius: 14px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
        background-size: 200% auto;
        color: #fff;
        border: none;
        font-weight: 600;
        font-size: 14px;
        box-shadow:
          0 4px 15px rgba(99, 102, 241, 0.35),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        animation: gradient-shift 4s ease infinite;

        .btn-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .btn-icon {
          font-size: 16px;
          animation: icon-bounce 2s ease-in-out infinite;
        }

        &:disabled {
          background: linear-gradient(135deg, #cbd5e1 0%, #e2e8f0 100%);
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        &:not(:disabled):hover {
          transform: translateY(-3px);
          box-shadow:
            0 8px 25px rgba(99, 102, 241, 0.45),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        &:not(:disabled):active {
          transform: translateY(-1px);
        }
      }
    }

    /* ========== 登录按钮 ========== */
    .login-btn {
      width: 100%;
      height: 56px;
      border-radius: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #ec4899 100%);
      background-size: 200% auto;
      border: none;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #fff;
      box-shadow:
        0 8px 25px rgba(102, 126, 234, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      animation: gradient-shift 4s ease infinite;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.6s ease;
      }

      &:hover::before {
        left: 100%;
      }

      .btn-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        position: relative;
        z-index: 1;
      }
      .btn-text {
        transition: transform 0.3s ease;
      }
      .btn-arrow {
        font-size: 18px;
        transition: transform 0.3s ease;
      }

      &:hover {
        transform: translateY(-4px);
        box-shadow:
          0 12px 35px rgba(102, 126, 234, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.3);
        .btn-arrow {
          transform: translateX(5px);
        }
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
    }

    /* ========== 底部装饰 ========== */
    .footer-decoration {
      margin-top: 35px;
      text-align: center;
      .dot-row {
        display: flex;
        justify-content: center;
        gap: 10px;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea, #764ba2);
        animation: dot-pulse 2s ease-in-out infinite;
        &:nth-child(2) {
          animation-delay: 0.2s;
        }
        &:nth-child(3) {
          animation-delay: 0.4s;
        }
      }
    }
  }
}

/* ========== 动画 ========== */

/* 渐变移位动画 */
@keyframes gradient-shift {
  0%,
  100% {
    background-position: 0% center;
  }
  50% {
    background-position: 100% center;
  }
}

/* 光晕脉冲动画 */
@keyframes glow-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

/* 浮动动画 */
@keyframes float-3d {
  0%,
  100% {
    transform: translateY(0) rotateZ(0deg);
  }
  25% {
    transform: translateY(-8px) rotateZ(5deg);
  }
  50% {
    transform: translateY(-5px) rotateZ(-5deg);
  }
  75% {
    transform: translateY(-10px) rotateZ(3deg);
  }
}

/* 星星闪烁动画 */
@keyframes star-twinkle {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
  }
  50% {
    opacity: 0.6;
    transform: scale(0.9);
    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.4));
  }
}

/* 月亮光晕动画 */
@keyframes moon-glow {
  0%,
  100% {
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.6));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.9));
    transform: scale(1.05);
  }
}

/* 火花淡入淡出动画 */
@keyframes spark-fade {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 粒子浮动动画 */
@keyframes particle-float {
  0%,
  100% {
    transform: translateY(0) translateX(0);
    opacity: 0.6;
  }
  25% {
    transform: translateY(-20px) translateX(10px);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-10px) translateX(-10px);
    opacity: 1;
  }
  75% {
    transform: translateY(-30px) translateX(5px);
    opacity: 0.7;
  }
}

/* 小人浮动动画 */
@keyframes character-float {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-8px);
  }
}

/* 图标弹跳动画 */
@keyframes icon-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* 圆点脉冲动画 */
@keyframes dot-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.6;
  }
}

/* 箭头滑入动画 */
@keyframes slide-in {
  0% {
    transform: translateX(-10px);
    opacity: 0;
  }
  100% {
    transform: translateX(5px);
    opacity: 1;
  }
}

.slide-in {
  animation: slide-in 0.5s ease forwards;
}
</style>
