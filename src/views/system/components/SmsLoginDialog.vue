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
      :before-close="handleClose">
      
      <div class="login-form">
        <el-form :model="loginForm" :rules="loginRules" ref="loginForm" label-width="0">
          <el-form-item prop="phone">
            <el-input 
              v-model="loginForm.phone" 
              prefix-icon="el-icon-phone" 
              placeholder="请输入手机号"
              maxlength="11"
              @keyup.enter.native="sendCode">
            </el-input>
          </el-form-item>
          
          <el-form-item prop="code">
            <div class="code-input">
              <el-input 
                v-model="loginForm.code" 
                prefix-icon="el-icon-message" 
                placeholder="请输入验证码"
                maxlength="6"
                @keyup.enter.native="handleLogin">
              </el-input>
              <el-button 
                :disabled="countdown > 0 || !validPhone" 
                @click="sendCode"
                class="code-btn"
                :loading="sendingCode">
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
      
      <div class="login-footer">
        <!-- <p class="login-tips">提示：请输入手机号和验证码完成登录</p> -->
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
      dialogVisible: false,
      loading: false,
      sendingCode: false,
      countdown: 0,
      timer: null,
      loginForm: {
        phone: '',
        code: ''
      },
      loginRules: {
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
  methods: {
    show() {
      this.dialogVisible = true
    },
    
    hide() {
      this.dialogVisible = false
      this.resetForm()
    },
    
    handleClose() {
      this.hide()
    },
    
    resetForm() {
      this.loginForm = {
        phone: '',
        code: ''
      }
      this.countdown = 0
      this.sendingCode = false
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.$refs.loginForm && this.$refs.loginForm.resetFields()
    },
    
    // 发送验证码
    async sendCode() {
      if (!this.validPhone) {
        this.$message.error('请输入正确的手机号')
        return
      }

      this.sendingCode = true
      try {
        const formData = new FormData()
        formData.append('phone', this.loginForm.phone)
        const response = await sendVerifyCode(this.loginForm.phone)
        
        if (response.code === 200) {
          this.$message.success('验证码已发送，可能有延迟，请注意接收')
          this.startCountdown() // 开始倒计时
        } else {
          this.$message.error(response.msg || '验证码发送失败')
        }
      } catch (error) {
        console.error('验证码发送失败:', error)
        this.$message.error('验证码发送失败，请稍后重试')
      } finally {
        this.sendingCode = false
      }
    },
    
    // 开始倒计时
    startCountdown() {
      this.countdown = 60
      this.timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(this.timer)
          this.timer = null
        }
      }, 1000)
    },
    
    // 处理登录
    async handleLogin() {
      if (!this.validForm) {
        this.$message.error('请填写完整的登录信息')
        return
      }

      this.loading = true
      try {
        const formData = new FormData()
        formData.append('phone', this.loginForm.phone)
        formData.append('verifyCode', this.loginForm.code)
        
        const response = await loginBySms(formData)
        
        if (response.code === 200) {
          // 登录成功，保存token
          setToken(response.data.token)
          //保存用户信息
          setUserInfo(response.data.userInfo)
          
          this.$message.success('登录成功')
          this.hide()
          
        } else {
          this.$message.error(response.msg || '登录失败,请稍后重试')
        }
      } catch (error) {
        console.error('登录失败:', error)
        this.$message.error('登录失败，请稍后重试')
      } finally {
        this.loading = false
      }
    }
  },
  
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>

<style scoped lang="scss">
.login-form {
  padding: 20px;
  
  .el-form-item {
    margin-bottom: 20px;
  }
  
  .code-input {
    display: flex;
    
    .el-input {
      flex: 1;
      margin-right: 10px;
    }
    
    .code-btn {
      width: auto;
      padding: 0 10px;
    }
  }
  
  .login-btn {
    width: 100%;
    margin-top: 10px;
  }
}

.login-footer {
  text-align: center;
  font-size: 12px;
  color: #999;
  padding: 0 20px 20px;
  
  .login-tips {
    margin: 0;
  }
}
</style>