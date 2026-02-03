<template>
  <div>
    <el-dialog
      title="短信登录"
      :visible.sync="dialogVisible"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
      :modal="true"
      center
      :modal-append-to-body="true"
      :z-index="2000"
      :before-close="handleClose"
      class="sms-login-dialog">
      
      <div class="login-form">
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
              登录/注册
            </el-button>
          </el-form-item>
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
          // 登录成功，保存token
          setToken(response.data.token)
          //保存用户信息
          setUserInfo(response.data.userInfo)
          
          this.$message.success('登录成功')
          this.handleClose()
          
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
  overflow: hidden;
  
  ::v-deep .el-dialog__header {
    background: linear-gradient(135deg, #92a4f4 0%, #97e7fa 100%);
    color: white;
    padding: 20px 20px 15px;
    
    .el-dialog__title {
      color: white;
      font-weight: 600;
    }
  }
  
  ::v-deep .el-dialog__body {
    padding: 10px 20px 20px;
  }
  // 表单
  .login-form {
    padding: 20px 0;
    
    .el-form-item {
      margin-bottom: 24px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    // 输入框美化
    .custom-input {
      ::v-deep .el-input__inner {
        height: 48px;
        line-height: 48px;
        border: 2px solid #e1e5e9;
        border-radius: 8px;
        padding-left: 45px;
        font-size: 14px;
        transition: all 0.3s ease;
        
        &:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
      }
      
      ::v-deep .el-input__prefix {
        display: flex;
        align-items: center;
        left: 15px;
        
        i {
          font-size: 16px;
          color: #a0aec0;
        }
      }
    }
    // 验证码输入框
    .code-input {
      display: flex;
      
      .el-input {
        flex: 1;
        margin-right: 12px;
      }
      
      .code-btn {
        height: 48px;
        min-width: 120px;
        padding: 0 15px;
        border-radius: 8px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        font-size: 13px;
        transition: all 0.3s ease;
        
        &.is-disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: linear-gradient(135deg, #c5c8ce 0%, #b1b4b8 100%);
        }
        
        &.btn-countdown {
          background: linear-gradient(135deg, #a0aec0 0%, #8f9da8 100%);
        }
        
        &:not(.is-disabled):hover {
          background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
          transform: translateY(-1px);
        }
      }
    }
    // 登录按钮
    .login-btn {
      width: 100%;
      height: 48px;
      border-radius: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 1px;
      transition: all 0.3s ease;
      
      &.is-loading,
      &[disabled] {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none !important;
      }
      
      &:not([disabled]):hover {
        background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
      }
   }
  }
}



</style>