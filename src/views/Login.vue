<template>
  <div class="login-container">
    <div class="login-form">
      <h2>滴滴打车管理平台</h2>
      <el-form :model="form" :rules="rules" ref="loginForm">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="管理员账号" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock"
                    @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" :loading="loading" @click="handleLogin">
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-tip">
        测试账号: admin 密码: 123456
      </div>
    </div>
  </div>
</template>

<script>
import { userApi } from '@/api/user'
import { auth } from '@/utils/auth'

export default {
  name: 'Login',
  data() {
    return {
      form: {
        username: 'admin',
        password: '123456'
      },
      rules: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      },
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          this.loading = true
          try {
            const response = await userApi.login(this.form)
            if (response.code === 200) {
              auth.setToken('admin-token-' + Date.now())
              this.$message.success('登录成功')
              this.$router.push('/dashboard')
            }
          } catch (error) {
            this.$message.error('登录失败：' + (error.message || '未知错误'))
          } finally {
            this.loading = false
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-form {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.login-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.login-tip {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}
</style>