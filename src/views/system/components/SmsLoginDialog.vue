<template>
  <el-dialog
    v-model="showLogin"
    width="420px"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    center
    align-center
    :z-index="2000"
    @close="handleClose"
    class="sms-login-dialog">
    <div class="login-form">
      <p class="form-title">短信快捷登录</p>

      <el-form :model="form" :rules="rules" label-width="0">
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" @keyup.enter="handleLogin">
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="code">
          <div class="code-row">
            <el-input v-model="form.code" placeholder="请输入验证码" maxlength="6" @keyup.enter="handleLogin">
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
            <el-button :disabled="countdown > 0 || !isPhoneValid" :loading="sending" @click="handleSendCode">
              {{ countdown > 0 ? `${countdown}秒后重发` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" :disabled="!canSubmit" @click="handleLogin" class="login-btn">
            登录 / 注册
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Phone, Message } from '@element-plus/icons-vue'
import { loginBySms } from '@/api/system/auth'
import { sendVerifyCode } from '@/api/system/sms'
import { setToken } from '@/utils/auth'
import { useLogin } from '@/composables/useLogin'

// ========== Composable ==========
const { showLogin, close } = useLogin()

// ========== 状态 ==========
const loading = ref(false)
const sending = ref(false)
const countdown = ref(0)

const form = ref({
  phone: '',
  code: '',
})

// ========== 验证规则 ==========
const phonePattern = /^1[3-9]\d{9}$/
const codePattern = /^\d{4}$/

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
    { pattern: codePattern, message: '请输入 4 位数字验证码', trigger: 'blur' },
  ],
}

// ========== 计算属性 ==========
const isPhoneValid = computed(() => phonePattern.test(form.value.phone))
const canSubmit = computed(() => isPhoneValid.value && codePattern.test(form.value.code) && !loading.value)

// ========== 方法 ==========
// 发送验证码
const handleSendCode = async () => {
  if (!isPhoneValid.value) {
    ElMessage.error('请输入正确的手机号')
    return
  }

  sending.value = true
  try {
    await sendVerifyCode(form.value.phone)
    // 拦截器已成功则返回，直接执行成功逻辑
    ElMessage.success('验证码已发送，可能有延迟，请耐心等待')
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer!)
    }, 1000)
  } catch (error : any) {
    ElMessage.error(error.message)
  } finally {
    sending.value = false
  }
}

// 登录
const handleLogin = async () => {
  if (!canSubmit.value) {
    ElMessage.error('请填写完整的登录信息')
    return
  }

  loading.value = true
  try {
    const result = await loginBySms({ phone: form.value.phone, verifyCode: form.value.code })
    //设置token即可
    setToken(result.token)
    //关闭弹窗
    close()
    // 刷新以处理状态
    location.reload()
  } catch (error : any) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  close()
}

// ========== 生命周期 ==========
let timer: ReturnType<typeof setInterval> | null = null
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped lang="scss">
.sms-login-dialog {
  /* ========== 登录表单区域 ========== */
  .login-form {
    padding: 45px 40px;
    background: linear-gradient(180deg, #ffffff 0%, #f5f7fa 100%);

    /* 标题 */
    .form-title {
      font-size: 26px;
      text-align: center;
      margin: -30px 0 30px;
      font-weight: 700;
      letter-spacing: 3px;
      color: #8d929f;
    }

    /* 表单项间距 */
    .el-form-item {
      margin-bottom: 22px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    /* ========== 输入框统一样式 ========== */
    .el-form-item :deep(.el-input__wrapper) {
      height: 48px;
      border-radius: 10px;
      background-color: #f8f9fa;
      box-shadow: none;
      border: 1px solid #e1e5eb;
      transition: all 0.3s ease;

      &:hover {
        border-color: #c5cbd6;
      }

      &.is-focus {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
      }

      .el-input__inner {
        font-size: 15px;
        color: #2c3e50;

        &::placeholder {
          color: #a0aec0;
        }
      }
    }

    /* 输入框前缀图标 */
    .el-form-item :deep(.el-input__prefix) {
      left: 12px;
      color: #95a5a6;
      transition: color 0.3s ease;
    }

    .el-form-item:focus-within :deep(.el-input__prefix) {
      color: #667eea;
    }

    /* ========== 验证码输入行 ========== */
    .code-row {
      display: flex;
      gap: 12px;

      .el-input {
        flex: 1;
      }

      /* 验证码按钮 */
      .el-button {
        height: 48px;
        min-width: 130px;
        border-radius: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        border: none;
        font-weight: 600;
        font-size: 14px;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.35);
        transition: all 0.3s ease;
        cursor: pointer;

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        &:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.45);
        }
      }
    }

    /* ========== 登录按钮 ========== */
    .login-btn {
      width: 100%;
      height: 50px;
      border-radius: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #fff;
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(102, 126, 234, 0.5);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
    }

    /* ========== 提示信息 ========== */
    .tip {
      text-align: center;
      font-size: 12px;
      color: #95a5a6;
      margin: 18px 0 0;
      line-height: 1.5;
    }
  }
}
</style>
