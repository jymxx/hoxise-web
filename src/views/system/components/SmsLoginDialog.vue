<template>
  <div>
    <el-dialog
      :visible.sync="dialogVisible"
      width="420px"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
      :modal="true"
      center
      :modal-append-to-body="true"
      :z-index="2000"
      :before-close="handleClose"
      class="sms-login-dialog">
      
      <div class="login-form">
        <!-- 标题区域 -->
        <div class="form-header">
          <p class="form-subtitle">短信快捷登录</p>
        </div>

        <el-form :model="loginForm" :rules="loginRules" ref="loginForm" label-width="0">
          <el-form-item prop="phone">
            <el-input
              v-model="loginForm.phone"
              prefix-icon="el-icon-phone"
              placeholder="请输入手机号"
              maxlength="11"
              @keyup.enter.native="handleLogin"
              class="custom-input">
            </el-input>
          </el-form-item>

          <el-form-item prop="code">
            <div class="code-input">
              <el-input
                v-model="loginForm.code"
                prefix-icon="el-icon-message"
                placeholder="请输入验证码"
                maxlength="6"
                @keyup.enter.native="handleLogin"
                class="custom-input">
              </el-input>
              <el-button
                :disabled="countdown > 0 || !validPhone"
                @click="sendCode"
                class="code-btn"
                :loading="sendingCode"
                :class="{ 'btn-countdown': countdown > 0 }">
                {{ countdown > 0 ? `${countdown}秒后重发` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleLogin"
              :loading="loading"
              class="login-btn"
              :disabled="!validForm">
              登录 / 注册
            </el-button>
          </el-form-item>

          <p class="form-tip">
            未注册手机号将自动创建账号
          </p>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>


<script>
import { loginBySms } from '@/api/system/auth'
import { sendVerifyCode } from '@/api/system/sms'
import { setToken,setUserInfo } from '@/utils/auth'

export default {
  name: 'SmsLoginDialog',
  data() {
    // 手机号验证规则
    const validatePhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入手机号'))
      } else if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }

    return {
      dialogVisible: true,
      loading: false,//登录加载状态
      sendingCode: false,//发送验证码加载状态
      countdown: 0,//发送验证码限制倒计时
      timer: null,//计时器
      loginForm: {//登录表单
        phone: '',
        code: ''
      },
      loginRules: {//验证规则
        phone: [
          { validator: validatePhone, trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { pattern: /^\d{4}$/, message: '请输入4位数字验证码', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    validPhone() {
      return /^1[3-9]\d{9}$/.test(this.loginForm.phone)
    },
    validForm() {
      return this.validPhone && this.loginForm.code.length === 4 && !this.loading
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    //显示组件
    show() {
      this.dialogVisible = true
    },
    //关闭组件
    handleClose() {
      this.dialogVisible = false
      this.$emit('close');
    },
    
    // 发送验证码
    async sendCode() {
      if (!this.validPhone) {
        this.$message.error('请输入正确的手机号')
        return
      }
      this.sendingCode = true
      try {
        const formData = new FormData();
        formData.append('phone', this.loginForm.phone)
        const response = await sendVerifyCode(this.loginForm.phone)
        
        if (response.code === 200) {
          this.$message.success('验证码已发送，可能有延迟，请耐心等待')
          this.startCountdown() // 开始倒计时
        } else {
          this.$message.error(response.msg || '验证码发送失败')
        }
      } catch (error) {
        this.$message.error('验证码发送失败，请稍后重试')
      } finally {
        this.sendingCode = false
      }
    },
    // 开始倒计时
    startCountdown() {
      this.countdown = 60;
      this.timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(this.timer)
          this.timer = null
        }
      }, 1000)
    },
    
    // 登录逻辑
    async handleLogin() {
      if (!this.validForm) {
        this.$message.error('请填写完整的登录信息')
        return
      }
      this.loading = true
      try {
        const formData = new FormData();
        formData.append('phone', this.loginForm.phone)
        formData.append('verifyCode', this.loginForm.code)
        const response = await loginBySms(formData)
        
        if (response.code === 200) {
          // 保存token
          setToken(response.data.token)
          // 保存用户信息
          setUserInfo(response.data.userInfo)
          
          this.$message.success('登录成功')
          //刷新页面状态
          this.handleClose()
          setTimeout(() => {
            location.reload()
          }, 300)
        } else {
          this.$message.error(response.msg || '登录失败,请稍后重试')
        }
      } catch (error) {
        this.$message.error('登录失败，请稍后重试')
      } finally {
        this.loading = false
      }
    }
  },
  

}
</script>
<style scoped lang="scss">
.sms-login-dialog {

  // 弹窗居中
  ::v-deep .el-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0 !important;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  // 表单
  .login-form {
    padding: 30px;
    background: linear-gradient(180deg, #ffffff 0%, #f8f9fc 100%);

    // 标题区域
    .form-header {
      text-align: center;
      margin-top: -30px;
      margin-bottom: 30px;

      .form-title {
        font-size: 24px;
        font-weight: 700;
        color: #1a1a2e;
        margin: 0 0 8px 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .form-subtitle {
        font-size: 24px;
        color: #8b92a5;
        margin: 0;
      }
    }

    .el-form-item {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 12px;
      }
    }

    // 输入框美化
    .custom-input {
      ::v-deep .el-input__inner {
        height: 50px;
        line-height: 50px;
        border: 2px solid #e8ecf1;
        border-radius: 12px;
        padding-left: 45px;
        font-size: 15px;
        color: #2d3748;
        background: #ffffff;
        transition: all 0.3s ease;

        &::placeholder {
          color: #a0aec0;
        }

        &:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.12);
          background: #ffffff;
        }

        &:hover:not(:focus) {
          border-color: #c5c9d1;
        }
      }

      ::v-deep .el-input__prefix {
        display: flex;
        align-items: center;
        left: 15px;

        i {
          font-size: 18px;
          color: #a0aec0;
          transition: color 0.3s ease;
        }
      }

      &:focus-within {
        ::v-deep .el-input__prefix i {
          color: #667eea;
        }
      }
    }

    // 验证码输入框
    .code-input {
      display: flex;
      gap: 12px;

      .el-input {
        flex: 1;
      }

      .code-btn {
        height: 50px;
        min-width: 130px;
        padding: 0 18px;
        border-radius: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

        &.is-disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: linear-gradient(135deg, #c5c8ce 0%, #b1b4b8 100%);
          box-shadow: none;
          transform: none;
        }

        &.btn-countdown {
          background: linear-gradient(135deg, #a0aec0 0%, #8f9da8 100%);
          box-shadow: none;
        }

        &:not(.is-disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        &:not(.is-disabled):active {
          transform: translateY(0);
        }
      }
    }

    // 登录按钮
    .login-btn {
      width: 100%;
      height: 52px;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 2px;
      color: white;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.35);

      &.is-loading,
      &[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none;
      }

      &:not([disabled]):hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(102, 126, 234, 0.45);
      }

      &:not([disabled]):active {
        transform: translateY(0);
      }
    }

    // 提示信息
    .form-tip {
      text-align: center;
      font-size: 12px;
      color: #a0aec0;
      margin: 16px 0 0 0;
      line-height: 1.5;
    }
  }
}
</style>